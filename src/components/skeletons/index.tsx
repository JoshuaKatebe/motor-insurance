'use client';

// Base skeleton component
export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-slate-200/60 rounded ${className}`}></div>
  );
}

// Stats card skeleton
export function StatsCardSkeleton() {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <Skeleton className="h-4 w-24 mb-3" />
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-12 w-12 rounded-xl" />
      </div>
    </div>
  );
}

// Table skeleton
export function TableSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200/60">
                <th className="p-4"><Skeleton className="h-4 w-16" /></th>
                <th className="p-4"><Skeleton className="h-4 w-20" /></th>
                <th className="p-4"><Skeleton className="h-4 w-16" /></th>
                <th className="p-4"><Skeleton className="h-4 w-14" /></th>
                <th className="p-4"><Skeleton className="h-4 w-16" /></th>
                <th className="p-4"><Skeleton className="h-4 w-16" /></th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: rows }).map((_, i) => (
                <tr key={i} className="border-b border-slate-200/60">
                  <td className="p-4">
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </td>
                  <td className="p-4"><Skeleton className="h-4 w-24" /></td>
                  <td className="p-4"><Skeleton className="h-4 w-20" /></td>
                  <td className="p-4"><Skeleton className="h-6 w-16 rounded-full" /></td>
                  <td className="p-4"><Skeleton className="h-4 w-20" /></td>
                  <td className="p-4">
                    <div className="flex space-x-2">
                      <Skeleton className="h-8 w-8 rounded-md" />
                      <Skeleton className="h-8 w-8 rounded-md" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Dashboard item skeleton
export function DashboardItemSkeleton() {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
      <div className="p-6 border-b border-slate-200/60">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-slate-50/80 rounded-xl border border-slate-200/40">
              <div className="flex items-center">
                <Skeleton className="h-9 w-9 rounded-lg" />
                <div className="ml-4">
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <div className="text-right">
                <Skeleton className="h-6 w-16 rounded-full mb-1" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Header skeleton
export function HeaderSkeleton() {
  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Skeleton className="h-6 w-6 lg:hidden mr-2" />
            <Skeleton className="h-8 w-24" />
          </div>
          <div className="flex items-center space-x-4">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-4 w-32 hidden sm:block" />
          </div>
        </div>
      </div>
    </header>
  );
}

// Welcome section skeleton
export function WelcomeSkeleton() {
  return (
    <div className="mb-8">
      <Skeleton className="h-9 w-80 mb-2" />
      <Skeleton className="h-6 w-96" />
    </div>
  );
}

// CTA section skeleton
export function CTASkeleton() {
  return (
    <div className="mb-8">
      <div className="bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200 rounded-3xl p-8 relative overflow-hidden animate-pulse">
        <div className="flex flex-col lg:flex-row items-center justify-between">
          <div className="text-center lg:text-left mb-6 lg:mb-0">
            <Skeleton className="h-8 w-64 mb-2 bg-slate-300" />
            <Skeleton className="h-5 w-80 bg-slate-300" />
          </div>
          <Skeleton className="h-14 w-40 rounded-2xl bg-slate-300" />
        </div>
      </div>
    </div>
  );
}
