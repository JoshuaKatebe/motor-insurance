'use client';

import { useState, useEffect } from 'react';
import { Car, Shield, Clock, Star, ChevronRight, CheckCircle, Users, Award, Zap, Phone, Mail, MapPin } from 'lucide-react';
import Link from 'next/link';

// Mock auth context for demo
const useAuth = () => ({ user: null });

export default function Home() {
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [currentStat, setCurrentStat] = useState(0);

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentStat(prev => (prev + 1) % 4);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { number: "50K+", label: "Happy Customers", icon: Users },
    { number: "99.8%", label: "Claim Success Rate", icon: Award },
    { number: "24/7", label: "Customer Support", icon: Phone },
    { number: "5min", label: "Average Quote Time", icon: Zap }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000"></div>
      </div>

      {/* Navigation */}
      <nav className="relative z-50 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center group">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl group-hover:scale-110 transition-transform duration-300">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <span className="ml-3 text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">SecureMotor</span>
            </div>
            <div className="flex items-center space-x-6">
              {user ? (
                <>
                  <a href="/dashboard" className="text-white/80 hover:text-white transition-colors duration-300 font-medium">Dashboard</a>
                  <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-full hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 font-semibold">
                    Get Quote
                  </button>
                </>
              ) : (
                <>
                  <a href="/login" className="text-white/80 hover:text-white transition-colors duration-300 font-medium">Login</a>
                  <Link href="/signup">
                    <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-full hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 font-semibold">
                      Sign Up
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="mb-8">
              <span className="inline-block bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-semibold mb-6 animate-bounce">
                Made by Joshua Katebe for Hobbiton Developer Challenge
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
              <span className="bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
                Motor Insurance
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Reimagined
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-4xl mx-auto leading-relaxed">
              Experience the future of motor insurance with instant quotes, seamless claims, 
              and comprehensive coverage starting from <span className="text-blue-400 font-bold">K1500</span>.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6 mb-16">
              <button className="group bg-gradient-to-r from-blue-500 to-purple-600 text-white px-10 py-5 rounded-2xl text-lg font-bold hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 transform hover:scale-105">
                Get Instant Quote
                <ChevronRight className="inline ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="group border-2 border-white/30 text-white px-10 py-5 rounded-2xl text-lg font-bold hover:bg-white/10 hover:border-white/50 transition-all duration-300 backdrop-blur-sm">
                View Coverage Options
                <Shield className="inline ml-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
              </button>
            </div>

            {/* Animated stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div 
                    key={index}
                    className={`text-center p-6 rounded-2xl backdrop-blur-sm border border-white/20 transition-all duration-500 ${
                      currentStat === index ? 'bg-white/20 scale-105 shadow-lg' : 'bg-white/10'
                    }`}
                  >
                    <Icon className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                    <div className="text-3xl font-bold text-white mb-1">{stat.number}</div>
                    <div className="text-white/70 text-sm">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-32 bg-white">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-blue-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">SecureMotor</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We have revolutionized motor insurance with cutting-edge technology and customer-first approach
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                icon: Clock,
                title: "Lightning Fast Quotes",
                desc: "AI-powered quote generation in under 60 seconds with real-time pricing.",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: Shield,
                title: "Comprehensive Protection",
                desc: "Advanced coverage options with 24/7 roadside assistance and rental car coverage.",
                color: "from-purple-500 to-pink-500"
              },
              {
                icon: Star,
                title: "Seamless Claims",
                desc: "Photo-based claims processing with instant approvals and direct bank transfers.",
                color: "from-green-500 to-emerald-500"
              }
            ].map((feature, index) => (
              <div key={index} className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-3xl blur-xl from-blue-500 to-purple-500"></div>
                <div className="relative bg-white p-10 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 group-hover:border-blue-200 transform group-hover:scale-105">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform duration-300`}>
                    <feature.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coverage Plans */}
      <section className="relative py-32 bg-gradient-to-br from-slate-900 to-blue-900">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.3),transparent_70%)]"></div>
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Choose Your <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Protection</span>
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Flexible coverage options designed to fit your needs and budget. Prices start from
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Third Party",
                price: "K1,500",
                popular: false,
                features: ["Legal requirement coverage", "Third party liability", "Property damage", "Emergency support"],
                gradient: "from-gray-600 to-gray-700"
              },
              {
                name: "Fire & Theft",
                price: "K2,500",
                popular: true,
                features: ["All Third Party benefits", "Fire damage coverage", "Theft protection", "24/7 helpline", "Towing service"],
                gradient: "from-blue-500 to-purple-600"
              },
              {
                name: "Comprehensive",
                price: "K3,500",
                popular: false,
                features: ["All Fire & Theft benefits", "Accident damage", "Windscreen coverage", "Rental car provision", "Personal effects"],
                gradient: "from-purple-600 to-pink-600"
              }
            ].map((plan, index) => (
              <div key={index} className={`relative group ${plan.popular ? 'scale-105' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold z-10">
                    Most Popular
                  </div>
                )}
                <div className={`h-full bg-white/10 backdrop-blur-sm p-8 rounded-3xl border transition-all duration-300 ${
                  plan.popular 
                    ? 'border-blue-400 shadow-2xl shadow-blue-500/20' 
                    : 'border-white/20 hover:border-white/40 group-hover:bg-white/15'
                }`}>
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-white/60 text-lg">From </span>
                    <span className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                      {plan.price}
                    </span>
                    <span className="text-white/60 text-lg">/year</span>
                  </div>
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-center text-white/80">
                        <CheckCircle className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button className={`w-full py-4 rounded-2xl font-bold transition-all duration-300 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:shadow-lg hover:shadow-blue-500/30 transform hover:scale-105'
                      : 'bg-white/10 text-white hover:bg-white/20 border border-white/30'
                  }`}>
                    Get This Plan
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-5 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center mb-6">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <span className="ml-3 text-xl font-bold">SecureMotor</span>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Revolutionizing motor insurance with technology, transparency, and exceptional customer service. 
                Your trusted partner on every journey.
              </p>
              <div className="flex space-x-4">
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                  <Phone className="h-5 w-5" />
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                  <Mail className="h-5 w-5" />
                </div>
                <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer">
                  <MapPin className="h-5 w-5" />
                </div>
              </div>
            </div>
            {[
              {
                title: "Products",
                links: ["Get Quote", "Manage Policy", "File Claim", "Roadside Assistance"]
              },
              {
                title: "Support",
                links: ["Help Center", "Contact Us", "Claims Support", "Emergency Line"]
              },
              {
                title: "Company",
                links: ["About Us", "Careers", "Press", "Partners"]
              }
            ].map((section, index) => (
              <div key={index}>
                <h4 className="font-bold mb-6 text-lg">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400">
              &copy; 2025 This is a demo made by Joshua Katebe  | For the Hobbiton Developer challenge
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}