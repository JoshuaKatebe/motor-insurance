'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminSidebar from '@/components/AdminSidebar';
import { AdminService, AdminDashboardData } from '@/lib/adminService';
import { 
  Users,
  Shield,
  FileText,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Activity,
  Server,
  Database,
  BarChart3,
  Menu,
  Bell,
  Search,
  Filter,
  Download,
  RefreshCw,
  MoreVertical,
  ChevronRight,
  UserPlus,
  Mail,
  Calendar,
  Eye,
  Edit,
  Trash2,
  UserCheck,
  Star
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Timestamp } from 'firebase/firestore';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTimeRange, setSelectedTimeRange] = useState('30days');

  useEffect(() => {
    // Check for admin authentication here
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      const data = await AdminService.getAdminDashboardData();
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to fetch admin dashboard data', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData();
  };

  const formatCurrency = (value: number) => `K${value.toLocaleString()}`;
  const formatPercentage = (value: number) => `${value}%`;
  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp.seconds * 1000).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'active': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'pending': 'bg-amber-100 text-amber-700 border-amber-200',
      'expired': 'bg-red-100 text-red-700 border-red-200',
      'approved': 'bg-green-100 text-green-700 border-green-200',
      'rejected': 'bg-red-100 text-red-700 border-red-200',
      'under-review': 'bg-blue-100 text-blue-700 border-blue-200',
      'submitted': 'bg-indigo-100 text-indigo-700 border-indigo-200',
      'settled': 'bg-teal-100 text-teal-700 border-teal-200'
    };
    return colors[status] || 'bg-slate-100 text-slate-700 border-slate-200';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50">
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="lg:pl-64">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden"
                >
                  <Menu className="h-6 w-6" />
                </button>
                <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
                <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                  ADMIN ACCESS
                </span>
              </div>
              
              <div className="flex items-center space-x-4">
                {/* Search */}
                <div className="hidden md:flex items-center bg-slate-100 rounded-lg px-3 py-2">
                  <Search className="h-5 w-5 text-slate-400 mr-2" />
                  <input
                    type="text"
                    placeholder="Search users, policies..."
                    className="bg-transparent outline-none text-sm w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Actions */}
                <button
                  onClick={handleRefresh}
                  className={`p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 ${refreshing ? 'animate-spin' : ''}`}
                  disabled={refreshing}
                >
                  <RefreshCw className="h-5 w-5" />
                </button>
                <button className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100">
                  <Download className="h-5 w-5" />
                </button>
                <div className="relative">
                  <Bell className="h-6 w-6 text-slate-600 cursor-pointer" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                </div>
                <div className="text-sm text-slate-600 hidden lg:block">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 sm:px-6 lg:px-8 py-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6 mb-8">
            {/* Total Users */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <span className="text-xs text-slate-500">+12.5%</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{dashboardData?.stats.totalUsers.toLocaleString()}</p>
              <p className="text-sm text-slate-600 mt-1">Total Users</p>
              <div className="mt-2 flex items-center text-xs">
                <span className="text-emerald-600">{dashboardData?.stats.activeUsers} active</span>
                <span className="mx-2 text-slate-300">•</span>
                <span className="text-slate-500">{((dashboardData?.stats.activeUsers! / dashboardData?.stats.totalUsers!) * 100).toFixed(0)}% rate</span>
              </div>
            </div>

            {/* Total Revenue */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                </div>
                <span className="text-xs text-emerald-600">+23.1%</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{formatCurrency(dashboardData?.stats.totalRevenue || 0)}</p>
              <p className="text-sm text-slate-600 mt-1">Total Revenue</p>
              <div className="mt-2 flex items-center text-xs">
                <span className="text-slate-600">{formatCurrency(dashboardData?.stats.monthlyRevenue || 0)}</span>
                <span className="mx-2 text-slate-300">•</span>
                <span className="text-slate-500">this month</span>
              </div>
            </div>

            {/* Active Policies */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Shield className="h-5 w-5 text-indigo-600" />
                </div>
                <span className="text-xs text-indigo-600">+8.7%</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{dashboardData?.stats.activePolicies}</p>
              <p className="text-sm text-slate-600 mt-1">Active Policies</p>
              <div className="mt-2 flex items-center text-xs">
                <span className="text-slate-600">{dashboardData?.stats.totalPolicies} total</span>
                <span className="mx-2 text-slate-300">•</span>
                <span className="text-slate-500">{formatCurrency(dashboardData?.stats.averagePremium || 0)} avg</span>
              </div>
            </div>

            {/* Pending Claims */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <FileText className="h-5 w-5 text-amber-600" />
                </div>
                <span className="text-xs text-red-600">+5 new</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{dashboardData?.stats.pendingClaims}</p>
              <p className="text-sm text-slate-600 mt-1">Pending Claims</p>
              <div className="mt-2 flex items-center text-xs">
                <span className="text-emerald-600">{dashboardData?.stats.approvedClaims} approved</span>
                <span className="mx-2 text-slate-300">•</span>
                <span className="text-red-600">{dashboardData?.stats.rejectedClaims} rejected</span>
              </div>
            </div>

            {/* Conversion Rate */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
                <span className="text-xs text-emerald-600">+2.3%</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{dashboardData?.stats.conversionRate}%</p>
              <p className="text-sm text-slate-600 mt-1">Conversion Rate</p>
              <div className="mt-2 flex items-center text-xs">
                <span className="text-slate-600">{dashboardData?.stats.totalQuotes} quotes</span>
                <span className="mx-2 text-slate-300">•</span>
                <span className="text-slate-500">total</span>
              </div>
            </div>

            {/* System Health */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-teal-100 rounded-lg">
                  <Activity className="h-5 w-5 text-teal-600" />
                </div>
                <span className="text-xs text-emerald-600">Healthy</span>
              </div>
              <p className="text-2xl font-bold text-slate-900">{dashboardData?.systemHealth.uptime}%</p>
              <p className="text-sm text-slate-600 mt-1">System Uptime</p>
              <div className="mt-2 flex items-center text-xs">
                <span className="text-slate-600">{dashboardData?.systemHealth.responseTime}ms</span>
                <span className="mx-2 text-slate-300">•</span>
                <span className="text-slate-500">response</span>
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* User Growth Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900">User & Policy Growth</h3>
                <select className="text-sm border border-slate-300 rounded-lg px-3 py-1">
                  <option>Last 6 months</option>
                  <option>Last year</option>
                </select>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={dashboardData?.userGrowth}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPolicies" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip />
                  <Area type="monotone" dataKey="users" stroke="#3b82f6" fillOpacity={1} fill="url(#colorUsers)" />
                  <Area type="monotone" dataKey="policies" stroke="#10b981" fillOpacity={1} fill="url(#colorPolicies)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Revenue Breakdown */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900">Revenue by Coverage Type</h3>
                <button className="text-slate-400 hover:text-slate-600">
                  <MoreVertical className="h-5 w-5" />
                </button>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={dashboardData?.revenueBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ source, percentage }) => `${source}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {dashboardData?.revenueBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Data Tables */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
            {/* Recent Users */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">Recent Users</h3>
                  <Link href="/admin/users" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View all →
                  </Link>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Joined</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Policies</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Spent</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {dashboardData?.recentUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center">
                              <span className="text-white font-semibold">
                                {user.displayName?.charAt(0) || user.email.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-slate-900">{user.displayName || 'N/A'}</p>
                              <p className="text-xs text-slate-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {formatDate(user.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {user.totalPolicies}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                          {formatCurrency(user.totalSpent)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                          <div className="flex items-center justify-end space-x-2">
                            <button className="text-slate-400 hover:text-slate-600">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="text-slate-400 hover:text-blue-600">
                              <Mail className="h-4 w-4" />
                            </button>
                            <button className="text-slate-400 hover:text-red-600">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Policies */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">Recent Policies</h3>
                  <Link href="/admin/policies" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View all →
                  </Link>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Policy</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Vehicle</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Premium</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {dashboardData?.recentPolicies.slice(0, 5).map((policy) => (
                      <tr key={policy.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-sm font-medium text-slate-900">{policy.policyNumber}</p>
                            <p className="text-xs text-slate-500">{policy.userName}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {policy.vehicleInfo}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                          {formatCurrency(policy.premium)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(policy.status)}`}>
                            {policy.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Bottom Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Claims */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">Recent Claims</h3>
                  <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                    {dashboardData?.stats.pendingClaims} pending
                  </span>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {dashboardData?.recentClaims.slice(0, 3).map((claim) => (
                  <div key={claim.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-amber-100 rounded-lg">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{claim.claimNumber}</p>
                        <p className="text-xs text-slate-500">{claim.userName}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900">{formatCurrency(claim.estimatedAmount)}</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(claim.status)}`}>
                        {claim.status}
                      </span>
                    </div>
                  </div>
                ))}
                <Link 
                  href="/admin/claims"
                  className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium pt-2"
                >
                  View all claims →
                </Link>
              </div>
            </div>

            {/* Top Performing Agents */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">Top Performing Agents</h3>
              </div>
              <div className="p-6 space-y-4">
                {dashboardData?.topPerformingAgents.slice(0, 5).map((agent, index) => (
                  <div key={agent.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm
                        ${index === 0 ? 'bg-gradient-to-r from-yellow-400 to-amber-500' : 
                          index === 1 ? 'bg-gradient-to-r from-slate-400 to-slate-500' :
                          index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-500' :
                          'bg-gradient-to-r from-slate-300 to-slate-400'}`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">{agent.name}</p>
                        <p className="text-xs text-slate-500">{agent.sales} sales</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-slate-900">{formatCurrency(agent.revenue)}</p>
                      <div className="flex items-center text-xs text-amber-600">
                        <Star className="h-3 w-3 mr-1 fill-amber-600" />
                        <span>Top {index + 1}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* System Status */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-semibold text-slate-900">System Status</h3>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                      <Server className="h-4 w-4 text-emerald-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-900">Server Status</span>
                  </div>
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full">
                    Online
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Database className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-900">Database</span>
                  </div>
                  <span className="text-sm text-slate-600">{dashboardData?.systemHealth.storageUsed}% used</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Activity className="h-4 w-4 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-900">Response Time</span>
                  </div>
                  <span className="text-sm text-slate-600">{dashboardData?.systemHealth.responseTime}ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                    </div>
                    <span className="text-sm font-medium text-slate-900">Error Rate</span>
                  </div>
                  <span className="text-sm text-slate-600">{dashboardData?.systemHealth.errorRate}%</span>
                </div>
                <div className="pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-600">System Uptime</span>
                    <span className="text-xs font-semibold text-slate-900">{dashboardData?.systemHealth.uptime}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full"
                      style={{ width: `${dashboardData?.systemHealth.uptime}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
