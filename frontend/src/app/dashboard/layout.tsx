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
import { ProoflyLogo } from '@/components/ProoflyLogo';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useStore(state => state.user);
  const collections = useStore(state => state.collections);
  const testimonials = useStore(state => state.testimonials);
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
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    setMounted(true);
    
    const checkAuth = async () => {
      try {
        await fetchUser();
      } catch (err) {
        console.error('Failed to fetch user in layout:', err);
      } finally {
        setIsChecking(false);
      }
    };

    if (!user) {
      checkAuth();
    } else {
      setIsChecking(false);
    }
  }, [user, fetchUser]);

  useEffect(() => {
    if (mounted && !isChecking && !user) {
      router.push('/login');
    }
  }, [user, isChecking, mounted, router]);

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutGrid className="w-4 h-4" /> },
    { name: 'Inbox', path: '/dashboard/inbox', icon: <Inbox className="w-4 h-4" /> },
    { name: 'Collections', path: '/dashboard/collections', icon: <FolderHeart className="w-4 h-4" /> },
    { name: 'Wall of Love', path: '/dashboard/wall-of-love', icon: <Heart className="w-4 h-4" /> },
    { name: 'Showcase', path: '/dashboard/showcase', icon: <Heart className="w-4 h-4 text-[#8B5CF6]" /> },
    { name: 'Widgets', path: '/dashboard/widgets', icon: <Code className="w-4 h-4" /> },
    { name: 'Analytics', path: '/dashboard/analytics', icon: <BarChart3 className="w-4 h-4" /> },
    { name: 'AI Insights', path: '/dashboard/insights', icon: <Cpu className="w-4 h-4" /> },
    { name: 'AI Studio', path: '/dashboard/ai-studio', icon: <Sparkles className="w-4 h-4 text-brand-teal" /> },
    { name: 'Imports', path: '/dashboard/imports', icon: <DownloadCloud className="w-4 h-4" /> },
    { name: 'Settings', path: '/dashboard/settings', icon: <Settings className="w-4 h-4" /> },
  ];

  const handleLogout = () => {
    logout();
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (!mounted || isChecking) {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center font-sans">
        <div className="w-8 h-8 border-2 border-brand-emerald border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
          <Link href="/" className="flex items-center space-x-2.5 px-4 py-5 border-b border-border-primary overflow-hidden hover:opacity-90 transition cursor-pointer">
            <ProoflyLogo iconSize={28} showText={!isCollapsed} />
          </Link>

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
          
          {/* Sidebar Usage Card for Free Users */}
          {!isCollapsed && user && user.tier === 'FREE' && (
            <div className="mx-3 my-4 p-4 rounded-xl bg-slate-900/60 border border-white/[0.06] backdrop-blur space-y-3 text-left">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-wider text-slate-400">Usage Limits</span>
                <span className="text-[8px] font-bold text-brand-emerald bg-brand-emerald/10 px-2 py-0.5 rounded-full uppercase">Free Plan</span>
              </div>
              
              <div className="space-y-2">
                {/* Meter 1: Spaces */}
                <div className="space-y-0.5">
                  <div className="flex items-center justify-between text-[9px] font-medium text-slate-300">
                    <span>Spaces</span>
                    <span className="font-bold">{collections.length} / 1</span>
                  </div>
                  <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="bg-brand-emerald h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((collections.length / 1) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Meter 2: Testimonials */}
                <div className="space-y-0.5">
                  <div className="flex items-center justify-between text-[9px] font-medium text-slate-300">
                    <span>Testimonials</span>
                    <span className="font-bold">{testimonials.length} / 25</span>
                  </div>
                  <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="bg-brand-teal h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((testimonials.length / 25) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Meter 3: Videos */}
                <div className="space-y-0.5">
                  <div className="flex items-center justify-between text-[9px] font-medium text-slate-300">
                    <span>Videos</span>
                    <span className="font-bold">{testimonials.filter(t => t.video_url).length} / 5</span>
                  </div>
                  <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#8B5CF6] h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((testimonials.filter(t => t.video_url).length / 5) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Meter 4: AI Credits */}
                <div className="space-y-0.5">
                  <div className="flex items-center justify-between text-[9px] font-medium text-slate-300">
                    <span>AI Credits</span>
                    <span className="font-bold">{user.aiCreditsUsed} / 10</span>
                  </div>
                  <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="bg-[#EC4899] h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((user.aiCreditsUsed / 10) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              <Link href="/dashboard/settings" className="block pt-1">
                <button className="w-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white hover:opacity-95 text-[9px] font-bold py-1.5 rounded-lg flex items-center justify-center space-x-1 shadow-lg shadow-[#6366F1]/20 transition cursor-pointer">
                  <Sparkles className="w-2.5 h-2.5 text-yellow-300 animate-pulse" />
                  <span>⭐⭐ Upgrade to Pro</span>
                </button>
              </Link>
            </div>
          )}
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
