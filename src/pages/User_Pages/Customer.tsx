import { useState, useEffect } from "react";
import {
  Menu,
  Search,
  ChevronDown,
  Bell,
  Users,
  Eye,
  UserPlus,
  Mail,
  Phone,
  MapPin,
  Calendar,
  X,
  FileText,
  CreditCard,
  File,
  Download,
  Check,
  Clock,
  CheckCircle,
  XCircle,
  ArrowRight,
  AlertCircle,
  DollarSign,
  Banknote,
  Percent,
  FileSpreadsheet,
  FileDigit,
  FileArchive,
  FileImage,
  FileBarChart2,
  FileSearch2,
  FileKey2,
  FileInput,
  FileOutput,
  FileClock,
  FileUp,
  FileDown,
  FileX2,
  FileCheck2,
  FilePieChart,
  FileStack,
  FilePlus2,
  FileMinus2,
  FileQuestion,
  FileHeart,
  FileDiff,
  FileSymlink,
  FileTerminal,
} from "lucide-react";
import Sidebar from "../../components/User_Sidebar";
import UserService from "../../services/admin_Services/user_Service";
import KycService from "../../services/user_Services/kyc_Service";
import LoanService from "../../services/admin_Services/loan_Service";
import EnhancedLoadingSpinner from '../../components/userspiner';

const NotificationBell = () => (
  <div className="relative">
    <Bell className="w-5 h-5 text-orange-500" />
  </div>
);

interface KycDocument {
  _id: string;
  userId: string;
  nationalId?: string;
  passportPhoto?: string;
  proofOfResident?: string;
  paySlip?: string;
  proofOfEmployment?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  status?: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
}

interface Payment {
  _id?: string;
  date: string;
  amount: number;
  status: "pending" | "paid" | "late";
  paymentMethod?: string;
  transactionId?: string;
  notes?: string;
}

interface Loan {
  _id: string;
  userId: string;
  amount: number;
  term: number;
  status: "pending" | "approved" | "rejected" | "paid";
  payments?: Payment[];
  createdAt: string;
  updatedAt: string;
  productType?: string;
  interestRate?: number;
  loanPurpose?: string;
  loanOfficer?: string;
  disbursementDate?: string;
  maturityDate?: string;
  collateral?: {
    type?: string;
    description?: string;
    value?: number;
    documents?: string[];
  };
  documents?: {
    applicationForm?: string;
    creditReport?: string;
    bankStatements?: string[];
    taxReturns?: string[];
    otherDocuments?: string[];
  };
  notes?: string[];
  borrowerInfo?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    creditScore?: number;
    annualIncome?: number;
    employmentStatus?: string;
  };
  repaymentSchedule?: {
    frequency: "weekly" | "bi-weekly" | "monthly";
    startDate: string;
    endDate: string;
    installments: {
      dueDate: string;
      amount: number;
      status: "pending" | "paid" | "late";
    }[];
  };
  fees?: {
    processingFee?: number;
    lateFee?: number;
    prepaymentPenalty?: number;
    otherFees?: {
      name: string;
      amount: number;
    }[];
  };
  insurance?: {
    required: boolean;
    provider?: string;
    policyNumber?: string;
    premium?: number;
    coverageAmount?: number;
  };
}

const CustomerPage = () => {
  const userName = "Admin User";
  const [sidebarOpen, setSidebarOpen] = useState(false
  );
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const [kycDocuments, setKycDocuments] = useState<KycDocument[]>([]);
  const [kycLoading, setKycLoading] = useState(false);
  const [kycError, setKycError] = useState<string | null>(null);
  const [processingKyc, setProcessingKyc] = useState<string | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loansLoading, setLoansLoading] = useState(false);
  const [loansError, setLoansError] = useState<string | null>(null);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [loanActiveTab, setLoanActiveTab] = useState("overview");

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const response = await UserService.getAllUsers();
        setCustomers(response.data);
        setError(null);
      } catch (err) {
        setError("Failed to fetch customers");
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  const fetchKycDocuments = async (userId: string) => {
    try {
      setKycLoading(true);
      setKycError(null);
      setKycDocuments([]);
      
      const response = await KycService.getKycByUserId(userId);
      
      // Handle different response structures
      let documents = [];
      
      if (response.data) {
        if (Array.isArray(response.data)) {
          documents = response.data;
        } else if (response.data.documents && Array.isArray(response.data.documents)) {
          documents = response.data.documents;
        } else if (response.data.kycDocuments && Array.isArray(response.data.kycDocuments)) {
          documents = response.data.kycDocuments;
        } else {
          documents = [response.data];
        }
      } else if (Array.isArray(response)) {
        documents = response;
      } else if (response.documents && Array.isArray(response.documents)) {
        documents = response.documents;
      } else if (response.kycDocuments && Array.isArray(response.kycDocuments)) {
        documents = response.kycDocuments;
      } else if (response._id) {
        documents = [response];
      }

      if (!Array.isArray(documents)) {
        console.error("Documents is not an array:", documents);
        documents = [];
      }

      // Format documents to ensure they have required fields
      const formattedDocs = documents
        .filter(doc => doc != null)
        .map((doc) => ({
          ...doc,
          documentType: doc.documentType || 'KYC Document',
          documentNumber: doc.documentNumber || doc.nationalId || 'N/A',
          status: doc.status || 'pending',
          createdAt: doc.createdAt || new Date().toISOString(),
          updatedAt: doc.updatedAt || new Date().toISOString(),
          _id: doc._id || Math.random().toString(36).substr(2, 9)
        }));

      setKycDocuments(formattedDocs);
    } catch (err) {
      setKycError("Failed to fetch KYC documents");
      console.error("Error fetching KYC documents:", err);
    } finally {
      setKycLoading(false);
    }
  };

  const fetchLoansByUserId = async (userId: string) => {
    try {
      setLoansLoading(true);
      setLoansError(null);
      const response = await LoanService.getLoansByUserId(userId);
      
      let loansData: Loan[] = [];
      
      if (Array.isArray(response)) {
        loansData = response;
      } else if (response.data && Array.isArray(response.data)) {
        loansData = response.data;
      } else if (response._id) {
        loansData = [response];
      } else {
        loansData = [];
      }

      // Normalize loan data to ensure it has required fields
      const normalizedLoans = loansData.map(loan => ({
        _id: loan._id || '',
        userId: loan.userId || userId,
        amount: loan.amount || 0,
        term: loan.term || 0,
        status: loan.status || 'pending',
        payments: loan.payments || [],
        createdAt: loan.createdAt || new Date().toISOString(),
        updatedAt: loan.updatedAt || new Date().toISOString(),
        productType: loan.productType || 'Personal Loan',
        interestRate: loan.interestRate || 0,
        loanPurpose: loan.loanPurpose || 'Not specified',
        loanOfficer: loan.loanOfficer || 'Unassigned',
        disbursementDate: loan.disbursementDate || '',
        maturityDate: loan.maturityDate || '',
        collateral: loan.collateral || {},
        documents: loan.documents || {},
        notes: loan.notes || [],
        borrowerInfo: loan.borrowerInfo || {
          firstName: selectedCustomer?.firstName || '',
          lastName: selectedCustomer?.lastName || '',
          email: selectedCustomer?.email || '',
          phone: selectedCustomer?.phoneNumber || '',
          creditScore: 0,
          annualIncome: 0,
          employmentStatus: 'Unknown'
        },
        repaymentSchedule: loan.repaymentSchedule || {
          frequency: 'monthly',
          startDate: new Date().toISOString(),
          endDate: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString(),
          installments: []
        },
        fees: loan.fees || {},
        insurance: loan.insurance || { required: false }
      }));

      setLoans(normalizedLoans);
    } catch (error) {
      setLoansError("Failed to fetch loan applications");
      console.error("Error fetching loans:", error);
      setLoans([]);
    } finally {
      setLoansLoading(false);
    }
  };

  const fetchLoanById = async (loanId: string) => {
    try {
      setLoansLoading(true);
      setLoansError(null);
      const response = await LoanService.getLoanById(loanId);
      
      const loanData = response.data || response;
      
      const normalizedLoan: Loan = {
        _id: loanData._id || loanId,
        userId: loanData.userId || selectedCustomer?._id || '',
        amount: loanData.amount || 0,
        term: loanData.term || 0,
        status: loanData.status || 'pending',
        payments: loanData.payments || [],
        createdAt: loanData.createdAt || new Date().toISOString(),
        updatedAt: loanData.updatedAt || new Date().toISOString(),
        productType: loanData.productType || 'Personal Loan',
        interestRate: loanData.interestRate || 0,
        loanPurpose: loanData.loanPurpose || 'Not specified',
        loanOfficer: loanData.loanOfficer || 'Unassigned',
        disbursementDate: loanData.disbursementDate || '',
        maturityDate: loanData.maturityDate || '',
        collateral: loanData.collateral || {},
        documents: loanData.documents || {},
        notes: loanData.notes || [],
        borrowerInfo: loanData.borrowerInfo || {
          firstName: selectedCustomer?.firstName || '',
          lastName: selectedCustomer?.lastName || '',
          email: selectedCustomer?.email || '',
          phone: selectedCustomer?.phoneNumber || '',
          creditScore: 0,
          annualIncome: 0,
          employmentStatus: 'Unknown'
        },
        repaymentSchedule: loanData.repaymentSchedule || {
          frequency: 'monthly',
          startDate: new Date().toISOString(),
          endDate: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString(),
          installments: []
        },
        fees: loanData.fees || {},
        insurance: loanData.insurance || { required: false }
      };

      setSelectedLoan(normalizedLoan);
      setShowLoanModal(true);
      return normalizedLoan;
    } catch (error) {
      setLoansError("Failed to fetch loan details");
      console.error("Error fetching loan:", error);
      return null;
    } finally {
      setLoansLoading(false);
    }
  };

  const handleKycAction = async (kycId: string, action: "approved" | "rejected") => {
    setProcessingKyc(kycId);
    setKycError(null);

    try {
      const updateData = {
        status: action,
        reviewedAt: new Date().toISOString(),
        reviewedBy: "admin"
      };

      await KycService.updateKyc(kycId, updateData);

      setKycDocuments(prev =>
        prev.map(doc =>
          doc._id === kycId
            ? {
                ...doc,
                status: action,
                reviewedAt: new Date().toISOString(),
                reviewedBy: "admin"
              }
            : doc
        )
      );
    } catch (error) {
      setKycError("Failed to update KYC status");
      console.error("Error updating KYC status:", error);
    } finally {
      setProcessingKyc(null);
    }
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phoneNumber?.includes(searchTerm)
  );

  const handleView = async (customer: any) => {
    setSelectedCustomer(customer);
    setShowViewModal(true);
    setActiveTab("details");
    await fetchKycDocuments(customer._id);
    await fetchLoansByUserId(customer._id);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'verified':
      case 'approved':
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
      case 'late':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "approved":
      case "paid":
        return "text-green-600 bg-green-50";
      case "rejected":
        return "text-red-600 bg-red-50";
      default:
        return "text-yellow-600 bg-yellow-50";
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "approved":
      case "paid":
        return <CheckCircle className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getDocumentIcon = (documentType: string) => {
    switch (documentType.toLowerCase()) {
      case 'application':
      case 'form':
        return <FileInput className="w-5 h-5" />;
      case 'credit':
      case 'report':
        return <FileSearch2 className="w-5 h-5" />;
      case 'bank':
      case 'statement':
        return <FileBarChart2 className="w-5 h-5" />;
      case 'tax':
      case 'return':
        return <FileDigit className="w-5 h-5" />;
      case 'id':
      case 'identification':
        return <FileKey2 className="w-5 h-5" />;
      case 'pay':
      case 'slip':
        return <FileOutput className="w-5 h-5" />;
      case 'proof':
      case 'residence':
        return <FileClock className="w-5 h-5" />;
      case 'image':
      case 'photo':
        return <FileImage className="w-5 h-5" />;
      case 'archive':
      case 'zip':
        return <FileArchive className="w-5 h-5" />;
      default:
        return <File className="w-5 h-5" />;
    }
  };

  const renderKycDocument = (doc: KycDocument) => {
    const documents = [
      { key: "nationalId", label: "National ID", value: doc.nationalId },
      { key: "passportPhoto", label: "Passport Photo", value: doc.passportPhoto },
      { key: "proofOfResident", label: "Proof of Residence", value: doc.proofOfResident },
      { key: "paySlip", label: "Pay Slip", value: doc.paySlip },
      { key: "proofOfEmployment", label: "Proof of Employment", value: doc.proofOfEmployment },
    ];

    return (
      <div key={doc._id} className="bg-white border border-orange-200 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="w-5 h-5 text-orange-600" />
            <h4 className="text-lg font-semibold text-orange-800">
              KYC Document
            </h4>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2 ${getStatusColor(doc.status)}`}>
            {getStatusIcon(doc.status)}
            <span className="capitalize">{doc.status || "pending"}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map((document) => (
            <div key={document.key} className="space-y-2">
              <label className="text-sm font-medium text-orange-600">
                {document.label}
              </label>
              <div className="bg-orange-50/30 p-3 rounded-lg">
                {document.value ? (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-orange-800 truncate">
                      {document.value.split("/").pop() || "Document uploaded"}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => window.open(document.value, "_blank")}
                        className="p-1 text-orange-600 hover:text-orange-700 hover:bg-orange-100 rounded"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                         const a = window.document.createElement("a");
                          a.href = document.value!;
                          a.download = `${document.label}_${selectedCustomer.firstName}_${selectedCustomer.lastName}`;
                          a.click();
                        }}
                        className="p-1 text-orange-600 hover:text-orange-700 hover:bg-orange-100 rounded"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <span className="text-sm text-gray-500">Not uploaded</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-orange-200/50">
          <div className="text-sm text-orange-600">
            <p>Submitted: {formatDate(doc.createdAt)}</p>
            {doc.reviewedAt && <p>Reviewed: {formatDate(doc.reviewedAt)}</p>}
          </div>

          {doc.status === "pending" && (
            <div className="flex space-x-2">
              <button
                onClick={() => handleKycAction(doc._id, "rejected")}
                disabled={processingKyc === doc._id}
                className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                <span>Reject</span>
              </button>
              <button
                onClick={() => handleKycAction(doc._id, "approved")}
                disabled={processingKyc === doc._id}
                className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>Approve</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderLoanItem = (loan: Loan) => {
    const paidPayments = loan.payments?.filter(p => p.status === 'paid').length || 0;
    const totalPayments = loan.term || 1;
    const progressPercentage = (paidPayments / totalPayments) * 100;

    return (
      <div key={loan._id} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CreditCard className="w-5 h-5 text-blue-600" />
            <div>
              <h4 className="text-lg font-semibold text-gray-800">
                {loan.productType || 'Loan Application'}
              </h4>
              <p className="text-xs text-gray-500">
                Created: {loan.createdAt ? formatDate(loan.createdAt) : 'N/A'}
              </p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-2 ${getStatusColor(loan.status)}`}>
            {getStatusIcon(loan.status)}
            <span className="capitalize">{loan.status || 'pending'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">Amount</span>
            </div>
            <p className="text-lg font-bold text-gray-900 mt-1">
              {formatCurrency(loan.amount || 0)}
            </p>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <Percent className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">Interest</span>
            </div>
            <p className="text-lg font-bold text-gray-900 mt-1">
              {loan.interestRate?.toFixed(2) || '0.00'}%
            </p>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">Term</span>
            </div>
            <p className="text-lg font-bold text-gray-900 mt-1">
              {loan.term || 0} weeks
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium text-gray-600">
            <span>Repayment Progress</span>
            <span>{paidPayments} of {totalPayments} payments made</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {loan.payments && loan.payments.length > 0 ? (
          <div className="space-y-3">
            <h5 className="text-sm font-medium text-gray-600">Recent Payments</h5>
            <div className="space-y-2">
              {loan.payments.slice(0, 3).map((payment, index) => (
                <div key={payment._id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${payment.status === 'paid' ? 'bg-green-100 text-green-600' : payment.status === 'late' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                      {payment.status === 'paid' ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : payment.status === 'late' ? (
                        <AlertCircle className="w-4 h-4" />
                      ) : (
                        <Clock className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{formatDate(payment.date)}</p>
                      <p className="text-xs text-gray-500">Payment #{index + 1}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{formatCurrency(payment.amount)}</p>
                    <span className={`text-xs ${payment.status === 'paid' ? 'text-green-600' : payment.status === 'late' ? 'text-red-600' : 'text-yellow-600'}`}>
                      {payment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {loan.payments.length > 3 && (
              <button className="w-full mt-2 text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center justify-center space-x-1">
                <span>View all payments</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="text-center py-4 bg-gray-50 rounded-lg">
            <p className="text-gray-500">No payments recorded yet</p>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            onClick={() => fetchLoanById(loan._id)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Full Details
          </button>
        </div>
      </div>
    );
  };

  const renderLoanDetailsModal = () => {
    if (!selectedLoan) return null;

    const renderDocumentItem = (name: string, url?: string | string[]) => {
      if (!url) return null;
      
      if (Array.isArray(url)) {
        return (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-600">{name}</h4>
            <div className="space-y-2">
              {url.map((u, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getDocumentIcon(name)}
                    <span className="text-sm text-gray-800 truncate max-w-xs">
                      {u.split('/').pop() || `Document ${i + 1}`}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => window.open(u, '_blank')}
                      className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        const a = document.createElement('a');
                        a.href = u;
                        a.download = `${name}_${i + 1}`;
                        a.click();
                      }}
                      className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      return (
        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center space-x-3">
            {getDocumentIcon(name)}
            <span className="text-sm text-gray-800 truncate max-w-xs">
              {url.split('/').pop() || name}
            </span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => window.open(url as string, '_blank')}
              className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                const a = document.createElement('a');
                a.href = url as string;
                a.download = name;
                a.click();
              }}
              className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      );
    };

    const renderOverviewTab = () => (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 p-6 rounded-xl">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Loan Summary</h4>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Loan Amount:</span>
                <span className="font-semibold">{formatCurrency(selectedLoan.amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Interest Rate:</span>
                <span className="font-semibold">{selectedLoan.interestRate?.toFixed(2) || '0.00'}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Term:</span>
                <span className="font-semibold">{selectedLoan.term} weeks</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Purpose:</span>
                <span className="font-semibold">{selectedLoan.loanPurpose || 'Not specified'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Loan Officer:</span>
                <span className="font-semibold">{selectedLoan.loanOfficer || 'Unassigned'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Disbursement Date:</span>
                <span className="font-semibold">{selectedLoan.disbursementDate ? formatDate(selectedLoan.disbursementDate) : 'Not disbursed'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Maturity Date:</span>
                <span className="font-semibold">{selectedLoan.maturityDate ? formatDate(selectedLoan.maturityDate) : 'N/A'}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-6 rounded-xl">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Borrower Information</h4>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-semibold">{selectedLoan.borrowerInfo?.firstName} {selectedLoan.borrowerInfo?.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-semibold">{selectedLoan.borrowerInfo?.email || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phone:</span>
                <span className="font-semibold">{selectedLoan.borrowerInfo?.phone || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Credit Score:</span>
                <span className="font-semibold">{selectedLoan.borrowerInfo?.creditScore || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Annual Income:</span>
                <span className="font-semibold">
                  {selectedLoan.borrowerInfo?.annualIncome ? formatCurrency(selectedLoan.borrowerInfo.annualIncome) : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Employment Status:</span>
                <span className="font-semibold">{selectedLoan.borrowerInfo?.employmentStatus || 'Unknown'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Loan Status</h4>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-full ${getStatusColor(selectedLoan.status)}`}>
                {getStatusIcon(selectedLoan.status)}
              </div>
              <div>
                <h5 className="font-medium text-gray-900">Current Status: <span className="capitalize">{selectedLoan.status}</span></h5>
                <p className="text-sm text-gray-600">
                  {selectedLoan.status === 'approved' ? 'This loan has been approved and is active' :
                   selectedLoan.status === 'pending' ? 'This loan application is under review' :
                   selectedLoan.status === 'rejected' ? 'This loan application was rejected' :
                   selectedLoan.status === 'paid' ? 'This loan has been fully paid' : 'Status unknown'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Created: {formatDate(selectedLoan.createdAt)}</p>
              <p className="text-sm text-gray-600">Last Updated: {formatDate(selectedLoan.updatedAt)}</p>
            </div>
          </div>
        </div>
      </div>
    );

    const renderRepaymentTab = () => (
      <div className="space-y-6">
        {selectedLoan.repaymentSchedule ? (
          <>
            <div className="bg-blue-50 p-6 rounded-xl">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Repayment Schedule</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-white p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-600">Start Date:</span>
                  </div>
                  <p className="text-lg font-semibold mt-1">
                    {formatDate(selectedLoan.repaymentSchedule.startDate)}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-600">End Date:</span>
                  </div>
                  <p className="text-lg font-semibold mt-1">
                    {formatDate(selectedLoan.repaymentSchedule.endDate)}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-600">Frequency:</span>
                  </div>
                  <p className="text-lg font-semibold mt-1 capitalize">
                    {selectedLoan.repaymentSchedule.frequency}
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Installment</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedLoan.repaymentSchedule.installments.map((installment, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">#{index + 1}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(installment.dueDate)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(installment.amount)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(installment.status)}`}>
                            {installment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Payment History</h4>
              {selectedLoan.payments && selectedLoan.payments.length > 0 ? (
                <div className="space-y-4">
                  {selectedLoan.payments.map((payment, index) => (
                    <div key={payment._id || index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-full ${payment.status === 'paid' ? 'bg-green-100 text-green-600' : payment.status === 'late' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                          {payment.status === 'paid' ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : payment.status === 'late' ? (
                            <AlertCircle className="w-5 h-5" />
                          ) : (
                            <Clock className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">Payment #{index + 1}</p>
                          <p className="text-xs text-gray-500">{formatDate(payment.date)}</p>
                          {payment.paymentMethod && (
                            <p className="text-xs text-gray-500">Method: {payment.paymentMethod}</p>
                          )}
                          {payment.transactionId && (
                            <p className="text-xs text-gray-500">Transaction: {payment.transactionId}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">{formatCurrency(payment.amount)}</p>
                        <span className={`text-sm ${payment.status === 'paid' ? 'text-green-600' : payment.status === 'late' ? 'text-red-600' : 'text-yellow-600'}`}>
                          {payment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <CreditCard className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No payment history available</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <FileClock className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <h5 className="text-lg font-medium text-gray-900 mb-1">No Repayment Schedule</h5>
            <p className="text-gray-500">This loan doesn't have a repayment schedule yet.</p>
          </div>
        )}
      </div>
    );

    const renderDocumentsTab = () => (
      <div className="space-y-6">
        <div className="bg-blue-50 p-6 rounded-xl">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Loan Documents</h4>
          <div className="space-y-4">
            {renderDocumentItem('Application Form', selectedLoan.documents?.applicationForm)}
            {renderDocumentItem('Credit Report', selectedLoan.documents?.creditReport)}
            {renderDocumentItem('Bank Statements', selectedLoan.documents?.bankStatements)}
            {renderDocumentItem('Tax Returns', selectedLoan.documents?.taxReturns)}
            {renderDocumentItem('Other Documents', selectedLoan.documents?.otherDocuments)}
          </div>
        </div>

        {selectedLoan.collateral && (
          <div className="bg-blue-50 p-6 rounded-xl">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Collateral Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-white p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <FileKey2 className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-600">Type:</span>
                </div>
                <p className="text-lg font-semibold mt-1">
                  {selectedLoan.collateral.type || 'N/A'}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-600">Value:</span>
                </div>
                <p className="text-lg font-semibold mt-1">
                  {selectedLoan.collateral.value ? formatCurrency(selectedLoan.collateral.value) : 'N/A'}
                </p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-blue-600" />
                <span className="text-gray-600">Description:</span>
              </div>
              <p className="mt-1">
                {selectedLoan.collateral.description || 'No description provided'}
              </p>
            </div>
            {selectedLoan.collateral.documents && selectedLoan.collateral.documents.length > 0 && (
              <div className="mt-4">
                <h5 className="text-sm font-medium text-gray-600 mb-2">Collateral Documents</h5>
                <div className="space-y-2">
                  {selectedLoan.collateral.documents.map((doc, i) => (
                    <div key={i} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-3">
                        {getDocumentIcon('Collateral Document')}
                        <span className="text-sm text-gray-800 truncate max-w-xs">
                          {doc.split('/').pop() || `Document ${i + 1}`}
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => window.open(doc, '_blank')}
                          className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            const a = document.createElement('a');
                            a.href = doc;
                            a.download = `collateral_document_${i + 1}`;
                            a.click();
                          }}
                          className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );

    const renderFeesTab = () => (
      <div className="space-y-6">
        <div className="bg-blue-50 p-6 rounded-xl">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Loan Fees</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                <span className="text-gray-600">Processing Fee:</span>
              </div>
              <p className="text-lg font-semibold mt-1">
                {selectedLoan.fees?.processingFee ? formatCurrency(selectedLoan.fees.processingFee) : 'N/A'}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                <span className="text-gray-600">Late Fee:</span>
              </div>
              <p className="text-lg font-semibold mt-1">
                {selectedLoan.fees?.lateFee ? formatCurrency(selectedLoan.fees.lateFee) : 'N/A'}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-blue-600" />
                <span className="text-gray-600">Prepayment Penalty:</span>
              </div>
              <p className="text-lg font-semibold mt-1">
                {selectedLoan.fees?.prepaymentPenalty ? formatCurrency(selectedLoan.fees.prepaymentPenalty) : 'N/A'}
              </p>
            </div>
          </div>

          {selectedLoan.fees?.otherFees && selectedLoan.fees.otherFees.length > 0 && (
            <div className="mt-6">
              <h5 className="text-md font-medium text-gray-900 mb-3">Other Fees</h5>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fee Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedLoan.fees.otherFees.map((fee, index) => (
                      <tr key={index}>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{fee.name}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(fee.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {selectedLoan.insurance && (
          <div className="bg-blue-50 p-6 rounded-xl">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Insurance Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <FileCheck2 className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-600">Required:</span>
                </div>
                <p className="text-lg font-semibold mt-1">
                  {selectedLoan.insurance.required ? 'Yes' : 'No'}
                </p>
              </div>
              {selectedLoan.insurance.required && (
                <>
                  <div className="bg-white p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <FileHeart className="w-5 h-5 text-blue-600" />
                      <span className="text-gray-600">Provider:</span>
                    </div>
                    <p className="text-lg font-semibold mt-1">
                      {selectedLoan.insurance.provider || 'N/A'}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <FileDigit className="w-5 h-5 text-blue-600" />
                      <span className="text-gray-600">Policy Number:</span>
                    </div>
                    <p className="text-lg font-semibold mt-1">
                      {selectedLoan.insurance.policyNumber || 'N/A'}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                      <span className="text-gray-600">Premium:</span>
                    </div>
                    <p className="text-lg font-semibold mt-1">
                      {selectedLoan.insurance.premium ? formatCurrency(selectedLoan.insurance.premium) : 'N/A'}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                      <span className="text-gray-600">Coverage Amount:</span>
                    </div>
                    <p className="text-lg font-semibold mt-1">
                      {selectedLoan.insurance.coverageAmount ? formatCurrency(selectedLoan.insurance.coverageAmount) : 'N/A'}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    );

    const renderNotesTab = () => (
      <div className="space-y-6">
        <div className="bg-blue-50 p-6 rounded-xl">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Loan Notes</h4>
          {selectedLoan.notes && selectedLoan.notes.length > 0 ? (
            <div className="space-y-4">
              {selectedLoan.notes.map((note, index) => (
                <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Note #{index + 1}</span>
                    <span className="text-xs text-gray-500">{formatDateTime(selectedLoan.updatedAt)}</span>
                  </div>
                  <p className="text-gray-800">{note}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-white rounded-lg">
              <FileQuestion className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No notes available for this loan</p>
            </div>
          )}
        </div>
      </div>
    );

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-6 w-full max-w-6xl mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4 sticky top-0 bg-white py-2 z-10">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                Loan Details: {selectedLoan.productType || 'Loan'} #{selectedLoan._id.substring(0, 8).toUpperCase()}
              </h3>
              <p className="text-sm text-gray-600">
                Borrower: {selectedLoan.borrowerInfo?.firstName} {selectedLoan.borrowerInfo?.lastName}
              </p>
            </div>
            <button
              onClick={() => setShowLoanModal(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Loan Tabs */}
          <div className="border-b border-gray-200 mb-6 sticky top-16 bg-white py-2 z-10">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              <button
                onClick={() => setLoanActiveTab("overview")}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${loanActiveTab === "overview" ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Overview
              </button>
              <button
                onClick={() => setLoanActiveTab("repayment")}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${loanActiveTab === "repayment" ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Repayment
              </button>
              <button
                onClick={() => setLoanActiveTab("documents")}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${loanActiveTab === "documents" ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Documents
              </button>
              <button
                onClick={() => setLoanActiveTab("fees")}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${loanActiveTab === "fees" ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Fees & Insurance
              </button>
              <button
                onClick={() => setLoanActiveTab("notes")}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${loanActiveTab === "notes" ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                Notes
              </button>
            </nav>
          </div>
          
          {/* Loan Tab Content */}
          <div className="space-y-6">
            {loanActiveTab === "overview" && renderOverviewTab()}
            {loanActiveTab === "repayment" && renderRepaymentTab()}
            {loanActiveTab === "documents" && renderDocumentsTab()}
            {loanActiveTab === "fees" && renderFeesTab()}
            {loanActiveTab === "notes" && renderNotesTab()}
          </div>
          
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setShowLoanModal(false)}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

 if (loading) {
  return <EnhancedLoadingSpinner />;
}

  if (error) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 items-center justify-center">
        <div className="text-center p-6 bg-white/80 rounded-xl shadow-lg max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-orange-200/50 px-6 py-4 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden mr-4 p-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg"
              >
                <Menu className="w-5 h-5 text-white" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-orange-500 font-medium">Dashboard</span>
                  <span className="text-orange-400">›</span>
                  <span className="text-black font-semibold">
                    Customer Management
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-orange-500" />
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 bg-white/70 border border-orange-300/50 rounded-xl text-sm text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500/70 transition-all duration-200"
                />
              </div>

              <button className="relative p-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 transition-all duration-200 group shadow-lg">
                <Bell className="w-5 h-5 text-white" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-red-600 to-orange-600 rounded-full flex items-center justify-center border-2 border-white">
                  <span className="text-xs text-white font-bold">2</span>
                </div>
              </button>
              <NotificationBell />

              <div className="flex items-center space-x-3 pl-4 border-l border-orange-200/50">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-bold text-black">{userName}</div>
                  <div className="text-xs text-gray-600 font-medium">
                    Customer Manager
                  </div>
                </div>
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-sm">AU</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full shadow-sm"></div>
                </div>
                <ChevronDown className="w-4 h-4 text-orange-500" />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Customer Management
                </h1>
                <p className="text-gray-600">
                  Manage and monitor all customer accounts
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg transform hover:scale-105"
              >
                <UserPlus className="w-5 h-5" />
                <span>Add Customer</span>
              </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-orange-200/30 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">
                      Total Customers
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {customers.length}
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-orange-200/30 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">
                      Active Customers
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {customers.length}
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-orange-200/30 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">
                      New This Month
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      {customers.filter(customer => {
                        const joinDate = new Date(customer.createdAt);
                        const now = new Date();
                        return joinDate.getMonth() === now.getMonth() && 
                               joinDate.getFullYear() === now.getFullYear();
                      }).length}
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                    <UserPlus className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Table */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-orange-200/30 shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-b border-orange-200/30">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Contact
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Address
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Join Date
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Role
                    </th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-orange-200/30">
                  {filteredCustomers.map((customer) => (
                    <tr
                      key={customer._id}
                      className="hover:bg-orange-50/30 transition-colors duration-200"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-sm">
                              {getInitials(
                                customer.firstName,
                                customer.lastName
                              )}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {customer.firstName} {customer.lastName}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {customer._id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2 text-sm text-gray-900">
                            <Mail className="w-4 h-4 text-orange-500" />
                            <span>{customer.email}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Phone className="w-4 h-4 text-orange-500" />
                            <span>{customer.phoneNumber || 'N/A'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4 text-orange-500" />
                          <span className="max-w-xs truncate">
                            {customer.address || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 text-orange-500" />
                          <span>{customer.createdAt ? formatDate(customer.createdAt) : 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {customer.role !== "agent" && (
                          <span className="inline-flex px-3 py-1 text-xs font-medium bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 rounded-full">
                            {customer.role || 'customer'}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center">
                          <button
                            onClick={() => handleView(customer)}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                            title="View Customer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredCustomers.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No customers found</p>
                <p className="text-gray-400 text-sm">
                  {searchTerm ? "Try adjusting your search criteria" : "No customers available"}
                </p>
              </div>
            )}
          </div>

          {/* Add Customer Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Add New Customer
                  </h3>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-gray-600 mb-6">
                  Customer creation form would go here.
                </p>
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-colors"
                  >
                    Add Customer
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* View Customer Modal */}
          {showViewModal && selectedCustomer && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-6 w-full max-w-4xl mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4 sticky top-0 bg-white py-2 z-10">
                  <h3 className="text-xl font-semibold text-gray-900">
                    Customer Details: {selectedCustomer.firstName} {selectedCustomer.lastName}
                  </h3>
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                
                {/* Tabs */}
                <div className="border-b border-gray-200 mb-6 sticky top-14 bg-white py-2 z-10">
                  <nav className="-mb-px flex space-x-8">
                    <button
                      onClick={() => setActiveTab("details")}
                      className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "details" ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    >
                      <div className="flex items-center">
                        <UserPlus className="w-4 h-4 mr-2" />
                        Basic Details
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab("kyc")}
                      className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "kyc" ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    >
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 mr-2" />
                        KYC Documents
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveTab("loans")}
                      className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === "loans" ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
                    >
                      <div className="flex items-center">
                        <CreditCard className="w-4 h-4 mr-2" />
                        Loan Applications
                      </div>
                    </button>
                  </nav>
                </div>
                
                {/* Tab Content */}
                <div className="space-y-6">
                  {activeTab === "details" && (
                    <>
                      <div className="flex items-center space-x-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold text-2xl">
                            {getInitials(selectedCustomer.firstName, selectedCustomer.lastName)}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-xl font-bold text-gray-900">
                            {selectedCustomer.firstName} {selectedCustomer.lastName}
                          </h4>
                          <p className="text-sm text-gray-600">ID: {selectedCustomer._id}</p>
                          <div className="mt-2">
                            <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${getStatusBadge(selectedCustomer.status || 'active')}`}>
                              {selectedCustomer.status || 'active'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                        <div className="col-span-2">
                          <h5 className="text-sm font-medium text-gray-500 mb-2">Email</h5>
                          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                            <Mail className="w-5 h-5 text-orange-500 mr-3" />
                            <span className="text-gray-900">{selectedCustomer.email}</span>
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="text-sm font-medium text-gray-500 mb-2">Phone Number</h5>
                          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                            <Phone className="w-5 h-5 text-orange-500 mr-3" />
                            <span className="text-gray-900">{selectedCustomer.phoneNumber || 'N/A'}</span>
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="text-sm font-medium text-gray-500 mb-2">Role</h5>
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <span className="inline-flex px-3 py-1 text-xs font-medium bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 rounded-full">
                              {selectedCustomer.role || 'customer'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="col-span-2">
                          <h5 className="text-sm font-medium text-gray-500 mb-2">Address</h5>
                          <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                            <MapPin className="w-5 h-5 text-orange-500 mr-3 mt-1 flex-shrink-0" />
                            <span className="text-gray-900">{selectedCustomer.address || 'N/A'}</span>
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="text-sm font-medium text-gray-500 mb-2">Join Date</h5>
                          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                            <Calendar className="w-5 h-5 text-orange-500 mr-3" />
                            <span className="text-gray-900">
                              {selectedCustomer.createdAt ? formatDate(selectedCustomer.createdAt) : 'N/A'}
                            </span>
                          </div>
                        </div>
                        
                        <div>
                          <h5 className="text-sm font-medium text-gray-500 mb-2">Last Updated</h5>
                          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                            <Calendar className="w-5 h-5 text-orange-500 mr-3" />
                            <span className="text-gray-900">
                              {selectedCustomer.updatedAt ? formatDate(selectedCustomer.updatedAt) : 'N/A'}
                            </span>
                          </div>
                        </div>
                        
                        {selectedCustomer.additionalInfo && (
                          <div className="col-span-2">
                            <h5 className="text-sm font-medium text-gray-500 mb-2">Additional Info</h5>
                            <div className="p-3 bg-gray-50 rounded-lg">
                              <p className="text-gray-900">
                                {selectedCustomer.additionalInfo}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {activeTab === "kyc" && (
                    <div className="space-y-6">
                      <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                        <h4 className="text-md font-semibold text-gray-900 mb-1">
                          KYC Documents for {selectedCustomer.firstName} {selectedCustomer.lastName}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Review and manage all identity verification documents submitted by this customer
                        </p>
                      </div>
                      
                      {kycError && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-red-700 text-sm">{kycError}</p>
                        </div>
                      )}

                      {kycLoading ? (
                        <div className="flex justify-center py-12">
                          <div className="flex flex-col items-center">
                            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-gray-600">Loading documents...</p>
                          </div>
                        </div>
                      ) : kycDocuments.length > 0 ? (
                        <div className="space-y-4">
                          {kycDocuments.map(renderKycDocument)}
                        </div>
                      ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <h5 className="text-lg font-medium text-gray-900 mb-1">No KYC Documents Found</h5>
                          <p className="text-gray-500 mb-4">This customer hasn't uploaded any verification documents yet.</p>
                          <button
                            onClick={() => fetchKycDocuments(selectedCustomer._id)}
                            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-colors"
                          >
                            Refresh Documents
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === "loans" && (
                    <div className="space-y-6">
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="text-md font-semibold text-gray-900 mb-1">
                              Loan Applications
                            </h4>
                            <p className="text-sm text-gray-600">
                              View and manage all loan applications from this customer
                            </p>
                          </div>
                          <button
                            onClick={() => fetchLoansByUserId(selectedCustomer._id)}
                            className="px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
                          >
                            Refresh
                          </button>
                        </div>
                      </div>

                      {loansLoading ? (
                        <div className="flex justify-center py-12">
                          <div className="flex flex-col items-center">
                            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-gray-600">Loading loan applications...</p>
                          </div>
                        </div>
                      ) : loansError ? (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-red-700 text-sm">{loansError}</p>
                        </div>
                      ) : loans.length > 0 ? (
                        <div className="space-y-4">
                          {loans.map(renderLoanItem)}
                        </div>
                      ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-lg">
                          <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <h5 className="text-lg font-medium text-gray-900 mb-1">No Loan Applications</h5>
                          <p className="text-gray-500 mb-4">
                            This customer hasn't applied for any loans yet.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Loan Details Modal */}
          {showLoanModal && selectedLoan && renderLoanDetailsModal()}
        </main>
      </div>
    </div>
  );
};

export default CustomerPage;