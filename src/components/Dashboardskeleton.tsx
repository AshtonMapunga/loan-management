import { type HTMLAttributes } from "react";

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  isLoaded?: boolean;
  children?: React.ReactNode;
}

// Base Skeleton Component
export const Skeleton = ({
  className = "",
  isLoaded = false,
  children,
  ...rest
}: SkeletonProps) => {
  if (isLoaded) return <>{children}</>;

  return (
    <div
      className={`animate-pulse bg-gradient-to-r from-orange-100 to-orange-200 rounded-lg ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
};

// Reusable Card Skeleton
export const SkeletonCard = () => (
  <div className="space-y-4">
    <Skeleton className="h-6 w-3/4 rounded-xl" />
    <Skeleton className="h-4 w-1/2 rounded-xl" />
    <Skeleton className="h-4 w-full rounded-xl" />
    <Skeleton className="h-4 w-5/6 rounded-xl" />
  </div>
);

// User Profile Skeleton
export const SkeletonUserProfile = () => (
  <div className="flex items-center space-x-4 p-4">
    <Skeleton className="w-12 h-12 rounded-xl" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-4 w-32 rounded-xl" />
      <Skeleton className="h-3 w-24 rounded-xl" />
    </div>
  </div>
);

// Loan Item Skeleton
export const SkeletonLoanItem = () => (
  <div className="flex items-center justify-between p-6">
    <div className="flex items-center space-x-4">
      <Skeleton className="w-14 h-14 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-5 w-48 rounded-xl" />
        <Skeleton className="h-4 w-64 rounded-xl" />
        <Skeleton className="h-3 w-32 rounded-xl" />
      </div>
    </div>
    <div className="space-y-2">
      <Skeleton className="h-6 w-24 rounded-xl" />
      <Skeleton className="h-4 w-16 rounded-xl" />
    </div>
  </div>
);

// Complete Dashboard Skeleton
export const DashboardSkeleton = () => (
  <div className="flex h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50">
    {/* Sidebar Skeleton */}
    <div className="hidden lg:block w-64 bg-white/50 border-r border-orange-200/50 p-4">
      <div className="space-y-8">
        <Skeleton className="h-10 w-32 rounded-xl" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-8 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>

    {/* Main Content Skeleton */}
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header Skeleton */}
      <header className="bg-white/80 border-b border-orange-200/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-8 w-8 rounded-xl lg:hidden" />
            <Skeleton className="h-6 w-48 rounded-xl" />
          </div>
          <div className="flex items-center space-x-4">
            <Skeleton className="h-10 w-64 rounded-xl hidden md:block" />
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-10 w-10 rounded-xl" />
          </div>
        </div>
      </header>

      {/* Dashboard Content Skeleton */}
      <main className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Hero Section Skeleton */}
        <div className="relative rounded-3xl overflow-hidden min-h-[300px]">
          <Skeleton className="h-full w-full" />
        </div>

        {/* Metrics Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white/70 rounded-2xl p-6 border border-white/50"
            >
              <SkeletonCard />
            </div>
          ))}
        </div>

        {/* Charts Section Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Users List Skeleton */}
          <div className="bg-white/70 rounded-2xl p-8 border border-white/50">
            <div className="mb-8">
              <Skeleton className="h-6 w-48 rounded-xl" />
              <Skeleton className="h-4 w-32 rounded-xl mt-2" />
            </div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <SkeletonUserProfile key={i} />
              ))}
            </div>
          </div>

          {/* Risk Assessment Skeleton */}
          <div className="bg-white/70 rounded-2xl p-8 border border-white/50">
            <div className="mb-8">
              <Skeleton className="h-6 w-48 rounded-xl" />
              <Skeleton className="h-4 w-32 rounded-xl mt-2" />
            </div>
            <div className="space-y-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-24 rounded-xl" />
                    <Skeleton className="h-4 w-12 rounded-xl" />
                  </div>
                  <Skeleton className="w-full h-3 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pending Loans Skeleton */}
        <div className="bg-white/70 rounded-2xl p-8 border border-white/50">
          <div className="mb-8">
            <Skeleton className="h-6 w-48 rounded-xl" />
            <Skeleton className="h-4 w-32 rounded-xl mt-2" />
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <SkeletonLoanItem key={i} />
            ))}
          </div>
        </div>
      </main>
    </div>
  </div>
);

// Export all skeleton components
export default {
  Skeleton,
  SkeletonCard,
  SkeletonUserProfile,
  SkeletonLoanItem,
  DashboardSkeleton,
};