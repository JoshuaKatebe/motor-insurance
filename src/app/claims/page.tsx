'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import SideBar from '@/components/SideBar';
import { ClaimsService, Claim } from '@/lib/claimsService';
import { Timestamp } from 'firebase/firestore';
import { FileText, Plus, Menu, Eye, Download, AlertTriangle, Bell } from 'lucide-react';
import ClaimsSkeleton from '@/components/skeletons/ClaimsSkeleton';

export default function ClaimsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [claims, setClaims] = useState<Claim[]>([]);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchClaims = async () => {
      try {
        const userClaims = await ClaimsService.getUserClaims(user.uid);
        setClaims(userClaims);
      } catch (error) {
        console.error('Error fetching claims:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchClaims();
  }, [user, router]);

  if (loading) {
    return <ClaimsSkeleton sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
      case 'settled':
        return 'text-emerald-700 bg-emerald-100 border-emerald-200';
      case 'rejected':
        return 'text-red-700 bg-red-100 border-red-200';
      case 'under-review':
      case 'submitted':
        return 'text-amber-700 bg-amber-100 border-amber-200';
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
         <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
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
                  Claims
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

        <main className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Your Claims</h1>
                <p className="text-slate-600 mt-1">Track the status of all your claims.</p>
              </div>
              <Link href="/new-claim">
                <button className="flex items-center px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                  <Plus className="h-5 w-5 mr-2" />
                  File a New Claim
                </button>
              </Link>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
              <div className="p-6">
                {claims.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-200/60">
                          <th className="p-4 text-sm font-semibold text-slate-600">Claim Number</th>
                          <th className="p-4 text-sm font-semibold text-slate-600">Incident</th>
                          <th className="p-4 text-sm font-semibold text-slate-600">Submitted</th>
                           <th className="p-4 text-sm font-semibold text-slate-600">Amount</th>
                          <th className="p-4 text-sm font-semibold text-slate-600">Status</th>
                          <th className="p-4 text-sm font-semibold text-slate-600 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {claims.map((claim) => (
                          <tr key={claim.id} className="border-b border-slate-200/60 hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 font-medium text-slate-800">{claim.claimNumber}</td>
                            <td className="p-4">
                              <div className="font-medium text-slate-900 capitalize">{claim.incidentType}</div>
                               <div className="text-sm text-slate-500">on {formatDate(claim.incidentDate)}</div>
                            </td>
                            <td className="p-4 text-sm text-slate-600">{formatDate(claim.submittedAt)}</td>
                            <td className="p-4 text-sm text-slate-600">K{claim.estimatedAmount.toLocaleString()}</td>
                            <td className="p-4">
                              <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(claim.status)}`}>
                                {claim.status}
                              </span>
                            </td>
                            <td className="p-4 text-right space-x-2">
                              <button className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded-md transition-colors">
                                <Eye className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <AlertTriangle className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-slate-700">No claims found</h2>
                    <p className="text-slate-500 mt-2 mb-6">File a claim to get started.</p>
                    <Link href="/new-claim">
                      <button className="flex items-center mx-auto px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium shadow-lg">
                        <Plus className="h-5 w-5 mr-2" />
                        File a Claim
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

