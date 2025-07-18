import { useState, useEffect } from "react";
import {
  Menu,
  Search,
  ChevronDown,
  Bell,
  Users,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  Mail,
  Phone,
  MapPin,
  Calendar,
} from "lucide-react";
import Sidebar from "../../components/User_Sidebar";
import UserService from "../../services/admin_Services/user_Service";// Import your UserService

// Mock NotificationBell component - replace with your actual import
const NotificationBell = () => (
  <div className="relative">
    <Bell className="w-5 h-5 text-orange-500" />
  </div>
);

const CustomerPage = () => {
  const userName = "Admin User"; // Replace with localStorage.getItem("userName")
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoading(true);
        const response = await UserService.getAllUsers();
        setCustomers(response.data); // Adjust based on your API response structure
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch customers");
        setLoading(false);
        console.error("Error fetching customers:", err);
      }
    };

    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phoneNumber?.includes(searchTerm)
  );

  const handleView = async (customerId: string) => {
    try {
      const response = await UserService.getUserById(customerId);
      alert(`Viewing customer: ${response.data.firstName} ${response.data.lastName}`);
    } catch (err) {
      console.error("Error viewing customer:", err);
      alert("Failed to view customer details");
    }
  };

  const handleEdit = async (customerId: string) => {
    try {
      const response = await UserService.getUserById(customerId);
      alert(`Editing customer: ${response.data.firstName} ${response.data.lastName}`);
      // You would typically open a modal with the customer data here
    } catch (err) {
      console.error("Error editing customer:", err);
      alert("Failed to edit customer");
    }
  };

  const handleDelete = async (customerId: string) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      try {
        await UserService.deleteUser(customerId);
        setCustomers(customers.filter((customer) => customer._id !== customerId));
      } catch (err) {
        console.error("Error deleting customer:", err);
        alert("Failed to delete customer");
      }
    }
  };

  const formatDate = (dateString: string | number | Date) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-lg text-gray-700">Loading customers...</p>
        </div>
      </div>
    );
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
                            <span>{customer.phoneNumber}</span>
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
                        <span className="inline-flex px-3 py-1 text-xs font-medium bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 rounded-full">
                          {customer.role || 'customer'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleView(customer._id)}
                            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                            title="View Customer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(customer._id)}
                            className="p-2 text-orange-600 hover:text-orange-800 hover:bg-orange-50 rounded-lg transition-colors duration-200"
                            title="Edit Customer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(customer._id)}
                            className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200"
                            title="Delete Customer"
                          >
                            <Trash2 className="w-4 h-4" />
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

          {/* Add Customer Modal Placeholder */}
          {showAddModal && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
              <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Add New Customer
                </h3>
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
        </main>
      </div>
    </div>
  );
};

export default CustomerPage;