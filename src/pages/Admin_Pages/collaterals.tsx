import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from "../../components/Sidebar";
import { Search, Filter, Eye, Download, AlertCircle, CheckCircle, Clock, Package, MoreHorizontal } from 'lucide-react';

// Types
interface Collateral {
  id: string;
  loanId: string;
  clientName: string;
  clientId: string;
  itemType: string;
  itemDescription: string;
  estimatedValue: number;
  appraisalValue: number;
  depositDate: string;
  loanAmount: number;
  loanStatus: 'pending' | 'active' | 'completed' | 'defaulted';
  collateralStatus: 'deposited' | 'returned' | 'seized';
  condition: string;
  location: string;
  documents: string[];
  dueDate: string;
  notes?: string;
}

const CollateralManagement: React.FC = () => {
  // Mock data - replace with actual API calls
  const mockCollaterals: Collateral[] = [
    {
      id: 'COL001',
      loanId: 'LN001',
      clientName: 'John Doe',
      clientId: 'CLI001',
      itemType: 'Vehicle',
      itemDescription: '2020 Toyota Camry - License: ABC123',
      estimatedValue: 25000,
      appraisalValue: 22000,
      depositDate: '2024-01-15',
      loanAmount: 18000,
      loanStatus: 'active',
      collateralStatus: 'deposited',
      condition: 'Good',
      location: 'Vault A-12',
      documents: ['vehicle_registration.pdf', 'appraisal_report.pdf'],
      dueDate: '2024-07-15',
      notes: 'Regular maintenance required'
    },
    {
      id: 'COL002',
      loanId: 'LN002',
      clientName: 'Jane Smith',
      clientId: 'CLI002',
      itemType: 'Jewelry',
      itemDescription: 'Gold necklace with diamonds',
      estimatedValue: 8000,
      appraisalValue: 7200,
      depositDate: '2024-02-20',
      loanAmount: 5000,
      loanStatus: 'completed',
      collateralStatus: 'returned',
      condition: 'Excellent',
      location: 'Vault B-05',
      documents: ['jewelry_appraisal.pdf'],
      dueDate: '2024-06-20',
      notes: 'Returned to client on 2024-06-18'
    },
    {
      id: 'COL003',
      loanId: 'LN003',
      clientName: 'Mike Johnson',
      clientId: 'CLI003',
      itemType: 'Electronics',
      itemDescription: 'MacBook Pro 16" 2023',
      estimatedValue: 3000,
      appraisalValue: 2800,
      depositDate: '2024-03-10',
      loanAmount: 2200,
      loanStatus: 'defaulted',
      collateralStatus: 'seized',
      condition: 'Fair',
      location: 'Storage C-08',
      documents: ['purchase_receipt.pdf', 'condition_report.pdf'],
      dueDate: '2024-06-10',
      notes: 'Client defaulted, item seized for auction'
    },
    {
      id: 'COL004',
      loanId: 'LN004',
      clientName: 'Sarah Wilson',
      clientId: 'CLI004',
      itemType: 'Real Estate',
      itemDescription: 'Property deed - 123 Main St',
      estimatedValue: 150000,
      appraisalValue: 145000,
      depositDate: '2024-04-05',
      loanAmount: 100000,
      loanStatus: 'pending',
      collateralStatus: 'deposited',
      condition: 'N/A',
      location: 'Document Safe D-01',
      documents: ['property_deed.pdf', 'valuation_report.pdf'],
      dueDate: '2024-10-05',
      notes: 'Pending loan approval'
    }
  ];

  const [collaterals] = useState<Collateral[]>(mockCollaterals);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [collateralFilter, setCollateralFilter] = useState<string>('all');
  const [selectedCollateral, setSelectedCollateral] = useState<Collateral | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Function to handle closing sidebar on mobile
  const handleSidebarClose = () => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  // Filter and search logic
  const filteredCollaterals = useMemo(() => {
    return collaterals.filter(collateral => {
      const matchesSearch = 
        collateral.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        collateral.loanId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        collateral.itemDescription.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || collateral.loanStatus === statusFilter;
      const matchesCollateral = collateralFilter === 'all' || collateral.collateralStatus === collateralFilter;
      
      return matchesSearch && matchesStatus && matchesCollateral;
    });
  }, [collaterals, searchTerm, statusFilter, collateralFilter]);

  // Status badge component
  const StatusBadge: React.FC<{ status: string; type: 'loan' | 'collateral' }> = ({ status, type }) => {
    const getStatusColor = (status: string, type: 'loan' | 'collateral') => {
      if (type === 'loan') {
        switch (status) {
          case 'pending': return 'bg-yellow-100 text-yellow-600 border border-yellow-200';
          case 'active': return 'bg-green-100 text-green-600 border border-green-200';
          case 'completed': return 'bg-blue-100 text-blue-600 border border-blue-200';
          case 'defaulted': return 'bg-red-100 text-red-600 border border-red-200';
          default: return 'bg-gray-100 text-gray-600 border border-gray-200';
        }
      } else {
        switch (status) {
          case 'deposited': return 'bg-blue-100 text-blue-600 border border-blue-200';
          case 'returned': return 'bg-green-100 text-green-600 border border-green-200';
          case 'seized': return 'bg-red-100 text-red-600 border border-red-200';
          default: return 'bg-gray-100 text-gray-600 border border-gray-200';
        }
      }
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status, type)}`}>
        {status === 'active' && <CheckCircle className="w-3 h-3 mr-1" />}
        {status === 'defaulted' && <AlertCircle className="w-3 h-3 mr-1" />}
        {status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // Statistics component
  const Statistics: React.FC<{ isLoading: boolean }> = ({ isLoading }) => {
    const stats = useMemo(() => {
      const total = collaterals.length;
      const deposited = collaterals.filter(c => c.collateralStatus === 'deposited').length;
      const returned = collaterals.filter(c => c.collateralStatus === 'returned').length;
      const seized = collaterals.filter(c => c.collateralStatus === 'seized').length;
      const totalValue = collaterals.reduce((sum, c) => sum + c.appraisalValue, 0);
      
      return { total, deposited, returned, seized, totalValue };
    }, [collaterals]);

    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-gray-200 animate-pulse"></div>
                <div className="ml-4 space-y-2">
                  <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Collaterals</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Deposited</p>
              <p className="text-2xl font-bold text-gray-900">{stats.deposited}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Overdue</p>
              <p className="text-2xl font-bold text-gray-900">{stats.seized}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100">
              <span className="text-orange-600 font-bold text-lg">Rs</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Disbursed</p>
              <p className="text-2xl font-bold text-orange-600">Rs{(stats.totalValue / 1000).toFixed(1)}M</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100">
              <span className="text-yellow-600 font-bold text-lg">Rs</span>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Outstanding</p>
              <p className="text-2xl font-bold text-yellow-600">Rs{((stats.totalValue * 0.8) / 1000).toFixed(1)}M</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const formatCurrency = (amount: number) => {
    return `Rs${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRiskLevel = (collateral: Collateral) => {
    if (collateral.loanStatus === 'defaulted') return 'High Risk';
    if (collateral.loanStatus === 'pending') return 'Low Risk';
    return 'Low Risk';
  };

  const getRiskColor = (risk: string) => {
    if (risk === 'High Risk') return 'text-red-600';
    return 'text-green-600';
  };

  return (  
    <div className="flex h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      {/* Sidebar Component with mobile behavior */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
      
      />

      {/* Main Content */}
      <div className="flex-1 min-h-screen bg-gray-50 overflow-y-auto">
        {/* Header */}
        {isLoading ? (
          <div className="bg-white shadow-sm h-16 flex items-center px-4 sm:px-6 lg:px-8">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="w-48 h-6 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="ml-auto">
              <div className="w-24 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center">
                  <button 
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                  <div className="flex-shrink-0 ml-2 md:ml-0">
                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                      <Package className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h1 className="text-xl font-semibold text-gray-900">Collateral Management</h1>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setCollateralFilter('all');
                    }}
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors flex items-center cursor-pointer"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Refresh
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Statistics */}
          <Statistics isLoading={isLoading} />

          {/* Filter Tabs */}
          {isLoading ? (
            <div className="mb-6">
              <div className="w-full h-12 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          ) : (
            <div className="mb-6">
              <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm">
                {['all', 'deposited', 'returned', 'seized'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setCollateralFilter(status)}
                    className={`px-4 py-2 rounded-md text-sm font-medium cursor-pointer ${
                      collateralFilter === status
                        ? 'bg-orange-500 text-white'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {status === 'all' ? 'All Collaterals' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search and Filters */}
          {isLoading ? (
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
              <div className="w-full h-12 bg-gray-200 rounded-lg animate-pulse"></div>
            </div>
          ) : (
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search collaterals..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Collaterals Table */}
          {isLoading ? (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="w-48 h-6 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-32 h-4 bg-gray-200 rounded animate-pulse mt-2"></div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      {[...Array(8)].map((_, i) => (
                        <th key={i} className="px-6 py-3">
                          <div className="w-24 h-4 bg-gray-200 rounded animate-pulse"></div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {[...Array(5)].map((_, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        {[...Array(8)].map((_, j) => (
                          <td key={j} className="px-6 py-4 whitespace-nowrap">
                            <div className="w-20 h-4 bg-gray-200 rounded animate-pulse"></div>
                            {j === 2 && <div className="w-32 h-3 bg-gray-200 rounded animate-pulse mt-1"></div>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Collateral Tracking</h2>
                <p className="text-sm text-gray-500">{filteredCollaterals.length} collaterals found</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Collateral ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Outstanding
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Next Payment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Risk
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredCollaterals.map((collateral) => (
                      <tr key={collateral.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{collateral.id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{collateral.clientName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-orange-600 font-medium">{collateral.itemType}</div>
                            <div className="text-sm text-gray-500">{collateral.itemDescription.substring(0, 30)}...</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{formatCurrency(collateral.appraisalValue)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{formatCurrency(collateral.loanAmount)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={collateral.loanStatus} type="loan" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-gray-900">{formatDate(collateral.dueDate)}</div>
                            <div className="text-xs text-gray-400">{collateral.loanStatus === 'pending' ? 'Pending' : 'Next Payment'}</div>
                          </div>
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap font-semibold ${getRiskColor(getRiskLevel(collateral))}`}>
                          {getRiskLevel(collateral)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => {
                              setSelectedCollateral(collateral);
                              setShowDetails(true);
                            }}
                            className="text-orange-500 hover:text-orange-700 cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => alert('Download feature coming soon!')}
                            className="text-gray-400 hover:text-gray-600 cursor-pointer"
                            title="Download"
                          >
                            <Download className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredCollaterals.length === 0 && (
                      <tr>
                        <td colSpan={9} className="text-center py-8 text-gray-500">
                          No collaterals found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Details Modal */}
        {showDetails && selectedCollateral && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
              <button
                onClick={() => setShowDetails(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 cursor-pointer"
                aria-label="Close details"
              >
                <MoreHorizontal className="w-6 h-6 rotate-45" />
              </button>

              <h3 className="text-xl font-semibold mb-4">Collateral Details - {selectedCollateral.id}</h3>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-700">Client Information</h4>
                  <p>{selectedCollateral.clientName} (ID: {selectedCollateral.clientId})</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700">Item</h4>
                  <p>{selectedCollateral.itemType} - {selectedCollateral.itemDescription}</p>
                  <p>Condition: {selectedCollateral.condition}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700">Values</h4>
                  <p>Estimated Value: {formatCurrency(selectedCollateral.estimatedValue)}</p>
                  <p>Appraisal Value: {formatCurrency(selectedCollateral.appraisalValue)}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700">Loan & Collateral Status</h4>
                  <p>Loan Status: <StatusBadge status={selectedCollateral.loanStatus} type="loan" /></p>
                  <p>Collateral Status: <StatusBadge status={selectedCollateral.collateralStatus} type="collateral" /></p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700">Dates & Location</h4>
                  <p>Deposit Date: {formatDate(selectedCollateral.depositDate)}</p>
                  <p>Due Date: {formatDate(selectedCollateral.dueDate)}</p>
                  <p>Location: {selectedCollateral.location}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700">Documents</h4>
                  <ul className="list-disc list-inside">
                    {selectedCollateral.documents.map((doc, i) => (
                      <li key={i} className="text-orange-600 cursor-pointer hover:underline" onClick={() => alert(`Open document: ${doc}`)}>
                        {doc}
                      </li>
                    ))}
                  </ul>
                </div>
                {selectedCollateral.notes && (
                  <div>
                    <h4 className="font-semibold text-gray-700">Notes</h4>
                    <p>{selectedCollateral.notes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollateralManagement;