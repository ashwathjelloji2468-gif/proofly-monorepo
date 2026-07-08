'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { 
  Settings, 
  Globe, 
  Users, 
  CreditCard, 
  Check, 
  ShieldCheck, 
  AlertCircle,
  ShieldAlert,
  Trash2,
  Plus,
  User as UserIcon,
  Mail,
  Loader
} from 'lucide-react';
import { StripeCheckoutModal } from '@/components/StripeCheckoutModal';

export default function SettingsPage() {
  const user = useStore(state => state.user);
  const collections = useStore(state => state.collections);
  const updateBillingTier = useStore(state => state.updateBillingTier);
  
  // Store actions
  const inviteTeammate = useStore(state => state.inviteTeammate);
  const getWorkspaceInvitations = useStore(state => state.getWorkspaceInvitations);
  const getWorkspaceMembers = useStore(state => state.getWorkspaceMembers);
  const removeWorkspaceMember = useStore(state => state.removeWorkspaceMember);
  const requestEmailChange = useStore(state => state.requestEmailChange);
  const updateProfile = useStore(state => state.updateProfile);
  const setPasswordAction = useStore(state => state.enablePasswordREST);
  const disablePasswordAction = useStore(state => state.disablePasswordREST);
  const changePasswordAction = useStore(state => state.changePasswordREST);
  const getActiveSessions = useStore(state => state.getActiveSessionsREST);
  const revokeSessionAction = useStore(state => state.revokeSessionREST);
  const revokeAllSessionsAction = useStore(state => state.revokeAllSessionsREST);

  // States
  const [activeSettingsTab, setActiveSettingsTab] = useState<'profile' | 'security' | 'billing' | 'domains' | 'team'>('profile');
  const [selectedSpaceId, setSelectedSpaceId] = useState<string>('');
  
  // Profile settings
  const [profileName, setProfileName] = useState(user?.name || '');
  const [newEmail, setNewEmail] = useState('');
  const [emailChangeStatus, setEmailChangeStatus] = useState<'idle' | 'requested' | 'error'>('idle');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [securitySuccess, setSecuritySuccess] = useState('');
  const [securityError, setSecurityError] = useState('');
  const [deviceSessions, setDeviceSessions] = useState<any[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);

  // Domains
  const [domains, setDomains] = useState<string[]>(['reviews.acmesaas.io']);
  const [newDomain, setNewDomain] = useState('');
  
  // Workspace members & invites
  const [activeMembers, setActiveMembers] = useState<any[]>([]);
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('MEMBER');
  
  const [feedbackError, setFeedbackError] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stripe Checkout success status
  const [checkoutSuccess, setCheckoutSuccess] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<{ id: 'FREE' | 'PRO' | 'BUSINESS' | 'ENTERPRISE'; name: string; price: string } | null>(null);

  // Set default active space ID
  useEffect(() => {
    if (collections.length > 0 && !selectedSpaceId) {
      setSelectedSpaceId(collections[0].id);
    }
  }, [collections, selectedSpaceId]);

  // Load team members and invitations when space is changed or settings team tab is active
  useEffect(() => {
    if (activeSettingsTab === 'team' && selectedSpaceId) {
      loadTeamData();
    }
  }, [activeSettingsTab, selectedSpaceId]);

  useEffect(() => {
    if (user) {
      setProfileName(user.name);
    }
  }, [user]);

  const loadTeamData = async () => {
    if (!selectedSpaceId) return;
    try {
      const [members, invites] = await Promise.all([
        getWorkspaceMembers(selectedSpaceId),
        getWorkspaceInvitations(selectedSpaceId)
      ]);
      setActiveMembers(members);
      setPendingInvites(invites);
    } catch (err) {
      console.error('Failed to load team data:', err);
    }
  };

  const handleUpdateProfileName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) return;
    updateProfile(profileName, user?.avatar || '');
    setProfileSuccess('Profile name updated successfully.');
    setTimeout(() => setProfileSuccess(''), 3000);
  };

  const handleRequestEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    setIsSubmitting(true);
    setFeedbackError('');
    try {
      const success = await requestEmailChange(newEmail);
      if (success) {
        setEmailChangeStatus('requested');
        setNewEmail('');
      } else {
        setFeedbackError('Failed to initiate email change.');
      }
    } catch (err: any) {
      setFeedbackError(err.message || 'An error occurred while requesting email change.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) return;
    if (newPassword !== confirmPassword) {
      setFeedbackError("Passwords don't match.");
      return;
    }
    setIsSubmitting(true);
    setFeedbackError('');
    setPasswordSuccess('');
    try {
      const success = await setPasswordAction(newPassword);
      if (success) {
        setPasswordSuccess('Password established successfully. You can now log in using email/password.');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setFeedbackError('Failed to establish password.');
      }
    } catch (err: any) {
      setFeedbackError(err.message || 'Error occurred while setting password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword.trim() || !newPassword.trim()) return;
    if (newPassword !== confirmPassword) {
      setSecurityError("Passwords don't match.");
      return;
    }
    setIsSubmitting(true);
    setSecurityError('');
    setSecuritySuccess('');
    try {
      await changePasswordAction(oldPassword, newPassword);
      setSecuritySuccess('Password updated successfully.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setSecurityError(err.message || 'Failed to update password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDisablePassword = async () => {
    setIsSubmitting(true);
    setSecurityError('');
    setSecuritySuccess('');
    try {
      await disablePasswordAction();
      setSecuritySuccess('Password login disabled. You must now use OTP or linked OAuth providers.');
    } catch (err: any) {
      setSecurityError(err.message || 'Failed to disable password login.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadSessions = async () => {
    setSessionsLoading(true);
    try {
      const data = await getActiveSessions();
      setDeviceSessions(data);
    } catch (err) {
      console.error('Failed to load active sessions:', err);
    } finally {
      setSessionsLoading(false);
    }
  };

  useEffect(() => {
    if (activeSettingsTab === 'security') {
      loadSessions();
    }
  }, [activeSettingsTab]);

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await revokeSessionAction(sessionId);
      await loadSessions();
      setFeedbackSuccess('Session revoked successfully.');
      setTimeout(() => setFeedbackSuccess(''), 3000);
    } catch (err: any) {
      setFeedbackError(err.message || 'Failed to revoke session.');
    }
  };

  const handleRevokeAllSessions = async () => {
    if (!confirm('Are you sure you want to log out of all other devices?')) return;
    try {
      await revokeAllSessionsAction();
      await loadSessions();
      setFeedbackSuccess('All other sessions revoked successfully.');
      setTimeout(() => setFeedbackSuccess(''), 3000);
    } catch (err: any) {
      setFeedbackError(err.message || 'Failed to revoke all sessions.');
    }
  };

  const handleAddDomain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim() || domains.includes(newDomain)) return;
    setDomains([...domains, newDomain]);
    setNewDomain('');
  };

  const handleInviteTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !selectedSpaceId) return;
    setIsSubmitting(true);
    setFeedbackError('');
    setFeedbackSuccess('');
    
    try {
      const success = await inviteTeammate(selectedSpaceId, inviteEmail, inviteRole);
      if (success) {
        setFeedbackSuccess(`Invitation email successfully sent to ${inviteEmail}.`);
        setInviteEmail('');
        loadTeamData();
      } else {
        setFeedbackError('Failed to send workspace invitation.');
      }
    } catch (err: any) {
      setFeedbackError(err.message || 'Error occurred during workspace invitation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    setFeedbackError('');
    setFeedbackSuccess('');
    try {
      const success = await removeWorkspaceMember(memberId);
      if (success) {
        setFeedbackSuccess('Teammate removed successfully.');
        loadTeamData();
      } else {
        setFeedbackError('Failed to remove teammate.');
      }
    } catch (err: any) {
      setFeedbackError(err.message || 'Error occurred while removing member.');
    }
  };

  const pricingPlans = [
    {
      id: 'FREE',
      name: 'Starter Plan',
      price: '$0',
      period: 'forever',
      features: ['1 Active collection Space', '10 Total testimonials limit', 'Standard text collections', 'Proofly watermark badge']
    },
    {
      id: 'PRO',
      name: 'Professional',
      price: '$49',
      period: 'monthly',
      features: ['5 Active Spaces', '100 Total testimonials', 'HD Video camera recorder', 'Custom CSS styling themes', 'Remove branding watermarks']
    },
    {
      id: 'BUSINESS',
      name: 'Business Growth',
      price: '$99',
      period: 'monthly',
      features: ['Unlimited Spaces', '1,000 Testimonials', 'AI Sentiment Engine summaries', 'Custom domain mapping', 'CSV/Spreadsheet bulk imports']
    },
    {
      id: 'ENTERPRISE',
      name: 'Enterprise Dedicated',
      price: '$249',
      period: 'monthly',
      features: ['Unlimited everything', 'Dedicated vector clusters', 'Mux webhook SLA agreements', 'SAML SSO security', 'Account Manager support']
    }
  ] as const;

  return (
    <div className="flex-1 bg-[#09090B] flex flex-col min-w-0">
      {/* Header */}
      <header className="border-b border-border-primary bg-[#09090B]/80 backdrop-blur sticky top-0 z-30 px-8 py-5 flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="font-extrabold text-lg text-white flex items-center space-x-2">
            <Settings className="w-5 h-5 text-brand-emerald" />
            <span>Workspace Settings</span>
          </h1>
          <p className="text-[11px] text-muted-foreground">Manage profile, subscription plans, invite teammates, and configure custom domains.</p>
        </div>
      </header>

      {/* Settings Panel Grid */}
      <main className="p-8 max-w-5xl w-full text-left space-y-6">
        
        {/* Checkout alert banner */}
        {checkoutSuccess && (
          <div className="bg-brand-emerald/10 border border-brand-emerald/30 p-4 rounded-xl flex items-center space-x-3 text-slate-100 shadow-md">
            <Check className="w-5 h-5 text-brand-emerald shrink-0" />
            <span className="text-xs font-bold">{checkoutSuccess}</span>
          </div>
        )}

        {feedbackError && (
          <div className="bg-red-950/40 border border-red-900/50 p-4 rounded-xl flex items-center space-x-3 text-red-400 shadow-md">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span className="text-xs font-bold">{feedbackError}</span>
          </div>
        )}

        {feedbackSuccess && (
          <div className="bg-brand-emerald/10 border border-brand-emerald/30 p-4 rounded-xl flex items-center space-x-3 text-slate-100 shadow-md">
            <Check className="w-5 h-5 text-brand-emerald shrink-0" />
            <span className="text-xs font-bold">{feedbackSuccess}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Navigation Sidebar */}
          <aside className="md:col-span-1 space-y-2 shrink-0 ">
            {[
              { id: 'profile', label: 'Profile Settings', desc: 'Display name & email', icon: <UserIcon className="w-4 h-4 text-brand-emerald" /> },
              { id: 'security', label: 'Security & Sessions', desc: 'Passwords & active devices', icon: <ShieldCheck className="w-4 h-4 text-amber-500" /> },
              { id: 'billing', label: 'Subscription Plans', desc: 'Manage Stripe billing', icon: <CreditCard className="w-4 h-4 text-brand-teal" /> },
              { id: 'domains', label: 'Custom Domains', desc: 'CNAME setup links', icon: <Globe className="w-4 h-4 text-brand-emerald" /> },
              { id: 'team', label: 'Workspace Team', desc: 'Teammates & Invites', icon: <Users className="w-4 h-4 text-brand-teal" /> }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveSettingsTab(tab.id as any);
                  setCheckoutSuccess(null);
                  setFeedbackError('');
                  setFeedbackSuccess('');
                }}
                className={`w-full text-left p-3 border rounded-xl flex items-center space-x-3 transition cursor-pointer ${
                  activeSettingsTab === tab.id
                    ? 'bg-brand-emerald/10 border-brand-emerald/40 text-white'
                    : 'bg-[#18181B] border-border-primary text-slate-400 hover:text-white'
                }`}
              >
                {tab.icon}
                <div>
                  <span className="text-xs font-bold block">{tab.label}</span>
                  <span className="text-[11px] text-muted-foreground block">{tab.desc}</span>
                </div>
              </button>
            ))}
          </aside>

          {/* Settings Details Canvas */}
          <section className="md:col-span-3 bg-[#18181B] border border-border-primary rounded-xl p-6 shadow-xl relative min-h-[400px]">
            <div className="absolute top-0 right-0 w-48 h-48 bg-brand-emerald/5 rounded-full blur-2xl -z-10" />

            {/* PROFILE & SECURITY TAB */}
            {activeSettingsTab === 'profile' && user && (
              <div className="space-y-6 text-left">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-1.5">
                    <UserIcon className="w-4 h-4 text-brand-emerald" />
                    <span>Profile & Account Security</span>
                  </h3>
                  <p className="text-xs text-muted-foreground">Manage your personal credentials, workspace identifier name, and login email address.</p>
                </div>

                {profileSuccess && (
                  <div className="p-3 text-xs rounded bg-brand-emerald/10 border border-brand-emerald/30 text-brand-emerald">
                    {profileSuccess}
                  </div>
                )}

                {/* Change Name form */}
                <form onSubmit={handleUpdateProfileName} className="space-y-4 bg-[#09090B] border border-border-primary p-5 rounded-xl">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">Your Display Name</h4>
                  <div className="space-y-1.5 max-w-md">
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="Your Full Name"
                      className="w-full bg-[#18181B] border border-border-primary text-white text-xs px-3.5 py-3 rounded-lg focus:outline-none focus:border-brand-emerald transition"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-brand-emerald/10 border border-brand-emerald/20 hover:bg-brand-emerald/20 text-brand-emerald font-bold text-[10px] uppercase tracking-widest py-2 px-6 rounded-lg transition cursor-pointer"
                  >
                    Save Profile Name
                  </button>
                </form>

                {/* Change Email form */}
                <div className="space-y-4 bg-[#09090B] border border-border-primary p-5 rounded-xl">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">Email address updates</h4>
                  
                  <div className="p-3 text-[10px] text-yellow-400 bg-yellow-950/20 border border-yellow-800/40 rounded-lg flex items-start space-x-2 leading-relaxed">
                    <AlertCircle className="w-4 h-4 shrink-0 text-yellow-400 mt-0.5" />
                    <span>
                      <strong>Enterprise Security Precaution</strong>: To change your login email address, Proofly requires a double-confirmation mechanism. Verification links will be sent to both your <strong>current email address</strong> (${user.email}) and your <strong>target new address</strong>. The switch will take effect only after both are verified.
                    </span>
                  </div>

                  {emailChangeStatus === 'requested' ? (
                    <div className="p-4 bg-brand-emerald/10 border border-brand-emerald/30 text-slate-200 text-xs rounded-lg space-y-2">
                      <p className="font-bold text-white flex items-center space-x-1.5">
                        <Check className="w-4 h-4 text-brand-emerald" />
                        <span>Email change requested!</span>
                      </p>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        We have dispatched verification links to both email boxes. Please click the confirmations in both mailboxes to update your account email.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleRequestEmailChange} className="space-y-4">
                      <div className="space-y-1.5 max-w-md">
                        <input
                          type="email"
                          required
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          placeholder="new-email@company.com"
                          className="w-full bg-[#18181B] border border-border-primary text-white text-xs px-3.5 py-3 rounded-lg focus:outline-none focus:border-brand-emerald transition"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-brand-emerald/10 border border-brand-emerald/20 hover:bg-brand-emerald/20 text-brand-emerald font-bold text-[10px] uppercase tracking-widest py-2 px-6 rounded-lg transition cursor-pointer disabled:opacity-50"
                      >
                        {isSubmitting ? 'Requesting change...' : 'Request Email Change'}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}

            {/* SECURITY & SESSIONS TAB */}
            {activeSettingsTab === 'security' && user && (
              <div className="space-y-6 text-left">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-500" />
                    <span>Security & Session Settings</span>
                  </h3>
                  <p className="text-xs text-muted-foreground">Manage password login, connected OAuth accounts, active browser sessions, and security history.</p>
                </div>

                {securitySuccess && (
                  <div className="p-3 text-xs rounded bg-brand-emerald/10 border border-brand-emerald/30 text-brand-emerald">
                    {securitySuccess}
                  </div>
                )}

                {securityError && (
                  <div className="p-3 text-xs rounded bg-red-950/40 border border-red-900/40 text-red-400">
                    {securityError}
                  </div>
                )}

                {/* Password Login Section */}
                <div className="space-y-4 bg-[#09090B] border border-border-primary p-5 rounded-xl">
                  <div className="flex items-center justify-between border-b border-border-primary/50 pb-3">
                    <div>
                      <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">Password Login</h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Toggle and configure standard password access for this account.</p>
                    </div>
                    <div>
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                        user.hasPassword 
                          ? 'bg-brand-emerald/10 border-brand-emerald/20 text-brand-emerald' 
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}>
                        {user.hasPassword ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                  </div>

                  {user.hasPassword ? (
                    <div className="space-y-4">
                      {/* Change Password Form */}
                      <form onSubmit={handleChangePassword} className="space-y-4 max-w-md pt-2">
                        <h5 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Change Password</h5>
                        <div className="space-y-1.5">
                          <label className="text-slate-400 text-[10px] uppercase tracking-wider font-bold block">Current Password</label>
                          <input
                            type="password"
                            required
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            placeholder="Current Password"
                            className="w-full bg-[#18181B] border border-border-primary text-white text-xs px-3.5 py-3 rounded-lg focus:outline-none focus:border-brand-emerald transition"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-slate-400 text-[10px] uppercase tracking-wider font-bold block">New Password</label>
                          <input
                            type="password"
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Min 8 characters, uppercase, number, special"
                            className="w-full bg-[#18181B] border border-border-primary text-white text-xs px-3.5 py-3 rounded-lg focus:outline-none focus:border-brand-emerald transition"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-slate-400 text-[10px] uppercase tracking-wider font-bold block">Confirm New Password</label>
                          <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Re-enter new password"
                            className="w-full bg-[#18181B] border border-border-primary text-white text-xs px-3.5 py-3 rounded-lg focus:outline-none focus:border-brand-emerald transition"
                          />
                        </div>
                        <div className="flex space-x-3 pt-2">
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-brand-emerald/10 border border-brand-emerald/20 hover:bg-brand-emerald/20 text-brand-emerald font-bold text-[10px] uppercase tracking-widest py-2 px-6 rounded-lg transition cursor-pointer disabled:opacity-50"
                          >
                            Update Password
                          </button>
                          <button
                            type="button"
                            onClick={handleDisablePassword}
                            disabled={isSubmitting}
                            className="bg-red-950/20 border border-red-900/30 hover:bg-red-950/40 text-red-400 font-bold text-[10px] uppercase tracking-widest py-2 px-6 rounded-lg transition cursor-pointer"
                          >
                            Disable Password Login
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div className="space-y-4 pt-2">
                      <div className="p-3 text-[10px] text-brand-teal bg-brand-teal/5 border border-brand-teal/20 rounded-lg flex items-start space-x-2 leading-relaxed">
                        <AlertCircle className="w-4 h-4 shrink-0 text-brand-teal mt-0.5" />
                        <span>
                          Password login is currently disabled. You are logging in passwordlessly via OTP or social OAuth. You can establish a password below to enable password-based logins.
                        </span>
                      </div>

                      <form onSubmit={handleSetPassword} className="space-y-4 max-w-md">
                        <div className="space-y-1.5">
                          <label className="text-slate-400 text-[10px] uppercase tracking-wider font-bold block">Create Password</label>
                          <input
                            type="password"
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Min 8 characters, uppercase, number, special"
                            className="w-full bg-[#18181B] border border-border-primary text-white text-xs px-3.5 py-3 rounded-lg focus:outline-none focus:border-brand-emerald transition"
                          />
                        </div>
                        
                        <div className="space-y-1.5">
                          <label className="text-slate-400 text-[10px] uppercase tracking-wider font-bold block">Confirm Password</label>
                          <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm password"
                            className="w-full bg-[#18181B] border border-border-primary text-white text-xs px-3.5 py-3 rounded-lg focus:outline-none focus:border-brand-emerald transition"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="bg-brand-emerald/10 border border-brand-emerald/20 hover:bg-brand-emerald/20 text-brand-emerald font-bold text-[10px] uppercase tracking-widest py-2 px-6 rounded-lg transition cursor-pointer disabled:opacity-50"
                        >
                          Enable Password Login
                        </button>
                      </form>
                    </div>
                  )}
                </div>

                {/* Connected OAuth Accounts */}
                <div className="space-y-4 bg-[#09090B] border border-border-primary p-5 rounded-xl">
                  <div>
                    <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">Connected OAuth Accounts</h4>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Integrate third-party social single sign-on (SSO) providers.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-3.5 bg-[#18181B] border border-border-primary rounded-xl">
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">Google</span>
                        <span className="text-[10px] text-slate-400">
                          {user.provider === 'GOOGLE' ? 'Used for current sign in' : 'Connected'}
                        </span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/20 font-bold uppercase">
                        Connected
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3.5 bg-[#18181B] border border-border-primary rounded-xl">
                      <div>
                        <span className="text-xs font-bold text-slate-200 block">GitHub</span>
                        <span className="text-[10px] text-slate-400">
                          {user.provider === 'GITHUB' ? 'Used for current sign in' : 'Connected'}
                        </span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/20 font-bold uppercase">
                        Connected
                      </span>
                    </div>
                  </div>
                </div>

                {/* Active Sessions */}
                <div className="space-y-4 bg-[#09090B] border border-border-primary p-5 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wide">Active Browser Sessions</h4>
                      <p className="text-[10px] text-muted-foreground mt-0.5">Manage and revoke active logins on different devices.</p>
                    </div>
                    {deviceSessions.filter(s => !s.isCurrent).length > 0 && (
                      <button
                        onClick={handleRevokeAllSessions}
                        className="text-[10px] text-red-400 hover:text-red-300 font-bold border border-red-900/30 hover:border-red-900/50 bg-red-950/10 py-1.5 px-3 rounded-lg transition cursor-pointer"
                      >
                        Revoke All Other Sessions
                      </button>
                    )}
                  </div>

                  {sessionsLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader className="w-5 h-5 text-brand-emerald animate-spin" />
                    </div>
                  ) : deviceSessions.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-2">No active sessions found.</p>
                  ) : (
                    <div className="space-y-3.5">
                      {deviceSessions.map((session) => (
                        <div key={session.id} className="flex items-center justify-between p-3.5 bg-[#18181B] border border-border-primary rounded-xl">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold text-slate-200">
                                {session.deviceType || 'Browser Session'}
                              </span>
                              {session.isCurrent && (
                                <span className="text-[11px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/20">
                                  Current Session
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-slate-400 space-y-0.5">
                              <p className="truncate max-w-[250px] md:max-w-md">
                                <span className="font-bold">User Agent:</span> {session.userAgent || 'Unknown Browser'}
                              </p>
                              <p>
                                <span className="font-bold">IP Address:</span> {session.ipAddress || 'Unknown IP'} • <span className="font-bold">Logged In:</span> {new Date(parseInt(session.createdAt) || session.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          {!session.isCurrent && (
                            <button
                              onClick={() => handleRevokeSession(session.id)}
                              className="text-red-400 hover:text-red-300 hover:bg-red-950/20 p-2 rounded-lg transition cursor-pointer"
                              title="Revoke Session"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* BILLING PLANS TAB */}
            {activeSettingsTab === 'billing' && user && (
              <div className="space-y-6 text-left">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-1.5">
                    <CreditCard className="w-4 h-4 text-brand-teal" />
                    <span>Billing Plans</span>
                  </h3>
                  <p className="text-xs text-muted-foreground">Select a plan to upgrade your workspace. Changes take effect immediately.</p>
                </div>

                <div className="bg-[#09090B] border border-border-primary p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-brand-emerald/10 border border-brand-emerald/30 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 text-brand-emerald" />
                    </div>
                    <div>
                      <span className="text-xs text-muted-foreground block">Active Plan Tier</span>
                      <span className="text-sm font-black text-white uppercase tracking-wider">{user.tier} Membership</span>
                    </div>
                  </div>
                  <span className="text-[10px] bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/20 px-2.5 py-1 rounded-full font-black uppercase">
                    Active Account
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pricingPlans.map((plan) => {
                    const isCurrent = user.tier === plan.id;
                    return (
                      <div 
                        key={plan.id} 
                        className={`p-5 border rounded-xl flex flex-col justify-between space-y-4 relative ${
                          isCurrent 
                            ? 'bg-brand-emerald/5 border-brand-emerald' 
                            : 'bg-[#09090B] border-border-primary'
                        }`}
                      >
                        {isCurrent && (
                          <span className="absolute -top-2.5 right-4 bg-brand-emerald text-white text-[11px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider shadow">
                            Current Plan
                          </span>
                        )}

                        <div className="space-y-2">
                          <div>
                            <span className="text-xs font-extrabold text-white block">{plan.name}</span>
                            <span className="text-2xl font-black text-white block mt-1">
                              {plan.price}
                              <span className="text-xs text-muted-foreground font-normal"> / {plan.period}</span>
                            </span>
                          </div>

                          <ul className="space-y-1.5 pt-2 text-[10px] text-slate-400">
                            {plan.features.map((f, i) => (
                              <li key={i} className="flex items-center space-x-1.5">
                                <Check className="w-3 h-3 text-brand-teal shrink-0" />
                                <span>{f}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {!isCurrent && (
                          <button
                            onClick={() => setSelectedPlan({ id: plan.id, name: plan.name, price: plan.price })}
                            className="w-full bg-[#18181B] hover:bg-[#27272A] border border-border-primary text-slate-200 hover:text-white font-bold text-[11px] py-2 rounded-lg cursor-pointer transition text-center block"
                          >
                            Upgrade Plan
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* DOMAINS TAB */}
            {activeSettingsTab === 'domains' && (
              <div className="space-y-6 text-left">
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white flex items-center space-x-1.5">
                    <Globe className="w-4 h-4 text-brand-emerald" />
                    <span>Custom Domains Mapping</span>
                  </h3>
                  <p className="text-xs text-muted-foreground">White-label your collection URLs by mapping customized subdomains.</p>
                </div>

                <form onSubmit={handleAddDomain} className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    placeholder="e.g. feedback.yourcompany.com"
                    className="flex-1 bg-[#09090B] border border-border-primary focus:border-brand-emerald outline-none rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-zinc-600 transition"
                  />
                  <button
                    type="submit"
                    className="bg-[#09090B] hover:bg-[#18181B] text-slate-300 hover:text-white font-bold text-xs py-2 px-4 border border-border-primary rounded-lg flex items-center space-x-1 cursor-pointer transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Alias</span>
                  </button>
                </form>

                <div className="space-y-3">
                  <h4 className="text-[10px] font-extrabold text-brand-teal uppercase tracking-widest">Domains list</h4>
                  {domains.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">No custom domains added yet.</p>
                  ) : (
                    domains.map((dom) => (
                      <div key={dom} className="bg-[#09090B] border border-border-primary p-3 rounded-lg flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald animate-pulse" />
                          <span className="text-xs font-semibold text-white">{dom}</span>
                        </div>
                        <button
                          onClick={() => setDomains(domains.filter(d => d !== dom))}
                          className="text-zinc-600 hover:text-red-400 p-1 cursor-pointer transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <div className="bg-[#09090B] border border-border-primary rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-slate-200 flex items-center space-x-1.5">
                    <AlertCircle className="w-4 h-4 text-brand-teal" />
                    <span>DNS Configuration Instructions</span>
                  </h4>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">
                    Access your domain registrar (GoDaddy, Namecheap, Cloudflare) and create a CNAME record with these credentials:
                  </p>
                  <table className="w-full text-[10px] font-mono border-t border-border-primary/50 pt-2">
                    <tbody>
                      <tr className="border-b border-border-primary/30">
                        <td className="py-2 text-zinc-500">Record Type</td>
                        <td className="py-2 text-brand-emerald font-black">CNAME</td>
                      </tr>
                      <tr className="border-b border-border-primary/30">
                        <td className="py-2 text-zinc-500">Host / Name</td>
                        <td className="py-2 text-white font-semibold">feedback (or your subdomain name)</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-zinc-500">Value / Target</td>
                        <td className="py-2 text-white font-semibold">cname.proofly.com</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TEAM MEMBERS TAB */}
            {activeSettingsTab === 'team' && user && (
              <div className="space-y-6 text-left">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white flex items-center space-x-1.5">
                      <Users className="w-4 h-4 text-brand-teal" />
                      <span>Workspace Teammates</span>
                    </h3>
                    <p className="text-xs text-muted-foreground">Collaborate by inviting project administrators and content review moderators.</p>
                  </div>
                  
                  {/* Space selector dropdown */}
                  {collections.length > 0 && (
                    <div className="shrink-0 flex items-center space-x-1">
                      <span className="text-[10px] text-slate-400 font-bold">Space:</span>
                      <select
                        value={selectedSpaceId}
                        onChange={(e) => setSelectedSpaceId(e.target.value)}
                        className="bg-[#09090B] border border-border-primary rounded-lg text-[10px] font-bold py-1.5 px-3 text-slate-200 focus:border-brand-emerald outline-none cursor-pointer"
                      >
                        {collections.map(col => (
                          <option key={col.id} value={col.id}>{col.title}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Form to invite teammates */}
                <form onSubmit={handleInviteTeam} className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="teammate@company.com"
                    className="flex-1 bg-[#09090B] border border-border-primary focus:border-brand-emerald outline-none rounded-lg px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-zinc-600 transition"
                  />
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="bg-[#09090B] border border-border-primary rounded-lg text-xs font-semibold py-2.5 px-3 text-slate-200 focus:border-brand-emerald outline-none cursor-pointer"
                  >
                    <option value="ADMIN">Administrator</option>
                    <option value="MANAGER">Manager</option>
                    <option value="MEMBER">Member</option>
                    <option value="VIEWER">Viewer</option>
                  </select>
                  <button
                    type="submit"
                    disabled={isSubmitting || !selectedSpaceId}
                    className="bg-[#09090B] hover:bg-[#18181B] text-slate-300 hover:text-white font-bold text-xs py-2.5 px-6 border border-border-primary rounded-lg flex items-center justify-center space-x-1.5 cursor-pointer transition shrink-0 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Plus className="w-3.5 h-3.5" />
                    )}
                    <span>Invite Teammate</span>
                  </button>
                </form>

                {/* Team member list */}
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-extrabold text-brand-emerald uppercase tracking-widest">Active Teammates ({activeMembers.length})</h4>
                    
                    {activeMembers.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">No members found.</p>
                    ) : (
                      activeMembers.map((member) => {
                        const isOwner = member.role === 'OWNER';
                        return (
                          <div key={member.id} className="bg-[#09090B] border border-border-primary p-3.5 rounded-lg flex items-center justify-between">
                            <div>
                              <span className="text-xs font-bold text-white block">{member.user?.name || 'Pending registration'}</span>
                              <span className="text-[10px] text-muted-foreground block">{member.user?.email}</span>
                            </div>
                            <div className="flex items-center space-x-3">
                              <span className={`text-[11px] px-2 py-0.5 rounded font-black uppercase border ${
                                isOwner 
                                  ? 'bg-brand-emerald/10 text-brand-emerald border-brand-emerald/20' 
                                  : 'bg-zinc-800 border-border-primary text-slate-400'
                              }`}>
                                {member.role}
                              </span>
                              {!isOwner && (
                                <button
                                  onClick={() => handleRemoveMember(member.id)}
                                  className="text-zinc-600 hover:text-red-400 cursor-pointer p-1 transition"
                                  title="Remove teammate"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Pending Invitations list */}
                  {pendingInvites.length > 0 && (
                    <div className="space-y-2 pt-2 border-t border-border-primary/50">
                      <h4 className="text-[10px] font-extrabold text-brand-teal uppercase tracking-widest">Pending Invitations ({pendingInvites.length})</h4>
                      {pendingInvites.map((invite) => (
                        <div key={invite.id} className="bg-[#09090B]/50 border border-border-primary p-3.5 rounded-lg flex items-center justify-between">
                          <div>
                            <span className="text-xs font-semibold text-slate-300 block">{invite.email}</span>
                            <span className="text-[11px] text-zinc-500 block">Expires: {new Date(invite.expiresAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-[11px] bg-brand-teal/10 border border-brand-teal/20 text-brand-teal px-2 py-0.5 rounded font-bold uppercase">
                              {invite.role} (Pending)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

          </section>

        </div>

      </main>

      <StripeCheckoutModal 
        isOpen={!!selectedPlan}
        onClose={() => setSelectedPlan(null)}
        planName={selectedPlan?.name || ''}
        price={selectedPlan?.price || ''}
        tierKey={selectedPlan?.id || 'FREE'}
      />
    </div>
  );
}
