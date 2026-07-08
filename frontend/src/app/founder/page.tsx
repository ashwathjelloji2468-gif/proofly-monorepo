'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import {
  Users,
  Layers,
  Activity,
  FileText,
  Sliders,
  ShieldAlert,
  DollarSign,
  Search,
  Lock,
  RefreshCw,
  AlertCircle,
  Trash2,
  UserCheck,
  Power,
  Terminal,
  Loader,
  Server,
  Shield,
  LogOut,
  Send,
  Eye,
  CheckCircle,
  ArrowRight,
  Download,
  AlertTriangle
} from 'lucide-react';
import { ProoflyLogo } from '@/components/ProoflyLogo';

export default function FounderPortal() {
  const router = useRouter();
  const user = useStore(state => state.user);

  // Founder actions
  const getFounderOverview = useStore(state => state.getFounderOverview);
  const getFounderMetrics = useStore(state => state.getFounderMetrics);
  const getFounderUsers = useStore(state => state.getFounderUsers);
  const suspendUser = useStore(state => state.suspendUser);
  const resetUserOTP = useStore(state => state.resetUserOTP);
  const forceUserLogout = useStore(state => state.forceUserLogout);
  const deleteUser = useStore(state => state.deleteUser);
  const getFounderWorkspaces = useStore(state => state.getFounderWorkspaces);
  const disableWorkspace = useStore(state => state.disableWorkspace);
  const transferWorkspaceOwnership = useStore(state => state.transferWorkspaceOwnership);
  const impersonateWorkspaceOwner = useStore(state => state.impersonateWorkspaceOwner);
  const getFounderFeatureFlags = useStore(state => state.getFounderFeatureFlags);
  const toggleFeatureFlag = useStore(state => state.toggleFeatureFlag);
  const toggleMaintenanceMode = useStore(state => state.toggleMaintenanceMode);
  const getFounderAuditLogs = useStore(state => state.getFounderAuditLogs);
  const getFounderSecurity = useStore(state => state.getFounderSecurity);

  // Core Portal States
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'workspaces' | 'flags' | 'monitoring' | 'audit' | 'security'>('overview');
  const [loading, setLoading] = useState(true);

  // Tab Details States
  const [overviewData, setOverviewData] = useState<any>(null);
  const [metricsData, setMetricsData] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [workspacesList, setWorkspacesList] = useState<any[]>([]);
  const [workspacesTotal, setWorkspacesTotal] = useState(0);
  const [flagsData, setFlagsData] = useState<any>(null);
  const [auditLogsList, setAuditLogsList] = useState<any[]>([]);
  const [securityData, setSecurityData] = useState<any>(null);

  // Filter & Control States
  const [userSearch, setUserSearch] = useState('');
  const [userPage, setUserPage] = useState(0);
  const [workspaceSearch, setWorkspaceSearch] = useState('');
  const [workspacePage, setWorkspacePage] = useState(0);
  const [transferTargetEmail, setTransferTargetEmail] = useState<{ [spaceId: string]: string }>({});
  
  // Feature flag form
  const [newFlagKey, setNewFlagKey] = useState('');
  const [newFlagDesc, setNewFlagDesc] = useState('');
  const [newFlagRollout, setNewFlagRollout] = useState(100);

  // Feedback banners
  const [successBanner, setSuccessBanner] = useState('');
  const [errorBanner, setErrorBanner] = useState('');

  // Enforce access control check on client mount
  useEffect(() => {
    if (!user || user.role !== 'FOUNDER') {
      setLoading(false);
      return;
    }
    loadData();
  }, [user, activeTab, userPage, workspacePage]);

  // General data load router based on tab selection
  const loadData = async () => {
    setLoading(true);
    setErrorBanner('');
    try {
      if (activeTab === 'overview') {
        const data = await getFounderOverview();
        setOverviewData(data);
      } else if (activeTab === 'monitoring') {
        const data = await getFounderMetrics();
        setMetricsData(data);
      } else if (activeTab === 'users') {
        const data = await getFounderUsers(userSearch, undefined, undefined, 10, userPage * 10);
        setUsersList(data.users);
        setUsersTotal(data.total);
      } else if (activeTab === 'workspaces') {
        const data = await getFounderWorkspaces(workspaceSearch, undefined, 10, workspacePage * 10);
        setWorkspacesList(data.spaces);
        setWorkspacesTotal(data.total);
      } else if (activeTab === 'flags') {
        const data = await getFounderFeatureFlags();
        setFlagsData(data);
      } else if (activeTab === 'audit') {
        const data = await getFounderAuditLogs({ limit: 30 });
        setAuditLogsList(data.logs);
      } else if (activeTab === 'security') {
        const data = await getFounderSecurity();
        setSecurityData(data);
      }
    } catch (err: any) {
      setErrorBanner(err.message || 'Failed to fetch portal resources.');
    } finally {
      setLoading(false);
    }
  };

  // Impersonate Owner Handler
  const handleImpersonate = async (spaceId: string) => {
    setErrorBanner('');
    setSuccessBanner('');
    try {
      const res = await impersonateWorkspaceOwner(spaceId);
      if (res.success) {
        setSuccessBanner(`Impersonating workspace owner ${res.user.email}. Redirecting...`);
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      }
    } catch (err: any) {
      setErrorBanner(err.message || 'Impersonation failed.');
    }
  };

  // Toggle user suspension
  const handleToggleSuspend = async (userId: string, currentStatus: string) => {
    try {
      const suspend = currentStatus === 'ACTIVE';
      await suspendUser(userId, suspend);
      setSuccessBanner(`User status successfully updated to ${suspend ? 'Suspended' : 'Active'}.`);
      loadData();
      setTimeout(() => setSuccessBanner(''), 3000);
    } catch (err: any) {
      setErrorBanner(err.message || 'Failed to update user status.');
    }
  };

  // Force session logout
  const handleForceLogout = async (userId: string) => {
    try {
      await forceUserLogout(userId);
      setSuccessBanner('Successfully invalidated all sessions for target user.');
      setTimeout(() => setSuccessBanner(''), 3000);
    } catch (err: any) {
      setErrorBanner(err.message || 'Failed to terminate user sessions.');
    }
  };

  // Reset failed login counts / OTP lockout
  const handleResetOTP = async (userId: string) => {
    try {
      await resetUserOTP(userId);
      setSuccessBanner('OTP lockout failures reset successfully.');
      setTimeout(() => setSuccessBanner(''), 3000);
    } catch (err: any) {
      setErrorBanner(err.message || 'Failed to reset lockout.');
    }
  };

  // Delete user account
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you absolutely sure you want to permanently delete this user account? This action is irreversible.')) return;
    try {
      await deleteUser(userId);
      setSuccessBanner('User account permanently deleted.');
      loadData();
      setTimeout(() => setSuccessBanner(''), 3000);
    } catch (err: any) {
      setErrorBanner(err.message || 'Failed to delete user.');
    }
  };

  // Toggle space disabled state
  const handleToggleSpaceDisable = async (spaceId: string, currentDisabled: boolean) => {
    try {
      await disableWorkspace(spaceId, !currentDisabled);
      setSuccessBanner(`Workspace collections successfully ${!currentDisabled ? 'Disabled' : 'Enabled'}.`);
      loadData();
      setTimeout(() => setSuccessBanner(''), 3000);
    } catch (err: any) {
      setErrorBanner(err.message || 'Failed to toggle workspace collections.');
    }
  };

  // Transfer space ownership
  const handleTransferOwnership = async (spaceId: string) => {
    const targetEmail = transferTargetEmail[spaceId];
    if (!targetEmail || !targetEmail.trim()) return;
    try {
      await transferWorkspaceOwnership(spaceId, targetEmail);
      setSuccessBanner(`Ownership of workspace successfully transferred to ${targetEmail}.`);
      loadData();
      setTimeout(() => setSuccessBanner(''), 3000);
    } catch (err: any) {
      setErrorBanner(err.message || 'Failed to transfer ownership.');
    }
  };

  // Toggle Feature Flag
  const handleToggleFlag = async (key: string, currentEnabled: boolean) => {
    try {
      await toggleFeatureFlag(key, !currentEnabled);
      setSuccessBanner(`Feature flag "${key}" configured successfully.`);
      loadData();
      setTimeout(() => setSuccessBanner(''), 3000);
    } catch (err: any) {
      setErrorBanner(err.message || 'Failed to update feature flag.');
    }
  };

  // Add Feature Flag
  const handleCreateFlag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFlagKey.trim()) return;
    try {
      await toggleFeatureFlag(newFlagKey, false, newFlagRollout, [], [], false);
      setSuccessBanner(`Created new inactive feature flag "${newFlagKey}".`);
      setNewFlagKey('');
      setNewFlagDesc('');
      loadData();
      setTimeout(() => setSuccessBanner(''), 3000);
    } catch (err: any) {
      setErrorBanner(err.message || 'Failed to create feature flag.');
    }
  };

  // Toggle Emergency Maintenance Mode
  const handleToggleMaintenance = async (currentMode: boolean) => {
    try {
      await toggleMaintenanceMode(!currentMode);
      setSuccessBanner(`Emergency Maintenance Mode has been ${!currentMode ? 'ENABLED' : 'DISABLED'}.`);
      loadData();
      setTimeout(() => setSuccessBanner(''), 5000);
    } catch (err: any) {
      setErrorBanner(err.message || 'Failed to toggle maintenance mode.');
    }
  };

  // Export audit logs to CSV
  const handleExportCSV = () => {
    if (auditLogsList.length === 0) return;
    const headers = ['ID', 'User', 'Action', 'IP Address', 'Created At', 'Device'];
    const rows = auditLogsList.map(log => [
      log.id,
      log.userId || 'Anonymous',
      log.action,
      log.ipAddress || 'Unknown',
      log.createdAt,
      log.deviceInfo || 'Unknown'
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `platform-audit-log-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Render Access Denied Guard if not founder
  if (!user || user.role !== 'FOUNDER') {
    return (
      <div className="min-h-screen bg-[#09090B] flex items-center justify-center px-4 font-sans text-slate-100 relative overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-950/20 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-950/10 rounded-full blur-3xl -z-10" />

        <div className="max-w-md w-full text-center space-y-6 bg-[#121214] border border-red-900/30 rounded-2xl p-8 shadow-2xl">
          <div className="flex justify-center">
            <div className="p-4 bg-red-950/40 rounded-full text-red-500 border border-red-900/40 animate-pulse">
              <ShieldAlert className="w-12 h-12" />
            </div>
          </div>
          <h2 className="text-xl font-black tracking-tight text-white uppercase">403 Forbidden</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Access denied. You do not possess Founder-level authentication rights to view or alter the Proofly Platform Administration Portal. This incident has been logged.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-widest py-3 rounded-xl transition cursor-pointer"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090B] font-sans text-slate-100 flex flex-col md:flex-row relative overflow-hidden">
      
      {/* Background radial glares */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-950/20 rounded-full blur-3xl -z-10" />

      {/* Admin Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-[#121214] border-b md:border-b-0 md:border-r border-border-primary/80 flex flex-col justify-between shrink-0 p-5 space-y-8 z-10">
        <div className="space-y-6">
          <div className="flex items-center space-x-2.5">
            <ProoflyLogo className="w-6 h-6" />
            <div className="text-left">
              <span className="text-xs font-black tracking-widest text-white uppercase block">Proofly</span>
              <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest block">Founder Portal</span>
            </div>
          </div>

          <div className="border-t border-border-primary/50 pt-4 space-y-1">
            {[
              { id: 'overview', label: 'Platform Overview', icon: <DollarSign className="w-4 h-4" /> },
              { id: 'users', label: 'User Accounts', icon: <Users className="w-4 h-4" /> },
              { id: 'workspaces', label: 'Workspaces', icon: <Layers className="w-4 h-4" /> },
              { id: 'flags', label: 'Feature Flags', icon: <Sliders className="w-4 h-4" /> },
              { id: 'monitoring', label: 'System Metrics', icon: <Activity className="w-4 h-4" /> },
              { id: 'audit', label: 'Global Audit Logs', icon: <FileText className="w-4 h-4" /> },
              { id: 'security', label: 'Security Center', icon: <ShieldAlert className="w-4 h-4" /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id as any); setUserPage(0); setWorkspacePage(0); }}
                className={`w-full flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-bold transition cursor-pointer text-left ${
                  activeTab === tab.id
                    ? 'bg-purple-950/30 text-purple-400 border border-purple-900/30'
                    : 'text-slate-400 hover:bg-slate-800/30 hover:text-slate-200'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-3 bg-[#1A1A1E] border border-border-primary rounded-xl text-left">
            <div className="flex items-center space-x-2 text-[10px] text-slate-400">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-bold truncate">{user.email}</span>
            </div>
            <span className="text-[9px] font-extrabold uppercase bg-purple-950/40 text-purple-400 border border-purple-900/40 px-1.5 py-0.5 rounded mt-1.5 inline-block">
              Founder Mode
            </span>
          </div>

          <button
            onClick={() => router.push('/dashboard')}
            className="w-full flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white text-[10px] uppercase font-bold py-2.5 rounded-xl transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Customer Dashboard</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto max-w-7xl mx-auto w-full text-left">
        
        {/* Header feedback alerts */}
        {successBanner && (
          <div className="p-4 bg-emerald-950/40 border border-emerald-900/40 text-emerald-400 text-xs rounded-xl flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successBanner}</span>
          </div>
        )}

        {errorBanner && (
          <div className="p-4 bg-red-950/40 border border-red-900/40 text-red-400 text-xs rounded-xl flex items-center space-x-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorBanner}</span>
          </div>
        )}

        {/* Dynamic Canvas loader */}
        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader className="w-8 h-8 text-purple-500 animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* ─── TAB 1: Platform Overview ─── */}
            {activeTab === 'overview' && overviewData && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { title: 'Total Registered Users', val: overviewData.totalUsers, desc: 'All local & social accounts', icon: <Users className="w-4 h-4 text-purple-400" /> },
                    { title: 'New Users Today', val: overviewData.newUsersToday, desc: 'Signed up in past 24h', icon: <UserCheck className="w-4 h-4 text-emerald-400" /> },
                    { title: 'Total Active Spaces', val: overviewData.totalSpaces, desc: 'Testimonial workspaces', icon: <Layers className="w-4 h-4 text-purple-400" /> },
                    { title: 'Platform Total Revenue (MRR)', val: `$${overviewData.revenue.mrr}`, desc: 'Active user paid plans', icon: <DollarSign className="w-4 h-4 text-emerald-400" /> }
                  ].map((metric, idx) => (
                    <div key={idx} className="bg-[#121214] border border-border-primary/80 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">{metric.title}</span>
                        {metric.icon}
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-2xl font-black text-white">{metric.val}</h4>
                        <span className="text-[9px] text-slate-400">{metric.desc}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 bg-[#121214] border border-border-primary/80 rounded-2xl p-6 shadow-lg space-y-4">
                    <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-200">Revenue Breakdown</h4>
                    <div className="h-48 flex items-end justify-between pt-6 px-4 border-b border-border-primary/50 relative">
                      {/* Grid background */}
                      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-5">
                        <div className="border-t border-white w-full"></div>
                        <div className="border-t border-white w-full"></div>
                        <div className="border-t border-white w-full"></div>
                      </div>
                      {/* Bar graph projections */}
                      {[
                        { label: 'Q1 Projected MRR', height: 'h-24', val: `$${overviewData.revenue.mrr}` },
                        { label: 'ARR (Annualized)', height: 'h-36', val: `$${overviewData.revenue.arr}` },
                        { label: 'Conversion Rate', height: 'h-16', val: `${overviewData.revenue.conversionRate}%` },
                        { label: 'Monthly Churn', height: 'h-10', val: `${overviewData.revenue.churnRate}%` }
                      ].map((bar, idx) => (
                        <div key={idx} className="flex flex-col items-center space-y-2 z-10">
                          <span className="text-[9px] font-black text-emerald-400">{bar.val}</span>
                          <div className={`w-14 bg-gradient-to-t from-purple-900 to-purple-500 rounded-t-lg transition ${bar.height}`} />
                          <span className="text-[8px] uppercase tracking-wider text-slate-500 font-extrabold">{bar.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#121214] border border-border-primary/80 rounded-2xl p-6 shadow-lg space-y-4">
                    <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-200">Platform Performance</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3.5 bg-[#1A1A1E] rounded-xl">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-extrabold block">Total API Calls</span>
                          <span className="text-lg font-black text-white">{overviewData.apiCalls}</span>
                        </div>
                        <Terminal className="w-5 h-5 text-purple-400" />
                      </div>

                      <div className="flex items-center justify-between p-3.5 bg-[#1A1A1E] rounded-xl">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-extrabold block">Total Widgets</span>
                          <span className="text-lg font-black text-white">{overviewData.totalWidgets}</span>
                        </div>
                        <Sliders className="w-5 h-5 text-emerald-400" />
                      </div>

                      <div className="flex items-center justify-between p-3.5 bg-[#1A1A1E] rounded-xl">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-extrabold block">Testimonials Submitted</span>
                          <span className="text-lg font-black text-white">{overviewData.totalTestimonials}</span>
                        </div>
                        <FileText className="w-5 h-5 text-purple-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ─── TAB 2: User Accounts ─── */}
            {activeTab === 'users' && (
              <div className="bg-[#121214] border border-border-primary/80 rounded-2xl shadow-lg p-6 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-white">Registered Customer Accounts</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Suspend, delete, reset OTP, and inspect details for any customer account.</p>
                  </div>
                  <div className="relative w-full md:w-80">
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={userSearch}
                      onChange={(e) => { setUserSearch(e.target.value); setUserPage(0); }}
                      onKeyDown={(e) => e.key === 'Enter' && loadData()}
                      className="w-full bg-[#1A1A1E] border border-border-primary text-xs px-3.5 py-2.5 pl-10 rounded-xl focus:outline-none focus:border-purple-500 text-white"
                    />
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-border-primary/50 text-slate-400 uppercase tracking-widest text-[9px] font-extrabold">
                        <th className="py-3 px-4">Name</th>
                        <th className="py-3 px-4">Email</th>
                        <th className="py-3 px-4">Tier</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-primary/30">
                      {usersList.map((usr) => (
                        <tr key={usr.id} className="hover:bg-slate-800/10">
                          <td className="py-3.5 px-4 font-bold text-slate-200">{usr.name}</td>
                          <td className="py-3.5 px-4 text-slate-400">{usr.email}</td>
                          <td className="py-3.5 px-4">
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                              usr.tier === 'ENTERPRISE' ? 'bg-purple-950/30 text-purple-400 border-purple-900/30' :
                              usr.tier === 'BUSINESS' ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900/30' :
                              usr.tier === 'PRO' ? 'bg-indigo-950/30 text-indigo-400 border-indigo-900/30' :
                              'bg-slate-800/50 text-slate-400 border-slate-700/50'
                            }`}>
                              {usr.tier}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                              usr.status === 'ACTIVE' ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900/30' :
                              'bg-red-950/30 text-red-400 border-red-900/30'
                            }`}>
                              {usr.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 flex justify-end space-x-2">
                            <button
                              onClick={() => handleToggleSuspend(usr.id, usr.status)}
                              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-extrabold text-[10px] uppercase py-1.5 px-2.5 rounded-lg transition cursor-pointer"
                              title={usr.status === 'ACTIVE' ? 'Suspend User' : 'Activate User'}
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleForceLogout(usr.id)}
                              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-extrabold text-[10px] uppercase py-1.5 px-2.5 rounded-lg transition cursor-pointer"
                              title="Force Logout Sessions"
                            >
                              <LogOut className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleResetOTP(usr.id)}
                              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-extrabold text-[10px] uppercase py-1.5 px-2.5 rounded-lg transition cursor-pointer"
                              title="Reset Lockout & OTP Attempts"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(usr.id)}
                              className="bg-red-950/20 hover:bg-red-950/40 text-red-400 font-extrabold text-[10px] uppercase py-1.5 px-2.5 rounded-lg transition cursor-pointer"
                              title="Delete Account Permanently"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between border-t border-border-primary/30 pt-4">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Total Users: {usersTotal}</span>
                  <div className="flex space-x-2">
                    <button
                      disabled={userPage === 0}
                      onClick={() => setUserPage(p => p - 1)}
                      className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold uppercase rounded-lg disabled:opacity-50 transition cursor-pointer"
                    >
                      Prev
                    </button>
                    <button
                      disabled={(userPage + 1) * 10 >= usersTotal}
                      onClick={() => setUserPage(p => p + 1)}
                      className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold uppercase rounded-lg disabled:opacity-50 transition cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ─── TAB 3: Workspaces ─── */}
            {activeTab === 'workspaces' && (
              <div className="bg-[#121214] border border-border-primary/80 rounded-2xl shadow-lg p-6 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-white">Platform Workspaces (Spaces)</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Disable workspace, transfer owner privileges, or impersonate owners.</p>
                  </div>
                  <div className="relative w-full md:w-80">
                    <input
                      type="text"
                      placeholder="Search spaces..."
                      value={workspaceSearch}
                      onChange={(e) => { setWorkspaceSearch(e.target.value); setWorkspacePage(0); }}
                      onKeyDown={(e) => e.key === 'Enter' && loadData()}
                      className="w-full bg-[#1A1A1E] border border-border-primary text-xs px-3.5 py-2.5 pl-10 rounded-xl focus:outline-none focus:border-purple-500 text-white"
                    />
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-border-primary/50 text-slate-400 uppercase tracking-widest text-[9px] font-extrabold">
                        <th className="py-3 px-4">Workspace Title</th>
                        <th className="py-3 px-4">Owner Name</th>
                        <th className="py-3 px-4">Owner Email</th>
                        <th className="py-3 px-4">Testimonials</th>
                        <th className="py-3 px-4 text-right">Actions / Controls</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-primary/30">
                      {workspacesList.map((space) => (
                        <tr key={space.id} className="hover:bg-slate-800/10">
                          <td className="py-3.5 px-4 font-bold text-slate-200">
                            {space.name}
                            <span className="text-[9px] text-slate-400 font-extrabold uppercase block mt-0.5">/{space.slug}</span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-300 font-bold">{space.user?.name || 'Deleted User'}</td>
                          <td className="py-3.5 px-4 text-slate-400">{space.user?.email || 'N/A'}</td>
                          <td className="py-3.5 px-4 text-center font-bold text-slate-300">{space._count?.testimonials}</td>
                          <td className="py-3.5 px-4 flex justify-end items-center space-x-3">
                            {/* Impersonate Owner */}
                            <button
                              onClick={() => handleImpersonate(space.id)}
                              className="bg-purple-950/40 text-purple-400 border border-purple-900/40 hover:bg-purple-900/20 font-extrabold text-[10px] uppercase py-1.5 px-3 rounded-lg transition cursor-pointer flex items-center space-x-1"
                              title="Impersonate Workspace Owner"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Impersonate</span>
                            </button>

                            {/* Enable/Disable Collections */}
                            <button
                              onClick={() => handleToggleSpaceDisable(space.id, !space.collectText)}
                              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-extrabold text-[10px] uppercase py-1.5 px-2.5 rounded-lg transition cursor-pointer"
                              title={space.collectText ? 'Disable Collections' : 'Enable Collections'}
                            >
                              <Power className="w-3.5 h-3.5" />
                            </button>

                            {/* Transfer Ownership Form */}
                            <div className="flex items-center space-x-1">
                              <input
                                type="email"
                                placeholder="Transfer to email..."
                                value={transferTargetEmail[space.id] || ''}
                                onChange={(e) => setTransferTargetEmail({ ...transferTargetEmail, [space.id]: e.target.value })}
                                className="bg-[#1A1A1E] border border-border-primary text-[10px] px-2 py-1.5 rounded-lg focus:outline-none text-white w-32"
                              />
                              <button
                                onClick={() => handleTransferOwnership(space.id)}
                                className="bg-slate-800 hover:bg-slate-700 text-emerald-400 p-1.5 rounded-lg transition cursor-pointer"
                                title="Execute Transfer"
                              >
                                <Send className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between border-t border-border-primary/30 pt-4">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Total Workspaces: {workspacesTotal}</span>
                  <div className="flex space-x-2">
                    <button
                      disabled={workspacePage === 0}
                      onClick={() => setWorkspacePage(p => p - 1)}
                      className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold uppercase rounded-lg disabled:opacity-50 transition cursor-pointer"
                    >
                      Prev
                    </button>
                    <button
                      disabled={(workspacePage + 1) * 10 >= workspacesTotal}
                      onClick={() => setWorkspacePage(p => p + 1)}
                      className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold uppercase rounded-lg disabled:opacity-50 transition cursor-pointer"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ─── TAB 4: Feature Flags & Maintenance ─── */}
            {activeTab === 'flags' && flagsData && (
              <div className="space-y-6">
                
                {/* Emergency Maintenance Mode Controls */}
                <div className="bg-[#121214] border border-red-900/30 rounded-2xl p-6 shadow-lg space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="text-left space-y-1.5">
                      <h4 className="text-sm font-bold text-white flex items-center space-x-1.5">
                        <AlertTriangle className="w-4 h-4 text-yellow-500 animate-pulse" />
                        <span>Emergency Maintenance Overrides</span>
                      </h4>
                      <p className="text-xs text-slate-400 max-w-xl">
                        Activating maintenance mode blocks customer dashboard traffic and redirect them to a service unavailable page. Platform Founders bypass this check.
                      </p>
                    </div>

                    <button
                      onClick={() => handleToggleMaintenance(flagsData.maintenanceMode)}
                      className={`font-black text-xs uppercase tracking-wider py-3 px-6 rounded-xl transition cursor-pointer ${
                        flagsData.maintenanceMode
                          ? 'bg-red-950/40 text-red-500 border border-red-900/40'
                          : 'bg-emerald-950/40 text-emerald-500 border border-emerald-900/40 hover:bg-emerald-900/20'
                      }`}
                    >
                      {flagsData.maintenanceMode ? 'Disable Maintenance' : 'Enable Maintenance'}
                    </button>
                  </div>
                </div>

                {/* Add Feature Flag Form */}
                <div className="bg-[#121214] border border-border-primary/80 rounded-2xl p-6 shadow-lg space-y-4">
                  <h4 className="text-xs font-extrabold uppercase tracking-wide text-slate-200">Configure Feature Toggle</h4>
                  <form onSubmit={handleCreateFlag} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-400">Flag Key</label>
                      <input
                        type="text"
                        required
                        value={newFlagKey}
                        onChange={(e) => setNewFlagKey(e.target.value)}
                        placeholder="NEW_AI_STUDIO_ALPHA"
                        className="w-full bg-[#1A1A1E] border border-border-primary text-xs px-3 py-2.5 rounded-xl text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-400">Description</label>
                      <input
                        type="text"
                        value={newFlagDesc}
                        onChange={(e) => setNewFlagDesc(e.target.value)}
                        placeholder="Enables GPT-5 testimonial extraction"
                        className="w-full bg-[#1A1A1E] border border-border-primary text-xs px-3 py-2.5 rounded-xl text-white focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-400">Rollout Percentage</label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={newFlagRollout}
                        onChange={(e) => setNewFlagRollout(parseInt(e.target.value))}
                        className="w-full bg-[#1A1A1E] border border-border-primary text-xs px-3 py-2.5 rounded-xl text-white focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-purple-950/40 text-purple-400 border border-purple-900/40 hover:bg-purple-900/20 font-bold text-xs uppercase tracking-widest py-3 rounded-xl transition cursor-pointer"
                    >
                      Register Flag
                    </button>
                  </form>
                </div>

                {/* List of Feature Flags */}
                <div className="bg-[#121214] border border-border-primary/80 rounded-2xl shadow-lg p-6 space-y-4">
                  <h4 className="text-xs font-extrabold uppercase tracking-wide text-slate-200">Active Platform Feature Flags</h4>
                  <div className="divide-y divide-border-primary/30">
                    {flagsData.flags.map((flag: any) => (
                      <div key={flag.id} className="flex justify-between items-center py-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-slate-200">{flag.key}</span>
                            <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                              flag.enabled ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900/30' : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}>
                              {flag.enabled ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400">{flag.description || 'No description provided'}</p>
                        </div>

                        <div className="flex items-center space-x-3">
                          <span className="text-[10px] text-slate-400 font-bold uppercase">Rollout: {flag.rolloutPercentage}%</span>
                          <button
                            onClick={() => handleToggleFlag(flag.key, flag.enabled)}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-extrabold text-[10px] uppercase py-1.5 px-3 rounded-lg transition cursor-pointer"
                          >
                            Toggle State
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ─── TAB 5: System Metrics ─── */}
            {activeTab === 'monitoring' && metricsData && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* CPU & Memory canvas */}
                  <div className="bg-[#121214] border border-border-primary/80 rounded-2xl p-6 shadow-lg space-y-4 text-left">
                    <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-200 flex items-center space-x-1.5">
                      <Server className="w-4 h-4 text-purple-400" />
                      <span>Node.js Process Resource Usage</span>
                    </h4>
                    <div className="space-y-3.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-bold">Process Uptime:</span>
                        <span className="text-white font-bold">{metricsData.uptimeHuman}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-bold">Process CPU Usage:</span>
                        <span className="text-emerald-400 font-bold">{metricsData.cpu}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-bold">RSS Allocated:</span>
                        <span className="text-white font-bold">{metricsData.memory.rss}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-bold">Heap Used:</span>
                        <span className="text-white font-bold">{metricsData.memory.heapUsed}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-bold">Heap Total:</span>
                        <span className="text-white font-bold">{metricsData.memory.heapTotal}</span>
                      </div>
                    </div>
                  </div>

                  {/* Database Metrics stats */}
                  <div className="bg-[#121214] border border-border-primary/80 rounded-2xl p-6 shadow-lg space-y-4 text-left">
                    <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-200 flex items-center space-x-1.5">
                      <Activity className="w-4 h-4 text-emerald-400" />
                      <span>Prisma Database Performance</span>
                    </h4>
                    <div className="space-y-3.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-bold">DB Query Score:</span>
                        <span className="text-emerald-400 font-extrabold">{metricsData.database.score}%</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-bold">Average Latency:</span>
                        <span className="text-white font-bold">{metricsData.database.avgMs}ms</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-bold">P95 Latency:</span>
                        <span className="text-white font-bold">{metricsData.database.p95Ms}ms</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-bold">P99 Latency:</span>
                        <span className="text-white font-bold">{metricsData.database.p99Ms}ms</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-bold">Slow Queries (Hourly):</span>
                        <span className="text-white font-bold">{metricsData.database.slowQueries}</span>
                      </div>
                    </div>
                  </div>

                  {/* Redis Stats */}
                  <div className="bg-[#121214] border border-border-primary/80 rounded-2xl p-6 shadow-lg space-y-4 text-left">
                    <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-200 flex items-center space-x-1.5">
                      <Terminal className="w-4 h-4 text-purple-400" />
                      <span>Redis Cache Analytics</span>
                    </h4>
                    <div className="space-y-3.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-bold">Redis Connection:</span>
                        <span className="text-emerald-400 font-extrabold uppercase">{metricsData.redis.status}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-bold">Redis Latency:</span>
                        <span className="text-white font-bold">{metricsData.redis.latency}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-bold">Used Memory:</span>
                        <span className="text-white font-bold">{metricsData.redis.usedMemory}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400 font-bold">Ops / Sec:</span>
                        <span className="text-white font-bold">{metricsData.redis.opsPerSec}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ─── TAB 6: Global Audit Logs ─── */}
            {activeTab === 'audit' && (
              <div className="bg-[#121214] border border-border-primary/80 rounded-2xl shadow-lg p-6 space-y-6">
                <div className="flex justify-between items-center border-b border-border-primary/50 pb-4">
                  <div>
                    <h4 className="text-sm font-bold text-white">Audit Log Timeline</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Global audit tracking history for security audits.</p>
                  </div>

                  <button
                    onClick={handleExportCSV}
                    className="bg-emerald-950/40 text-emerald-400 border border-emerald-900/40 hover:bg-emerald-900/20 font-bold text-[10px] uppercase tracking-widest py-2.5 px-4 rounded-xl transition cursor-pointer flex items-center space-x-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {auditLogsList.map((log) => (
                    <div key={log.id} className="p-4 bg-[#1A1A1E] border border-border-primary rounded-xl flex flex-col md:flex-row md:items-center justify-between text-xs gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-purple-400">{log.action}</span>
                          <span className="text-[10px] text-slate-500">{new Date(log.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-slate-400">
                          Actor ID: <span className="text-slate-300 font-mono">{log.userId || 'System / Anon'}</span> • IP: <span className="text-slate-300 font-mono">{log.ipAddress || 'N/A'}</span>
                        </p>
                      </div>
                      <div className="text-[10px] text-slate-500 bg-slate-900 px-3 py-1.5 rounded-lg max-w-xs truncate border border-border-primary/50">
                        {log.deviceInfo || 'No client signature'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─── TAB 7: Security Center ─── */}
            {activeTab === 'security' && securityData && (
              <div className="space-y-6 text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <div className="bg-[#121214] border border-border-primary/80 rounded-2xl p-6 shadow-lg space-y-4">
                    <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-200 flex items-center space-x-1.5">
                      <Shield className="w-4 h-4 text-purple-400" />
                      <span>Security Breach Indicators</span>
                    </h4>
                    <div className="space-y-4 pt-2">
                      <div className="flex justify-between items-center p-3.5 bg-[#1A1A1E] rounded-xl border border-border-primary">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">Failed Password Tries</span>
                          <span className="text-xl font-black text-white">{securityData.failedLoginsCount}</span>
                        </div>
                        <Sliders className="w-5 h-5 text-red-500" />
                      </div>

                      <div className="flex justify-between items-center p-3.5 bg-[#1A1A1E] rounded-xl border border-border-primary">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase block">OTP Rate Limit Blocks</span>
                          <span className="text-xl font-black text-white">{securityData.rateLimitViolationsCount}</span>
                        </div>
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#121214] border border-border-primary/80 rounded-2xl p-6 shadow-lg space-y-4">
                    <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-200 flex items-center space-x-1.5">
                      <ShieldAlert className="w-4 h-4 text-red-500 animate-pulse" />
                      <span>Live Anomalous Logins (Risk &gt;= 0.7)</span>
                    </h4>
                    <div className="space-y-3 pt-2">
                      {securityData.anomalies.length === 0 ? (
                        <p className="text-xs text-muted-foreground py-4 text-center">No anomalous session risk detected.</p>
                      ) : (
                        securityData.anomalies.map((anom: any) => (
                          <div key={anom.id} className="p-3 bg-red-950/10 border border-red-900/30 rounded-xl flex justify-between items-center text-xs">
                            <div>
                              <span className="font-bold text-slate-200 block">{anom.user?.email || 'N/A'}</span>
                              <span className="text-[10px] text-slate-500">IP: {anom.ipAddress} • {anom.browser} / {anom.os}</span>
                            </div>
                            <span className="text-[11px] font-black bg-red-950/40 text-red-500 border border-red-900/40 px-2 py-0.5 rounded">
                              Score: {anom.riskScore}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                </div>
              </div>
            )}

          </div>
        )}
      </main>
    </div>
  );
}
