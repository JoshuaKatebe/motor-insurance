'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import SideBar from '@/components/SideBar';
import QuotesSkeleton from '@/components/skeletons/QuotesSkeleton';
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
  DollarSign,
  Trash2,
  Edit,
  ShoppingCart
} from 'lucide-react';
import { QuotesService, Quote } from '@/lib/quotesService';
import { Timestamp } from 'firebase/firestore';

export default function QuotesPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quotes, setQuotes] = useState<Quote[]>([]);

  useEffect(() => {
    if (!user) {
      console.log("Not user");
      return;
    }

    const fetchQuotes = async () => {
      try {
        const userQuotes = await QuotesService.getUserQuotes(user.uid);
        setQuotes(userQuotes);
      } catch (error) {
        console.error('Error fetching quotes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuotes();
  }, [user, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  
  const handleDelete = async (quoteId: string) => {
    if(confirm('Are you sure you want to delete this quote?')) {
      try {
        await QuotesService.deleteQuote(quoteId);
        setQuotes(quotes.filter(q => q.id !== quoteId));
      } catch (error) {
        console.error('Failed to delete quote:', error);
        alert('Could not delete quote.');
      }
    }
  };

  if (loading) {
    return <QuotesSkeleton sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />;
  }
  
  const getStatusInfo = (status: string, expiresAt: Timestamp) => {
    const now = Timestamp.now();
    if (status === 'converted') {
      return { text: 'Converted', color: 'text-purple-700 bg-purple-100 border-purple-200' };
    } else if (expiresAt.seconds < now.seconds) {
      return { text: 'Expired', color: 'text-red-700 bg-red-100 border-red-200' };
    }
    return { text: 'Active', color: 'text-emerald-700 bg-emerald-100 border-emerald-200' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Sidebar - assuming similar sidebar structure */}
      <SideBar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main content */}
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
                  Quotes
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
                <h1 className="text-3xl font-bold text-slate-900">Your Quotes</h1>
                <p className="text-slate-600 mt-1">Manage and review all your insurance quotes</p>
              </div>
              <Link href="/new-quote">
                <button className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                  <Plus className="h-5 w-5 mr-2" />
                  New Quote
                </button>
              </Link>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20">
              <div className="p-6">
                {quotes.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-200/60">
                          <th className="p-4 text-sm font-semibold text-slate-600">Vehicle</th>
                          <th className="p-4 text-sm font-semibold text-slate-600">Coverage</th>
                          <th className="p-4 text-sm font-semibold text-slate-600">Premium</th>
                          <th className="p-4 text-sm font-semibold text-slate-600">Status</th>
                          <th className="p-4 text-sm font-semibold text-slate-600">Expires</th>
                          <th className="p-4 text-sm font-semibold text-slate-600 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {quotes.map((quote) => {
                          const statusInfo = getStatusInfo(quote.status, quote.expiresAt);
                          return (
                            <tr key={quote.id} className="border-b border-slate-200/60 hover:bg-slate-50/50 transition-colors">
                              <td className="p-4">
                                <div className="font-medium text-slate-900">{quote.make} {quote.model}</div>
                                <div className="text-sm text-slate-500">{quote.year}</div>
                              </td>
                              <td className="p-4 text-sm text-slate-600">{quote.coverageType}</td>
                              <td className="p-4 font-medium text-slate-800">K{quote.premium.toLocaleString()}</td>
                              <td className="p-4">
                                <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${statusInfo.color}`}>
                                  {statusInfo.text}
                                </span>
                              </td>
                              <td className="p-4 text-sm text-slate-600">
                                {new Date(quote.expiresAt.seconds * 1000).toLocaleDateString()}
                              </td>
                              <td className="p-4 text-right space-x-2">
                                {statusInfo.text === 'Active' && (
                                  <Link href={`/purchase?quoteId=${quote.id}`}>
                                    <button className="p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-100 rounded-md transition-colors" title="Purchase Policy">
                                      <ShoppingCart className="h-4 w-4" />
                                    </button>
                                  </Link>
                                )}
                                <button className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-100 rounded-md transition-colors">
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button 
                                  onClick={() => handleDelete(quote.id!)}
                                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-100 rounded-md transition-colors">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-20">
                    <Car className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-slate-700">No quotes found</h2>
                    <p className="text-slate-500 mt-2 mb-6">It looks like you haven&apos;t created any quotes yet.</p>
                    <Link href="/new-quote">
                      <button className="flex items-center mx-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                        <Plus className="h-5 w-5 mr-2" />
                        Create your first quote
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
