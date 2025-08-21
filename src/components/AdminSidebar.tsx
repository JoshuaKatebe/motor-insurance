'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard,
  Users,
  Shield,
  FileText,
  TrendingUp,
  Settings,
  Bell,
  DollarSign,
  UserCheck,
  AlertTriangle,
  BarChart3,
  Database,
  LogOut,
  X,
  ChevronDown,
  ChevronRight,
  Building,
  Mail,
  Key,
  Activity
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface AdminSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function AdminSidebar({ sidebarOpen, setSidebarOpen }: AdminSidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const router = useRouter();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const toggleExpanded = (item: string) => {
    setExpandedItems(prev => 
      prev.includes(item) 
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const menuItems = [
    { 
      icon: LayoutDashboard, 
      label: 'Dashboard', 
      href: '/admin',
      badge: null 
    },
    { 
      icon: BarChart3, 
      label: 'Analytics', 
      href: '/admin/analytics',
      badge: 'NEW' 
    },
    { 
      icon: Users, 
      label: 'Users', 
      href: '/admin/users',
      badge: '1,245',
      subItems: [
        { label: 'All Users', href: '/admin/users' },
        { label: 'Active Users', href: '/admin/users/active' },
        { label: 'Pending Verification', href: '/admin/users/pending' },
        { label: 'Blocked Users', href: '/admin/users/blocked' }
      ]
    },
    { 
      icon: Shield, 
      label: 'Policies', 
      href: '/admin/policies',
      badge: '342',
      subItems: [
        { label: 'All Policies', href: '/admin/policies' },
        { label: 'Active Policies', href: '/admin/policies/active' },
        { label: 'Expired Policies', href: '/admin/policies/expired' },
        { label: 'Cancelled Policies', href: '/admin/policies/cancelled' }
      ]
    },
    { 
      icon: FileText, 
      label: 'Claims', 
      href: '/admin/claims',
      badge: '12',
      badgeColor: 'amber',
      subItems: [
        { label: 'All Claims', href: '/admin/claims' },
        { label: 'Pending Review', href: '/admin/claims/pending' },
        { label: 'Approved Claims', href: '/admin/claims/approved' },
        { label: 'Rejected Claims', href: '/admin/claims/rejected' }
      ]
    },
    { 
      icon: DollarSign, 
      label: 'Revenue', 
      href: '/admin/revenue',
      badge: null 
    },
    { 
      icon: UserCheck, 
      label: 'Agents', 
      href: '/admin/agents',
      badge: '28' 
    },
    { 
      icon: Activity, 
      label: 'System Health', 
      href: '/admin/system',
      badge: null 
    },
    { 
      icon: Mail, 
      label: 'Communications', 
      href: '/admin/communications',
      badge: '5',
      badgeColor: 'blue' 
    },
    { 
      icon: Database, 
      label: 'Database', 
      href: '/admin/database',
      badge: null 
    },
    { 
      icon: Settings, 
      label: 'Settings', 
      href: '/admin/settings',
      badge: null 
    }
  ];

  const getBadgeColor = (color?: string) => {
    switch(color) {
      case 'amber':
        return 'bg-amber-100 text-amber-700';
      case 'blue':
        return 'bg-blue-100 text-blue-700';
      case 'red':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 bottom-0 w-64 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 
        transform transition-transform duration-300 ease-in-out z-50
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="p-6 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Building className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Admin Panel</h2>
                <p className="text-xs text-slate-400">SecureMotor Insurance</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Admin Info */}
        <div className="px-6 py-4 border-b border-slate-700/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">A</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-white">Admin User</p>
              <p className="text-xs text-slate-400">Super Administrator</p>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-240px)]">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const isExpanded = expandedItems.includes(item.label);
            const hasSubItems = item.subItems && item.subItems.length > 0;
            
            return (
              <div key={item.label}>
                <div
                  className={`
                    flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer
                    ${isActive 
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                    }
                  `}
                  onClick={() => {
                    if (hasSubItems) {
                      toggleExpanded(item.label);
                    } else {
                      router.push(item.href);
                      setSidebarOpen(false);
                    }
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <item.icon className="h-5 w-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {item.badge && (
                      <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                        item.badge === 'NEW' 
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                          : getBadgeColor(item.badgeColor)
                      }`}>
                        {item.badge}
                      </span>
                    )}
                    {hasSubItems && (
                      <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                    )}
                  </div>
                </div>
                
                {/* Sub-items */}
                {hasSubItems && isExpanded && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.subItems?.map((subItem) => {
                      const isSubActive = pathname === subItem.href;
                      return (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          onClick={() => setSidebarOpen(false)}
                          className={`
                            block px-4 py-2 rounded-lg text-sm transition-all duration-200
                            ${isSubActive 
                              ? 'bg-slate-700/50 text-white' 
                              : 'text-slate-400 hover:bg-slate-700/30 hover:text-white'
                            }
                          `}
                        >
                          {subItem.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-red-600/10 text-red-400 rounded-xl hover:bg-red-600/20 transition-all duration-200"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}
