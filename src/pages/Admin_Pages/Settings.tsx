import { useState, useRef, useEffect } from "react";
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  Settings as SettingsIcon,
} from "lucide-react";
import Sidebar from "../../components/Sidebar";
import SystemSettings from "../../components/settingspage_components/system_settings";
import LoanProducts from "../../components/settingspage_components/loan_products";
import WorkflowManagement from "../../components/settingspage_components/workflow_management";

const Settings = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const userName = localStorage.getItem('userName');
  const [, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      {/* Sidebar Component - Not affected by loading state */}
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
              {isLoading ? (
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-orange-200 rounded-md animate-pulse"></div>
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="w-16 h-4 bg-orange-200 rounded-md animate-pulse"></div>
                    <div className="w-4 h-4 bg-orange-200 rounded-md animate-pulse"></div>
                    <div className="w-20 h-4 bg-orange-200 rounded-md animate-pulse"></div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <SettingsIcon className="w-6 h-6 text-orange-600" />
                  <div className="flex items-center space-x-2 text-sm">
                    <span className="text-orange-500">Dashboard</span>
                    <span className="text-orange-300">›</span>
                    <span className="text-orange-700 font-medium">Settings</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {/* Search */}
              {isLoading ? (
                <div className="w-64 h-10 bg-orange-100/50 rounded-xl animate-pulse"></div>
              ) : (
                <div className="relative hidden md:block">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-orange-400" />
                  <input
                    type="text"
                    placeholder="Search settings..."
                    className="pl-10 pr-4 py-2 w-64 bg-orange-100/50 border border-orange-200/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 transition-all duration-200"
                  />
                </div>
              )}

              {/* Notifications with Dropdown */}
              <div className="relative" ref={notificationRef}>
                {isLoading ? (
                  <div className="w-10 h-10 bg-orange-100/50 rounded-xl animate-pulse"></div>
                ) : (
                  <button
                    onClick={() => setShowNotifications((prev) => !prev)}
                    className="relative p-2 rounded-xl bg-orange-100/50 hover:bg-orange-200/50 transition-all duration-200 group"
                  >
                    <Bell className="w-5 h-5 text-orange-600 group-hover:text-orange-700" />
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-medium">3</span>
                    </div>
                  </button>
                )}
              </div>

              {/* User Profile */}
              {isLoading ? (
                <div className="flex items-center space-x-3 pl-4 border-l border-orange-200/50">
                  <div className="text-right hidden sm:block">
                    <div className="w-24 h-4 bg-orange-200 rounded-md animate-pulse mb-1"></div>
                    <div className="w-16 h-3 bg-orange-200 rounded-md animate-pulse"></div>
                  </div>
                  <div className="w-10 h-10 bg-orange-200 rounded-xl animate-pulse"></div>
                  <div className="w-4 h-4 bg-orange-200 rounded-md animate-pulse"></div>
                </div>
              ) : (
                <div className="flex items-center space-x-3 pl-4 border-l border-orange-200/50">
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-semibold text-orange-700">
                      {userName}
                    </div>
                    <div className="text-xs text-orange-500">Administrator</div>
                  </div>
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/25">
                      <span className="text-white font-semibold text-sm">SJ</span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full shadow-sm"></div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-orange-400" />
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Settings Content */}
        <main className="flex-1 overflow-y-auto p-6 space-y-8">
          {isLoading ? (
            <>
              {/* Skeleton for Page Title */}
              <div className="text-center space-y-2">
                <div className="w-64 h-8 bg-orange-200 rounded-md mx-auto animate-pulse"></div>
                <div className="w-48 h-4 bg-orange-200 rounded-md mx-auto animate-pulse"></div>
              </div>

              {/* Skeleton for System Settings */}
              <div className="bg-white/80 rounded-xl shadow-sm border border-orange-200/50 p-6 space-y-6">
                <div className="w-48 h-6 bg-orange-200 rounded-md animate-pulse"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="space-y-3">
                      <div className="w-32 h-4 bg-orange-200 rounded-md animate-pulse"></div>
                      <div className="w-full h-10 bg-orange-100 rounded-lg animate-pulse"></div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end">
                  <div className="w-24 h-10 bg-orange-200 rounded-lg animate-pulse"></div>
                </div>
              </div>

              {/* Skeleton for Loan Products */}
              <div className="bg-white/80 rounded-xl shadow-sm border border-orange-200/50 p-6 space-y-6">
                <div className="flex justify-between items-center">
                  <div className="w-48 h-6 bg-orange-200 rounded-md animate-pulse"></div>
                  <div className="w-32 h-10 bg-orange-200 rounded-lg animate-pulse"></div>
                </div>
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-4 bg-orange-50/50 rounded-lg border border-orange-200/30">
                      <div className="flex justify-between items-center mb-3">
                        <div className="w-40 h-5 bg-orange-200 rounded-md animate-pulse"></div>
                        <div className="flex space-x-2">
                          <div className="w-8 h-8 bg-orange-200 rounded-md animate-pulse"></div>
                          <div className="w-8 h-8 bg-orange-200 rounded-md animate-pulse"></div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, j) => (
                          <div key={j} className="space-y-2">
                            <div className="w-20 h-3 bg-orange-200 rounded-md animate-pulse"></div>
                            <div className="w-full h-4 bg-orange-200 rounded-md animate-pulse"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Skeleton for Workflow Management */}
              <div className="bg-white/80 rounded-xl shadow-sm border border-orange-200/50 p-6 space-y-6">
                <div className="w-48 h-6 bg-orange-200 rounded-md animate-pulse"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="bg-orange-50/50 p-4 rounded-lg border border-orange-200/30 space-y-4">
                      <div className="w-32 h-5 bg-orange-200 rounded-md animate-pulse"></div>
                      <div className="space-y-3">
                        {[...Array(4)].map((_, j) => (
                          <div key={j} className="flex items-center space-x-3">
                            <div className="w-5 h-5 bg-orange-200 rounded-full animate-pulse"></div>
                            <div className="w-40 h-4 bg-orange-200 rounded-md animate-pulse"></div>
                          </div>
                        ))}
                      </div>
                      <div className="w-full h-10 bg-orange-200 rounded-lg animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Page Title */}
              <div className="text-center">
                <h1 className="text-3xl font-bold text-orange-800 mb-2">
                  System Settings
                </h1>
                <p className="text-orange-600">
                  Configure your loan management system
                </p>
              </div>

              {/* System Settings */}
              <SystemSettings />

              {/* Loan Products */}
              <LoanProducts />

              {/* Workflow Management */}
              <WorkflowManagement />
            </>
          )}
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Settings;