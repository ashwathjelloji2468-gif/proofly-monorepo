'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { 
  Sparkles,
  Link2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Plus,
  Settings,
  Code,
  ShieldCheck,
  Layers,
  Database,
  Terminal,
  Activity,
  ArrowRight,
  ExternalLink,
  Info,
  Crown,
  CheckCircle,
  XCircle,
  Send,
  Loader2,
  Palette,
  Globe,
  Mail,
  Users,
  Shield,
  Eye,
  Key
} from 'lucide-react';
import Link from 'next/link';

export default function EnterpriseSecurityPage() {
  const user = useStore(state => state.user);
  const collections = useStore(state => state.collections); // spaces

  const organization = useStore(state => state.organization);
  const auditLogs = useStore(state => state.auditLogs);
  const customRoles = useStore(state => state.customRoles);
  const ssoConfig = useStore(state => state.ssoConfig);
  const ipPolicies = useStore(state => state.ipPolicies);

  const fetchOrganization = useStore(state => state.fetchOrganization);
  const fetchAuditLogs = useStore(state => state.fetchAuditLogs);
  const fetchCustomRoles = useStore(state => state.fetchCustomRoles);
  const createCustomRole = useStore(state => state.createCustomRole);
  const fetchSsoConfig = useStore(state => state.fetchSsoConfig);
  const updateSsoConfig = useStore(state => state.updateSsoConfig);
  const fetchIpPolicies = useStore(state => state.fetchIpPolicies);
  const createIpPolicy = useStore(state => state.createIpPolicy);
  const deleteIpPolicy = useStore(state => state.deleteIpPolicy);

  const [selectedSpaceId, setSelectedSpaceId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'security_center' | 'rbac' | 'sso' | 'ip_rules' | 'audit_timeline'>('security_center');

  // Form states
  const [newRoleName, setNewRoleName] = useState('');
  const [permissionsList, setPermissionsList] = useState<string[]>(['READ_TESTIMONIALS']);

  const [ssoProvider, setSsoProvider] = useState('OKTA');
  const [ssoEntryPoint, setSsoEntryPoint] = useState('');
  const [ssoIssuer, setSsoIssuer] = useState('');

  const [ipCidr, setIpCidr] = useState('');
  const [ipPolicyType, setIpPolicyType] = useState('WHITELIST');

  const [processing, setProcessing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  // Mock Org ID mapping
  const orgId = 'acme_enterprise_org_123';

  // Load details
  useEffect(() => {
    if (collections.length > 0) {
      setSelectedSpaceId(collections[0].id);
      loadEnterpriseData(orgId);
    }
  }, [collections]);

  const loadEnterpriseData = (organizationId: string) => {
    fetchOrganization(organizationId);
    fetchAuditLogs(organizationId);
    fetchCustomRoles(organizationId);
    fetchSsoConfig(organizationId);
    fetchIpPolicies(organizationId);
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;

    setProcessing(true);
    try {
      const success = await createCustomRole(orgId, newRoleName, permissionsList.join(','));
      if (success) {
        setNewRoleName('');
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      }
    } catch (err: any) {
      setErrorToast(err.message || 'Upgrade plan to access custom roles.');
      setTimeout(() => setErrorToast(null), 4000);
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdateSso = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const success = await updateSsoConfig(orgId, ssoProvider, ssoEntryPoint, ssoIssuer);
      if (success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      }
    } catch (err: any) {
      setErrorToast(err.message || 'Upgrade plan to configure SSO.');
      setTimeout(() => setErrorToast(null), 4000);
    } finally {
      setProcessing(false);
    }
  };

  const handleCreateIpPolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ipCidr.trim()) return;

    setProcessing(true);
    try {
      const success = await createIpPolicy(orgId, ipCidr, ipPolicyType);
      if (success) {
        setIpCidr('');
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      }
    } catch (err: any) {
      setErrorToast(err.message || 'Upgrade plan to configure whitelists.');
      setTimeout(() => setErrorToast(null), 4000);
    } finally {
      setProcessing(false);
    }
  };

  const handleDeleteIpPolicy = async (id: string) => {
    setProcessing(true);
    try {
      const success = await deleteIpPolicy(id);
      if (success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      }
    } catch (err: any) {
      setErrorToast(err.message || 'Policy revocation error.');
      setTimeout(() => setErrorToast(null), 4000);
    } finally {
      setProcessing(false);
    }
  };

  const togglePermission = (perm: string) => {
    if (permissionsList.includes(perm)) {
      setPermissionsList(permissionsList.filter(p => p !== perm));
    } else {
      setPermissionsList([...permissionsList, perm]);
    }
  };

  // Billing check
  const isEnterpriseUser = user?.tier === 'ENTERPRISE';

  return (
    <div className="flex-1 bg-[#09090B] flex flex-col min-w-0 text-slate-100 font-sans">
      
      {/* Toast Alert */}
      {saveSuccess && (
        <div className="fixed top-5 right-5 z-50 bg-brand-emerald text-white font-bold text-xs px-4 py-3 rounded-lg flex items-center space-x-2 shadow-2xl transition animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>Security configurations updated!</span>
        </div>
      )}
      {errorToast && (
        <div className="fixed top-5 right-5 z-50 bg-red-650 text-white font-bold text-xs px-4 py-3 rounded-lg flex items-center space-x-2 shadow-2xl transition animate-pulse">
          <AlertCircle className="w-4 h-4" />
          <span>{errorToast}</span>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-border-primary bg-[#09090B]/80 backdrop-blur sticky top-0 z-30 px-8 py-5 flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="font-extrabold text-lg text-white flex items-center space-x-2">
            <Shield className="w-5 h-5 text-brand-emerald" />
            <span>Enterprise Security & Compliance Center</span>
          </h1>
          <p className="text-[11px] text-muted-foreground">Audit user logs, Whitelist CIDR locations, establish SAML 2.0 Sso providers, and define Custom RBAC permission mappings.</p>
        </div>
      </header>

      <main className="p-8 space-y-6 max-w-6xl w-full text-left relative">
        
        {/* Tab Filters */}
        <div className="flex space-x-2 border-b border-border-primary/50 pb-2 select-none overflow-x-auto scrollbar-none">
          {[
            { id: 'security_center', label: 'Security Center', icon: <Shield className="w-3.5 h-3.5" /> },
            { id: 'rbac', label: 'Custom Roles RBAC', icon: <Users className="w-3.5 h-3.5" /> },
            { id: 'sso', label: 'Sso setup', icon: <Key className="w-3.5 h-3.5" /> },
            { id: 'ip_rules', label: 'IP Policies Whitelists', icon: <Globe className="w-3.5 h-3.5" /> },
            { id: 'audit_timeline', label: 'AuditsTimeline', icon: <Terminal className="w-3.5 h-3.5" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-1.5 text-xs font-black uppercase px-4 py-2 border rounded-lg transition cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-brand-emerald/10 text-brand-emerald border-brand-emerald/20'
                  : 'bg-[#18181B] text-slate-400 border-border-primary hover:text-white'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ─── UPGRADE PLAN OVERLAY IF NOT ENTERPRISE ───────────────────── */}
        {!isEnterpriseUser && (
          <div className="absolute inset-x-8 bottom-8 top-16 bg-black/75 backdrop-blur-md rounded-2xl z-40 flex flex-col items-center justify-center p-8 text-center space-y-6 border border-zinc-800/80">
            <Crown className="w-16 h-16 text-[#F59E0B] animate-pulse" />
            <div className="space-y-2 max-w-md">
              <h2 className="text-white text-lg font-black uppercase tracking-wider">Unlock Enterprise Suite Features</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect SAML providers, whitelist office network ranges, create granular roles, and track audit trails.
              </p>
            </div>
            <Link 
              href="/dashboard/settings" 
              className="bg-brand-emerald hover:opacity-95 text-white font-black text-xs px-6 py-3 rounded-lg shadow-xl transition"
            >
              Upgrade to Enterprise Plan
            </Link>
          </div>
        )}

        {/* TAB 1: SECURITY CENTER */}
        {activeTab === 'security_center' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            
            {/* Score card */}
            <div className="bg-[#18181B] border border-border-primary rounded-2xl p-6 shadow-xl flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase text-slate-450 tracking-wider block">Security Score</span>
                <span className="text-4xl font-black text-brand-emerald">92 / 100</span>
                <p className="text-xs text-slate-400 leading-relaxed">Your organization credentials and settings comply with SOC2 baseline standards.</p>
              </div>
              <div className="pt-4 border-t border-zinc-800 text-[10px] text-slate-400">
                ✔️ HTTPS Only enforced • SSL Certificate Active
              </div>
            </div>

            {/* Checklist details */}
            <div className="bg-[#18181B] border border-border-primary rounded-2xl p-6 shadow-xl md:col-span-2 space-y-4">
              <h3 className="text-white text-xs font-black uppercase tracking-wider border-b border-border-primary/50 pb-2">Active Security Checklist</h3>
              <div className="space-y-2.5">
                {[
                  { label: 'Multi-factor Authentication (MFA) Active', status: true },
                  { label: 'Single Sign-on (SSO) Okta routing connected', status: ssoConfig ? true : false },
                  { label: 'Active whitelist CIDR office locations', status: ipPolicies.length > 0 },
                  { label: 'Custom granular user role mapping configured', status: customRoles.length > 0 }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center space-x-2.5 text-xs">
                    {item.status ? (
                      <CheckCircle className="w-4 h-4 text-brand-emerald shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                    <span className={item.status ? 'text-slate-200' : 'text-slate-450'}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: CUSTOM ROLES RBAC */}
        {activeTab === 'rbac' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
            
            {/* Roles list */}
            <div className="lg:col-span-2 bg-[#18181B] border border-border-primary rounded-2xl p-6 space-y-4 shadow-xl">
              <h3 className="text-white text-xs font-black uppercase tracking-wider border-b border-border-primary/50 pb-2">Configured Custom Roles</h3>
              
              <div className="space-y-3">
                {customRoles.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-xs font-bold border border-dashed border-border-primary rounded-xl">
                    No custom roles configured yet. Establish one on the sidebar panel creator.
                  </div>
                ) : (
                  customRoles.map(role => (
                    <div key={role.id} className="bg-[#09090B] border border-border-primary rounded-xl p-4 space-y-2 hover:border-zinc-800 transition">
                      <span className="text-xs font-bold text-white block">{role.name}</span>
                      <div className="flex gap-1.5 flex-wrap">
                        {role.permissions.split(',').map((p, idx) => (
                          <span key={idx} className="text-[9px] bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/25 px-2 py-0.5 rounded font-mono font-black">{p}</span>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Custom role creator form */}
            <div className="bg-[#18181B] border border-border-primary rounded-2xl p-6 space-y-4 shadow-xl">
              <h3 className="text-white text-xs font-black uppercase tracking-wider border-b border-border-primary/50 pb-2">Create Custom Role</h3>
              <form onSubmit={handleCreateRole} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Role Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Content Moderator"
                    value={newRoleName}
                    onChange={(e) => setNewRoleName(e.target.value)}
                    className="w-full bg-[#09090B] border border-border-primary rounded-lg text-xs py-2 px-3 text-slate-200 focus:border-brand-emerald outline-none"
                  />
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Granular Permissions</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {[
                      { id: 'READ_TESTIMONIALS', label: 'Read space testimonials' },
                      { id: 'WRITE_TESTIMONIALS', label: 'Submit testimonials' },
                      { id: 'DELETE_TESTIMONIALS', label: 'Delete testimonials' },
                      { id: 'MANAGE_WIDGETS', label: 'Create/Edit Widget configurations' },
                      { id: 'MANAGE_DOMAINS', label: 'Connect Custom CNAME domains' }
                    ].map(perm => (
                      <label key={perm.id} className="flex items-center space-x-2.5 cursor-pointer text-xs">
                        <input
                          type="checkbox"
                          checked={permissionsList.includes(perm.id)}
                          onChange={() => togglePermission(perm.id)}
                          className="accent-brand-emerald"
                        />
                        <span className="text-slate-350">{perm.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={processing}
                  className="w-full bg-brand-emerald text-white hover:opacity-95 font-black text-xs py-2.5 rounded-lg flex items-center justify-center space-x-1 cursor-pointer transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Custom Role</span>
                </button>
              </form>
            </div>

          </div>
        )}

        {/* TAB 3: SSO SAML SETUP */}
        {activeTab === 'sso' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
            
            {/* Setup Form */}
            <div className="lg:col-span-2 bg-[#18181B] border border-border-primary rounded-2xl p-6 space-y-4 shadow-xl">
              <h3 className="text-white text-xs font-black uppercase tracking-wider border-b border-border-primary/50 pb-2">Single Sign-On Settings</h3>
              
              <form onSubmit={handleUpdateSso} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">SSO Provider *</label>
                  <select
                    value={ssoProvider}
                    onChange={(e) => setSsoProvider(e.target.value)}
                    className="w-full bg-[#09090B] border border-border-primary rounded-lg text-xs py-2 px-3 text-slate-200 focus:border-brand-emerald outline-none cursor-pointer"
                  >
                    <option value="OKTA">Okta SAML 2.0</option>
                    <option value="AUTH0">Auth0</option>
                    <option value="AZURE_AD">Microsoft Entra ID (Azure AD)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Identity Provider Entrypoint URL *</label>
                  <input
                    type="url"
                    required
                    placeholder="https://acme.okta.com/app/saml/..."
                    value={ssoEntryPoint}
                    onChange={(e) => setSsoEntryPoint(e.target.value)}
                    className="w-full bg-[#09090B] border border-border-primary rounded-lg text-xs py-2.5 px-3 text-slate-200 focus:border-brand-emerald outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Provider Issuer URI *</label>
                  <input
                    type="text"
                    required
                    placeholder="http://www.okta.com/exk..."
                    value={ssoIssuer}
                    onChange={(e) => setSsoIssuer(e.target.value)}
                    className="w-full bg-[#09090B] border border-border-primary rounded-lg text-xs py-2.5 px-3 text-slate-200 focus:border-brand-emerald outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={processing}
                  className="w-full bg-brand-emerald text-white hover:opacity-95 font-black text-xs py-2.5 rounded-lg flex items-center justify-center space-x-1 cursor-pointer transition"
                >
                  {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Update SSO configuration</span>}
                </button>
              </form>
            </div>

            {/* SSO instruction card */}
            <div className="bg-[#18181B] border border-border-primary rounded-2xl p-6 space-y-4 shadow-xl">
              <h3 className="text-white text-xs font-black uppercase tracking-wider border-b border-border-primary/50 pb-2">SSO Callback metadata</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">Provide these parameters inside your Okta/Azure dashboard setting fields:</p>
              
              <div className="space-y-3 font-mono text-[9px] bg-[#09090B] border border-border-primary rounded-xl p-4">
                <div>
                  <span className="text-slate-450 block uppercase font-bold">Assertion Consumer Service URL (ACS):</span>
                  <span className="text-slate-200">https://useproofly.vercel.app/api/auth/saml/callback</span>
                </div>
                <div>
                  <span className="text-slate-450 block uppercase font-bold">Entity ID:</span>
                  <span className="text-slate-200">urn:amazon:cognito:sp:useproofly_sp</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: IP WHITELISTS */}
        {activeTab === 'ip_rules' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
            
            {/* Whitelisted list */}
            <div className="lg:col-span-2 bg-[#18181B] border border-border-primary rounded-2xl p-6 space-y-4 shadow-xl">
              <h3 className="text-white text-xs font-black uppercase tracking-wider border-b border-border-primary/50 pb-2">Network IP Whitelist Policies</h3>
              
              <div className="space-y-3">
                {ipPolicies.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 text-xs font-bold border border-dashed border-border-primary rounded-xl">
                    No active whitelists CIDR ranges. Add one on the side setup form.
                  </div>
                ) : (
                  ipPolicies.map(pol => (
                    <div key={pol.id} className="bg-[#09090B] border border-border-primary rounded-xl p-4 flex items-center justify-between hover:border-zinc-800 transition">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-white font-mono block">{pol.cidr}</span>
                        <span className="text-[9px] bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/25 px-2 py-0.5 rounded font-black uppercase font-mono">{pol.type}</span>
                      </div>
                      
                      <button
                        onClick={() => handleDeleteIpPolicy(pol.id)}
                        className="bg-red-950/20 hover:bg-red-950/50 border border-red-900/20 p-2 rounded-lg text-red-400 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Whitelist form */}
            <div className="bg-[#18181B] border border-border-primary rounded-2xl p-6 space-y-4 shadow-xl">
              <h3 className="text-white text-xs font-black uppercase tracking-wider border-b border-border-primary/50 pb-2">Add IP Policy</h3>
              <form onSubmit={handleCreateIpPolicy} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">CIDR Address Range *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 192.168.1.0/24"
                    value={ipCidr}
                    onChange={(e) => setIpCidr(e.target.value)}
                    className="w-full bg-[#09090B] border border-border-primary rounded-lg text-xs py-2 px-3 text-slate-200 focus:border-brand-emerald outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Policy Type</label>
                  <select
                    value={ipPolicyType}
                    onChange={(e) => setIpPolicyType(e.target.value)}
                    className="w-full bg-[#09090B] border border-border-primary rounded-lg text-xs py-2 px-3 text-slate-200 focus:border-brand-emerald outline-none cursor-pointer"
                  >
                    <option value="WHITELIST">Whitelist access (Allow)</option>
                    <option value="BLACKLIST">Blacklist access (Block)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={processing}
                  className="w-full bg-brand-emerald text-white hover:opacity-95 font-black text-xs py-2.5 rounded-lg flex items-center justify-center space-x-1 cursor-pointer transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add IP Policy</span>
                </button>
              </form>
            </div>

          </div>
        )}

        {/* TAB 5: AUDIT TIMELINE */}
        {activeTab === 'audit_timeline' && (
          <div className="bg-[#18181B] border border-border-primary rounded-2xl p-6 space-y-4 shadow-xl text-left">
            <h3 className="text-white text-xs font-black uppercase tracking-wider border-b border-border-primary/50 pb-2">Audit Logs Trail</h3>
            
            <div className="overflow-x-auto select-none">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border-primary text-[10px] text-slate-400 font-black uppercase tracking-wider">
                    <th className="py-3 px-2">Actor</th>
                    <th className="py-3 px-2">Operation</th>
                    <th className="py-3 px-2">IP Address</th>
                    <th className="py-3 px-2">Device Info</th>
                    <th className="py-3 px-2">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-slate-500 font-bold">No audit logs recorded yet.</td>
                    </tr>
                  ) : (
                    auditLogs.map(log => (
                      <tr key={log.id} className="border-b border-border-primary/40 hover:bg-[#202024] transition font-mono">
                        <td className="py-3 px-2 text-white font-bold">{log.user ? log.user.name : 'Unknown User'}</td>
                        <td className="py-3 px-2 text-slate-200">{log.action}</td>
                        <td className="py-3 px-2 text-slate-400">{log.ipAddress || 'unknown'}</td>
                        <td className="py-3 px-2 text-slate-400 max-w-xs truncate">{log.deviceInfo || 'unknown'}</td>
                        <td className="py-3 px-2 text-slate-450">{new Date(log.createdAt).toLocaleString()}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

    </div>
  );
}
