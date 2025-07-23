import { useState, useEffect } from "react";
import {
  DollarSign,
  TrendingUp,
  Users,
  Menu,
  Search,
  ChevronDown,
  Target,
  User,
  Mail,
  Phone,
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Bell,
} from "lucide-react";
import Sidebar from "../../components/Sidebar";
import LoanService from "../../services/admin_Services/loan_Service";
import PaymentService from "../../services/user_Services/payment_Service";
import UserService from "../../services/admin_Services/user_Service";
import  { DashboardSkeleton } from "../../components/Dashboardskeleton"; 

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  profilePicture?: string;
  createdAt?: string;
}

interface Loan {
  _id?: string;
  id?: number;
  user?: string | number;
  userId?: number;
  amount?: string | number;
  status: string;
  createdAt?: string;
  applicationDate?: string;
  timestamps?: {
    createdAt: string;
    updatedAt: string;
  };
  productType?: string;
  loanType?: string;
  riskLevel?: string;
  borrowerInfo?: {
    firstName?: string;
    surname?: string;
    email?: string;
    phone?: string;
    mobile?: string;
  };
}

interface Payment {
  id: number;
  amount: string | number;
  createdAt: string;
}


interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'loan' | 'payment' | 'system';
}

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: "New Loan Application",
      message: "John Doe has submitted a new loan application for ₨50,000",
      time: "10 minutes ago",
      read: false,
      type: 'loan'
    },
    {
      id: 2,
      title: "Payment Received",
      message: "Payment of ₨12,500 received from Jane Smith",
      time: "2 hours ago",
      read: false,
      type: 'payment'
    },
    {
      id: 3,
      title: "System Update",
      message: "Scheduled maintenance this weekend",
      time: "1 day ago",
      read: true,
      type: 'system'
    },
    {
      id: 4,
      title: "Loan Approved",
      message: "Loan application #L-10045 has been approved",
      time: "3 days ago",
      read: true,
      type: 'loan'
    },
    {
      id: 5,
      title: "New User Registered",
      message: "Michael Brown has registered as a new borrower",
      time: "1 week ago",
      read: true,
      type: 'system'
    },
  ]);

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.notifications-popup') && !target.closest('.notification-bell')) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch data from backend
  useEffect(() => {
    const fetchLoans = async () => {
      try {
        const loansResponse = await LoanService.getAllLoans();
        setLoans(loansResponse.data || loansResponse || []);
      } catch (err) {
        console.error("Error fetching loans:", err);
        setLoans([]);
      }
    };

    const fetchPayments = async () => {
      try {
        const paymentsResponse = await PaymentService.getAllPayments();
        setPayments(paymentsResponse.data || paymentsResponse || []);
      } catch (err) {
        console.error("Error fetching payments:", err);
        setPayments([]);
      }
    };

    const fetchUsers = async () => {
      try {
        const usersResponse = await UserService.getAllUsers();
        setUsers(usersResponse.data || usersResponse || []);
      } catch (err) {
        console.error("Error fetching users:", err);
        setUsers([]);
      }
    };

    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      await Promise.allSettled([fetchLoans(), fetchPayments(), fetchUsers()]);
      setLoading(false);
    };

    fetchAllData();
  }, []);

  // Search function that filters across all data
  const searchAllData = () => {
    if (!searchTerm.trim()) {
      return {
        loans: loans,
        users: users,
        payments: payments,
      };
    }

    const searchLower = searchTerm.toLowerCase();

    const filteredLoans = loans.filter(loan => {
      const borrowerName = loan.borrowerInfo 
        ? `${loan.borrowerInfo.firstName || ''} ${loan.borrowerInfo.surname || ''}`.toLowerCase()
        : '';
      const loanType = (loan.productType || loan.loanType || '').toLowerCase();
      const amount = loan.amount?.toString().toLowerCase() || '';
      const status = loan.status.toLowerCase();

      return (
        borrowerName.includes(searchLower) ||
        loanType.includes(searchLower) ||
        amount.includes(searchLower) ||
        status.includes(searchLower)
      );
    });

    const filteredUsers = users.filter(user => {
      const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
      const email = user.email?.toLowerCase() || '';
      const phone = user.phoneNumber?.toLowerCase() || '';
      const address = user.address?.toLowerCase() || '';

      return (
        fullName.includes(searchLower) ||
        email.includes(searchLower) ||
        phone.includes(searchLower) ||
        address.includes(searchLower)
      );
    });

    const filteredPayments = payments.filter(payment => {
      const amount = payment.amount?.toString().toLowerCase() || '';
      const date = payment.createdAt.toLowerCase();

      return (
        amount.includes(searchLower) ||
        date.includes(searchLower)
      );
    });

    return {
      loans: filteredLoans,
      users: filteredUsers,
      payments: filteredPayments,
    };
  };

  const { loans: searchedLoans, users: searchedUsers, payments: searchedPayments } = searchAllData();

  // Toggle notification read status
  const toggleNotificationRead = (id: number) => {
    setNotifications(notifications.map(notification => 
      notification.id === id ? {...notification, read: !notification.read} : notification
    ));
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(notifications.map(notification => ({
      ...notification,
      read: true
    })));
  };

  // Calculate metrics from backend data
  const calculateMetrics = () => {
    const totalLoans = searchedLoans.length;
    const totalUsers = searchedUsers.length;

    const totalPayments = searchedPayments.reduce((sum, payment) => {
      if (!payment || payment.amount === null || payment.amount === undefined) {
        return sum;
      }
      const amount = typeof payment.amount === "number"
        ? payment.amount
        : parseFloat(payment.amount.toString());
      return sum + (isNaN(amount) ? 0 : amount);
    }, 0);

    const currentMonth = new Date().getMonth();
    const currentMonthLoans = searchedLoans.filter((loan) => {
      const createdAt = loan.createdAt;
      return createdAt
        ? new Date(createdAt).getMonth() === currentMonth
        : false;
    }).length;
    const previousMonthLoans = searchedLoans.filter((loan) => {
      const createdAt = loan.createdAt;
      return createdAt
        ? new Date(createdAt).getMonth() === currentMonth - 1
        : false;
    }).length;
    const loanTrend =
      previousMonthLoans > 0
        ? Math.round(
            ((currentMonthLoans - previousMonthLoans) / previousMonthLoans) *
              100
          )
        : 0;

    return {
      totalLoans,
      totalUsers,
      totalPayments,
      loanTrend: loanTrend > 0 ? `+${loanTrend}%` : `${loanTrend}%`,
    };
  };

  const metrics = calculateMetrics();

  const loanMetrics = [
    {
      label: "Total Loans",
      value: metrics.totalLoans.toString(),
      unit: "",
      trend: metrics.loanTrend,
      color: "from-orange-400 to-red-500",
      bgColor: "bg-orange-50",
      icon: DollarSign,
    },
    {
      label: "Total Users",
      value: metrics.totalUsers.toString(),
      unit: "",
      trend: "+8%",
      color: "from-red-500 to-orange-600",
      bgColor: "bg-red-50",
      icon: Users,
    },
    {
      label: "Payments",
      value: `₨${(metrics.totalPayments / 1000000).toFixed(1)}M`,
      unit: "",
      trend: "+12%",
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-50",
      icon: TrendingUp,
    },
  ];

  // Get pending loans
  const getPendingLoans = () => {
    const pendingLoans = searchedLoans.filter((loan) => {
      return loan.status === "pending" && (loan._id || loan.id);
    });

    return pendingLoans
      .sort((a, b) => {
        const dateA = new Date(
          a.applicationDate || a.createdAt || a.timestamps?.createdAt || 0
        );
        const dateB = new Date(
          b.applicationDate || b.createdAt || b.timestamps?.createdAt || 0
        );
        return dateB.getTime() - dateA.getTime();
      })
      .slice(0, 6)
      .map((loan) => {
        const user = searchedUsers.find(
          (u) =>
            u.id === loan.userId ||
            u.id === loan.user ||
            u.id === loan.user ||
            u.id.toString() === loan.user?.toString()
        );

        let borrowerName = "Unknown User";
        if (loan.borrowerInfo?.firstName && loan.borrowerInfo?.surname) {
          borrowerName = `${loan.borrowerInfo.firstName} ${loan.borrowerInfo.surname}`;
        } else if (user) {
          borrowerName = `${user.firstName} ${user.lastName}`;
        }

        let email = "No email";
        if (loan.borrowerInfo?.email) {
          email = loan.borrowerInfo.email;
        } else if (user?.email) {
          email = user.email;
        }

        let formattedAmount = "₨0";
        if (loan.amount !== null && loan.amount !== undefined) {
          const amount =
            typeof loan.amount === "number"
              ? loan.amount
              : parseFloat(loan.amount.toString());

          if (!isNaN(amount)) {
            formattedAmount = `₨${amount.toLocaleString()}`;
          }
        }

        const dateField =
          loan.applicationDate || loan.createdAt || loan.timestamps?.createdAt;

        return {
          id: loan._id || loan.id,
          borrower: borrowerName,
          email: email,
          amount: formattedAmount,
          status: loan.status || "pending",
          time: dateField ? getTimeAgo(dateField) : "Unknown time",
          type: loan.productType || loan.loanType || "Personal Loan",
          riskLevel: loan.riskLevel || "low",
        };
      });
  };

  // Helper function to calculate time ago
  const getTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "Less than an hour ago";
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`;
  };

  const calculateRiskAssessment = () => {
    if (searchedLoans.length === 0) return { low: 0, medium: 0, high: 0 };

    const riskCounts = searchedLoans.reduce(
      (acc, loan) => {
        const risk = loan.riskLevel || "low";
        acc[risk as keyof typeof acc] =
          (acc[risk as keyof typeof acc] || 0) + 1;
        return acc;
      },
      { low: 0, medium: 0, high: 0 }
    );

    const total = searchedLoans.length;
    return {
      low: Math.round((riskCounts.low / total) * 100),
      medium: Math.round((riskCounts.medium / total) * 100),
      high: Math.round((riskCounts.high / total) * 100),
    };
  };

  const riskAssessment = calculateRiskAssessment();

  // Get user avatar initials
  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Get user join time
  const getUserJoinTime = (createdAt?: string) => {
    if (!createdAt) return "Recently joined";
    return `Joined ${getTimeAgo(createdAt)}`;
  };

   if (loading) {
  return <DashboardSkeleton />;
}
  if (error) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      {/* Sidebar Component */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-orange-200/50 px-6 py-4 relative z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden mr-4 p-2 rounded-xl bg-orange-100/50 hover:bg-orange-200/50 transition-all duration-200"
              >
                <Menu className="w-5 h-5 text-orange-600" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-orange-500">Dashboard</span>
                  <span className="text-orange-300">›</span>
                  <span className="text-orange-700 font-medium">
                    Loan Management
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
                  placeholder="Search loans, users, payments..."
                  className="pl-10 pr-4 py-2 w-64 bg-orange-100/50 border border-orange-200/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 transition-all duration-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Notifications */}
              
            
              <div className="relative">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setNotificationsOpen(!notificationsOpen);
                  }}
                  className="notification-bell relative p-2 rounded-xl bg-orange-100/50 hover:bg-orange-200/50 transition-all duration-200 group"
                >
                  <Bell className="w-5 h-5 text-orange-600 group-hover:text-orange-700" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-medium">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  </div>
                </button>

                {/* Enhanced Notifications Popup */}
                {notificationsOpen && (
                  <div className="notifications-popup fixed right-6 top-20 w-96 bg-white rounded-xl shadow-2xl border border-orange-200/50 z-[9999] overflow-hidden transform transition-all duration-300 ease-in-out">
                    <div className="p-5 bg-gradient-to-r from-orange-50 to-red-50 border-b border-orange-200/50 flex justify-between items-center">
                      <h3 className="font-bold text-lg text-orange-800">Notifications</h3>
                      <div className="flex items-center space-x-3">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            markAllAsRead();
                          }}
                          className="text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
                        >
                          Mark all as read
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setNotificationsOpen(false);
                          }}
                          className="text-orange-500 hover:text-orange-700"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="max-h-[70vh] overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map(notification => (
                          <div 
                            key={notification.id}
                            className={`p-5 border-b border-orange-100/50 hover:bg-orange-50/50 cursor-pointer transition-colors ${!notification.read ? 'bg-orange-50' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleNotificationRead(notification.id);
                            }}
                          >
                            <div className="flex items-start space-x-4">
                              <div className={`mt-1 flex-shrink-0 w-3 h-3 rounded-full ${
                                notification.read ? 'bg-orange-200' : 'bg-orange-500'
                              }`}></div>
                              <div className="flex-1">
                                <div className="flex justify-between items-start">
                                  <h4 className="font-semibold text-lg text-orange-800">{notification.title}</h4>
                                  <span className="text-xs text-orange-400">{notification.time}</span>
                                </div>
                                <p className="text-base text-orange-600 mt-2">{notification.message}</p>
                                <div className="mt-3 flex items-center">
                                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                                    notification.type === 'loan' 
                                      ? 'bg-purple-100 text-purple-800' 
                                      : notification.type === 'payment' 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-blue-100 text-blue-800'
                                  }`}>
                                    {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center">
                          <Bell className="w-12 h-12 mx-auto text-orange-300 mb-4" />
                          <p className="text-lg text-orange-500 font-medium">No notifications to display</p>
                          <p className="text-sm text-orange-400 mt-1">You're all caught up!</p>
                        </div>
                      )}
                    </div>
                    <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 border-t border-orange-200/50 text-center">
                      
                    </div>
                  </div>
                )}
              </div>

              {/* User Profile */}
              <div className="flex items-center space-x-3 pl-4 border-l border-orange-200/50">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-semibold text-orange-700">
                    Sarah Johnson
                  </div>
                  <div className="text-xs text-orange-500">Loan Manager</div>
                </div>
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25">
                    <span className="text-white font-semibold text-sm">SJ</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full shadow-sm"></div>
                </div>
                <ChevronDown className="w-4 h-4 text-orange-400" />
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Search Results Summary */}
          {searchTerm && (
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-orange-200/50">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-orange-600">
                  Search results for: <span className="font-semibold">"{searchTerm}"</span>
                </h3>
                <button 
                  onClick={() => setSearchTerm("")}
                  className="text-xs text-orange-500 hover:text-orange-700"
                >
                  Clear search
                </button>
              </div>
              <div className="flex space-x-6 mt-2 text-xs text-orange-500">
                <span>{searchedLoans.length} loans</span>
                <span>{searchedUsers.length} users</span>
                <span>{searchedPayments.length} payments</span>
              </div>
            </div>
          )}

          {/* Hero Section */}
          <div className="relative rounded-3xl px-10 py-20 text-white overflow-hidden bg-gradient-to-br from-orange-900 via-red-900 to-yellow-900 shadow-2xl min-h-[300px]">
            {/* Background image layer */}
            <div
              className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-50"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')",
              }}
            ></div>

            {/* Softer Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-600/10 via-red-500/5 to-transparent z-0"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-yellow-400/10 to-transparent rounded-full blur-3xl z-0"></div>
            {/* Content */}
            <div className="relative z-10 flex items-center justify-between">
              <div className="max-w-2xl">
                <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 mb-4">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">System Active</span>
                </div>

                <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white to-orange-200 bg-clip-text text-transparent">
                  Welcome back, Sarah
                </h1>
                <p className="text-lg text-orange-200 mb-8 max-w-lg">
                  Monitor loan performance, track key metrics, and make
                  data-driven decisions to optimize your lending portfolio.
                </p>

                <div className="flex items-center space-x-4">
                  <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transform hover:scale-105">
                    Create New Loan
                  </button>
                  <button className="px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl font-semibold hover:bg-white/20 transition-all duration-200">
                    View Reports
                  </button>
                </div>
              </div>

              <div className="hidden lg:block relative">
                <div className="w-40 h-40 bg-gradient-to-br from-white/10 to-white/5 rounded-3xl backdrop-blur-sm border border-white/20 flex items-center justify-center">
                  <Target className="w-20 h-20 text-white/80" />
                </div>
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse shadow-lg shadow-yellow-400/50"></div>
              </div>
            </div>
          </div>

          {/* Loan Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {loanMetrics.map((metric, index) => {
              const IconComponent = metric.icon;
              return (
                <div
                  key={index}
                  className="group relative bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/50 hover:transform hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent rounded-2xl"></div>

                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`p-3 rounded-2xl ${metric.bgColor} group-hover:scale-110 transition-transform duration-300`}
                      >
                        <IconComponent className="w-6 h-6 text-orange-700" />
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${metric.color} shadow-lg`}
                      >
                        {metric.trend}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-orange-600">
                        {metric.label}
                      </h3>
                      <div className="flex items-baseline space-x-2">
                        <span className="text-3xl font-bold text-orange-800">
                          {metric.value}
                        </span>
                        <span className="text-sm text-orange-500">
                          {metric.unit}
                        </span>
                      </div>
                    </div>

                    {/* Mini chart */}
                    <div className="mt-4 h-12 flex items-end justify-center space-x-1">
                      {[...Array(12)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-1.5 rounded-full bg-gradient-to-t ${metric.color} opacity-60 group-hover:opacity-100 transition-opacity duration-300`}
                          style={{ height: `${Math.random() * 70 + 30}%` }}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Users List */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-bold text-orange-800 mb-1">
                    System Users
                  </h3>
                  <p className="text-sm text-orange-500">
                    {searchedUsers.length} registered users
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="px-4 py-2 bg-orange-100 rounded-xl">
                    <span className="text-sm font-medium text-orange-700">
                      All Users
                    </span>
                  </div>
                </div>
              </div>

              {/* Scrollable Users List */}
              <div className="space-y-4 max-h-80 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-orange-200 scrollbar-track-orange-50">
                {searchedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="group flex items-center justify-between p-4 bg-gradient-to-r from-white/50 to-orange-50/30 rounded-xl border border-orange-200/30 hover:border-orange-300/50 transition-all duration-300 hover:shadow-md"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25">
                          <span className="text-white font-semibold text-sm">
                            {getUserInitials(user.firstName, user.lastName)}
                          </span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full shadow-sm"></div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-orange-800">
                            {user.firstName} {user.lastName}
                          </h4>
                          <div className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded-full font-medium">
                            Active
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-orange-600">
                          {user.email && (
                            <div className="flex items-center space-x-1">
                              <Mail className="w-3 h-3" />
                              <span className="truncate max-w-32">
                                {user.email}
                              </span>
                            </div>
                          )}
                          {user.phoneNumber && (
                            <div className="flex items-center space-x-1">
                              <Phone className="w-3 h-3" />
                              <span>{user.phoneNumber}</span>
                            </div>
                          )}
                        </div>
                        {user.address && (
                          <div className="flex items-center space-x-1 text-xs text-orange-500 mt-1">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate max-w-48">
                              {user.address}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-orange-500 mb-1">
                        {getUserJoinTime(user.createdAt)}
                      </div>
                      <button className="text-xs text-orange-600 hover:text-orange-700 font-medium group-hover:underline transition-colors duration-200">
                        View Profile
                      </button>
                    </div>
                  </div>
                ))}

                {searchedUsers.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <User className="w-8 h-8 text-orange-400" />
                    </div>
                    <h4 className="text-lg font-semibold text-orange-800 mb-2">
                      No Users Found
                    </h4>
                    <p className="text-orange-500 text-sm">
                      {searchTerm ? "No users match your search" : "Users will appear here once they register"}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Risk Assessment */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50">
              <div className="mb-8">
                <h3 className="text-xl font-bold text-orange-800 mb-1">
                  Risk Assessment
                </h3>
                <p className="text-sm text-orange-500">
                  Portfolio risk distribution
                </p>
              </div>

              {/* Risk Categories */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-orange-600">
                      Low Risk
                    </span>
                    <span className="text-sm font-bold text-orange-800">
                      {riskAssessment.low}%
                    </span>
                  </div>
                  <div className="w-full bg-orange-200 rounded-full h-3">
                    <div
                      className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-1000"
                      style={{ width: `${riskAssessment.low}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-orange-600">
                      Medium Risk
                    </span>
                    <span className="text-sm font-bold text-orange-800">
                      {riskAssessment.medium}%
                    </span>
                  </div>
                  <div className="w-full bg-orange-200 rounded-full h-3">
                    <div
                      className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full transition-all duration-1000"
                      style={{ width: `${riskAssessment.medium}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-orange-600">
                      High Risk
                    </span>
                    <span className="text-sm font-bold text-orange-800">
                      {riskAssessment.high}%
                    </span>
                  </div>
                  <div className="w-full bg-orange-200 rounded-full h-3">
                    <div
                      className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all duration-1000"
                      style={{ width: `${riskAssessment.high}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Risk Score */}
              <div className="mt-8 text-center p-6 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl">
                <div className="text-3xl font-bold text-orange-800 mb-2">
                  {(
                    (riskAssessment.medium * 0.5 + riskAssessment.high * 1) /
                    10
                  ).toFixed(1)}
                </div>
                <div className="text-sm text-orange-600 font-medium">
                  Overall Risk Score
                </div>
                <div className="text-xs text-orange-500 mt-1">
                  Out of 10 (Lower is better)
                </div>
              </div>
            </div>
          </div>

          {/* Pending Loans */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-orange-800 mb-1">
                  Pending Loan Applications
                </h3>
                <p className="text-sm text-orange-500">
                  {getPendingLoans().length} applications awaiting review
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className="px-4 py-2 bg-orange-100 rounded-xl">
                  <span className="text-sm font-medium text-orange-700">
                    All Pending
                  </span>
                </div>
                <button className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl text-sm font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg shadow-orange-500/25">
                  Review All
                </button>
              </div>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-orange-200 scrollbar-track-orange-50">
              {getPendingLoans().map((loan) => (
                <div
                  key={loan.id}
                  className="group flex items-center justify-between p-6 bg-gradient-to-r from-white/50 to-orange-50/30 rounded-xl border border-orange-200/30 hover:border-orange-300/50 transition-all duration-300 hover:shadow-md"
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25">
                        <span className="text-white font-semibold text-sm">
                          {loan.borrower
                            .split(" ")
                            .map((n) => n.charAt(0))
                            .join("")}
                        </span>
                      </div>
                      <div
                        className={`absolute -bottom-1 -right-1 w-4 h-4 border-2 border-white rounded-full shadow-sm ${
                          loan.riskLevel === "high"
                            ? "bg-red-500"
                            : loan.riskLevel === "medium"
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                      ></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold text-orange-800 text-lg">
                          {loan.borrower}
                        </h4>
                        <div
                          className={`px-2 py-1 text-xs rounded-full font-medium ${
                            loan.riskLevel === "high"
                              ? "bg-red-100 text-red-600"
                              : loan.riskLevel === "medium"
                              ? "bg-yellow-100 text-yellow-600"
                              : "bg-green-100 text-green-600"
                          }`}
                        >
                          {loan.riskLevel} Risk
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-orange-600 mb-1">
                        <div className="flex items-center space-x-1">
                          <Mail className="w-3 h-3" />
                          <span className="truncate max-w-40">
                            {loan.email}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{loan.time}</span>
                        </div>
                      </div>
                      <div className="text-xs text-orange-500">{loan.type}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-orange-800 mb-1">
                        {loan.amount}
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          loan.status === "pending"
                            ? "bg-yellow-100 text-yellow-600"
                            : loan.status === "approved"
                            ? "bg-green-100 text-green-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {loan.status}
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2">
                      <button className="p-2 bg-green-100 hover:bg-green-200 rounded-lg transition-colors duration-200 group">
                        <CheckCircle className="w-5 h-5 text-green-600 group-hover:text-green-700" />
                      </button>
                      <button className="p-2 bg-red-100 hover:bg-red-200 rounded-lg transition-colors duration-200 group">
                        <XCircle className="w-5 h-5 text-red-600 group-hover:text-red-700" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {getPendingLoans().length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-orange-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-orange-800 mb-2">
                    No Pending Loans
                  </h4>
                  <p className="text-orange-500 text-sm">
                    {searchTerm ? "No pending loans match your search" : "All loan applications have been processed"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;