import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/User_Sidebar';
import { IoClose } from 'react-icons/io5';
import { FiLogOut } from 'react-icons/fi';
import { Menu, ChevronDown } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Logout = () => {
  const [showLogout, setShowModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleConfirm = () => {
    localStorage.clear();
    toast.success("Logged out successfully!");
    setShowModal(false);
    setTimeout(() => {
      navigate("/userlogin");
    }, 1500);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      {/* Sidebar - remains unchanged */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-orange-200/50 px-6 py-4 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-red-500/5" />
          <div className="relative flex items-center justify-between">
            {loading ? (
              <div className="flex items-center space-x-4 w-full">
                <div className="w-8 h-8 bg-gray-200 rounded-xl animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center">
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="lg:hidden mr-4 p-2 rounded-xl bg-orange-100/50 hover:bg-orange-200/50 transition-all duration-200"
                  >
                    <Menu className="w-5 h-5 text-orange-600" />
                  </button>
                  <div className="flex items-center space-x-3">
                    <FiLogOut className="w-6 h-6 text-orange-600" />
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="text-orange-500">Dashboard</span>
                      <span className="text-orange-300">›</span>
                      <span className="text-orange-700 font-medium">Logout</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3 pl-4 border-l border-orange-200/50">
                    <div className="text-right hidden sm:block">
                      <div className="text-sm font-semibold text-orange-700">
                        John Doe
                      </div>
                      <div className="text-xs text-orange-500">User</div>
                    </div>
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25">
                        <span className="text-white font-semibold text-sm">JD</span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full shadow-sm" />
                    </div>
                    <ChevronDown className="w-4 h-4 text-orange-400" />
                  </div>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="max-w-sm mx-auto mt-5">
              <div className="bg-white rounded-xl shadow-lg p-4 flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="w-3/4 h-6 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-1/2 h-4 bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          ) : (
            <div
              onClick={() => setShowModal(true)}
              className="cursor-pointer max-w-sm mx-auto mt-5 bg-white rounded-xl shadow-lg hover:shadow-xl p-4 flex flex-col items-center space-y-4 transition"
            >
              <span className="text-xl font-semibold text-orange-700">
                <FiLogOut size={24} className="text-red-500" /> Click To Logout
              </span>
            </div>
          )}
        </main>

        {/* Logout Modal */}
        {showLogout && (
          <div
            onClick={() => setShowModal(false)}
            className="fixed bg-black/50 min-h-screen z-50 w-screen flex justify-center items-center top-0 left-0"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white p-6 rounded relative"
            >
              <div className="flex flex-col gap-4 max-w-[400px]">
                <h2 className="text-xl font-bold">Logout</h2>
                <p className="text-gray-700">
                  Are you sure you want to logout?
                </p>
                <div className="flex gap-4 mt-5">
                  <button
                    onClick={handleConfirm}
                    className="bg-orange-500 text-white px-4 py-2 hover:bg-gray-600"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setShowModal(false)}
                    className="bg-orange-500 text-white px-4 py-2 hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
              <div
                onClick={() => setShowModal(false)}
                className="absolute top-2 right-2 cursor-pointer"
              >
                <IoClose size={30} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={1500} hideProgressBar />
    </div>
  );
};

export default Logout;