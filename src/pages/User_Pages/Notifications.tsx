// src/pages/user/NotificationsPage.tsx
import React, { useEffect, useState, useRef } from 'react';
import Sidebar from '../../components/User_Sidebar';
import { 
  Menu, 
  ChevronDown, 
  Bell, 
  BellRing, 
  Mail,
  AlertCircle,
  Info,
  Clock,
  User,
  X
} from 'lucide-react';
import NotificationService from "../../services/user_Services/notifications_service";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  notificationType?: 'info' | 'alert' | 'message';
  sender?: string;
  userId?: string;
}

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  
  // Hardcoded user ID for demonstration
  const userId = "6864e993d58e659e74b470d0";

  // Fetch notifications with polling
  const fetchNotifications = async () => {
    try {
      const response = await NotificationService.getNotificationById(userId);
      
      if (response.data && Array.isArray(response.data)) {
        const fetchedNotifications = response.data.map((notification: any) => ({
          id: notification._id,
          title: notification.title || 'New Notification',
          message: notification.message || '',
          timestamp: notification.createdAt || new Date().toISOString(),
          read: notification.read || false,
          notificationType: notification.type || 'info',
          sender: notification.sender || 'System',
          userId: notification.userId || userId
        }));
        
        // Check for new notifications
        const newNotifications = fetchedNotifications.filter(
          (fn: { id: string }) => !notifications.some(n => n.id === fn.id)
        );
        
        // Show toast for new notifications
        newNotifications.forEach((notification: Notification) => {
          toast.info(
            <div onClick={() => handleNotificationClick(notification)}>
              <div className="font-medium text-blue-800">New Notification</div>
              <div className="text-sm text-gray-700">{notification.title}: {notification.message}</div>
            </div>, 
            {
              position: "top-right",
              autoClose: 5000,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              className: "border-l-4 border-blue-500",
            }
          );
        });

        setNotifications(fetchedNotifications);
        updateUnreadCount(fetchedNotifications);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchNotifications();
  }, []);

  // Set up polling for new notifications
  useEffect(() => {
    const pollInterval = setInterval(() => {
      fetchNotifications();
    }, 30000); // Check every 30 seconds

    return () => clearInterval(pollInterval);
  }, [notifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotificationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const updateUnreadCount = (notifs: Notification[]) => {
    const count = notifs.filter(n => !n.read).length;
    setUnreadCount(count);
  };

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
    setShowNotificationDropdown(false);
  };

  const toggleNotificationDropdown = () => {
    setShowNotificationDropdown(!showNotificationDropdown);
  };

  const getNotificationIcon = (type?: 'info' | 'alert' | 'message') => {
    switch (type) {
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      case 'alert':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'message':
        return <Mail className="w-5 h-5 text-green-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Full-page Skeleton Loader
  const FullPageSkeleton = () => (
    <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-40">
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
        </div>
        
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="p-5 rounded-lg border border-gray-200 bg-white">
              <div className="flex items-start space-x-4">
                <div className="mt-1">
                  <div className="w-5 h-5 bg-gray-200 rounded-full animate-pulse"></div>
                </div>
                <div className="flex-1 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-blue-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0 relative">
        {/* Loading overlay */}
        {loading && <FullPageSkeleton />}

        <header className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-blue-200/50 px-6 py-4 relative z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-blue-500/5" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden mr-4 p-2 rounded-xl bg-blue-100/50 hover:bg-blue-200/50 transition-all duration-200"
              >
                <Menu className="w-5 h-5 text-blue-600" />
              </button>
              <div className="flex items-center space-x-3">
                <Bell className="w-6 h-6 text-blue-600" />
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-blue-500">Dashboard</span>
                  <span className="text-blue-300">›</span>
                  <span className="text-blue-700 font-medium">Notifications</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={toggleNotificationDropdown}
                  className="relative p-2 rounded-xl bg-blue-100/50 hover:bg-blue-200/50 transition-all duration-200 flex items-center justify-center w-10 h-10"
                >
                  <Bell className="w-5 h-5 text-blue-600" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {showNotificationDropdown && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                    <div className="p-3 border-b border-gray-200 bg-blue-50 rounded-t-lg">
                      <h3 className="font-medium text-blue-800">Notifications</h3>
                    </div>
                    
                    <div className="divide-y divide-gray-100">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-sm">
                          No notifications available
                        </div>
                      ) : (
                        notifications.slice(0, 5).map((notification) => (
                          <div
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`p-3 cursor-pointer hover:bg-blue-50 transition-colors ${
                              !notification.read ? 'bg-blue-50' : ''
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="mt-1">
                                {getNotificationIcon(notification.notificationType)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className={`text-sm font-medium truncate ${
                                  !notification.read ? 'text-blue-800' : 'text-gray-800'
                                }`}>
                                  {notification.title}
                                </h4>
                                <p className="text-xs text-gray-600 truncate mt-1">
                                  {notification.message}
                                </p>
                                <div className="flex items-center mt-2 text-xs text-gray-500">
                                  <Clock className="w-3 h-3 mr-1" />
                                  <span>{formatDate(notification.timestamp)}</span>
                                </div>
                              </div>
                              {!notification.read && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    
                    {notifications.length > 5 && (
                      <div className="p-3 border-t border-gray-200 text-center">
                        <button
                          onClick={() => {
                            setShowNotificationDropdown(false);
                          }}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View all notifications
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-3 pl-4 border-l border-blue-200/50">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-semibold text-blue-700">User</div>
                  <div className="text-xs text-blue-500">Client</div>
                </div>
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25">
                    <span className="text-white font-semibold text-sm">U</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full shadow-sm" />
                </div>
                <ChevronDown className="w-4 h-4 text-blue-400" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-auto relative">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-blue-700">Notifications</h1>
              {!loading && notifications.length > 0 && (
                <div className="text-sm text-gray-500">
                  Last updated: {lastUpdate.toLocaleTimeString()}
                </div>
              )}
            </div>

            {!loading && notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center mt-20 text-center text-gray-600">
                <Bell className="w-16 h-16 text-blue-400 mb-4" />
                <p className="text-lg font-medium">No notifications found</p>
                <p className="text-sm mt-2">You'll see notifications here when you receive them</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-5 rounded-lg border transition-all cursor-pointer ${
                      !notification.read
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-white border-gray-200'
                    } hover:shadow-md`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="mt-1">
                        {getNotificationIcon(notification.notificationType)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className={`text-lg font-medium ${
                              !notification.read ? 'text-blue-800' : 'text-gray-800'
                            }`}>
                              {notification.title}
                            </h3>
                            <p className="text-gray-600 mt-1">{notification.message}</p>
                          </div>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1 flex-shrink-0"></span>
                          )}
                        </div>
                        
                        <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatDate(notification.timestamp)}</span>
                          </div>
                          {notification.sender && (
                            <>
                              <span>•</span>
                              <div className="flex items-center space-x-1">
                                <User className="w-3 h-3" />
                                <span>From: {notification.sender}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Notification Modal - will appear on top of everything */}
      {selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden transform transition-all">
            <div className="p-6 border-b border-blue-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-blue-700">Notification Details</h2>
              <button
                onClick={() => setSelectedNotification(null)}
                className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-blue-600" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex items-start space-x-4">
                <div className="mt-1">
                  {getNotificationIcon(selectedNotification.notificationType)}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-semibold text-blue-800">{selectedNotification.title}</h3>
                      <p className="text-gray-800 mt-2">{selectedNotification.message}</p>
                    </div>
                    {!selectedNotification.read && (
                      <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full ml-2">
                        New
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-6 space-y-4">
                    {selectedNotification.sender && (
                      <div className="flex items-start">
                        <div className="w-24 text-sm text-gray-500">From</div>
                        <div className="flex-1 text-gray-900">
                          {selectedNotification.sender}
                        </div>
                      </div>
                    )}
                    <div className="flex items-start">
                      <div className="w-24 text-sm text-gray-500">Date</div>
                      <div className="flex-1 text-gray-900">
                        {formatDate(selectedNotification.timestamp)}
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="w-24 text-sm text-gray-500">Type</div>
                      <div className="flex-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          selectedNotification.notificationType === 'alert'
                            ? 'bg-red-100 text-red-800'
                            : selectedNotification.notificationType === 'info'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {selectedNotification.notificationType || 'message'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;