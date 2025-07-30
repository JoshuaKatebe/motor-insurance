'use client';

import SideBar from '@/components/SideBar';
import { HeaderSkeleton, WelcomeSkeleton, TableSkeleton } from './index';

interface QuotesSkeletonProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function QuotesSkeleton({ sidebarOpen, setSidebarOpen }: QuotesSkeletonProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <SideBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="lg:pl-64">
        <HeaderSkeleton />
        <main className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            <WelcomeSkeleton />
            <div className="mt-8">
              <TableSkeleton rows={5} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
