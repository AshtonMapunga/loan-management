import { useEffect, useState, type JSX } from "react";
import {
  CreditCard,
  Calendar,
  Clock,
  DollarSign,
  CheckCircle,
  AlertCircle,
  XCircle,
  Menu,
  Bell,
  Search,
  ChevronDown,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  Building2,
  Smartphone,
  Settings,
  Shield,
  Info,
  Download,
  Banknote,
} from "lucide-react";
import Sidebar from "../../components/User_Sidebar";
import PaymentService from "../../services/user_Services/payment_Service"; // Adjust path as needed
import LoanService from "../../services/user_Services/loan_Service";
import React from "react";

interface PaymentHistory {
  _id: string;
  loan: string;
  user: string;
  amountPaid: number;
  paymentMethod: string;
  paymentReference: string;
  forInstallmentDate: string;
  paymentDate: string;
  notes?: string;
  status: "pending" | "confirmed" | "failed";
}

interface Loan {
  _id: string;
  productType: string;
  borrowerInfo: {
    firstName: string;
    middleNames?: string;
    surname: string;
    email: string;
    phone: string;
  };
  amount: number;
  balance: number;
  interestRate: number;
  term: number;
  status: string;
  paymentSchedule: Array<{
    dueDate: string;
    amountDue: number;
    status: string;
  }>;
}

