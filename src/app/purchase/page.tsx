'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import SideBar from '@/components/SideBar';
import { QuotesService, Quote } from '@/lib/quotesService';
import { PoliciesService } from '@/lib/policiesService';
import { Timestamp } from 'firebase/firestore';
import { Shield, CreditCard, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';

function PurchasePageContents() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const quoteId = searchParams.get('quoteId');

  const [loading, setLoading] = useState(true);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (!quoteId) {
      alert('No quote selected.');
      router.push('/quotes');
      return;
    }

    const fetchQuote = async () => {
      try {
        const fetchedQuote = await QuotesService.getQuote(quoteId);
        if (!fetchedQuote || fetchedQuote.userId !== user.uid) {
          alert('Quote not found or access denied.');
          router.push('/quotes');
          return;
        }
        setQuote(fetchedQuote);
      } catch (error) {
        console.error('Error fetching quote:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, [user, router, quoteId]);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quote) return;

    setIsProcessing(true);
    try {
      // This is a dummy payment process
      await new Promise(resolve => setTimeout(resolve, 2000));

      await PoliciesService.convertQuoteToPolicy(quote);
      await QuotesService.updateQuote(quote.id!, { status: 'converted' });

      alert('Payment successful! Your policy has been created.');
      router.push('/policies');

    } catch (error) {
      console.error('Payment or policy creation failed:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>; // Replace with a proper skeleton loader
  }

  if (!quote) {
    return <div>Quote not found.</div>;
  }
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  }

  return (
    <main className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/quotes" className="text-slate-600 hover:text-slate-900 flex items-center mb-4">
          <ArrowLeft className="h-4 w-4 mr-2"/> Back to Quotes
        </Link>
        
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Purchase Insurance Policy</h1>
        <p className="text-slate-600 mb-8">You are purchasing a policy based on the details from your quote.</p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quote Summary */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
              <Shield className="h-6 w-6 mr-3 text-blue-600"/> Quote Summary
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-slate-600">Vehicle:</span>
                <span className="font-medium text-slate-900">{quote.year} {quote.make} {quote.model}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Coverage:</span>
                <span className="font-medium text-slate-900 capitalize">{quote.coverageType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Start Date:</span>
                <span className="font-medium text-slate-900">{formatDate(quote.startDate)}</span>
              </div>
              <div className="border-t border-slate-200 my-4"></div>
              <div className="flex justify-between text-2xl font-bold">
                <span className="text-slate-900">Total Premium:</span>
                <span className="text-blue-600">K{quote.premium.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Dummy Payment Form */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
             <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
              <CreditCard className="h-6 w-6 mr-3 text-blue-600"/> Payment Details
            </h2>
            <form onSubmit={handlePayment} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Card Number</label>
                <input type="text" placeholder="**** **** **** ****" className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white/50"/>
              </div>
              <div className="grid grid-cols-2 gap-6">
                 <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Expiry Date</label>
                  <input type="text" placeholder="MM/YY" className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white/50"/>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">CVC</label>
                  <input type="text" placeholder="***" className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white/50"/>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Cardholder Name</label>
                <input type="text" placeholder="John Doe" className="w-full px-4 py-3 border border-slate-300 rounded-xl bg-white/50"/>
              </div>
              <button 
                type="submit"
                disabled={isProcessing}
                className="w-full flex items-center justify-center px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold shadow-lg disabled:opacity-50"
              >
                {isProcessing ? 
                  <><Loader2 className="h-5 w-5 animate-spin mr-2"/> Processing...</> : 
                  <><CheckCircle className="h-5 w-5 mr-2"/> Pay & Activate Policy</>
                }
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}


export default function PurchasePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <SideBar />
        <div className="flex flex-1 flex-col lg:pl-64">
          <PurchasePageContents />
        </div>
      </div>
    </Suspense>
  )
}

