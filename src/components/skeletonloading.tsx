import React from "react";

const FullPageSkeleton: React.FC = () => {
  return (
    <div className="flex h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
      {/* Main Content Skeleton */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Skeleton */}
        <header className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-orange-200/50 px-6 py-4 relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-orange-100 rounded-xl animate-pulse"></div>
              <div className="ml-4 h-4 w-48 bg-orange-100 rounded-lg animate-pulse"></div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:block h-10 w-64 bg-orange-100 rounded-xl animate-pulse"></div>
              <div className="h-10 w-10 bg-orange-100 rounded-xl animate-pulse"></div>
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block space-y-1">
                  <div className="h-3 w-24 bg-orange-100 rounded animate-pulse"></div>
                  <div className="h-2 w-16 bg-orange-100 rounded animate-pulse"></div>
                </div>
                <div className="h-10 w-10 bg-orange-100 rounded-xl animate-pulse"></div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Skeleton */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6 relative z-0">
          {/* Page Header Skeleton */}
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-2">
              <div className="h-8 w-64 bg-orange-100 rounded-xl animate-pulse"></div>
              <div className="h-4 w-80 bg-orange-100 rounded-xl animate-pulse"></div>
            </div>
            <div className="flex space-x-3">
              <div className="h-10 w-24 bg-orange-100 rounded-xl animate-pulse"></div>
              <div className="h-10 w-36 bg-orange-100 rounded-xl animate-pulse"></div>
            </div>
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-orange-100 rounded-xl animate-pulse"></div>
                    <div className="h-6 w-16 bg-orange-100 rounded-xl animate-pulse"></div>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-xl animate-pulse">
                    <div className="w-6 h-6"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Filters Skeleton */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/50 mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div className="h-8 w-24 bg-orange-100 rounded-xl animate-pulse"></div>
                <div className="h-10 w-32 bg-orange-100 rounded-xl animate-pulse"></div>
              </div>
              <div className="h-4 w-48 bg-orange-100 rounded-xl animate-pulse"></div>
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
                        <div className="h-4 w-24 bg-orange-100 rounded-xl animate-pulse"></div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-orange-200/30">
                  {[...Array(5)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(6)].map((_, j) => (
                        <td key={j} className="px-6 py-4 whitespace-nowrap">
                          <div className="h-4 w-32 bg-orange-100 rounded-xl animate-pulse"></div>
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
              <div className="h-4 w-48 bg-orange-100 rounded-xl animate-pulse"></div>
              <div className="flex items-center space-x-2">
                <div className="h-10 w-20 bg-orange-100 rounded-lg animate-pulse"></div>
                <div className="h-10 w-8 bg-orange-200 rounded-lg animate-pulse"></div>
                <div className="h-10 w-20 bg-orange-100 rounded-lg animate-pulse"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default FullPageSkeleton;