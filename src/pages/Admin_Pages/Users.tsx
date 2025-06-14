import { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Edit3,
  Trash2,
  Search,
  Menu,
  Bell,
  ChevronDown,
  MoreVertical,
  Eye,
  AlertCircle,
  CheckCircle,
  UserCheck,
} from "lucide-react";
import UserService from "../../services/user-service";
import Sidebar from "../../components/Sidebar";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  profilePicture: string;
  createdAt: string;
  updatedAt: string;
}

const UserManagement = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await UserService.getAllUsers();
      console.log("API Response:", response);
      
      // Handle different possible response structures
      let userData: User[] = [];
      if (Array.isArray(response)) {
        userData = response;
      } else if (response.data && Array.isArray(response.data)) {
        userData = response.data;
      } else if (response.users && Array.isArray(response.users)) {
        userData = response.users;
      } else {
        console.warn("Unexpected response structure:", response);
        userData = [];
      }
      
      setUsers(userData);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching users:", err);
      setError(typeof err === 'string' ? err : err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Invalid Date';
    }
  };

  // Filter users based on search
  const filteredUsers = users.filter((user) => {
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`;
    const searchLower = searchTerm.toLowerCase();
    return (
      fullName.toLowerCase().includes(searchLower) ||
      (user.email || '').toLowerCase().includes(searchLower)
    );
  });

  const userStats = [
    {
      label: "Total Users",
      value: users.length.toString(),
      trend: "+3",
      color: "from-orange-400 to-red-500",
      bgColor: "bg-orange-50",
      icon: Users,
    },
    {
      label: "Active Users",
      value: users.length.toString(),
      trend: "+2",
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
      icon: UserCheck,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-orange-600">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-700 mb-2">Error</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchUsers}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
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
                className="lg:hidden mr-4 p-2 rounded-xl bg-orange-100/50 hover:bg-orange-200/50 transition-all duration-200"
              >
                <Menu className="w-5 h-5 text-orange-600" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-orange-500">Dashboard</span>
                  <span className="text-orange-300">›</span>
                  <span className="text-orange-700 font-medium">User Management</span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-orange-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 bg-orange-100/50 border border-orange-200/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 transition-all duration-200"
                />
              </div>

              {/* Notifications */}
              <button className="relative p-2 rounded-xl bg-orange-100/50 hover:bg-orange-200/50 transition-all duration-200 group">
                <Bell className="w-5 h-5 text-orange-600 group-hover:text-orange-700" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-medium">2</span>
                </div>
              </button>

              {/* User Profile */}
              <div className="flex items-center space-x-3 pl-4 border-l border-orange-200/50">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-semibold text-orange-700">Admin</div>
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
        <main className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-orange-800 mb-2">User Management</h1>
              <p className="text-orange-600">Manage user accounts, roles, and permissions</p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-lg shadow-orange-500/25 flex items-center space-x-2">
                <UserPlus className="w-4 h-4" />
                <span>Add User</span>
              </button>
            </div>
          </div>

          {/* User Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userStats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div
                  key={index}
                  className="group relative bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-white/50 hover:transform hover:scale-105"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent rounded-2xl"></div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-2xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-300`}>
                        <IconComponent className="w-6 h-6 text-orange-700" />
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold text-white bg-gradient-to-r ${stat.color} shadow-lg`}>
                        {stat.trend}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-orange-600">{stat.label}</h3>
                      <div className="text-3xl font-bold text-orange-800">{stat.value}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add User Button */}
          <div className="flex justify-between items-center">
            <p className="text-orange-600">Showing {filteredUsers.length} users</p>
          </div>

          {/* Users Table */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-orange-200/30">
              <h3 className="text-lg font-semibold text-orange-800">All Users</h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-orange-50/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-orange-600 uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-orange-600 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-orange-600 uppercase tracking-wider">Address</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-orange-600 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-orange-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-orange-200/30">
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-orange-50/30 transition-colors duration-200">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25">
                            <span className="text-white font-semibold text-sm">
                              {getInitials(user.firstName, user.lastName)}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-orange-800">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-xs text-orange-600">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-orange-700">{user.phoneNumber || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-orange-700">{user.address || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-orange-700">{formatDate(user.createdAt)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button className="p-2 rounded-lg bg-blue-100/70 hover:bg-blue-200/70 transition-colors duration-200 group" title="View Details">
                            <Eye className="w-4 h-4 text-blue-600 group-hover:text-blue-700" />
                          </button>
                          <button className="p-2 rounded-lg bg-green-100/70 hover:bg-green-200/70 transition-colors duration-200 group" title="Edit User">
                            <Edit3 className="w-4 h-4 text-green-600 group-hover:text-green-700" />
                          </button>
                          <button className="p-2 rounded-lg bg-red-100/70 hover:bg-red-200/70 transition-colors duration-200 group" title="Delete User">
                            <Trash2 className="w-4 h-4 text-red-600 group-hover:text-red-700" />
                          </button>
                          <button className="p-2 rounded-lg bg-gray-100/70 hover:bg-gray-200/70 transition-colors duration-200 group" title="More Options">
                            <MoreVertical className="w-4 h-4 text-gray-600 group-hover:text-gray-700" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-orange-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-orange-700 mb-2">No users found</h3>
                <p className="text-orange-600">
                  {users.length === 0 ? "No users available" : "Try adjusting your search criteria"}
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredUsers.length > 0 && (
            <div className="flex items-center justify-between bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-white/50">
              <div className="text-sm text-orange-600">
                Showing 1 to {filteredUsers.length} of {filteredUsers.length} results
              </div>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-2 bg-orange-100/50 text-orange-600 rounded-lg hover:bg-orange-200/50 transition-colors duration-200 text-sm font-medium">
                  Previous
                </button>
                <button className="px-3 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-colors duration-200 text-sm font-medium">
                  1
                </button>
                <button className="px-3 py-2 bg-orange-100/50 text-orange-600 rounded-lg hover:bg-orange-200/50 transition-colors duration-200 text-sm font-medium">
                  Next
                </button>
              </div>
            </div>
          )}
        </main>
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

export default UserManagement;