'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Shield,
  FileText,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Calendar,
  Menu,
  Bell,
  Download,
  Filter,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  Car,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import AdminSidebar from '@/components/AdminSidebar';
import { AnalyticsService, AnalyticsData } from '@/lib/analyticsService';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AnalyticsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [timeRange, setTimeRange] = useState('6months');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    fetchAnalyticsData();
  }, [user, router]);

  const fetchAnalyticsData = async () => {
    try {
      setRefreshing(true);
      const data = await AnalyticsService.getAnalyticsData(user!.uid);
      setAnalyticsData(data);
    } catch (error) {
      console.error('Failed to fetch analytics data', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchAnalyticsData();
  };

  const formatCurrency = (value: number) => `K${value.toLocaleString()}`;
  const formatPercentage = (value: number) => `${value}%`;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
          <p className="text-sm font-semibold text-slate-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.name.includes('K') || entry.dataKey.includes('revenue') || entry.dataKey.includes('amount') || entry.dataKey.includes('premium') || entry.dataKey.includes('value')
                ? formatCurrency(entry.value)
                : entry.value
              }
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="lg:pl-64">
        {/* Header */}
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
                  Analytics Dashboard
                </h1>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleRefresh}
                  className={`p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all ${refreshing ? 'animate-spin' : ''}`}
                  disabled={refreshing}
                >
                  <RefreshCw className="h-5 w-5" />
                </button>
                <button className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100">
                  <Download className="h-5 w-5" />
                </button>
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

        <main className="px-4 sm:px-6 lg:px-8 py-8">
          {/* Overview Cards */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Performance Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              {/* Total Revenue */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-slate-600 text-sm font-medium">Total Revenue</p>
                  <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg">
                    <DollarSign className="h-4 w-4 text-white" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  {formatCurrency(analyticsData?.overview.totalRevenue || 0)}
                </p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-emerald-500 mr-1" />
                  <span className="text-emerald-600 text-sm font-medium">+15.2%</span>
                </div>
              </div>

              {/* Active Policies */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-slate-600 text-sm font-medium">Active Policies</p>
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
                    <Shield className="h-4 w-4 text-white" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  {analyticsData?.overview.totalPolicies || 0}
                </p>
                <p className="text-slate-500 text-sm mt-2">All active</p>
              </div>

              {/* Total Claims */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-slate-600 text-sm font-medium">Total Claims</p>
                  <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  {analyticsData?.overview.totalClaims || 0}
                </p>
                <div className="flex items-center mt-2">
                  <TrendingDown className="h-4 w-4 text-amber-500 mr-1" />
                  <span className="text-amber-600 text-sm font-medium">-8.1%</span>
                </div>
              </div>

              {/* Average Premium */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-slate-600 text-sm font-medium">Avg Premium</p>
                  <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                    <Activity className="h-4 w-4 text-white" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  {formatCurrency(analyticsData?.overview.averagePremium || 0)}
                </p>
                <p className="text-slate-500 text-sm mt-2">Per policy</p>
              </div>

              {/* Claim Ratio */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-slate-600 text-sm font-medium">Claim Ratio</p>
                  <div className="p-2 bg-gradient-to-r from-red-500 to-rose-500 rounded-lg">
                    <BarChart3 className="h-4 w-4 text-white" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  {formatPercentage(analyticsData?.overview.claimRatio || 0)}
                </p>
                <p className="text-slate-500 text-sm mt-2">Of revenue</p>
              </div>

              {/* Renewal Rate */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-slate-600 text-sm font-medium">Renewal Rate</p>
                  <div className="p-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-slate-900">
                  {formatPercentage(analyticsData?.overview.renewalRate || 0)}
                </p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-emerald-500 mr-1" />
                  <span className="text-emerald-600 text-sm font-medium">+3.5%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Revenue Trend */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900">Revenue Trend</h3>
                <select className="text-sm border border-slate-300 rounded-lg px-3 py-1 bg-white/50">
                  <option>Last 6 months</option>
                  <option>Last year</option>
                  <option>All time</option>
                </select>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analyticsData?.revenueByMonth}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis stroke="#64748b" tickFormatter={formatCurrency} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#3b82f6" 
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Policies by Type */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Policies by Coverage Type</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analyticsData?.policiesByType}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ type, count }) => `${type}: ${count}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {analyticsData?.policiesByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {analyticsData?.policiesByType.map((item, index) => (
                  <div key={item.type} className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-xs text-slate-600">{item.type}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Monthly Growth */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Monthly Growth Metrics</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analyticsData?.monthlyGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="quotes" 
                    stroke="#8b5cf6" 
                    strokeWidth={2}
                    dot={{ fill: '#8b5cf6', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="policies" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ fill: '#10b981', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="claims" 
                    stroke="#f59e0b" 
                    strokeWidth={2}
                    dot={{ fill: '#f59e0b', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Claims by Status */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Claims Analysis</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analyticsData?.claimsByStatus}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="status" stroke="#64748b" />
                  <YAxis stroke="#64748b" tickFormatter={formatCurrency} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="amount" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                    {analyticsData?.claimsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Additional Insights */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Top Vehicles */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Top Insured Vehicles</h3>
              <div className="space-y-4">
                {analyticsData?.topVehicles.map((vehicle, index) => (
                  <div key={vehicle.vehicle} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="ml-3">
                        <p className="font-semibold text-slate-900">{vehicle.vehicle}</p>
                        <p className="text-sm text-slate-600">{vehicle.policies} policies</p>
                      </div>
                    </div>
                    <p className="font-semibold text-slate-900">{formatCurrency(vehicle.premium)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Premium Distribution */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Premium Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={analyticsData?.premiumDistribution} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" stroke="#64748b" />
                  <YAxis type="category" dataKey="range" stroke="#64748b" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" fill="#10b981" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Claim Types */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-6">Claim Frequency by Type</h3>
              <div className="space-y-3">
                {analyticsData?.claimFrequency.map((item, index) => (
                  <div key={item.type}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-slate-700">{item.type}</span>
                      <span className="text-sm font-bold text-slate-900">{item.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full transition-all duration-500"
                        style={{ 
                          width: `${item.percentage}%`,
                          backgroundColor: COLORS[index % COLORS.length]
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-white mb-4">Generate Detailed Report</h3>
              <p className="text-blue-100 mb-6 max-w-2xl">
                Export comprehensive analytics data including all metrics, charts, and insights for the selected period.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="bg-white text-slate-900 px-6 py-3 rounded-xl font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2">
                  <Download className="h-5 w-5" />
                  <span>Export PDF Report</span>
                </button>
                <button className="bg-white/20 backdrop-blur-sm text-white border border-white/30 px-6 py-3 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 flex items-center space-x-2">
                  <Calendar className="h-5 w-5" />
                  <span>Schedule Reports</span>
                </button>
              </div>
            </div>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full"></div>
          </div>
        </main>
      </div>
    </div>
  );
}
