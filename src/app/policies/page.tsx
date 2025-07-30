'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import SideBar from '@/components/SideBar';
import { PoliciesService, Policy } from '@/lib/policiesService';
import { Timestamp } from 'firebase/firestore';
import { Shield, Plus, FileText, Car, Menu, Home, Settings, HelpCircle, BarChart3, Eye, Download } from 'lucide-react';
import PoliciesSkeleton from '@/components/skeletons/PoliciesSkeleton';

export default function PoliciesPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [policies, setPolicies] = useState<Policy[]>([]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchPolicies = async () => {
      try {
        const userPolicies = await PoliciesService.getUserPolicies(user.uid);
        setPolicies(userPolicies);
      } catch (error) {
        console.error('Error fetching policies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPolicies();
  }, [user, router]);

  if (loading) {
    return <PoliciesSkeleton sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-emerald-700 bg-emerald-100 border-emerald-200';
      case 'expired':
        return 'text-red-700 bg-red-100 border-red-200';
      case 'cancelled':
        return 'text-slate-700 bg-slate-100 border-slate-200';
      default:
        return 'text-slate-700 bg-slate-100 border-slate-200';
    }
  };
  
  const formatDate = (timestamp: Timestamp) => {
    return new Date(timestamp.seconds * 1000).toLocaleDateString();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <SideBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex flex-1 flex-col lg:pl-64">
        <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm sticky top-0 z-30">
           <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-slate-500 hover:text-slate-700"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="flex-1 min-w-0">
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Your Policies</h1>
                <p className="text-slate-600 mt-1">View and manage your active and past policies.</p>
              </div>
               <Link href="/quotes">
                <button className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                  <Plus className="h-5 w-5 mr-2" />
                  New Policy from Quote
                </button>
              </Link>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
              <div className="p-6">
                {policies.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-200/60">
                          <th className="p-4 text-sm font-semibold text-slate-600">Policy Number</th>
                          <th className="p-4 text-sm font-semibold text-slate-600">Vehicle</th>
                          <th className="p-4 text-sm font-semibold text-slate-600">Coverage</th>
                          <th className="p-4 text-sm font-semibold text-slate-600">Period</th>
                          <th className="p-4 text-sm font-semibold text-slate-600">Status</th>
                          <th className="p-4 text-sm font-semibold text-slate-600 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {policies.map((policy) => (
                          <tr key={policy.id} className="border-b border-slate-200/60 hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 font-medium text-slate-800">{policy.policyNumber}</td>
                            <td className="p-4">
                              <div className="font-medium text-slate-900">{policy.vehicleInfo}</div>
                            </td>
                            <td className="p-4 text-sm text-slate-600">{policy.coverageType}</td>
                            <td className="p-4 text-sm text-slate-600">
                              {formatDate(policy.startDate)} - {formatDate(policy.endDate)}
                            </td>
                            <td className="p-4">
                              <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(policy.status)}`}>
                                {policy.status}
                              </span>
                            </td>
                            <td className="p-4 text-right space-x-2">
                              <button className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded-md transition-colors">
                                <Eye className="h-4 w-4" />
                              </button>
                              <button className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-100 rounded-md transition-colors">
                                <Download className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <Shield className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-slate-700">No policies found</h2>
                    <p className="text-slate-500 mt-2 mb-6">Convert a quote to a policy to get started.</p>
                    <Link href="/quotes">
                      <button className="flex items-center mx-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg">
                        <Plus className="h-5 w-5 mr-2" />
                        View Quotes
                      </button>
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

