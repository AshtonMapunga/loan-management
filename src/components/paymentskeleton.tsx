
import { Menu } from "lucide-react";
import { Skeleton } from "./Dashboardskeleton";

export const paymentSkeleton = () => {
  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Keep the existing sidebar */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
        {/* Header Skeleton */}
        <header className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-blue-200/50 px-6 py-4 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center">
              <button className="lg:hidden mr-4 p-2 rounded-xl bg-blue-100/50">
                <Menu className="w-5 h-5 text-blue-600" />
              </button>
              <div className="flex items-center space-x-3">
                <Skeleton className="h-4 w-32 rounded-md" />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Skeleton className="hidden md:block h-10 w-64 rounded-xl" />
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex items-center space-x-3 pl-4 border-l border-blue-200/50">
                <div className="text-right hidden sm:block">
                  <Skeleton className="h-4 w-24 mb-1 rounded-md" />
                  <Skeleton className="h-3 w-16 rounded-md" />
                </div>
                <Skeleton className="h-10 w-10 rounded-xl" />
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Tab Navigation Skeleton */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/50">
            <div className="flex space-x-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-32 rounded-xl" />
              ))}
            </div>
          </div>

          {/* Main Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Panel Skeleton */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                <Skeleton className="h-6 w-48 mb-4 rounded-md" />
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-4 rounded-xl border-2 border-blue-200/50">
                      <div className="flex justify-between items-start mb-2">
                        <Skeleton className="h-4 w-16 rounded-md" />
                        <Skeleton className="h-5 w-12 rounded-full" />
                      </div>
                      <Skeleton className="h-6 w-40 mb-1 rounded-md" />
                      <Skeleton className="h-4 w-24 mb-2 rounded-md" />
                      <Skeleton className="h-4 w-20 rounded-md" />
                      <Skeleton className="h-3 w-36 mt-1 rounded-md" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Panel Skeleton */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/50">
                <div className="mb-6">
                  <Skeleton className="h-7 w-56 mb-2 rounded-md" />
                  <Skeleton className="h-4 w-64 rounded-md" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  {[...Array(2)].map((_, i) => (
                    <Skeleton key={i} className="h-28 rounded-xl" />
                  ))}
                </div>

                <div className="space-y-6">
                  <div>
                    <Skeleton className="h-5 w-36 mb-3 rounded-md" />
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {[...Array(2)].map((_, i) => (
                        <Skeleton key={i} className="h-20 rounded-xl" />
                      ))}
                    </div>
                    <Skeleton className="w-full h-14 rounded-xl" />
                  </div>

                  <div>
                    <Skeleton className="h-5 w-36 mb-3 rounded-md" />
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[...Array(6)].map((_, i) => (
                        <Skeleton key={i} className="h-24 rounded-xl" />
                      ))}
                    </div>
                  </div>

                  <div>
                    <Skeleton className="h-5 w-40 mb-3 rounded-md" />
                    <Skeleton className="w-full h-12 rounded-xl" />
                    <Skeleton className="h-3 w-64 mt-1 rounded-md" />
                  </div>

                  <div>
                    <Skeleton className="h-5 w-32 mb-3 rounded-md" />
                    <Skeleton className="w-full h-24 rounded-xl" />
                  </div>

                  <div className="pt-4 border-t border-blue-200">
                    <Skeleton className="w-full h-14 rounded-xl" />
                    <div className="flex items-center justify-center space-x-1 mt-3">
                      <Skeleton className="h-3 w-48 rounded-md" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
 