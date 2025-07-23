import { useState, useEffect } from "react";
import {
  Search,
  Download,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Menu,
  Bell,
  ChevronDown,
  RefreshCw,
  MoreHorizontal,
  X,
} from "lucide-react";
import Sidebar from "../../components/Sidebar";
import LoanService from "../../services/admin_Services/loan_Service";
import FullPageSkeleton from  "../../components/skeletonloading"; 


// Define proper types

interface Loan {
  _id: string;
  user: string;
  productType: string;
  borrowerInfo: {
    firstName: string;
    middleNames?: string;
    surname: string;
    email: string;
    phone: string;
    mobile: string;
  };
  amount: number;
  balance: number;
  status: "pending" | "approved" | "rejected" | "active" | "closed";
  applicationDate: string;
  approvalDate?: string;
  startDate?: string;
  endDate?: string;
  interestRate: number;
  term: number;
  paymentSchedule: Array<{
    dueDate: string;
    amountDue: number;
    amountPaid: number;
    paidOn?: string;
    status: "pending" | "paid" | "overdue";
  }>;
}
interface TransformedLoan {
  id: string;
  borrower: string;
  amount: number;
  disbursedAmount: number;
  outstandingBalance: number;
  status: "pending" | "approved" | "rejected" | "active" | "closed";
  type: string;
  disbursedDate: string | null;
  dueDate: string;
  nextPaymentDate: string | null;
  nextPaymentAmount: number;
  interestRate: number;
  tenure: number;
  completedPayments: number;
  totalPayments: number;
  overdueDays: number;
  riskLevel: string;
}

const LoanTracking = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLoan, setSelectedLoan] = useState<TransformedLoan | null>(
    null
  );
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);

  // Mock notification data
  const notifications = [
    {
      id: 1,
      title: "Payment Overdue",
      message: "Loan #L-10025 is overdue by 15 days",
      date: "10 mins ago",
      read: false,
      type: "alert"
    },
    {
      id: 2,
      title: "New Loan Application",
      message: "John Smith has applied for a personal loan",
      date: "2 hours ago",
      read: false,
      type: "info"
    },
    {
      id: 3,
      title: "Payment Received",
      message: "Payment of ₨25,000 received for Loan #L-10018",
      date: "1 day ago",
      read: true,
      type: "success"
    }
  ];

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        setLoading(true);
        const response = await LoanService.getAllLoans();
        setLoans(response.data || response);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Failed to fetch loans");
        console.error("Error fetching loans:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLoans();
  }, []);

  // Close popups when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      if (showNotifications && !target.closest('.notifications-container') && !target.closest('.notifications-button')) {
        setShowNotifications(false);
      }
      
      if (showExportOptions && !target.closest('.export-container') && !target.closest('.export-button')) {
        setShowExportOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };

    
  }, [showNotifications, showExportOptions]);

  const transformLoanData = (backendLoan: Loan) => {
    const borrowerName = `${backendLoan.borrowerInfo.firstName} ${
      backendLoan.borrowerInfo.middleNames || ""
    } ${backendLoan.borrowerInfo.surname}`.trim();

    const getOverdueDays = () => {
      const overduePayments = backendLoan.paymentSchedule.filter(
        (payment) => payment.status === "overdue"
      );
      if (overduePayments.length === 0) return 0;

      const oldestOverdue = overduePayments[0];
      const dueDate = new Date(oldestOverdue.dueDate);
      const today = new Date();
      return Math.floor(
        (today.getTime() - dueDate.getTime()) / (1000 * 3600 * 24)
      );
    };
     
    
    const totalPayments = backendLoan.paymentSchedule.length;
    const completedPayments = backendLoan.paymentSchedule.filter(
      (payment) => payment.status === "paid"
    ).length;

    const nextPayment = backendLoan.paymentSchedule.find(
      (payment) => payment.status === "pending"
    );

    const overdueDays = getOverdueDays();
    const getRiskLevel = () => {
      if (overdueDays > 30) return "high";
      if (overdueDays > 0 || backendLoan.status === "rejected") return "medium";
      return "low";
    };

    return {
      id: backendLoan._id,
      borrower: borrowerName,
      amount: backendLoan.amount || 0,
      disbursedAmount: backendLoan.status === "active" ? backendLoan.amount : 0,
      outstandingBalance: backendLoan.balance || 0,
      status: backendLoan.status,
      type: backendLoan.productType,
      disbursedDate: backendLoan.startDate || null,
      dueDate: backendLoan.endDate || "",
      nextPaymentDate: nextPayment ? nextPayment.dueDate : null,
      nextPaymentAmount: nextPayment ? nextPayment.amountDue : 0,
      interestRate: backendLoan.interestRate || 0,
      tenure: backendLoan.term || 0,
      completedPayments,
      totalPayments,
      overdueDays,
      riskLevel: getRiskLevel(),
    };
  };
  
  if (loading) {
    return <FullPageSkeleton  />;
  }


  const transformedLoans = loans.map(transformLoanData);
  const filteredLoans = transformedLoans.filter((loan) => {
    const matchesFilter =
      activeFilter === "all" ||
      loan.status === activeFilter ||
      (activeFilter === "overdue" && loan.overdueDays > 0);

    const matchesSearch =
      loan.borrower.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.type.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: string, overdueDays: number) => {
    if (overdueDays > 0) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 flex items-center space-x-1">
          <AlertTriangle className="w-3 h-3" />
          <span>Overdue ({overdueDays}d)</span>
        </span>
      );
    }

    switch (status) {
      case "active":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 flex items-center space-x-1">
            <CheckCircle className="w-3 h-3" />
            <span>Active</span>
          </span>
        );
      case "pending":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>Pending</span>
          </span>
        );
      case "closed":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 flex items-center space-x-1">
            <CheckCircle className="w-3 h-3" />
            <span>Closed</span>
          </span>
        );
      case "rejected":
        return (
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 flex items-center space-x-1">
            <XCircle className="w-3 h-3" />
            <span>Rejected</span>
          </span>
        );
      default:
        return null;
    }
  };

  const getRiskBadge = (riskLevel: string) => {
    switch (riskLevel) {
      case "low":
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            Low Risk
          </span>
        );
      case "medium":
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
            Medium Risk
          </span>
        );
      case "high":
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
            High Risk
          </span>
        );
      default:
        return null;
    }
  };

  const summaryStats = {
    totalLoans: transformedLoans.length,
    activeLoans: transformedLoans.filter((l) => l.status === "active").length,
    overdueLoans: transformedLoans.filter((l) => l.overdueDays > 0).length,
    totalOutstanding: transformedLoans.reduce(
      (sum, loan) => sum + loan.outstandingBalance,
      0
    ),
    totalDisbursed: transformedLoans.reduce(
      (sum, loan) => sum + loan.disbursedAmount,
      0
    ),
  };

  const handleExport = (format: string) => {
    setShowExportOptions(false);
    alert(`Exporting data in ${format} format...`);
  };

  // Replace your loading check with this structure:
