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
  ShieldCheck,
  Link2,
  Crown,
  Shield,
  Bell,
  WifiOff,
  Archive
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

  const inAppNotifications = useStore(state => state.inAppNotifications);
  const fetchInAppNotifications = useStore(state => state.fetchInAppNotifications);
  const markNotificationRead = useStore(state => state.markNotificationRead);
  const markAllNotificationsRead = useStore(state => state.markAllNotificationsRead);

  const [isOnline, setIsOnline] = useState(true);
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      // Register SW
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js').catch(err => {
          console.warn('Service worker registration failed:', err);
        });
      }

      const params = new URLSearchParams(window.location.search);
      if (params.get('confetti') === 'true') {
        setShowConfetti(true);
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, '', cleanUrl);
      }

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
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

  useEffect(() => {
    if (collections.length > 0 && user) {
      fetchInAppNotifications(collections[0].id);
    }
  }, [collections, user]);

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
    { name: 'Integrations', path: '/dashboard/settings/integrations', icon: <Link2 className="w-4 h-4 text-indigo-400" /> },
    { name: 'White-Label', path: '/dashboard/settings/white-label', icon: <Crown className="w-4 h-4 text-[#F59E0B]" /> },
    { name: 'Enterprise', path: '/dashboard/settings/enterprise', icon: <Shield className="w-4 h-4 text-brand-emerald" /> },
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
            onClick={() => setShowNotifDrawer(true)}
            className="w-full flex items-center justify-center space-x-2 text-muted-foreground hover:text-brand-emerald hover:bg-brand-emerald/10 py-2 rounded-lg text-xs font-bold transition cursor-pointer relative"
          >
            <Bell className="w-4 h-4 text-brand-emerald" />
            {!isCollapsed && <span>Alert Center</span>}
            {inAppNotifications.filter(n => n.status === 'UNREAD').length > 0 && (
              <span className="absolute right-3 top-2 bg-red-500 text-white text-[8px] font-black rounded-full h-4.5 w-4.5 flex items-center justify-center">
                {inAppNotifications.filter(n => n.status === 'UNREAD').length}
              </span>
            )}
          </button>

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
      <div className="flex-1 bg-[#09090B] flex flex-col min-w-0 overflow-y-auto pb-16 md:pb-0">
        {!isOnline && (
          <div className="bg-amber-600 text-white font-bold text-xs px-4 py-2.5 flex items-center justify-center space-x-2 animate-pulse select-none z-50 shadow-md">
            <WifiOff className="w-4 h-4 shrink-0" />
            <span>Offline Mode Active. Operations will cache and sync automatically when network returns.</span>
          </div>
        )}
        {children}
      </div>

      {/* Bottom Mobile Navigation bar */}
      <div className="md:hidden border-t border-border-primary bg-[#09090B] px-4 py-3 fixed bottom-0 inset-x-0 z-40 flex items-center justify-around select-none">
        <Link href="/dashboard" className="flex flex-col items-center text-slate-400 hover:text-white transition">
          <LayoutGrid className="w-5 h-5" />
          <span className="text-[9px] mt-0.5">Home</span>
        </Link>
        <Link href="/dashboard/collections" className="flex flex-col items-center text-slate-400 hover:text-white transition">
          <FolderHeart className="w-5 h-5" />
          <span className="text-[9px] mt-0.5">Spaces</span>
        </Link>
        <button 
          onClick={() => setShowNotifDrawer(true)} 
          className="flex flex-col items-center text-slate-400 hover:text-white transition relative cursor-pointer"
        >
          <Bell className="w-5 h-5 text-brand-emerald" />
          {inAppNotifications.filter(n => n.status === 'UNREAD').length > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-black rounded-full h-4 w-4 flex items-center justify-center animate-bounce">
              {inAppNotifications.filter(n => n.status === 'UNREAD').length}
            </span>
          )}
          <span className="text-[9px] mt-0.5">Alerts</span>
        </button>
        <Link href="/dashboard/settings" className="flex flex-col items-center text-slate-400 hover:text-white transition">
          <Settings className="w-5 h-5" />
          <span className="text-[9px] mt-0.5">Settings</span>
        </Link>
      </div>

      {/* In-App Notifications Center Drawer Overlay */}
      {showNotifDrawer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-sm bg-[#09090B] border-l border-border-primary h-full shadow-2xl flex flex-col justify-between animate-slide-in">
            <div>
              <div className="px-6 py-5 border-b border-border-primary flex items-center justify-between">
                <span className="text-xs font-black uppercase text-white tracking-wider">Alert notification center</span>
                <button 
                  onClick={() => setShowNotifDrawer(false)}
                  className="text-slate-450 hover:text-white text-xs font-bold px-2 py-1 bg-zinc-900 border border-zinc-800 rounded transition cursor-pointer"
                >
                  Close
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {inAppNotifications.length === 0 ? (
                  <div className="py-16 text-center text-slate-500 text-xs font-bold border border-dashed border-border-primary rounded-xl">
                    No active notifications.
                  </div>
                ) : (
                  inAppNotifications.map(notif => (
                    <div 
                      key={notif.id} 
                      onClick={() => markNotificationRead(notif.id)}
                      className={`border border-border-primary rounded-xl p-4 space-y-2 hover:border-zinc-800 transition cursor-pointer relative ${
                        notif.status === 'UNREAD' ? 'bg-brand-emerald/5 border-brand-emerald/20' : 'bg-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] bg-brand-emerald/10 text-brand-emerald px-2 py-0.5 rounded font-mono font-black">{notif.category}</span>
                        <span className="text-[8px] text-slate-450">{new Date(notif.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <span className="text-xs font-bold text-white block">{notif.title}</span>
                      <p className="text-[10px] text-slate-400 leading-relaxed">{notif.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="p-6 border-t border-border-primary bg-[#18181B]/40">
              <button
                onClick={() => {
                  if (collections.length > 0) markAllNotificationsRead(collections[0].id);
                }}
                className="w-full bg-brand-emerald hover:opacity-95 text-white font-black text-xs py-3 rounded-lg flex items-center justify-center space-x-1.5 cursor-pointer transition"
              >
                <Archive className="w-4 h-4" />
                <span>Mark all as read</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfetti && <ConfettiRibbons />}
    </div>
  );
}
