'use client';

import SideBar from '@/components/SideBar';
import { 
  HeaderSkeleton, 
  WelcomeSkeleton, 
  StatsCardSkeleton, 
  CTASkeleton, 
  DashboardItemSkeleton 
} from './index';

interface DashboardSkeletonProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function DashboardSkeleton({ sidebarOpen, setSidebarOpen }: DashboardSkeletonProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Sidebar */}
      <SideBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Header skeleton */}
        <HeaderSkeleton />

        {/* Main content area */}
        <main className="px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section skeleton */}
          <WelcomeSkeleton />

          {/* Stats Cards skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <StatsCardSkeleton key={i} />
            ))}
          </div>

          {/* CTA Section skeleton */}
          <CTASkeleton />

          {/* Dashboard Grid skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Quotes skeleton */}
            <DashboardItemSkeleton />

            {/* Active Policies skeleton */}
            <DashboardItemSkeleton />

            {/* Recent Claims skeleton - spans 2 columns */}
            <div className="lg:col-span-2">
              <DashboardItemSkeleton />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
