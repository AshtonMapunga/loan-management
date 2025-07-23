import React, { useState, useRef, useEffect } from 'react';
import { Search, Send, Paperclip, Smile, Mic, Play, Pause, X, Menu, Image, FileText, User, FileAudio } from "lucide-react";
import EmojiPicker from 'emoji-picker-react';
import Sidebar from "../../components/Sidebar";
import UserService from "../../services/admin_Services/user_Service";

// Firebase imports
import { initializeApp } from 'firebase/app';
import {  
  getFirestore, 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  addDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import EnhancedLoadingSpinner from '../../components/chatspinner';

// Firebase configuration (replace with your config)
const firebaseConfig = {
  apiKey: "AIzaSyBOW5kWbvqexfn8JXvvUtAwPlbHXCkoh3M",
  authDomain: "pocket-management-93dba.firebaseapp.com",
  projectId: "pocket-management-93dba",
  storageBucket: "pocket-management-93dba.firebasestorage.app",
  messagingSenderId: "602070514808",
  appId: "1:602070514808:web:d9156bd1cd73fec6d6418d",
};



// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

interface Message {
  id: string;
  text?: string;
  senderId: string;
  senderName: string;
  timestamp: any;
  isTyping?: boolean;
  type?: 'text' | 'image' | 'file' | 'audio';
  fileName?: string;
  fileUrl?: string;
  audioUrl?: string;
  audioDuration?: number;
}

interface Contact {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  lastMessage?: string;
  lastMessageTime?: any;
  unreadCount?: number; 
  isOnline?: boolean;
  role?: string;
  status?: string;
}

const ChatInterface = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentUser] = useState({
    id: localStorage.getItem('userId') || 'current-user',
    name: localStorage.getItem('userName') || 'You',
    email: localStorage.getItem('userEmail') || ''
  });
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [showChatSearch, setShowChatSearch] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioDuration, setAudioDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [currentAudioId, setCurrentAudioId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recordingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  

  // Load contacts from your user management system
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await UserService.getAllUsers();
        const transformedUsers = response.data?.map((user: any) => ({
          id: user._id || user.id,
          name: user.name || `${user.firstName} ${user.lastName}`.trim(),
          email: user.email,
          avatar: getInitials(user.name || `${user.firstName} ${user.lastName}`),
          role: user.role || "User",
          status: user.status || "Active",
          isOnline: Math.random() > 0.5 // Random online status for demo
        })) || [];
        
        // Filter out the current user from contacts
        setContacts(transformedUsers.filter((user: any) => user.id !== currentUser.id));
        
        // Select first contact by default if none selected
        if (transformedUsers.length > 0 && !selectedContact) {
          setSelectedContact(transformedUsers[0].id);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [currentUser.id]);

  // Load messages for selected contact
  useEffect(() => {
    if (!selectedContact || !currentUser.id) return;

    const messagesRef = collection(db, 'messages');
    const q = query(
      messagesRef,
      where('participants', 'array-contains', currentUser.id),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData: Message[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        // Only show messages between current user and selected contact
        if ((data.senderId === currentUser.id && data.receiverId === selectedContact) || 
            (data.senderId === selectedContact && data.receiverId === currentUser.id)) {
          messagesData.push({
            id: doc.id,
            text: data.text,
            senderId: data.senderId,
            senderName: data.senderName,
            timestamp: data.timestamp,
            type: data.type || 'text',
            fileName: data.fileName,
            fileUrl: data.fileUrl,
            audioUrl: data.audioUrl,
            audioDuration: data.audioDuration
            
          });
        }
      });
      setMessages(messagesData);
    });

    return () => unsubscribe();
  }, [selectedContact, currentUser.id]);

  // Helper function to generate initials from name
  const getInitials = (name: string): string => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMessages = messages.filter(msg =>
    msg.text?.toLowerCase().includes(chatSearchQuery.toLowerCase())
  );

  const currentContact = contacts.find(c => c.id === selectedContact);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSendMessage = async () => {
    if (!currentUser.id || !selectedContact) return;

    if (message.trim() || selectedFiles.length > 0 || audioBlob) {
      const messagesRef = collection(db, 'messages');
      
      // Send text message
      if (message.trim()) {
        await addDoc(messagesRef, {
          text: message,
          senderId: currentUser.id,
          senderName: currentUser.name,
          receiverId: selectedContact,
          participants: [currentUser.id, selectedContact],
          type: 'text',
          timestamp: serverTimestamp()
        });
      }

      // Send files
      for (const file of selectedFiles) {
        const fileType = file.type.startsWith('image/') ? 'image' : 'file';
        const storageRef = ref(storage, `files/${currentUser.id}/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const fileUrl = await getDownloadURL(storageRef);

        await addDoc(messagesRef, {
          senderId: currentUser.id,
          senderName: currentUser.name,
          receiverId: selectedContact,
          participants: [currentUser.id, selectedContact],
          type: fileType,
          fileName: file.name,
          fileUrl: fileUrl,
          timestamp: serverTimestamp()
        });
      }

      // Send audio
      if (audioBlob) {
        const storageRef = ref(storage, `audio/${currentUser.id}/${Date.now()}.ogg`);
        await uploadBytes(storageRef, audioBlob);
        const audioUrl = await getDownloadURL(storageRef);

        await addDoc(messagesRef, {
          senderId: currentUser.id,
          senderName: currentUser.name,
          receiverId: selectedContact,
          participants: [currentUser.id, selectedContact],
          type: 'audio',
          audioUrl: audioUrl,
          audioDuration: audioDuration,
          timestamp: serverTimestamp()
        });
      }

      // Reset state
      setMessage('');
      setSelectedFiles([]);
      setAudioBlob(null);
      setAudioDuration(0);
      setShowFilePicker(false);

      // Simulate typing indicator
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
      }, 2000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const onEmojiClick = (emojiData: any) => {
    setMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleFileUpload = (type: 'image' | 'document') => {
    setShowFilePicker(false);
    if (type === 'image') {
      imageInputRef.current?.click();
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...newFiles]);
    }
    if (e.target) {
      e.target.value = '';
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 32;
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      dataArrayRef.current = new Uint8Array(analyserRef.current.frequencyBinCount);
      
      const audioChunks: BlobPart[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunks, { type: 'audio/ogg; codecs=opus' });
        setAudioBlob(blob);
        setAudioDuration(recordingTime);
        setRecordingTime(0);
        if (recordingIntervalRef.current) {
          clearInterval(recordingIntervalRef.current);
        }
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
      
      mediaRecorder.start();
      setIsRecording(true);
      
      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      // Start audio visualization
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const draw = () => {
            animationRef.current = requestAnimationFrame(draw);
            if (analyserRef.current && dataArrayRef.current && ctx) {
              analyserRef.current.getByteFrequencyData(dataArrayRef.current);
              ctx.clearRect(0, 0, canvas.width, canvas.height);
              
              const barWidth = 3;
              const gap = 2;
              let x = 0;
              
              for (let i = 0; i < analyserRef.current.frequencyBinCount; i++) {
                const barHeight = dataArrayRef.current[i] / 2;
                ctx.fillStyle = '#ef4444';
                ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
                x += barWidth + gap;
              }
            }
          };
          draw();
        }
      }
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const playAudio = (audioUrl: string, id: string) => {
    if (audioRef.current) {
      stopAudio();
    }
    
    const audio = new Audio(audioUrl);
    audioRef.current = audio;
    setCurrentAudioId(id);
    
    audio.onended = () => {
      setIsPlaying(false);
      setCurrentTime(0);
      setCurrentAudioId(null);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
    
    audio.onpause = () => {
      setIsPlaying(false);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
    
    audio.onplay = () => {
      setIsPlaying(true);
      progressIntervalRef.current = setInterval(() => {
        setCurrentTime(audio.currentTime);
      }, 100);
    };
    
    audio.play();
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
      setCurrentTime(0);
      setCurrentAudioId(null);
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    }
  };

  const clearAudioRecording = () => {
    setAudioBlob(null);
    setAudioDuration(0);
    stopAudio();
  };

  const calculateProgress = (duration: number, currentTime: number) => {
    return duration > 0 ? (currentTime / duration) * 100 : 0;
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stream?.getTracks().forEach(track => track.stop());
      }
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="flex h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      {/* Full-page spinner for initial load */}
      {<EnhancedLoadingSpinner />}
      {/* Sidebar Component - Always visible */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        
        {/* Header - Simplified version */}
        <header className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-orange-200/50 px-6 py-4 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden mr-4 p-2 rounded-xl bg-orange-100/50 hover:bg-orange-200/50 transition-all duration-200"
              >
                <Menu className="w-5 h-5 text-orange-600" />
              </button>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center text-white font-semibold shadow-lg shadow-orange-500/25">
                  {getInitials(currentUser.name)}
                </div>
                <span className="ml-2 font-medium text-orange-800">{currentUser.name}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Chat Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Contacts Sidebar */}
          <div className="w-80 bg-white/70 backdrop-blur-sm border-r border-orange-200/50 flex flex-col">
            {/* Search Bar */}
            <div className="p-4 border-b border-orange-200/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-orange-100/50 border border-orange-200/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 transition-all duration-200"
                />
              </div>
            </div>

            {/* Contacts List */}
            <div className="flex-1 overflow-y-auto">
              {filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => setSelectedContact(contact.id)}
                  className={`p-4 border-b border-orange-200/30 cursor-pointer hover:bg-orange-50/50 transition-colors ${
                    selectedContact === contact.id ? 'bg-orange-50/70 border-r-4 border-r-orange-500' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center text-white font-semibold shadow-lg shadow-orange-500/25">
                        {contact.avatar || getInitials(contact.name)}
                      </div>
                      {contact.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-orange-800 truncate">{contact.name}</h3>
                        <span className="text-xs text-orange-500 flex-shrink-0">
                          {contact.lastMessageTime?.toDate ? 
                            contact.lastMessageTime.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 
                            ''}
                        </span>
                      </div>
                      <p className="text-sm text-orange-600 truncate mt-1">{contact.lastMessage || contact.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {contact.role && (
                          <span className="text-xs bg-orange-100/50 text-orange-600 px-2 py-0.5 rounded">
                            {contact.role}
                          </span>
                        )}
                        {contact.status && (
                          <span className="text-xs bg-orange-100/50 text-orange-600 px-2 py-0.5 rounded">
                            {contact.status}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            {currentContact && (
              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 border-b border-orange-600">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white text-orange-500 rounded-xl flex items-center justify-center font-semibold shadow-lg">
                    {currentContact.avatar || getInitials(currentContact.name)}
                  </div>
                  <div className="flex-1">
                    <h2 className="font-semibold">{currentContact.name}</h2>
                    <div className="text-sm opacity-80">
                      {currentContact.isOnline ? 'Online' : 'Offline'}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                      onClick={() => setShowChatSearch(!showChatSearch)}
                    >
                      <Search className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                {showChatSearch && (
                  <div className="mt-3 relative">
                    <input
                      type="text"
                      placeholder="Search in conversation..."
                      value={chatSearchQuery}
                      onChange={(e) => setChatSearchQuery(e.target.value)}
                      className="w-full px-4 py-2 bg-white/20 text-white placeholder:text-white/70 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/50"
                    />
                    <button
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-white/20 rounded"
                      onClick={() => {
                        setShowChatSearch(false);
                        setChatSearchQuery('');
                      }}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-orange-50/50">
              {(chatSearchQuery ? filteredMessages : messages).map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.senderId === currentUser.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="flex items-end gap-2 max-w-[70%]">
                    {msg.senderId !== currentUser.id && (
                      <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 shadow-lg shadow-orange-500/25">
                        {currentContact?.avatar || getInitials(msg.senderName)}
                      </div>
                    )}
                    <div className="space-y-1">
                      <div
                        className={`px-4 py-3 rounded-2xl ${
                          msg.senderId === currentUser.id
                            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-br-sm shadow-lg shadow-orange-500/25'
                            : 'bg-white text-orange-800 rounded-bl-sm shadow-sm'
                        } ${msg.isTyping ? 'animate-pulse' : ''}`}
                      >
                        {msg.isTyping ? (
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        ) : (
                          <>
                            {msg.type === 'image' && msg.fileUrl && (
                              <img src={msg.fileUrl} alt="Shared image" className="max-w-[200px] rounded-lg mb-2" />
                            )}
                            {msg.type === 'audio' && msg.audioUrl && (
                              <div className="flex items-center gap-3">
                                <button
                                  className={`p-2 rounded-full ${currentAudioId === msg.id ? 'bg-white/20' : 'bg-white/10 hover:bg-white/20'} transition-colors`}
                                  onClick={() => currentAudioId === msg.id ? stopAudio() : playAudio(msg.audioUrl!, msg.id)}
                                >
                                  {currentAudioId === msg.id && isPlaying ? (
                                    <Pause className="w-4 h-4 fill-current" />
                                  ) : (
                                    <Play className="w-4 h-4 fill-current" />
                                  )}
                                </button>
                                <div className="flex-1 flex items-center gap-2">
                                  <div className="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-white rounded-full" 
                                      style={{ 
                                        width: `${currentAudioId === msg.id 
                                          ? calculateProgress(msg.audioDuration || 0, currentTime) 
                                          : 0}%` 
                                      }}
                                    ></div>
                                  </div>
                                  <span className="text-xs text-white/80">
                                    {currentAudioId === msg.id 
                                      ? formatTime(currentTime) 
                                      : formatTime(msg.audioDuration || 0)}
                                  </span>
                                </div>
                              </div>
                            )}
                            {msg.text && <p className="text-sm leading-relaxed">{msg.text}</p>}
                            {msg.type === 'file' && msg.fileName && (
                              <div className="flex items-center gap-2 text-sm">
                                <Paperclip className="w-4 h-4" />
                                <span>{msg.fileName}</span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                      <p className={`text-xs px-2 ${msg.senderId === currentUser.id ? 'text-right text-orange-500' : 'text-orange-500'}`}>
                        {msg.timestamp?.toDate ? 
                          msg.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 
                          ''}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-end gap-2 max-w-[70%]">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center text-white text-xs font-semibold shadow-lg shadow-orange-500/25">
                      {currentContact?.avatar || getInitials(currentContact?.name || 'C')}
                    </div>
                    <div className="bg-white text-orange-800 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm animate-pulse">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {(selectedFiles.length > 0 || audioBlob) && (
              <div className="p-4 border-t border-orange-200/50 bg-white/70 backdrop-blur-sm">
                <div className="flex flex-wrap gap-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 bg-orange-100/50 p-2 rounded-lg border border-orange-200/50">
                      {file.type.startsWith('image/') ? (
                        <img src={URL.createObjectURL(file)} alt={file.name} className="w-8 h-8 rounded object-cover" />
                      ) : (
                        <div className="w-8 h-8 bg-orange-200/50 rounded flex items-center justify-center">
                          <FileText className="w-4 h-4 text-orange-600" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-orange-800 truncate">{file.name}</p>
                        <p className="text-xs text-orange-500">{Math.round(file.size / 1024)} KB</p>
                      </div>
                      <button
                        className="p-1 hover:bg-orange-200/50 rounded"
                        onClick={() => removeFile(index)}
                      >
                        <X className="w-3 h-3 text-orange-600" />
                      </button>
                    </div>
                      ))}
                    
                  {audioBlob && (
                    <div className="flex items-center gap-2 bg-orange-100/50 p-2 rounded-lg border border-orange-200/50 w-full">
                      <button
                        className={`p-2 rounded-full ${isPlaying ? 'bg-orange-200/70' : 'hover:bg-orange-200/50'}`}
                        onClick={() => isPlaying ? stopAudio() : playAudio(URL.createObjectURL(audioBlob), 'current-recording')}
                      >
                        {isPlaying ? (
                          <Pause className="w-4 h-4 text-orange-600" />
                        ) : (
                          <Play className="w-4 h-4 text-orange-600" />
                        )}
                      </button>
                      <div className="flex-1 flex items-center gap-2">
                        <canvas 
                          ref={canvasRef} 
                          width="120" 
                          height="30" 
                          className="w-[120px] h-[30px]"
                        ></canvas>
                        <span className="text-xs text-orange-600">
                          {isPlaying ? formatTime(currentTime) : formatTime(audioDuration)}
                        </span>
                      </div>
                      <button
                        className="p-2 hover:bg-orange-200/50 rounded"
                        onClick={clearAudioRecording}
                      >
                        <X className="w-4 h-4 text-orange-600" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* File Picker Popup */}
            {showFilePicker && (
              <div className="absolute bottom-16 left-4 bg-white rounded-xl shadow-xl border border-orange-200/50 overflow-hidden z-10 w-64">
                <div className="p-2">
                  <div className="px-3 py-2 text-sm font-medium text-orange-800 border-b border-orange-200/50">
                    Send files
                  </div>
                  <div className="grid grid-cols-2 gap-2 p-2">
                    <button 
                      onClick={() => handleFileUpload('image')}
                      className="flex flex-col items-center p-3 hover:bg-orange-50/50 rounded-lg transition-colors"
                    >
                      <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-2">
                        <Image className="w-6 h-6 text-orange-500" />
                      </div>
                      <span className="text-xs text-orange-800">Photos</span>
                    </button>
                    <button 
                      onClick={() => handleFileUpload('document')}
                      className="flex flex-col items-center p-3 hover:bg-orange-50/50 rounded-lg transition-colors"
                    >
                      <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-2">
                        <FileText className="w-6 h-6 text-orange-500" />
                      </div>
                      <span className="text-xs text-orange-800">Documents</span>
                    </button>
                    <button 
                      className="flex flex-col items-center p-3 hover:bg-orange-50/50 rounded-lg transition-colors"
                    >
                      <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-2">
                        <User className="w-6 h-6 text-orange-500" />
                      </div>
                      <span className="text-xs text-orange-800">Contact</span>
                    </button>
                    <button 
                      className="flex flex-col items-center p-3 hover:bg-orange-50/50 rounded-lg transition-colors"
                    >
                      <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-2">
                        <FileAudio className="w-6 h-6 text-orange-500" />
                      </div>
                      <span className="text-xs text-orange-800">Audio</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Message Input */}
            <div className="p-4 border-t border-orange-200/50 bg-white/70 backdrop-blur-sm relative">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                multiple
                accept=".pdf,.doc,.docx,.txt"
                style={{ display: 'none' }}
              />
              <input
                type="file"
                ref={imageInputRef}
                onChange={handleFileChange}
                multiple
                accept="image/*,video/*"
                style={{ display: 'none' }}
              />
              
              {showEmojiPicker && (
                <div className="absolute bottom-16 right-4 z-50">
                  <EmojiPicker 
                    onEmojiClick={onEmojiClick}
                    width={300}
                    height={350}
                    previewConfig={{ showPreview: false }}
                  />
                </div>
              )}
              
              <div className="flex items-center gap-3">
                <button 
                  className="p-2 text-orange-600 hover:bg-orange-100/50 rounded-lg transition-colors relative"
                  onClick={() => setShowFilePicker(!showFilePicker)}
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                
                {isRecording ? (
                  <div className="flex-1 flex items-center gap-3 bg-orange-100/50 px-4 py-3 rounded-xl">
                    <div className="flex-1 flex items-center gap-2">
                      <div className="w-full h-2 bg-orange-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full" 
                          style={{ width: `${Math.min(recordingTime * 2, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-orange-600">{formatTime(recordingTime)}</span>
                    </div>
                    <button 
                      onClick={stopRecording}
                      className="p-1 text-white bg-red-500 rounded-full"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type something..."
                      className="w-full px-4 py-3 pr-20 bg-orange-100/50 border border-orange-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 text-orange-800 placeholder:text-orange-500/70 transition-all duration-200"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                      <button 
                        className="p-1 text-orange-600 hover:bg-orange-100/50 rounded"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                      >
                        <Smile className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
                
                {isRecording ? (
                  <button 
                    onClick={handleSendMessage} 
                    className="p-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg shadow-orange-500/25"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                ) : (
                  <button 
                    onClick={message.trim() ? handleSendMessage : toggleRecording} 
                    className={`p-3 rounded-xl transition-all duration-200 shadow-lg ${
                      message.trim() 
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600'
                        : 'bg-orange-100/50 text-orange-600 hover:bg-orange-200/50'
                    }`}
                  >
                    {message.trim() ? (
                      <Send className="w-4 h-4" />
                    ) : (
                      <Mic className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default ChatInterface;