// Extended interface for transformed loan data
interface TransformedLoan {
  _id: string;
  loanId: string;
  borrower: string;
  loanType: string;
  currentBalance: number;
  monthlyEMI: number;
  nextPaymentDate: string;
  dueAmount: number;
  status: string;
}
import NotificationBell from '../../components/Notificationsbell';
const Payment = () => {
  const userName = localStorage.getItem("userName");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("make-payment");
  const [selectedLoan, setSelectedLoan] = useState(0);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Ecocash");
  const [autoPayEnabled, setAutoPayEnabled] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");
  const [paymentReference, setPaymentReference] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  //loans
  const [loans, setLoans] = useState<TransformedLoan[]>([]);
  const [loansLoading, setLoansLoading] = useState(false);
  const [loansError, setLoansError] = useState("");
  // 1. Add new state for success message (add this with other useState declarations around line 65)
  const [successMessage, setSuccessMessage] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        setLoansLoading(true);
        const token = localStorage.getItem("userToken");

        if (!token) {
          setLoansError("No authentication token found");
          return;
        }

        // Decode the token to get user ID
        const payload = JSON.parse(atob(token.split(".")[1]));
        const userId = payload.id;

        const response = await LoanService.getLoansByUserId(userId);
        const fetchedLoans = response.data || [];

        // Transform the data to match your interface
        const transformedLoans: TransformedLoan[] = fetchedLoans.map(
          (loan: Loan) => ({
            _id: loan._id,
            loanId: `LN${loan._id.slice(-3).toUpperCase()}`,
            borrower: `${loan.borrowerInfo.firstName} ${loan.borrowerInfo.surname}`,
            loanType: loan.productType,
            currentBalance: loan.balance || 0,
            monthlyEMI: calculateMonthlyEMI(
              loan.amount,
              loan.interestRate,
              loan.term
            ),
            nextPaymentDate: getNextPaymentDate(loan.paymentSchedule),
            dueAmount: getDueAmount(loan.paymentSchedule),
            status: loan.status,
          })
        );

        setLoans(transformedLoans);
      } catch (err: any) {
        console.error("Error fetching loans:", err);
        setLoansError("Failed to fetch loans");
      } finally {
        setLoansLoading(false);
      }
    };

    fetchLoans();
  }, []);

  const calculateMonthlyEMI = (
    principal: number,
    rate: number,
    term: number
  ): number => {
    if (!principal || !rate || !term) return 0;
    const monthlyRate = rate / (12 * 100);
    const emi =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, term)) /
      (Math.pow(1 + monthlyRate, term) - 1);
    return Math.round(emi);
  };

  const getNextPaymentDate = (paymentSchedule: any[]): string => {
    if (!paymentSchedule || paymentSchedule.length === 0) {
      // Default to next month if no schedule
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      return nextMonth.toISOString().split("T")[0];
    }

    const nextPayment = paymentSchedule.find((p) => p.status === "pending");
    return nextPayment ? nextPayment.dueDate : paymentSchedule[0].dueDate;
  };

  const getDueAmount = (paymentSchedule: any[]): number => {
    if (!paymentSchedule || paymentSchedule.length === 0) return 0;
    const nextPayment = paymentSchedule.find((p) => p.status === "pending");
    return nextPayment ? nextPayment.amountDue : 0;
  };

  // Updated payment history to match the Payment model exactly
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("userToken");

        if (!token) {
          setError("No authentication token found");
          return;
        }

        // Decode the token to get user ID
        const payload = JSON.parse(atob(token.split(".")[1]));
        const userId = payload.id;

        const response = await PaymentService.getPaymentsByUserId(userId);
        setPaymentHistory(response.data || []);
      } catch (err: any) {
        console.error("Error fetching payments:", err);
        setError("Failed to fetch payment history");
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const currentLoan = loans.length > 0 ? loans[selectedLoan] : null;

  const formatCurrency = (amount: number | bigint) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  const formatDate = (dateString: string | number | Date) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const getStatusIcon = (status: string) => {
    const icons: { [key: string]: JSX.Element } = {
      confirmed: <CheckCircle className="w-4 h-4 text-green-600" />,
      failed: <XCircle className="w-4 h-4 text-red-600" />,
      pending: <Clock className="w-4 h-4 text-yellow-600" />,
    };
    return icons[status] || <AlertCircle className="w-4 h-4 text-gray-600" />;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      confirmed: "bg-green-100 text-green-700 border-green-200",
      failed: "bg-red-100 text-red-700 border-red-200",
      pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    };
    return colors[status] || "bg-gray-100 text-gray-700 border-gray-200";
  };

  const filteredHistory = paymentHistory.filter(
    (payment: PaymentHistory) =>
      filterStatus === "all" || payment.status.toLowerCase() === filterStatus
  );

  const handlePayment = async () => {
    if (!currentLoan) {
      alert("Please select a loan first");
      return;
    }

    if (!paymentReference.trim()) {
      alert("Please enter a payment reference number");
      return;
    }

    try {
      setLoading(true);
      setError(""); // Clear any previous errors
      const token = localStorage.getItem("userToken");

      if (!token) {
        alert("Authentication required. Please login again.");
        return;
      }

      // Decode token to get user ID
      const payload = JSON.parse(atob(token.split(".")[1]));
      const userId = payload.id;

      const paymentData = {
        loan: currentLoan._id,
        user: userId,
        amountPaid: parseFloat(paymentAmount) || currentLoan.dueAmount,
        paymentMethod: paymentMethod,
        paymentReference: paymentReference,
        forInstallmentDate: currentLoan.nextPaymentDate,
        notes: notes,
        status: "pending" as const,
      };

      const response = await PaymentService.createPayment(paymentData);

      // Check for success in multiple ways - API might return different response formats
      const isSuccess =
        response.success === true ||
        response.status === "success" ||
        response.statusCode === 200 ||
        response.statusCode === 201 ||
        (response.data && response.data._id) || // Payment created with ID
        response._id; // Direct payment object returned

      if (isSuccess) {
        // Set success message
        setSuccessMessage(
          `Payment of ${formatCurrency(
            paymentData.amountPaid
          )} has been submitted successfully! 
        Reference: ${paymentReference}. 
        Your payment is being processed and will be confirmed shortly.`
        );
        setShowSuccess(true);

        // Reset form
        setPaymentAmount("");
        setPaymentReference("");
        setNotes("");

        // Refresh payment history
        try {
          const updatedPayments = await PaymentService.getPaymentsByUserId(
            userId
          );
          setPaymentHistory(updatedPayments.data || []);
        } catch (refreshError) {
          console.warn("Failed to refresh payment history:", refreshError);
          // Don't show error for this, payment was still successful
        }

        // Auto-hide success message after 10 seconds
        setTimeout(() => {
          setShowSuccess(false);
          setSuccessMessage("");
        }, 10000);
      } else {
        // If response doesn't indicate success, but no error was thrown,
        // treat as success since payment might still be processed
        console.warn("Ambiguous response from payment service:", response);

        setSuccessMessage(
          `Payment of ${formatCurrency(
            paymentData.amountPaid
          )} has been submitted! 
        Reference: ${paymentReference}. 
        Please check your payment history to confirm the status.`
        );
        setShowSuccess(true);

        // Reset form
        setPaymentAmount("");
        setPaymentReference("");
        setNotes("");

        // Try to refresh payment history
        try {
          const updatedPayments = await PaymentService.getPaymentsByUserId(
            userId
          );
          setPaymentHistory(updatedPayments.data || []);
        } catch (refreshError) {
          console.warn("Failed to refresh payment history:", refreshError);
        }

        // Auto-hide success message after 10 seconds
        setTimeout(() => {
          setShowSuccess(false);
          setSuccessMessage("");
        }, 10000);
      }
    } catch (error: any) {
      console.error("Payment error:", error);

      // Check if it's a network error or server error
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const message =
          error.response.data?.message ||
          error.response.data?.error ||
          "Unknown server error";

        if (status >= 500) {
          // Server error - payment might still be processed
          setSuccessMessage(
            `Payment submitted but server response unclear. 
          Reference: ${paymentReference}. 
          Please check your payment history or contact support if needed.`
          );
          setShowSuccess(true);

          // Reset form
          setPaymentAmount("");
          setPaymentReference("");
          setNotes("");

          setTimeout(() => {
            setShowSuccess(false);
            setSuccessMessage("");
          }, 10000);
        } else {
          // Client error (4xx) - likely a real failure
          setError(`Payment failed: ${message}`);
        }
      } else if (error.request) {
        // Network error - payment status unclear
        setSuccessMessage(
          `Payment submitted but connection issue occurred. 
        Reference: ${paymentReference}. 
        Please check your payment history to confirm status.`
        );
        setShowSuccess(true);

        // Reset form
        setPaymentAmount("");
        setPaymentReference("");
        setNotes("");

        setTimeout(() => {
          setShowSuccess(false);
          setSuccessMessage("");
        }, 10000);
      } else {
        // Other error
        setError("Payment failed: " + (error.message || "Unknown error"));
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get loan info by loan ID
  const getLoanInfo = (loanId: string) => {
    return loans.find((loan) => loan._id === loanId);
  };

  const tabs = [
    { id: "make-payment", label: "Make Payment", icon: CreditCard },
    { id: "history", label: "Payment History", icon: Clock },
    { id: "auto-pay", label: "Auto Payment", icon: Settings },
  ];

  const paymentMethods = [
    { id: "Ecocash", label: "Ecocash", icon: Smartphone },
    { id: "OneMoney", label: "OneMoney", icon: Smartphone },
    { id: "Innsbucks", label: "Innsbucks", icon: Wallet },
    { id: "BankTransfer", label: "Bank Transfer", icon: Building2 },
    { id: "Cash", label: "Cash", icon: Banknote },
    { id: "Card", label: "Card", icon: CreditCard },
  ];

  // 6. UPDATE THE SUMMARY CARDS CALCULATION (replace summaryCards array)
  const summaryCards = [
    {
      title: "Confirmed Payments",
      value: paymentHistory.filter(
        (p: PaymentHistory) => p.status === "confirmed"
      ).length,
      icon: CheckCircle,
      color: "green",
      arrow: ArrowUpRight,
    },
    {
      title: "Failed Payments",
      value: paymentHistory.filter((p: PaymentHistory) => p.status === "failed")
        .length,
      icon: XCircle,
      color: "red",
      arrow: ArrowDownLeft,
    },
    {
      title: "Total Paid",
      value: formatCurrency(
        paymentHistory
          .filter((p: PaymentHistory) => p.status === "confirmed")
          .reduce((sum: number, p: PaymentHistory) => sum + p.amountPaid, 0)
      ),
      icon: DollarSign,
      color: "blue",
      arrow: ArrowUpRight,
    },
    {
      title: "This Month",
      value: paymentHistory.filter(
        (p: PaymentHistory) =>
          new Date(p.paymentDate).getMonth() === new Date().getMonth()
      ).length,
      icon: Calendar,
      color: "purple",
      arrow: Info,
    },
  ];

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-blue-200/50 px-6 py-4 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden mr-4 p-2 rounded-xl bg-blue-100/50 hover:bg-blue-200/50 transition-all duration-200"
              >
                <Menu className="w-5 h-5 text-blue-600" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-blue-500">Payments</span>
                  <span className="text-blue-300">›</span>
                  <span className="text-blue-700 font-medium">
                    Payment Management
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-400" />
                <input
                  type="text"
                  placeholder="Search payments..."
                  className="pl-10 pr-4 py-2 w-64 bg-blue-100/50 border border-blue-200/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-200"
                />
              </div>
            <NotificationBell />
              <div className="flex items-center space-x-3 pl-4 border-l border-blue-200/50">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-semibold text-blue-700">
                    {userName}
                  </div>
                  <div className="text-xs text-blue-500">Loan Manager</div>
                </div>
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25"></div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full shadow-sm"></div>
                </div>
                <ChevronDown className="w-4 h-4 text-blue-400" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Tab Navigation */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/50">
            <div className="flex space-x-2">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                        : "text-blue-600 hover:bg-blue-100/50"
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
          {/* Success Message */}
          {showSuccess && (
            <div className="fixed top-4 right-4 z-50 max-w-md">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-6 rounded-2xl shadow-2xl border border-green-400">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-6 h-6 text-green-100 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-bold text-lg mb-1">
                      Payment Submitted!
                    </div>
                    <div className="text-green-100 text-sm leading-relaxed">
                      {successMessage}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setShowSuccess(false);
                      setSuccessMessage("");
                    }}
                    className="text-green-100 hover:text-white transition-colors duration-200 ml-2"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
                <div className="mt-4 bg-green-600/30 rounded-lg p-3">
                  <div className="flex items-center space-x-2 text-sm text-green-100">
                    <Clock className="w-4 h-4" />
                    <span>Processing time: 1-3 business days</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="fixed top-4 right-4 z-50 max-w-md">
              <div className="bg-gradient-to-r from-red-500 to-rose-500 text-white p-6 rounded-2xl shadow-2xl border border-red-400">
                <div className="flex items-start space-x-3">
                  <XCircle className="w-6 h-6 text-red-100 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-bold text-lg mb-1">Payment Failed</div>
                    <div className="text-red-100 text-sm leading-relaxed">
                      {error}
                    </div>
                  </div>
                  <button
                    onClick={() => setError("")}
                    className="text-red-100 hover:text-white transition-colors duration-200 ml-2"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                </div>
                <div className="mt-4 bg-red-600/30 rounded-lg p-3">
                  <div className="flex items-center space-x-2 text-sm text-red-100">
                    <AlertCircle className="w-4 h-4" />
                    <span>Please try again or contact support</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Make Payment Tab */}
          {activeTab === "make-payment" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                  <h3 className="text-lg font-bold text-blue-800 mb-4">
                    Select Loan Account
                  </h3>
                  <div className="space-y-3">
                    {loansLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                        <p className="text-blue-600 text-sm">
                          Loading loans...
                        </p>
                      </div>
                    ) : loansError ? (
                      <div className="text-center py-8">
                        <AlertCircle className="w-8 h-8 text-red-300 mx-auto mb-2" />
                        <p className="text-red-500 text-sm">{loansError}</p>
                      </div>
                    ) : loans.length === 0 ? (
                      <div className="text-center py-8">
                        <AlertCircle className="w-8 h-8 text-blue-300 mx-auto mb-2" />
                        <p className="text-blue-500 text-sm">
                          No active loans found
                        </p>
                      </div>
                    ) : (
                      loans.map((loan, index) => (
                        <div
                          key={loan._id}
                          onClick={() => setSelectedLoan(index)}
                          className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
                            selectedLoan === index
                              ? "border-blue-500 bg-blue-50 shadow-lg"
                              : "border-blue-200/50 bg-white/50 hover:border-blue-300 hover:shadow-md"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-semibold text-blue-800">
                              {loan.loanId}
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                loan.status === "active"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {loan.status}
                            </span>
                          </div>
                          <div className="text-lg font-bold text-blue-900 mb-1">
                            {loan.borrower}
                          </div>
                          <div className="text-sm text-blue-600 mb-2">
                            {loan.loanType}
                          </div>
                          <div className="text-sm font-semibold text-red-600">
                            Due: {formatCurrency(loan.dueAmount)}
                          </div>
                          <div className="text-xs text-blue-500 mt-1">
                            Next Payment: {formatDate(loan.nextPaymentDate)}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-2 space-y-6">
                {currentLoan ? (
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50">
                    <div className="mb-6">
                      <h3 className="text-xl font-bold text-blue-800 mb-2">
                        Payment Details
                      </h3>
                      <p className="text-sm text-blue-500">
                        Make a payment for loan {currentLoan.loanId}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div className="p-4 bg-gradient-to-br from-red-50 to-orange-50 rounded-xl border border-red-200">
                        <div className="flex items-center space-x-3 mb-2">
                          <AlertCircle className="w-5 h-5 text-red-600" />
                          <span className="text-sm font-medium text-red-700">
                            Amount Due
                          </span>
                        </div>
                        <div className="text-2xl font-bold text-red-800">
                          {formatCurrency(currentLoan.dueAmount)}
                        </div>
                        <div className="text-xs text-red-600 mt-1">
                          Due on {formatDate(currentLoan.nextPaymentDate)}
                        </div>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200">
                        <div className="flex items-center space-x-3 mb-2">
                          <DollarSign className="w-5 h-5 text-blue-600" />
                          <span className="text-sm font-medium text-blue-700">
                            Outstanding Balance
                          </span>
                        </div>
                        <div className="text-2xl font-bold text-blue-800">
                          {formatCurrency(currentLoan.currentBalance)}
                        </div>
                        <div className="text-xs text-blue-600 mt-1">
                          Total remaining amount
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-3">
                          Payment Amount
                        </label>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <button
                            onClick={() =>
                              setPaymentAmount(currentLoan.dueAmount.toString())
                            }
                            className="p-3 border-2 border-blue-200 rounded-xl text-center hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
                          >
                            <div className="text-sm font-medium text-blue-700">
                              Pay EMI Amount
                            </div>
                            <div className="text-lg font-bold text-blue-800">
                              {formatCurrency(currentLoan.dueAmount)}
                            </div>
                          </button>
                          <button
                            onClick={() => setPaymentAmount("")}
                            className="p-3 border-2 border-purple-200 rounded-xl text-center hover:border-purple-400 hover:bg-purple-50 transition-all duration-200"
                          >
                            <div className="text-sm font-medium text-purple-700">
                              Custom Amount
                            </div>
                            <div className="text-lg font-bold text-purple-800">
                              Enter Amount
                            </div>
                          </button>
                        </div>
                        <div className="relative">
                          <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-blue-400" />
                          <input
                            type="number"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(e.target.value)}
                            placeholder="Enter payment amount"
                            className="w-full pl-12 pr-4 py-4 bg-white border border-blue-200 rounded-xl text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-3">
                          Payment Method
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {paymentMethods.map((method) => {
                            const IconComponent = method.icon;
                            return (
                              <button
                                key={method.id}
                                onClick={() => setPaymentMethod(method.id)}
                                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                                  paymentMethod === method.id
                                    ? "border-blue-500 bg-blue-50 shadow-lg"
                                    : "border-blue-200 hover:border-blue-300 hover:bg-blue-50/50"
                                }`}
                              >
                                <IconComponent className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                                <div className="text-sm font-medium text-blue-700">
                                  {method.label}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-3">
                          Payment Reference{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={paymentReference}
                          onChange={(e) => setPaymentReference(e.target.value)}
                          placeholder="Enter payment reference number"
                          className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                          required
                        />
                        <p className="text-xs text-blue-500 mt-1">
                          Required: Transaction ID or reference number from your
                          payment provider
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-blue-700 mb-3">
                          Notes (Optional)
                        </label>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          placeholder="Add any additional notes about this payment"
                          rows={3}
                          className="w-full px-4 py-3 bg-white border border-blue-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 resize-none"
                        />
                      </div>

                      <div className="pt-4 border-t border-blue-200">
                        <button
                          onClick={handlePayment}
                          disabled={loading}
                          className={`w-full py-4 ${
                            loading
                              ? "bg-gray-400 cursor-not-allowed"
                              : "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                          } text-white rounded-xl text-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/25`}
                        >
                          <Shield className="w-5 h-5" />
                          <span>
                            {loading
                              ? "Processing..."
                              : `Pay ${formatCurrency(
                                  parseFloat(paymentAmount) ||
                                    currentLoan.dueAmount
                                )} Securely`}
                          </span>
                        </button>
                        <div className="flex items-center justify-center space-x-1 mt-3 text-xs text-blue-500">
                          <Shield className="w-3 h-3" />
                          <span>256-bit SSL encrypted • PCI DSS compliant</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50">
                    <div className="text-center py-12">
                      <AlertCircle className="w-16 h-16 text-blue-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-blue-700 mb-2">
                        No Loan Selected
                      </h3>
                      <p className="text-blue-500">
                        Please select a loan account from the left panel to make
                        a payment.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Payment History Tab */}
          {activeTab === "history" && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {summaryCards.map((card, index) => {
                  const IconComponent = card.icon;
                  const ArrowComponent = card.arrow;
                  return (
                    <div
                      key={index}
                      className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-xl bg-${card.color}-100`}>
                          <IconComponent
                            className={`w-6 h-6 text-${card.color}-600`}
                          />
                        </div>
                        <ArrowComponent
                          className={`w-4 h-4 text-${card.color}-500`}
                        />
                      </div>
                      <div className="text-2xl font-bold text-blue-800 mb-1">
                        {card.value}
                      </div>
                      <div className="text-sm text-blue-600">{card.title}</div>
                    </div>
                  );
                })}
              </div>

              {/* Payment History Table */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50">
                <div className="p-6 border-b border-blue-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-blue-800">
                      Payment History
                    </h3>
                    <div className="flex items-center space-x-4">
                      <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-2 bg-white border border-blue-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      >
                        <option value="all">All Status</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="pending">Pending</option>
                        <option value="failed">Failed</option>
                      </select>
                      <button className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-all duration-200">
                        <Download className="w-4 h-4" />
                        <span>Export</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  {loading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-blue-600">
                        Loading payment history...
                      </p>
                    </div>
                  ) : error ? (
                    <div className="text-center py-12">
                      <AlertCircle className="w-12 h-12 text-red-300 mx-auto mb-4" />
                      <p className="text-red-500">{error}</p>
                    </div>
                  ) : filteredHistory.length === 0 ? (
                    <div className="text-center py-12">
                      <Clock className="w-12 h-12 text-blue-300 mx-auto mb-4" />
                      <p className="text-blue-500">No payment history found</p>
                    </div>
                  ) : (
                    <table className="w-full">
                      <thead className="bg-blue-50/50">
                        <tr>
                          <th className="text-left px-6 py-4 text-sm font-semibold text-blue-700">
                            Payment ID
                          </th>
                          <th className="text-left px-6 py-4 text-sm font-semibold text-blue-700">
                            Loan
                          </th>
                          <th className="text-left px-6 py-4 text-sm font-semibold text-blue-700">
                            Amount
                          </th>
                          <th className="text-left px-6 py-4 text-sm font-semibold text-blue-700">
                            Method
                          </th>
                          <th className="text-left px-6 py-4 text-sm font-semibold text-blue-700">
                            Date
                          </th>
                          <th className="text-left px-6 py-4 text-sm font-semibold text-blue-700">
                            Status
                          </th>
                          <th className="text-left px-6 py-4 text-sm font-semibold text-blue-700">
                            Reference
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-blue-100">
                        {filteredHistory.map((payment) => {
                          const loanInfo = getLoanInfo(payment.loan);
                          return (
                            <tr
                              key={payment._id}
                              className="hover:bg-blue-50/30 transition-colors duration-150"
                            >
                              <td className="px-6 py-4">
                                <div className="text-sm font-medium text-blue-800">
                                  #{payment._id.slice(-6).toUpperCase()}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-blue-700">
                                  {loanInfo ? loanInfo.loanId : "Unknown Loan"}
                                </div>
                                <div className="text-xs text-blue-500">
                                  {loanInfo ? loanInfo.loanType : ""}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm font-semibold text-blue-800">
                                  {formatCurrency(payment.amountPaid)}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center space-x-2">
                                  {paymentMethods.find(
                                    (m) => m.id === payment.paymentMethod
                                  )?.icon &&
                                    React.createElement(
                                      paymentMethods.find(
                                        (m) => m.id === payment.paymentMethod
                                      )!.icon,
                                      { className: "w-4 h-4 text-blue-600" }
                                    )}
                                  <span className="text-sm text-blue-700">
                                    {payment.paymentMethod}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-blue-700">
                                  {formatDate(payment.paymentDate)}
                                </div>
                                <div className="text-xs text-blue-500">
                                  For: {formatDate(payment.forInstallmentDate)}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div
                                  className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                                    payment.status
                                  )}`}
                                >
                                  {getStatusIcon(payment.status)}
                                  <span className="capitalize">
                                    {payment.status}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm font-mono text-blue-700">
                                  {payment.paymentReference}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}
          {/* Auto Payment Tab */}
          {activeTab === "auto-pay" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50">
                <div className="flex items-center space-x-3 mb-6">
                  <Settings className="w-6 h-6 text-blue-600" />
                  <h3 className="text-xl font-bold text-blue-800">
                    Auto Payment Settings
                  </h3>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-blue-50/50 rounded-xl border border-blue-200">
                    <div>
                      <div className="font-semibold text-blue-800">
                        Enable Auto Payment
                      </div>
                      <div className="text-sm text-blue-600">
                        Automatically pay your EMI on due date
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoPayEnabled}
                        onChange={(e) => setAutoPayEnabled(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {autoPayEnabled && (
                    <div className="space-y-4 p-4 bg-green-50/50 rounded-xl border border-green-200">
                      <div>
                        <label className="block text-sm font-medium text-green-700 mb-2">
                          Default Payment Method
                        </label>
                        <select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-full px-4 py-3 bg-white border border-green-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20"
                        >
                          {paymentMethods.map((method) => (
                            <option key={method.id} value={method.id}>
                              {method.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                        <Info className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div className="text-sm text-yellow-700">
                          <strong>Important:</strong> Auto payments will be
                          processed 1 day before the due date. Ensure sufficient
                          balance in your selected payment method.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50">
                <div className="flex items-center space-x-3 mb-6">
                  <Shield className="w-6 h-6 text-blue-600" />
                  <h3 className="text-xl font-bold text-blue-800">
                    Security & Benefits
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-4 bg-green-50/50 rounded-xl">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <div className="font-semibold text-green-800">
                        Never Miss a Payment
                      </div>
                      <div className="text-sm text-green-600">
                        Automatic payments ensure you never miss a due date
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-4 bg-blue-50/50 rounded-xl">
                    <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <div className="font-semibold text-blue-800">
                        Bank-Grade Security
                      </div>
                      <div className="text-sm text-blue-600">
                        256-bit encryption protects your payment information
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-4 bg-purple-50/50 rounded-xl">
                    <Bell className="w-5 h-5 text-purple-600 mt-0.5" />
                    <div>
                      <div className="font-semibold text-purple-800">
                        Payment Notifications
                      </div>
                      <div className="text-sm text-purple-600">
                        Get notified before and after each automatic payment
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-4 bg-orange-50/50 rounded-xl">
                    <Settings className="w-5 h-5 text-orange-600 mt-0.5" />
                    <div>
                      <div className="font-semibold text-orange-800">
                        Full Control
                      </div>
                      <div className="text-sm text-orange-600">
                        Cancel or modify auto payments anytime
                      </div>
                    </div>
                  </div>
                </div>

                {autoPayEnabled && (
                  <div className="mt-6 p-4 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl text-white">
                    <div className="flex items-center space-x-2 mb-2">
                      <CheckCircle className="w-5 h-5" />
                      <span className="font-semibold">Auto Payment Active</span>
                    </div>
                    <div className="text-sm opacity-90">
                      Your EMI will be automatically deducted using{" "}
                      {paymentMethod} one day before the due date.
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Payment;
