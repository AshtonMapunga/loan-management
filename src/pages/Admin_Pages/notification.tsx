import React, { useState, useEffect } from "react";
import { 
  Menu, 
  Search, 
  ChevronDown, 
  MessageSquareText, 
  X, 
  Clock, 
  Send, 
  Inbox, 
  User, 
  Calendar,
  Bell,
  BellRing,
  Check,
  ChevronUp,
  Users,
  ChevronLeft,
  ChevronRight,
  Mail,
  AlertCircle,
  Info
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import NotificationService from "../../services/admin_Services/notification_service";
import UserService from "../../services/admin_Services/user_Service";




interface Notification {
  id: string;
  type: 'sent' | 'received';
  recipient?: string;
  sender?: string;
  message: string;
  timestamp: string;
  read?: boolean;
  notificationType?: 'info' | 'alert' | 'message';
}

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  avatar?: string;
}

// Sidebar Component
const Sidebar: React.FC<{ 
  isOpen: boolean; 
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}> = ({ isOpen, onClose, activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'notifications', icon: MessageSquareText, label: 'Notifications' },
    { id: 'users', icon: User, label: 'Users' },
    { id: 'calendar', icon: Calendar, label: 'Calendar' }
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    onClose(); // Close sidebar whenever any tab is clicked
  };

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <div className={`fixed left-0 top-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 z-50 lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-4 border-b border-orange-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-orange-700">Dashboard</h2>
            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded-lg hover:bg-orange-100"
            >
              <X className="w-5 h-5 text-orange-600" />
            </button>
          </div>
        </div>
        
        <nav className="p-4">
          <div className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`flex items-center w-full px-3 py-2 rounded-lg ${
                  activeTab === tab.id 
                    ? 'text-orange-700 bg-orange-100' 
                    : 'text-gray-600 hover:bg-orange-100'
                }`}
              >
                <tab.icon className="w-5 h-5 mr-3" />
                {tab.label}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </>
  );
};

// Notification Bell Component
const AdminBell: React.FC<{ 
  notifications: Notification[]; 
  onViewAll: () => void;
  onNotificationClick: (notification: Notification) => void;
}> = ({ notifications, onViewAll, onNotificationClick }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const unreadCount = notifications.filter(n => !n.read && n.type === 'received').length;

  const getNotificationIcon = (type?: 'info' | 'alert' | 'message') => {
    switch (type) {
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
      case 'alert':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'message':
        return <Mail className="w-4 h-4 text-green-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 rounded-xl bg-orange-100/50 hover:bg-orange-200/50 transition-all duration-200"
      >
        {unreadCount > 0 ? (
          <BellRing className="w-5 h-5 text-orange-600" />
        ) : (
          <Bell className="w-5 h-5 text-orange-600" />
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-lg border border-orange-200 z-50">
          <div className="p-4 border-b border-orange-200 flex justify-between items-center">
            <h3 className="font-semibold text-orange-700">Notifications</h3>
            <div className="flex space-x-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewAll();
                }}
                className="text-sm text-orange-600 hover:text-orange-700 px-2 py-1 rounded hover:bg-orange-50"
              >
                View All
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDropdown(false);
                }}
                className="text-sm text-gray-500 hover:text-gray-700 p-1 rounded hover:bg-gray-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications
              .filter(n => n.type === 'received')
              .slice(0, 5)
              .map((notification) => (
                <div
                  key={`notification-${notification.id}`}
                  onClick={() => {
                    onNotificationClick(notification);
                    setShowDropdown(false);
                  }}
                  className={`p-4 border-b border-orange-100 hover:bg-orange-50 cursor-pointer transition-colors ${
                    !notification.read ? 'bg-orange-25' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="mt-1">
                      {getNotificationIcon(notification.notificationType)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-medium text-gray-800 line-clamp-2">
                          {notification.message}
                        </p>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-orange-500 rounded-full ml-2 mt-1 flex-shrink-0"></div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                        <span>
                          From: {notification.sender}
                        </span>
                        <span>•</span>
                        <span>
                          {new Date(notification.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            
            {notifications.filter(n => n.type === 'received').length === 0 && (
              <div className="p-6 text-center text-gray-500">
                <Bell className="w-10 h-10 mx-auto mb-3 text-gray-400" />
                <p className="text-sm">No new notifications</p>
                <button 
                  onClick={onViewAll}
                  className="mt-2 text-sm text-orange-600 hover:text-orange-700"
                >
                  View all notifications
                </button>
              </div>
            )}
          </div>

          {notifications.filter(n => n.type === 'received').length > 0 && (
            <div className="p-3 border-t border-orange-200 text-center">
              <button
                onClick={onViewAll}
                className="text-sm text-orange-600 hover:text-orange-700 px-3 py-1 rounded-lg hover:bg-orange-50"
              >
                See all notifications
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const UserSelectDropdown: React.FC<{
  users: User[];
  selectedUsers: string[];
  onSelectUser: (userId: string) => void;
  onSelectAll: () => void;
  loading: boolean;
}> = ({ users, selectedUsers, onSelectUser, onSelectAll, loading }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );


  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-white border border-orange-200 rounded-lg shadow-sm text-left focus:outline-none focus:ring-2 focus:ring-orange-500"
        disabled={loading}
      >
        <div className="flex items-center">
          <Users className="w-5 h-5 text-orange-500 mr-3" />
          {loading ? (
            <span className="text-gray-500">Loading users...</span>
          ) : (
            <span className="truncate">
              {selectedUsers.length === 0
                ? "Select recipients..."
                : selectedUsers.length === users.length
                ? "All users selected"
                : `${selectedUsers.length} recipient${selectedUsers.length !== 1 ? "s" : ""}`}
            </span>
          )}
        </div>
        {loading ? (
          <svg
            className="animate-spin h-5 w-5 text-orange-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        ) : isOpen ? (
          <ChevronUp className="w-5 h-5 text-orange-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-orange-500" />
        )}
      </button>

      {isOpen && !loading && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-96 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          <div className="sticky top-0 bg-white p-2 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                className="pl-10 pr-4 py-2 w-full bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="px-2 py-1 border-b border-gray-200">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectAll();
              }}
              className="w-full text-left text-sm text-orange-600 hover:text-orange-800 px-2 py-1 rounded hover:bg-orange-50"
            >
              {selectedUsers.length === users.length ? "Deselect all" : "Select all"}
            </button>
          </div>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                onClick={() => onSelectUser(user.id)}
                className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-orange-50 ${
                  selectedUsers.includes(user.id) ? "bg-orange-100" : ""
                }`}
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <User className="w-5 h-5" />
                    )}
                  </div>
                  <div className="ml-3">
                    <div className={`text-sm ${
                      selectedUsers.includes(user.id) ? "font-semibold text-orange-800" : "text-gray-700"
                    }`}>
                      {user.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {user.email}
                      {user.phone && ` • ${user.phone}`}
                    </div>
                    {user.role && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 mt-1">
                        {user.role}
                      </span>
                    )}
                  </div>
                </div>
                {selectedUsers.includes(user.id) && (
                  <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-orange-600">
                    <Check className="w-5 h-5" />
                  </span>
                )}
              </div>
            ))
          ) : (
            <div className="py-4 text-center text-gray-500">
              <User className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">No users found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Calendar Component
const CalendarView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const daysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const firstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDateClick = (day: number) => {
    setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysCount = daysInMonth(year, month);
  const firstDay = firstDayOfMonth(year, month);

  // Generate days array
  const days = [];
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysCount; i++) {
    days.push(i);
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 w-full max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={prevMonth}
          className="p-2 rounded-full hover:bg-orange-100 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-orange-600" />
        </button>
        <h2 className="text-xl font-semibold text-orange-700">
          {monthNames[month]} {year}
        </h2>
        <button
          onClick={nextMonth}
          className="p-2 rounded-full hover:bg-orange-100 transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-orange-600" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-4">
        {dayNames.map((day) => (
          <div key={day} className="text-center font-medium text-orange-600 text-sm py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => (
          <div
            key={index}
            onClick={() => day && handleDateClick(day)}
            className={`h-12 flex items-center justify-center rounded-lg cursor-pointer transition-colors ${
              day
                ? selectedDate && selectedDate.getDate() === day && selectedDate.getMonth() === month
                  ? 'bg-orange-600 text-white'
                  : 'hover:bg-orange-100'
                : ''
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {selectedDate && (
        <div className="mt-6 p-4 bg-orange-50 rounded-lg">
          <h3 className="font-medium text-orange-700 mb-2">
            Selected Date: {selectedDate.toDateString()}
          </h3>
          <div className="text-sm text-gray-600">
            No events scheduled for this day.
          </div>
        </div>
      )}
    </div>
  );
};

// Users List Component
const UsersList: React.FC<{ 
  users: User[]; 
  loading: boolean;
  onUserClick: (user: User) => void;
}> = ({ users, loading, onUserClick }) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.phone && user.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.role && user.role.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden w-full max-w-6xl">
      <div className="p-6 border-b border-orange-200 flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-orange-700">Users Management</h2>
          <p className="text-sm text-gray-500 mt-1">
            {users.length} user{users.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <div className="mt-3 md:mt-0 relative max-w-xs w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            className="pl-10 pr-4 py-2 w-full bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-orange-200">
          <thead className="bg-orange-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-orange-500 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-orange-500 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-orange-500 uppercase tracking-wider">
                Phone
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-orange-500 uppercase tracking-wider">
                Role
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-orange-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-orange-200">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr 
                  key={user.id} 
                  className={`cursor-pointer transition-colors ${
                    selectedUser?.id === user.id ? 'bg-orange-50' : 'hover:bg-orange-50'
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <User className="w-5 h-5" />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.phone || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
                      {user.role || 'user'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        onUserClick(user);
                      }}
                      className="text-orange-600 hover:text-orange-900 mr-3"
                    >
                      View
                    </button>
                    <button className="text-gray-600 hover:text-gray-900">
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  No users found matching your search
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedUser && (
        <div className="p-6 border-t border-orange-200 bg-gray-50">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-medium text-orange-700 mb-4">User Details</h3>
            <button 
              onClick={() => setSelectedUser(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0 h-16 w-16 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                {selectedUser.avatar ? (
                  <img src={selectedUser.avatar} alt={selectedUser.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <User className="w-8 h-8" />
                )}
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900">{selectedUser.name}</h4>
                <p className="text-sm text-gray-500">{selectedUser.role || 'User'}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-gray-900">{selectedUser.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="text-gray-900">{selectedUser.phone || '-'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Notifications Panel Component
const NotificationsPanel: React.FC<{ 
  notifications: Notification[]; 
  onSendNotification: (users: string[], message: string, type: 'info' | 'alert' | 'message') => Promise<void>;
  users: User[];
  loadingUsers: boolean;
}> = ({ onSendNotification, users, loadingUsers }) => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [] = useState<'all' | 'sent' | 'received'>('all');
  const [notificationType, setNotificationType] = useState<'info' | 'alert' | 'message'>('message');

  const handleSelectUser = (userId: string) => {
  setSelectedUsers(prev => 
    prev.includes(userId) 
      ? prev.filter(id => id !== userId) // remove if already selected
      : [...prev, userId] // add if not selected
  );
};

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user.id));
    }
  };

 const handleSendNotification = async () => {
  if (selectedUsers.length === 0 || !message.trim()) {
    toast.error("Please select at least one user and enter a message");
    return;
  }

  setLoading(true);
  try {
    await onSendNotification(selectedUsers, message, notificationType);
    // Clear the form
    setSelectedUsers([]);
    setMessage(""); 
    // Show pop-up success message (this appears outside the input box)
    toast.success(`Notification sent to ${selectedUsers.length} user${selectedUsers.length !== 1 ? 's' : ''}!`);
  } catch (error) {
    console.error("Failed to send notification:", error);
    toast.error("Failed to send notification");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="space-y-6 w-full max-w-6xl">
      {/* Send Notification Card */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-orange-700">Send Notification</h1>
          <p className="text-sm text-gray-500 mt-1">Send messages to selected users</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-orange-700 mb-2">
              Select Recipients
            </label>
            <UserSelectDropdown
              users={users}
              selectedUsers={selectedUsers}
              onSelectUser={handleSelectUser}
              onSelectAll={handleSelectAll}
              loading={loadingUsers}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-orange-700 mb-2">
              Notification Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setNotificationType('message')}
                className={`py-2 px-3 rounded-lg border transition-colors flex items-center justify-center space-x-2 ${
                  notificationType === 'message' 
                    ? 'border-green-500 bg-green-50 text-green-700' 
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <Mail className="w-4 h-4" />
                <span>Message</span>
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-orange-700 mb-2">
            Message Content
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            className="w-full border border-orange-200 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
            placeholder="Enter your notification message here..."
          />
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSendNotification}
            disabled={loading || selectedUsers.length === 0 || loadingUsers}
            className={`px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${
              loading || selectedUsers.length === 0 || loadingUsers
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-orange-600 hover:bg-orange-700 text-white"
            }`}
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
                Sending Notification...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Send to {selectedUsers.length} recipient{selectedUsers.length !== 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
const Dashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('notifications');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [showViewAll, setShowViewAll] = useState(false);
  const [, setSelectedUser] = useState<User | null>(null);
  
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

useEffect(() => {
  // Load notifications from local storage when component mounts
  const savedNotifications = localStorage.getItem('notifications');
  if (savedNotifications) {
    setNotifications(JSON.parse(savedNotifications));
  }
    
     

     // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await UserService.getAllUsers();
      const fetchedUsers = response.data.map((user: any) => ({
        id: user._id || user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar
      }));
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      toast.error("Failed to load users. Please try again later.");
    } finally {
      setLoadingUsers(false);
    }
  };

  fetchUsers();
}, []);

  const handleSendNotification = async (userIds: string[], message: string, type: 'info' | 'alert' | 'message') => {
  if (userIds.length === 0) {
    toast.error("Please select at least one recipient");
    return Promise.reject("No recipients selected");
  }

  if (!message.trim()) {
    toast.error("Please enter a message");
    return Promise.reject("Empty message");
  }

  try {
    const response = await NotificationService.sendNotification({
      receivers: userIds,
      message,
      type
    });

    const newNotifications: Notification[] = userIds.map(userId => ({
      id: response.data._id || `notification-${Date.now()}`,
      type: 'sent',
      recipient: userId,
      message,
      timestamp: new Date().toISOString(),
      notificationType: type,
      read: false
    }));

    // Update state and save to local storage
    setNotifications(prev => {
      const updatedNotifications = [...newNotifications, ...prev];
      localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
      return updatedNotifications;
    });

    return Promise.resolve(response);
  } catch (error: any) {
    console.error("Notification error:", error);
    toast.error(error.response?.data?.message || "Failed to send notifications");
    return Promise.reject(error);
  }
};

  const handleViewAll = () => {
    setShowViewAll(true);
  };

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
  };

  const handleNotificationClick = (notification: Notification) => {
    setSelectedNotification(notification);
    // Mark as read if it's a received notification
    if (notification.type === 'received' && !notification.read) {
      setNotifications(prev => 
        prev.map(n => 
          n.id === notification.id ? {...n, read: true} : n
        )
      );
    }
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'notifications':
        return (
          <NotificationsPanel
            notifications={notifications}
            onSendNotification={handleSendNotification}
            users={users}
            loadingUsers={loadingUsers}
          />
        );
      case 'users':
        return (
          <UsersList 
            users={users} 
            loading={loadingUsers}
            onUserClick={handleUserClick}
          />
        );
      case 'calendar':
        return <CalendarView />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      {/* Add ToastContainer here */}
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Section */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-orange-200/50 px-6 py-4 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5" />
          <div className="relative flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden mr-4 p-2 rounded-xl bg-orange-100/50 hover:bg-orange-200/50 transition-all duration-200"
              >
                <Menu className="w-5 h-5 text-orange-600" />
              </button>
              <div className="flex items-center space-x-3">
                {activeTab === 'notifications' && <MessageSquareText className="w-6 h-6 text-orange-600" />}
                {activeTab === 'users' && <Users className="w-6 h-6 text-orange-600" />}
                {activeTab === 'calendar' && <Calendar className="w-6 h-6 text-orange-600" />}
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-orange-500">Dashboard</span>
                  <span className="text-orange-300">›</span>
                  <span className="text-orange-700 font-medium">
                    {activeTab === 'notifications' && 'Notifications'}
                    {activeTab === 'users' && 'Users'}
                    {activeTab === 'calendar' && 'Calendar'}
                  </span>
                </div>
              </div>
            </div>
            

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-orange-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 w-64 bg-orange-100/50 border border-orange-200/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 transition-all duration-200"
                />
              </div>
              

              {/* Bell */}
              <AdminBell 
                notifications={notifications.filter(n => n.type === 'received')} 
                onViewAll={handleViewAll}
                onNotificationClick={handleNotificationClick}
              />

              {/* User Info */}
              <div className="flex items-center space-x-3 pl-4 border-l border-orange-200/50">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-semibold text-orange-700">Admin User</div>
                  <div className="text-xs text-orange-500">Administrator</div>
                </div>
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25">
                    <span className="text-white font-semibold text-sm">AD</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full shadow-sm"></div>
                </div>
                <ChevronDown className="w-4 h-4 text-orange-400" />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex justify-center">
            {renderActiveTab()}
          </div>
        </main>
      </div>
      

      

      {/* View All Notifications Modal */}
      {showViewAll && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-orange-200">
              <h2 className="text-2xl font-bold text-orange-700">All Notifications</h2>
              <button
                onClick={() => setShowViewAll(false)}
                className="p-2 hover:bg-orange-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-orange-600" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-orange-200">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex-1 py-4 px-6 text-sm font-medium transition-colors flex items-center justify-center ${
                  activeTab === 'all'
                    ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
                    : 'text-gray-500 hover:text-orange-600 hover:bg-orange-50'
                }`}
              >
                All Notifications ({notifications.length})
              </button>
              <button
                onClick={() => setActiveTab('sent')}
                className={`flex-1 py-4 px-6 text-sm font-medium transition-colors flex items-center justify-center ${
                  activeTab === 'sent'
                    ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
                    : 'text-gray-500 hover:text-orange-600 hover:bg-orange-50'
                }`}
              >
                <Send className="w-4 h-4 mr-2" />
                Sent ({notifications.filter(n => n.type === 'sent').length})
              </button>
              <button
                onClick={() => setActiveTab('received')}
                className={`flex-1 py-4 px-6 text-sm font-medium transition-colors flex items-center justify-center ${
                  activeTab === 'received'
                    ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
                    : 'text-gray-500 hover:text-orange-600 hover:bg-orange-50'
                }`}
              >
                <Inbox className="w-4 h-4 mr-2" />
                Received ({notifications.filter(n => n.type === 'received').length})
              </button>
            </div>

            {/* Notifications List */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {notifications.filter(n => activeTab === 'all' || n.type === activeTab).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageSquareText className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No notifications found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notifications
                    .filter(n => activeTab === 'all' || n.type === activeTab)
                    .map((notification) => (
                      <div
                        key={`modal-notification-${notification.id}`}
                        onClick={() => handleNotificationClick(notification)}
                        className={`p-5 rounded-lg border transition-all cursor-pointer ${
                          notification.type === 'received' && !notification.read
                            ? 'bg-orange-50 border-orange-200'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-start space-x-4">
                          <div className="mt-1">
                            {notification.type === 'sent' ? (
                              <Send className="w-5 h-5 text-blue-500" />
                            ) : (
                              <Inbox className="w-5 h-5 text-green-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className={`text-sm font-medium ${
                                  notification.type === 'sent' ? 'text-blue-600' : 'text-green-600'
                                }`}>
                                  {notification.type === 'sent' ? 'Sent' : 'Received'}
                                </span>
                                <p className="text-gray-800 mt-1">{notification.message}</p>
                              </div>
                              {notification.type === 'received' && !notification.read && (
                                <span className="w-2 h-2 bg-orange-500 rounded-full ml-2 mt-1 flex-shrink-0"></span>
                              )}
                            </div>
                            
                            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <User className="w-3 h-3" />
                                <span>
                                  {notification.type === 'sent' 
                                    ? `To: ${notification.recipient}`
                                    : `From: ${notification.sender}`
                                  }
                                </span>
                              </div>
                              <span>•</span>
                              <div className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>{new Date(notification.timestamp).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      

      {/* Notification Detail Modal */}
      {selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-orange-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-orange-700">Notification Details</h2>
              <button
                onClick={() => setSelectedNotification(null)}
                className="p-2 hover:bg-orange-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-orange-600" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex items-start space-x-4">
                <div className="mt-1">
                  {selectedNotification.type === 'sent' ? (
                    <Send className="w-8 h-8 text-blue-500" />
                  ) : (
                    <Inbox className="w-8 h-8 text-green-500" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className={`text-base font-medium ${
                        selectedNotification.type === 'sent' ? 'text-blue-600' : 'text-green-600'
                      }`}>
                        {selectedNotification.type === 'sent' ? 'Sent Notification' : 'Received Notification'}
                      </span>
                      <p className="text-gray-800 mt-2 text-lg">{selectedNotification.message}</p>
                    </div>
                    {selectedNotification.type === 'received' && !selectedNotification.read && (
                      <span className="px-2 py-1 bg-orange-500 text-white text-xs rounded-full ml-2">
                        New
                      </span>
                    )}
                  </div>
                  
                  <div className="mt-6 space-y-4">
                    <div className="flex items-start">
                      <div className="w-24 text-sm text-gray-500">From</div>
                      <div className="flex-1 text-gray-900">
                        {selectedNotification.sender || 'System'}
                      </div>
                    </div>
                    {selectedNotification.type === 'sent' && (
                      <div className="flex items-start">
                        <div className="w-24 text-sm text-gray-500">To</div>
                        <div className="flex-1 text-gray-900">
                          {selectedNotification.recipient || 'All Users'}
                        </div>
                      </div>
                    )}
                    <div className="flex items-start">
                      <div className="w-24 text-sm text-gray-500">Date</div>
                      <div className="flex-1 text-gray-900">
                        {new Date(selectedNotification.timestamp).toLocaleString()}
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
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
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

export default Dashboard;