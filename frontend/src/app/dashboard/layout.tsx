'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Sparkles,
  LayoutGrid, 
  Inbox, 
  FolderHeart, 
  Heart, 
  Code, 
  BarChart3, 
  Cpu, 
  DownloadCloud, 
  Settings, 
  LogOut, 
  ChevronLeft, 
  ChevronRight,
  User,
  ShieldCheck
} from 'lucide-react';

import { useStore } from '@/store/useStore';
import { ConfettiRibbons } from '@/components/ConfettiRibbons';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useStore(state => state.user);
  const logout = useStore(state => state.logout);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('confetti') === 'true') {
        setShowConfetti(true);
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, '', cleanUrl);
      }
    }
  }, []);

  const fetchUser = useStore(state => state.fetchUser);

  useEffect(() => {
    setMounted(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token && !user) {
      fetchUser();
    } else if (!user && !token) {
      router.push('/login');
    }
  }, [user, router, fetchUser]);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutGrid className="w-4 h-4" /> },
    { name: 'Inbox', path: '/dashboard/inbox', icon: <Inbox className="w-4 h-4" /> },
    { name: 'Collections', path: '/dashboard/collections', icon: <FolderHeart className="w-4 h-4" /> },
    { name: 'Wall of Love', path: '/dashboard/wall-of-love', icon: <Heart className="w-4 h-4" /> },
    { name: 'Widgets', path: '/dashboard/widgets', icon: <Code className="w-4 h-4" /> },
    { name: 'Analytics', path: '/dashboard/analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { name: 'AI Insights', path: '/dashboard/insights', icon: <Cpu className="w-4 h-4" /> },
    { name: 'Imports', path: '/dashboard/imports', icon: <DownloadCloud className="w-4 h-4" /> },
    { name: 'Settings', path: '/dashboard/settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const handleLogout = () => {
    logout();
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#09090B] text-slate-100 flex flex-row relative selection:bg-brand-emerald selection:text-white font-sans">
      {/* Sidebar Navigation */}
      <aside 
        className={`bg-[#09090B] border-r border-border-primary transition-all duration-300 flex flex-col justify-between shrink-0 select-none ${
          isCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div>
          {/* Brand Logo Header */}
          <div className="flex items-center space-x-2.5 px-4 py-5 border-b border-border-primary">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-emerald to-brand-teal flex items-center justify-center shadow-md shrink-0">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            {!isCollapsed && (
              <span className="font-extrabold text-sm text-white tracking-tight">
                Power<span className="text-brand-emerald">Testimonials</span>
              </span>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {menuItems.map(item => {
              const isActive = pathname === item.path;
              return (
                <Link key={item.name} href={item.path}>
                  <div 
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
                      isActive 
                        ? 'bg-brand-emerald/10 text-brand-emerald border-l-2 border-brand-emerald' 
                        : 'text-muted-foreground hover:text-white hover:bg-[#18181B]'
                    }`}
                  >
                    <div className={isActive ? 'text-brand-emerald' : 'text-slate-400'}>
                      {item.icon}
                    </div>
                    {!isCollapsed && <span>{item.name}</span>}
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Account Info Bottom */}
        <div className="p-3 border-t border-border-primary space-y-2">
          {!isCollapsed && user ? (
            <div className="p-2 rounded-lg bg-[#18181B] border border-border-primary space-y-2 text-left">
              <div className="flex items-center space-x-2 truncate">
                <img
                  src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}`}
                  alt="avatar"
                  className="w-8 h-8 rounded-full border border-border-primary shrink-0"
                />
                <div className="truncate">
                  <span className="text-xs font-bold text-white block truncate">{user.name}</span>
                  <span className="text-[9px] text-muted-foreground block truncate">{user.email}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-1 border-t border-border-primary/50 text-[9px]">
                <span className="text-muted-foreground">Tier:</span>
                <span className="text-brand-emerald font-black flex items-center space-x-0.5 uppercase">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{user.tier}</span>
                </span>
              </div>
            </div>
          ) : (
            user && (
              <div className="flex justify-center py-2">
                <img
                  src={user.avatar}
                  alt="avatar"
                  className="w-8 h-8 rounded-full border border-border-primary"
                />
              </div>
            )
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 text-muted-foreground hover:text-red-400 hover:bg-red-950/15 py-2 rounded-lg text-xs font-bold transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            {!isCollapsed && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Collapse vertical border line trigger button */}
      <div className="relative">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute top-1/2 -translate-y-1/2 -left-3.5 z-40 bg-[#09090B] border border-border-primary text-slate-400 hover:text-white p-1 rounded-full shadow-md cursor-pointer transition-colors"
        >
          {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-[#09090B] flex flex-col min-w-0 overflow-y-auto">
        {children}
      </div>
      {showConfetti && <ConfettiRibbons />}
    </div>
  );
}
