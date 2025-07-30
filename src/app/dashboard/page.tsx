'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Shield, 
  Plus, 
  FileText, 
  Car, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  LogOut,
  User,
  Bell,
  Menu,
  X,
  Home,
  CreditCard,
  Settings,
  HelpCircle,
  BarChart3,
  TrendingUp,
  Calendar,
  DollarSign
} from 'lucide-react';
import SideBar from '@/components/SideBar';
import DashboardSkeleton from '@/components/skeletons/DashboardSkeleton';
import { DashboardService, DashboardData } from '@/lib/dashboardService';
import { Timestamp } from 'firebase/firestore';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const data = await DashboardService.getDashboardData(user.uid);
        setDashboardData(data);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  if (loading) {
    return <DashboardSkeleton sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />;
  }

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active':
      case 'approved':
      case 'settled':
        return 'text-emerald-700 bg-emerald-100 border-emerald-200';
      case 'expired':
      case 'rejected':
        return 'text-red-700 bg-red-100 border-red-200';
      case 'under-review':
      case 'submitted':
        return 'text-amber-700 bg-amber-100 border-amber-200';
      case 'draft':
      case 'cancelled':
        return 'text-slate-700 bg-slate-100 border-slate-200';
      default:
        return 'text-slate-700 bg-slate-100 border-slate-200';
    }
  };

  // Format timestamp to a readable date
  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp.seconds * 1000).toLocaleDateString();
  };

  const sidebarItems = [
    { icon: Home, label: 'Dashboard', active: true },
    { icon: Car, label: 'Quotes' },
    { icon: Shield, label: 'Policies' },
    { icon: FileText, label: 'Claims' },
    { icon: BarChart3, label: 'Analytics' },
    { icon: Settings, label: 'Settings' },
    { icon: HelpCircle, label: 'Support' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Sidebar */}
      <SideBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden"
                >
                  <Menu className="h-6 w-6" />
                </button>
                <h1 className="ml-2 text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent lg:ml-0">
                  Dashboard
                </h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Bell className="h-6 w-6 text-slate-400 hover:text-slate-600 cursor-pointer transition-colors" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                </div>
                <div className="text-sm text-slate-600 hidden sm:block">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">
              Welcome back, {user?.displayName?.split(' ')[0] || 'User'}! 👋
            </h2>
            <p className="text-slate-600 text-lg">
              Here's an overview of your motor insurance portfolio
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Total Coverage</p>
                  <p className="text-3xl font-bold text-slate-900">K{dashboardData?.stats.totalCoverage.toLocaleString() || '0'}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-emerald-500 mr-1" />
                    <span className="text-emerald-600 text-sm font-medium">+12%</span>
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Active Policies</p>
                  <p className="text-3xl font-bold text-slate-900">{dashboardData?.stats.activePolicies || 0}</p>
                  <p className="text-slate-500 text-sm mt-2">All up to date</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl">
                  <Shield className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Pending Claims</p>
                  <p className="text-3xl font-bold text-slate-900">{dashboardData?.stats.pendingClaims || 0}</p>
                  <p className="text-amber-600 text-sm mt-2">Under review</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl">
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-600 text-sm font-medium">Total Quotes</p>
                  <p className="text-3xl font-bold text-slate-900">{dashboardData?.stats.totalQuotes || 0}</p>
                  <p className="text-slate-500 text-sm mt-2">This month</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between">
                <div className="text-center lg:text-left mb-6 lg:mb-0">
                  <h3 className="text-3xl font-bold text-white mb-2">Need New Coverage?</h3>
                  <p className="text-blue-100 text-lg max-w-md">Get instant quotes and compare coverage options tailored to your needs</p>
                </div>
                <Link href="/new-quote">
                  <button className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2">
                    <Plus className="h-6 w-6" />
                    <span>Get Quote Now</span>
                  </button>
                </Link>
              </div>
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"></div>
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full"></div>
            </div>
          </div>

          {/* Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Quotes */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
              <div className="p-6 border-b border-slate-200/60">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">Recent Quotes</h3>
                  <Link href="/quotes" className="text-blue-600 hover:text-blue-700 font-medium text-sm">View all →</Link>
                </div>
              </div>
              <div className="p-6">
                {dashboardData?.recentQuotes && dashboardData.recentQuotes.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.recentQuotes.map((quote) => (
                      <div key={quote.id} className="flex items-center justify-between p-4 bg-slate-50/80 rounded-xl border border-slate-200/40 hover:shadow-md transition-all duration-200">
                        <div className="flex items-center">
                          <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                            <Car className="h-5 w-5 text-white" />
                          </div>
                          <div className="ml-4">
                            <h4 className="font-semibold text-slate-900">{quote.year} {quote.make} {quote.model}</h4>
                            <p className="text-sm text-slate-600">
                              {quote.coverageType} • K{quote.premium.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(quote.status)}`}>
                            {quote.status}
                          </span>
                          <p className="text-xs text-slate-500 mt-1">
                            Expires {formatDate(quote.expiresAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Car className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600 text-lg font-medium">No quotes yet</p>
                    <p className="text-slate-500 mb-4">Get started with your first quote</p>
                    <button className="text-blue-600 hover:text-blue-700 font-medium">Get your first quote →</button>
                  </div>
                )}
              </div>
            </div>

            {/* Active Policies */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
              <div className="p-6 border-b border-slate-200/60">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">Active Policies</h3>
                  <a href="/" className="text-blue-600 hover:text-blue-700 font-medium text-sm">View all →</a>
                </div>
              </div>
              <div className="p-6">
                {dashboardData?.recentPolicies && dashboardData.recentPolicies.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.recentPolicies.map((policy) => (
                      <div key={policy.id} className="flex items-center justify-between p-4 bg-slate-50/80 rounded-xl border border-slate-200/40 hover:shadow-md transition-all duration-200">
                        <div className="flex items-center">
                          <div className="p-2 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg">
                            <Shield className="h-5 w-5 text-white" />
                          </div>
                          <div className="ml-4">
                            <h4 className="font-semibold text-slate-900">{policy.vehicleInfo}</h4>
                            <p className="text-sm text-slate-600">Policy: {policy.policyNumber}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(policy.status)}`}>
                            {policy.status}
                          </span>
                          <p className="text-xs text-slate-500 mt-1">
                            Until {formatDate(policy.endDate)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Shield className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600 text-lg font-medium">No active policies</p>
                    <p className="text-slate-500 mb-4">Protect your vehicle today</p>
                    <button className="text-blue-600 hover:text-blue-700 font-medium">Get coverage now →</button>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Claims */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 lg:col-span-2">
              <div className="p-6 border-b border-slate-200/60">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-slate-900">Recent Claims</h3>
                  <a href="/" className="text-blue-600 hover:text-blue-700 font-medium text-sm">View all →</a>
                </div>
              </div>
              <div className="p-6">
                {dashboardData?.recentClaims && dashboardData.recentClaims.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.recentClaims.map((claim) => (
                      <div key={claim.id} className="flex items-center justify-between p-4 bg-slate-50/80 rounded-xl border border-slate-200/40 hover:shadow-md transition-all duration-200">
                        <div className="flex items-center">
                          <div className="p-2 bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg">
                            <AlertTriangle className="h-5 w-5 text-white" />
                          </div>
                          <div className="ml-4">
                            <h4 className="font-semibold text-slate-900">Claim {claim.claimNumber}</h4>
                            <p className="text-sm text-slate-600">
                              {claim.incidentType} • K{claim.estimatedAmount.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(claim.status)}`}>
                            {claim.status}
                          </span>
                          <p className="text-xs text-slate-500 mt-1">
                            {formatDate(claim.submittedAt)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-600 text-lg font-medium">No claims filed</p>
                    <p className="text-slate-500 mb-4">Need to report an incident?</p>
                    <Link href="/new-claim">
                      <button className="text-blue-600 hover:text-blue-700 font-medium">File a claim →</button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
