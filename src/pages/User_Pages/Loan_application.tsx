import { useState, useEffect } from "react";
import {
  Menu,
  Search,
  ChevronDown,
  Plus,
  FileText,
  Clock,
  Bell,
} from "lucide-react";
import Sidebar from "../../components/User_Sidebar";
import NotificationBell from '../../components/Notificationsbell';
import Apply_new_loan from "../../components/loan_component/Apply_new_loan";
import Application_Status from "../../components/loan_component/Application_Status";
import ApplicationHistory from "../../components/loan_component/Application_history";
import KycDocuments from "../../components/loan_component/kyc_Doc";

// Main Loan Application Page
const LoanApplicationPage = () => {
  const userName = localStorage.getItem("userName");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("apply");
  const [loading, setLoading] = useState(true);

  const tabs = [
    { id: "apply", label: "Apply New Loan", icon: Plus },
    { id: "status", label: "Application Status", icon: FileText },
    { id: "history", label: "History", icon: Clock },
    { id: "kyc", label: "KYC Documents", icon: Clock },
  ];

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {loading ? (
          <div className="animate-pulse">
            {/* Skeleton Header */}
            <header className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-orange-200/50 px-6 py-4 relative">
              <div className="relative flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
                  <div className="flex space-x-2">
                    <div className="w-20 h-4 bg-gray-200 rounded"></div>
                    <div className="w-4 h-4 bg-gray-200 rounded"></div>
                    <div className="w-24 h-4 bg-gray-200 rounded"></div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="hidden md:block w-64 h-10 bg-gray-200 rounded-xl"></div>
                  <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
                  <div className="flex items-center space-x-3">
                    <div className="hidden sm:block space-y-1">
                      <div className="w-24 h-3 bg-gray-200 rounded"></div>
                      <div className="w-16 h-3 bg-gray-200 rounded"></div>
                    </div>
                    <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
                    <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </header>

            {/* Skeleton Main Content */}
            <main className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Tab Navigation Skeleton */}
              <div className="mb-8">
                <div className="flex space-x-1 bg-white/70 backdrop-blur-sm p-2 rounded-2xl border border-orange-200/30 shadow-lg">
                  {tabs.map((tab) => (
                    <div
                      key={tab.id}
                      className="flex-1 h-12 bg-gray-200 rounded-xl"
                    ></div>
                  ))}
                </div>
              </div>

              {/* Content Area Skeleton */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-orange-200/30 shadow-lg p-6 h-96">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-12 bg-gray-200 rounded-xl"></div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-12 bg-gray-200 rounded-xl"></div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="h-32 bg-gray-200 rounded-xl"></div>
                  ))}
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-orange-200/30 shadow-lg p-6 h-64">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="h-4 bg-gray-200 rounded w-full"></div>
                  ))}
                </div>
              </div>
            </main>
          </div>
        ) : (
          <>
            {/* Actual Header */}
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
                        Loan Application
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="relative hidden md:block">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-orange-500" />
                    <input
                      type="text"
                      placeholder="Search applications..."
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
                        Loan Manager
                      </div>
                    </div>
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-sm">SJ</span>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full shadow-sm"></div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-orange-500" />
                  </div>
                </div>
              </div>
            </header>

            {/* Actual Main Content */}
            <main className="flex-1 overflow-y-auto p-6">
              {/* Tab Navigation */}
              <div className="mb-8">
                <div className="flex space-x-1 bg-white/70 backdrop-blur-sm p-2 rounded-2xl border border-orange-200/30 shadow-lg">
                  {tabs.map((tab) => {
                    const IconComponent = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                          activeTab === tab.id
                            ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg transform scale-105"
                            : "text-black hover:bg-gradient-to-r hover:from-orange-100 hover:to-red-100 hover:text-orange-700"
                        }`}
                      >
                        <IconComponent className="w-5 h-5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tab Content */}
              <div className="space-y-8">
                {activeTab === "apply" && <Apply_new_loan />}
                {activeTab === "status" && <Application_Status />}
                {activeTab === "history" && <ApplicationHistory />}
                {activeTab === "kyc" && <KycDocuments />}
              </div>
            </main>
          </>
        )}
      </div>
    </div>
  );
};

export default LoanApplicationPage;