return (
  <div className="flex h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 relative">
    {/* Sidebar - Always visible */}
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
                    Loan Tracking
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
                  placeholder="Search loans..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 bg-orange-100/50 border border-orange-200/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 transition-all duration-200"
                />
              </div>

              {/* Notifications */}
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="notifications-button relative p-2 rounded-xl bg-orange-100/50 hover:bg-orange-200/50 transition-all duration-200 group"
                >
                  <Bell className="w-5 h-5 text-orange-600 group-hover:text-orange-700" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-medium">
                      {summaryStats.overdueLoans}
                    </span>
                  </div>
                </button>

                {/* Notification Dropdown */}
                {showNotifications && (
                  <div className="notifications-container absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-orange-200/50 z-[100]">
                    <div className="p-4 border-b border-orange-200/50 flex justify-between items-center">
                      <h3 className="font-semibold text-orange-800">Notifications</h3>
                      <button 
                        onClick={() => setShowNotifications(false)}
                        className="p-1 rounded-full hover:bg-orange-100"
                      >
                        <X className="w-4 h-4 text-orange-500" />
                      </button>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div 
                          key={notification.id}
                          className={`p-4 border-b border-orange-200/30 hover:bg-orange-50/50 cursor-pointer transition-colors ${
                            !notification.read ? "bg-blue-50/50" : ""
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`mt-1 flex-shrink-0 ${
                              notification.type === 'alert' ? 'text-red-500' : 
                              notification.type === 'info' ? 'text-blue-500' : 
                              'text-green-500'
                            }`}>
                              {notification.type === 'alert' ? (
                                <AlertTriangle className="w-5 h-5" />
                              ) : notification.type === 'info' ? (
                                <Bell className="w-5 h-5" />
                              ) : (
                                <CheckCircle className="w-5 h-5" />
                              )}
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-semibold text-orange-800">
                                {notification.title}
                              </h4>
                              <p className="text-sm text-orange-600 mt-1">
                                {notification.message}
                              </p>
                              <div className="text-xs text-orange-400 mt-2">
                                {notification.date}
                              </div>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 bg-orange-50/50 text-center">
                      <button className="text-sm font-medium text-orange-600 hover:text-orange-800">
                        Mark all as read
                      </button>
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

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 space-y-8 relative z-0">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-800">
                    {summaryStats.totalLoans}
                  </div>
                  <div className="text-sm text-orange-600">Total Loans</div>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-green-100 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-800">
                    {summaryStats.activeLoans}
                  </div>
                  <div className="text-sm text-orange-600">Active Loans</div>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-red-100 rounded-xl">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-800">
                    {summaryStats.overdueLoans}
                  </div>
                  <div className="text-sm text-orange-600">Overdue Loans</div>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-yellow-100 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-800">
                    {(summaryStats.totalDisbursed / 1000000).toFixed(1)}
                  </div>
                  <div className="text-sm text-orange-600">Total Disbursed</div>
                </div>
              </div>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-orange-100 rounded-xl">
                  <TrendingDown className="w-6 h-6 text-orange-600" />
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-800">
                    {(summaryStats.totalOutstanding / 1000000).toFixed(1)}
                  </div>
                  <div className="text-sm text-orange-600">Outstanding</div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Actions */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex flex-wrap items-center space-x-2">
                <button
                  onClick={() => setActiveFilter("all")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeFilter === "all"
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
                      : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                  }`}
                >
                  All Loans
                </button>
                <button
                  onClick={() => setActiveFilter("active")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeFilter === "active"
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
                      : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setActiveFilter("overdue")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeFilter === "overdue"
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
                      : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                  }`}
                >
                  Overdue
                </button>
                <button
                  onClick={() => setActiveFilter("pending")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeFilter === "pending"
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
                      : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                  }`}
                >
                  Pending
                </button>
                <button
                  onClick={() => setActiveFilter("closed")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    activeFilter === "closed"
                      ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg"
                      : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                  }`}
                >
                  Closed
                </button>
              </div>

              <div className="flex items-center space-x-3">
                <button
                  onClick={() => {
                    const fetchLoans = async () => {
                      try {
                        setLoading(true);
                        const response = await LoanService.getAllLoans();
                        setLoans(response.data || response);
                        setError(null);
                      } catch (err: any) {
                        setError(err.message || "Failed to fetch loans");
                      } finally {
                        setLoading(false);
                      }
                    };
                    fetchLoans();
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-orange-100 hover:bg-orange-200 rounded-xl text-sm font-medium text-orange-700 transition-all duration-200"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                  />
                  <span>Refresh</span>
                </button>
                <div className="relative">
                  <button 
                    onClick={() => setShowExportOptions(!showExportOptions)}
                    className="export-button flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-xl text-sm font-medium text-white transition-all duration-200"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </button>

                  {/* Export Options Dropdown */}
                  {showExportOptions && (
                    <div className="export-container absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-orange-200/50 z-[100]">
                      <div className="py-1">
                        <button
                          onClick={() => handleExport("CSV")}
                          className="block w-full text-left px-4 py-2 text-sm text-orange-700 hover:bg-orange-50"
                        >
                          Export as CSV
                        </button>
                        <button
                          onClick={() => handleExport("Excel")}
                          className="block w-full text-left px-4 py-2 text-sm text-orange-700 hover:bg-orange-50"
                        >
                          Export as Excel
                        </button>
                        <button
                          onClick={() => handleExport("PDF")}
                          className="block w-full text-left px-4 py-2 text-sm text-orange-700 hover:bg-orange-50"
                        >
                          Export as PDF
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Loans Table */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-orange-200/50">
              <h3 className="text-xl font-bold text-orange-800">
                Loan Tracking
              </h3>
              <p className="text-sm text-orange-600 mt-1">
                {filteredLoans.length} loans found
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-orange-50/50">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-orange-700">
                      Loan ID
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-orange-700">
                      Borrower
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-orange-700">
                      Type
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-orange-700">
                      Amount
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-orange-700">
                      Outstanding
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-orange-700">
                      Status
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-orange-700">
                      Progress
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-orange-700">
                      Next Payment
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-orange-700">
                      Risk
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-orange-700">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-orange-200/30">
                  {filteredLoans.map((loan) => (
                    <tr
                      key={loan.id}
                      className="hover:bg-orange-50/30 transition-colors duration-200"
                    >
                      <td className="py-4 px-6">
                        <div className="font-medium text-orange-800">
                          {loan.id}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-medium text-orange-800">
                          {loan.borrower}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-orange-600">
                          {loan.type}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-medium text-orange-800">
                          ₨{loan.amount.toLocaleString()}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-medium text-orange-800">
                          ₨{loan.outstandingBalance.toLocaleString()}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {getStatusBadge(loan.status, loan.overdueDays)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-orange-600">
                              {loan.completedPayments}/{loan.totalPayments}
                            </span>
                            <span className="text-orange-600">
                              {Math.round(
                                (loan.completedPayments / loan.totalPayments) *
                                  100
                              )}
                              %
                            </span>
                          </div>
                          <div className="w-full bg-orange-200 rounded-full h-2">
                            <div
                              className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-300"
                              style={{
                                width: `${
                                  (loan.completedPayments /
                                    loan.totalPayments) *
                                  100
                                }%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {loan.nextPaymentDate ? (
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-orange-800">
                              ₨{loan.nextPaymentAmount.toLocaleString()}
                            </div>
                            <div className="text-xs text-orange-600">
                              {loan.nextPaymentDate}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">N/A</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {getRiskBadge(loan.riskLevel)}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedLoan(loan)}
                            className="p-2 rounded-lg bg-orange-100 hover:bg-orange-200 text-orange-700 transition-colors duration-200"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 rounded-lg bg-orange-100 hover:bg-orange-200 text-orange-700 transition-colors duration-200">
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {loading && (
              <div className="flex items-center justify-center h-64">
                <div className="flex items-center space-x-2">
                  <RefreshCw className="w-6 h-6 text-orange-500 animate-spin" />
                  <span className="text-orange-600">Loading loans...</span>
                </div>
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <div className="text-sm font-semibold text-red-800">
                    {error}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Loan Details Modal */}
      {selectedLoan && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-orange-200/50">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-orange-800">
                  Loan Details - {selectedLoan.id}
                </h3>
                <button
                  onClick={() => setSelectedLoan(null)}
                  className="p-2 rounded-lg bg-orange-100 hover:bg-orange-200 text-orange-700"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-orange-600">
                    Borrower
                  </label>
                  <div className="text-lg font-semibold text-orange-800">
                    {selectedLoan.borrower}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-orange-600">
                    Loan Type
                  </label>
                  <div className="text-lg font-semibold text-orange-800">
                    {selectedLoan.type}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-orange-600">
                    Loan Amount
                  </label>
                  <div className="text-lg font-semibold text-orange-800">
                    ₨{selectedLoan.amount.toLocaleString()}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-orange-600">
                    Interest Rate
                  </label>
                  <div className="text-lg font-semibold text-orange-800">
                    {selectedLoan.interestRate}%
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-orange-600">
                    Outstanding Balance
                  </label>
                  <div className="text-lg font-semibold text-red-600">
                    ₨{selectedLoan.outstandingBalance.toLocaleString()}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-orange-600">
                    Tenure
                  </label>
                  <div className="text-lg font-semibold text-orange-800">
                    {selectedLoan.tenure} months
                  </div>
                </div>
              </div>

              <div className="border-t border-orange-200/50 pt-6">
                <h4 className="text-lg font-semibold text-orange-800 mb-4">
                  Payment Status
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-orange-600">
                      Payment Progress
                    </span>
                    <span className="text-sm font-semibold text-orange-800">
                      {selectedLoan.completedPayments} of{" "}
                      {selectedLoan.totalPayments} payments
                    </span>
                  </div>
                  <div className="w-full bg-orange-200 rounded-full h-3">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          (selectedLoan.completedPayments /
                            selectedLoan.totalPayments) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                  <div className="text-center text-sm text-orange-600">
                    {Math.round(
                      (selectedLoan.completedPayments /
                        selectedLoan.totalPayments) *
                        100
                    )}
                    % Complete
                  </div>
                </div>
              </div>

              <div className="border-t border-orange-200/50 pt-6">
                <h4 className="text-lg font-semibold text-orange-800 mb-4">
                  Important Dates
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-orange-600">
                      Disbursed Date
                    </label>
                    <div className="text-base font-semibold text-orange-800">
                      {selectedLoan.disbursedDate || "Not disbursed"}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-orange-600">
                      Due Date
                    </label>
                    <div className="text-base font-semibold text-orange-800">
                      {selectedLoan.dueDate}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-orange-600">
                      Next Payment Date
                    </label>
                    <div className="text-base font-semibold text-orange-800">
                      {selectedLoan.nextPaymentDate || "N/A"}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-orange-600">
                      Next Payment Amount
                    </label>
                    <div className="text-base font-semibold text-orange-800">
                      ₨{selectedLoan.nextPaymentAmount.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-orange-200/50 pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-sm font-medium text-orange-600">
                      Current Status:
                    </div>
                    {getStatusBadge(
                      selectedLoan.status,
                      selectedLoan.overdueDays
                    )}
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-sm font-medium text-orange-600">
                      Risk Level:
                    </div>
                    {getRiskBadge(selectedLoan.riskLevel)}
                  </div>
                </div>
              </div>

              {selectedLoan.overdueDays > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <div className="text-sm font-semibold text-red-800">
                      This loan is overdue by {selectedLoan.overdueDays} days
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-orange-50/50 border-t border-orange-200/50 flex justify-end space-x-3">
              <button
                onClick={() => setSelectedLoan(null)}
                className="px-4 py-2 bg-orange-100 hover:bg-orange-200 rounded-xl text-sm font-medium text-orange-700 transition-all duration-200"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 rounded-xl text-sm font-medium text-white transition-all duration-200">
                Edit Loan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanTracking;