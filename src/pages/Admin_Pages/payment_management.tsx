import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  DollarSign,
  Plus,
  Clock,
  Menu,
  Bell,
  ChevronDown,
  MoreVertical,
  CreditCard,
  Smartphone,
  Building,
  Banknote,
} from "lucide-react";
import Sidebar from "../../components/Sidebar";
import PaymentService from "../../services/user_Services/payment_Service";
import PaymentDetailsModal from "../../components/admin_payments/view_payment";

interface Payment {
  id: string;
  loanId: string;
  borrowerName: string;
  borrowerEmail: string;
  amountPaid: string;
  paymentDate: string;
  paymentMethod: string;
  paymentReference: string;
  forInstallmentDate: string;
  status: string;
  notes: string;
  loanAmount: string;
  loanType: string;
}

const SkeletonLoader = () => {
  return (
    <div className="space-y-6">
      {/* Page Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-gray-200 rounded-xl animate-pulse"></div>
          <div className="h-4 w-80 bg-gray-200 rounded-xl animate-pulse"></div>
        </div>
        <div className="flex space-x-3">
          <div className="h-10 w-24 bg-gray-200 rounded-xl animate-pulse"></div>
          <div className="h-10 w-36 bg-gray-200 rounded-xl animate-pulse"></div>
        </div>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 w-24 bg-gray-200 rounded-xl animate-pulse"></div>
                <div className="h-6 w-16 bg-gray-200 rounded-xl animate-pulse"></div>
              </div>
              <div className="p-3 bg-gray-200 rounded-xl animate-pulse">
                <div className="w-6 h-6"></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Skeleton */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="h-8 w-24 bg-gray-200 rounded-xl animate-pulse"></div>
            <div className="h-10 w-32 bg-gray-200 rounded-xl animate-pulse"></div>
          </div>
          <div className="h-4 w-48 bg-gray-200 rounded-xl animate-pulse"></div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-orange-100/50 to-red-100/50">
              <tr>
                {[...Array(6)].map((_, i) => (
                  <th key={i} className="px-6 py-4">
                    <div className="h-4 w-24 bg-gray-300 rounded-xl animate-pulse"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-200/30">
              {[...Array(5)].map((_, i) => (
                <tr key={i}>
                  {[...Array(6)].map((_, j) => (
                    <td key={j} className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 w-32 bg-gray-200 rounded-xl animate-pulse"></div>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Skeleton */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/50">
        <div className="flex items-center justify-between">
          <div className="h-4 w-48 bg-gray-200 rounded-xl animate-pulse"></div>
          <div className="flex items-center space-x-2">
            <div className="h-10 w-20 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-10 w-8 bg-gray-300 rounded-lg animate-pulse"></div>
            <div className="h-10 w-20 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PaymentManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Fetch payments from backend
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await PaymentService.getAllPayments();

        const transformedPayments: Payment[] =
          response.data?.map((payment: any) => ({
            id: payment._id || payment.id || "",
            loanId: payment.loan?._id || payment.loan || "",
            borrowerName:
              `${payment.user?.firstName || ""} ${
                payment.user?.surname || ""
              }`.trim() ||
              `${payment.loan?.borrowerInfo?.firstName || ""} ${
                payment.loan?.borrowerInfo?.surname || ""
              }`.trim() ||
              "Unknown",
            borrowerEmail:
              payment.user?.email || payment.loan?.borrowerInfo?.email || "",
            amountPaid: payment.amountPaid
              ? `₨${payment.amountPaid.toLocaleString()}`
              : "₨0",
            paymentDate: payment.paymentDate
              ? new Date(payment.paymentDate).toISOString().split("T")[0]
              : "",
            paymentMethod: payment.paymentMethod || "Unknown",
            paymentReference: payment.paymentReference || "",
            forInstallmentDate: payment.forInstallmentDate
              ? new Date(payment.forInstallmentDate).toISOString().split("T")[0]
              : "",
            status: payment.status || "pending",
            notes: payment.notes || "",
            loanAmount: payment.loan?.amount
              ? `₨${payment.loan.amount.toLocaleString()}`
              : "₨0",
            loanType: payment.loan?.productType || "Unknown",
          })) || [];

        setPayments(transformedPayments);
      } catch (err: any) {
        const errorMessage = err?.message || err || "Failed to fetch payments";
        setError(errorMessage);
        console.error("Error fetching payments:", err);
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "bg-green-100 text-green-700 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "failed":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "Confirmed";
      case "pending":
        return "Pending";
      case "failed":
        return "Failed";
      default:
        return "Unknown";
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case "ecocash":
      case "onemoney":
      case "innsbucks":
        return <Smartphone className="w-4 h-4" />;
      case "banktransfer":
        return <Building className="w-4 h-4" />;
      case "card":
        return <CreditCard className="w-4 h-4" />;
      case "cash":
        return <Banknote className="w-4 h-4" />;
      default:
        return <DollarSign className="w-4 h-4" />;
    }
  };

  const getPaymentMethodColor = (method: string) => {
    switch (method.toLowerCase()) {
      case "ecocash":
        return "bg-orange-100 text-orange-700";
      case "onemoney":
        return "bg-blue-100 text-blue-700";
      case "innsbucks":
        return "bg-purple-100 text-purple-700";
      case "banktransfer":
        return "bg-indigo-100 text-indigo-700";
      case "card":
        return "bg-cyan-100 text-cyan-700";
      case "cash":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const filterOptions = [
    { value: "all", label: "All Payments" },
    { value: "confirmed", label: "Confirmed" },
    { value: "pending", label: "Pending" },
    { value: "failed", label: "Failed" },
  ];

  const filteredPayments = payments.filter((payment) => {
    const matchesFilter =
      selectedFilter === "all" ||
      payment.status.toLowerCase() === selectedFilter.toLowerCase();
    const matchesSearch =
      payment.borrowerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.paymentReference
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      payment.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleConfirm = async (paymentId: string) => {
    try {
      await PaymentService.updatePayment(paymentId, { status: "confirmed" });
      setPayments((prev) =>
        prev.map((payment) =>
          payment.id === paymentId
            ? { ...payment, status: "confirmed" }
            : payment
        )
      );
    } catch (err) {
      console.error("Error confirming payment:", err);
    }
  };

  const handleReject = async (paymentId: string) => {
    try {
      await PaymentService.updatePayment(paymentId, { status: "failed" });
      setPayments((prev) =>
        prev.map((payment) =>
          payment.id === paymentId ? { ...payment, status: "failed" } : payment
        )
      );
    } catch (err) {
      console.error("Error rejecting payment:", err);
    }
  };

  const handleViewDetails = async (paymentId: string) => {
    try {
      const response = await PaymentService.getPaymentById(paymentId);
      setSelectedPayment(response.data);
      setShowDetailsModal(true);
    } catch (err) {
      console.error("Error fetching payment details:", err);
      const payment = payments.find((p) => p.id === paymentId);
      if (payment) {
        setShowDetailsModal(true);
      }
    }
  };

  const getPendingCount = () => {
    return payments.filter(
      (payment) => payment.status.toLowerCase() === "pending"
    ).length;
  };

  const getConfirmedCount = () => {
    return payments.filter(
      (payment) => payment.status.toLowerCase() === "confirmed"
    ).length;
  };

  const getFailedCount = () => {
    return payments.filter(
      (payment) => payment.status.toLowerCase() === "failed"
    ).length;
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      {/* Sidebar Component */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header */}
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
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-orange-500">Dashboard</span>
                  <span className="text-orange-300">›</span>
                  <span className="text-orange-700 font-medium">
                    Payment Management
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
                  placeholder="Search payments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 bg-orange-100/50 border border-orange-200/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 transition-all duration-200"
                />
              </div>

              {/* Notifications */}
              <button className="relative p-2 rounded-xl bg-orange-100/50 hover:bg-orange-200/50 transition-all duration-200 group">
                <Bell className="w-5 h-5 text-orange-600 group-hover:text-orange-700" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-medium">3</span>
                </div>
              </button>

              {/* User Profile */}
              <div className="flex items-center space-x-3 pl-4 border-l border-orange-200/50">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-semibold text-orange-700">
                    Admin
                  </div>
                  <div className="text-xs text-orange-500">Payment Manager</div>
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
        <main className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <SkeletonLoader />
          ) : (
            <>
              {/* Error Message */}
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl mb-4">
                  <div className="flex items-center">
                    <XCircle className="w-5 h-5 mr-2" />
                    <span>Error: {error}</span>
                  </div>
                </div>
              )}

              {/* Page Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-orange-800 mb-2">
                    Payment Management
                  </h1>
                  <p className="text-orange-600">
                    Monitor and manage loan payments, confirm transactions, and
                    handle payment records
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <button className="px-4 py-2 bg-orange-100/60 text-orange-700 rounded-xl font-medium hover:bg-orange-200/60 transition-all duration-200 flex items-center space-x-2">
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </button>
                  <button className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-200 flex items-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>Record Payment</span>
                  </button>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-orange-600 font-medium">
                        Total Payments
                      </p>
                      <p className="text-2xl font-bold text-orange-800">
                        {payments.length}
                      </p>
                    </div>
                    <div className="p-3 bg-orange-100 rounded-xl">
                      <DollarSign className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-yellow-600 font-medium">
                        Pending
                      </p>
                      <p className="text-2xl font-bold text-yellow-800">
                        {getPendingCount()}
                      </p>
                    </div>
                    <div className="p-3 bg-yellow-100 rounded-xl">
                      <Clock className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-600 font-medium">
                        Confirmed
                      </p>
                      <p className="text-2xl font-bold text-green-800">
                        {getConfirmedCount()}
                      </p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-xl">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </div>
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-red-600 font-medium">Failed</p>
                      <p className="text-2xl font-bold text-red-800">
                        {getFailedCount()}
                      </p>
                    </div>
                    <div className="p-3 bg-red-100 rounded-xl">
                      <XCircle className="w-6 h-6 text-red-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Filters and Controls */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Filter className="w-4 h-4 text-orange-600" />
                      <span className="text-sm font-medium text-orange-700">
                        Filter by:
                      </span>
                    </div>
                    <select
                      value={selectedFilter}
                      onChange={(e) => setSelectedFilter(e.target.value)}
                      className="px-3 py-2 bg-orange-100/50 border border-orange-200/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50"
                    >
                      {filterOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="text-sm text-orange-600">
                    Showing {filteredPayments.length} of {payments.length}{" "}
                    payments
                  </div>
                </div>
              </div>

              {/* Payments Table */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden mb-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-orange-100/50 to-red-100/50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">
                          Payment
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">
                          Borrower
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">
                          Amount & Method
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">
                          Installment Info
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-orange-700 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-orange-200/30">
                      {filteredPayments.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-6 py-8 text-center text-orange-600"
                          >
                            {error
                              ? "Unable to load payments"
                              : "No payments found"}
                          </td>
                        </tr>
                      ) : (
                        filteredPayments.map((payment) => (
                          <tr
                            key={payment.id}
                            className="hover:bg-orange-50/30 transition-colors duration-200"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center mr-3">
                                  <span className="text-white font-bold text-sm">
                                    {payment.id.slice(-2)}
                                  </span>
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-orange-800">
                                    {payment.paymentReference}
                                  </div>
                                  <div className="text-xs text-orange-600">
                                    {payment.paymentDate}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-orange-800">
                                  {payment.borrowerName}
                                </div>
                                <div className="text-xs text-orange-600">
                                  {payment.borrowerEmail}
                                </div>
                                <div className="text-xs text-orange-500">
                                  Loan: {payment.loanType}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-orange-800">
                                  {payment.amountPaid}
                                </div>
                                <div
                                  className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getPaymentMethodColor(
                                    payment.paymentMethod
                                  )}`}
                                >
                                  {getPaymentMethodIcon(payment.paymentMethod)}
                                  <span>{payment.paymentMethod}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm text-orange-700">
                                  Due: {payment.forInstallmentDate}
                                </div>
                                <div className="text-xs text-orange-500">
                                  Loan Amount: {payment.loanAmount}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
                                  payment.status
                                )}`}
                              >
                                {getStatusText(payment.status)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleViewDetails(payment.id)}
                                  className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                {payment.status.toLowerCase() === "pending" && (
                                  <>
                                    <button
                                      onClick={() => handleConfirm(payment.id)}
                                      className="p-2 text-green-600 hover:text-green-700 hover:bg-green-100 rounded-lg transition-colors duration-200"
                                      title="Confirm Payment"
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleReject(payment.id)}
                                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors duration-200"
                                      title="Mark as Failed"
                                    >
                                      <XCircle className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                                <div className="relative">
                                  <button className="p-2 text-orange-600 hover:text-orange-700 hover:bg-orange-100 rounded-lg transition-colors duration-200">
                                    <MoreVertical className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {filteredPayments.length > 0 && (
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-orange-600">
                      Showing 1 to {filteredPayments.length} of{" "}
                      {filteredPayments.length} results
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="px-3 py-2 text-sm font-medium text-orange-600 bg-orange-100/50 border border-orange-200/50 rounded-lg hover:bg-orange-200/50 transition-colors duration-200">
                        Previous
                      </button>
                      <button className="px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                        1
                      </button>
                      <button className="px-3 py-2 text-sm font-medium text-orange-600 bg-orange-100/50 border border-orange-200/50 rounded-lg hover:bg-orange-200/50 transition-colors duration-200">
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
      
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {showDetailsModal && selectedPayment && (
        <PaymentDetailsModal
          payment={selectedPayment}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedPayment(null);
          }}
          isOpen={showDetailsModal}
        />
      )}
    </div>
  );
};

export default PaymentManagement;