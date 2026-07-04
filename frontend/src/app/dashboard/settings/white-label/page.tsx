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
  Mail
} from 'lucide-react';
import Link from 'next/link';

export default function WhiteLabelSettingsPage() {
  const user = useStore(state => state.user);
  const collections = useStore(state => state.collections); // spaces

  const whiteLabelConfig = useStore(state => state.whiteLabelConfig);
  const smtpConfig = useStore(state => state.smtpConfig);

  const fetchWhiteLabelConfig = useStore(state => state.fetchWhiteLabelConfig);
  const updateWhiteLabelConfig = useStore(state => state.updateWhiteLabelConfig);

  const fetchSmtpConfig = useStore(state => state.fetchSmtpConfig);
  const updateSmtpConfig = useStore(state => state.updateSmtpConfig);

  const verifyDomainDNS = useStore(state => state.verifyDomainDNS);

  const [selectedSpaceId, setSelectedSpaceId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'branding' | 'theme' | 'domains' | 'smtp'>('branding');

  // Form states
  const [brandName, setBrandName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [darkLogoUrl, setDarkLogoUrl] = useState('');
  const [faviconUrl, setFaviconUrl] = useState('');
  const [customCss, setCustomCss] = useState('');

  const [primaryColor, setPrimaryColor] = useState('#10B981');
  const [secondaryColor, setSecondaryColor] = useState('#8B5CF6');
  const [accentColor, setAccentColor] = useState('#06B6D4');

  const [customDomain, setCustomDomain] = useState('');
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');

  const [processing, setProcessing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  // Sync state data on load
  useEffect(() => {
    if (collections.length > 0) {
      const defaultSpace = collections[0].id;
      setSelectedSpaceId(defaultSpace);
      loadBrandingData(defaultSpace);
    }
  }, [collections]);

  const loadBrandingData = async (spaceId: string) => {
    const config = await fetchWhiteLabelConfig(spaceId);
    if (config) {
      setBrandName(config.brandName || '');
      setLogoUrl(config.logoUrl || '');
      setDarkLogoUrl(config.darkLogoUrl || '');
      setFaviconUrl(config.faviconUrl || '');
      setPrimaryColor(config.primaryColor || '#10B981');
      setSecondaryColor(config.secondaryColor || '#8B5CF6');
      setAccentColor(config.accentColor || '#06B6D4');
      setCustomCss(config.customCss || '');
    }

    const smtp = await fetchSmtpConfig(spaceId);
    if (smtp) {
      setSmtpHost(smtp.host || '');
      setSmtpPort(smtp.port || 587);
      setSmtpUser(smtp.username || '');
      setSenderName(smtp.senderName || '');
      setSenderEmail(smtp.senderEmail || '');
    }

    const space = collections.find(c => c.id === spaceId);
    if (space) {
      setCustomDomain(space.customDomain || '');
    }
  };

  const handleSpaceChange = (spaceId: string) => {
    setSelectedSpaceId(spaceId);
    loadBrandingData(spaceId);
  };

  const saveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const success = await updateWhiteLabelConfig(
        selectedSpaceId,
        brandName,
        logoUrl,
        darkLogoUrl,
        faviconUrl,
        primaryColor,
        secondaryColor,
        accentColor,
        customCss
      );
      if (success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      }
    } catch (err: any) {
      setErrorToast(err.message || 'Upgrade plan to access white label configurations.');
      setTimeout(() => setErrorToast(null), 4000);
    } finally {
      setProcessing(false);
    }
  };

  const saveSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const success = await updateSmtpConfig(
        selectedSpaceId,
        smtpHost,
        smtpPort,
        smtpUser,
        smtpPass,
        senderName,
        senderEmail
      );
      if (success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      }
    } catch (err: any) {
      setErrorToast(err.message || 'Upgrade plan to access SMTP configurations.');
      setTimeout(() => setErrorToast(null), 4000);
    } finally {
      setProcessing(false);
    }
  };

  const handleVerifyDomain = async () => {
    if (!customDomain.trim()) return;
    setProcessing(true);
    try {
      const res = await verifyDomainDNS(selectedSpaceId, customDomain);
      if (res) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
        loadBrandingData(selectedSpaceId);
      }
    } catch (err: any) {
      setErrorToast(err.message || 'Domain DNS verification error.');
      setTimeout(() => setErrorToast(null), 4000);
    } finally {
      setProcessing(false);
    }
  };

  // Find current space details
  const activeSpace = collections.find(c => c.id === selectedSpaceId);

  // Billing Tier Authorization check
  const isBusinessUser = user?.tier === 'BUSINESS' || user?.tier === 'ENTERPRISE';

  return (
    <div className="flex-1 bg-[#09090B] flex flex-col min-w-0 text-slate-100 font-sans">
      
      {/* Toast Alert */}
      {saveSuccess && (
        <div className="fixed top-5 right-5 z-50 bg-brand-emerald text-white font-bold text-xs px-4 py-3 rounded-lg flex items-center space-x-2 shadow-2xl transition animate-pulse">
          <CheckCircle2 className="w-4 h-4" />
          <span>Branding configurations updated!</span>
        </div>
      )}
      {errorToast && (
        <div className="fixed top-5 right-5 z-50 bg-red-600 text-white font-bold text-xs px-4 py-3 rounded-lg flex items-center space-x-2 shadow-2xl transition animate-pulse">
          <AlertCircle className="w-4 h-4" />
          <span>{errorToast}</span>
        </div>
      )}

      {/* Header */}
      <header className="border-b border-border-primary bg-[#09090B]/80 backdrop-blur sticky top-0 z-30 px-8 py-5 flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="font-extrabold text-lg text-white flex items-center space-x-2">
            <Crown className="w-5 h-5 text-[#8B5CF6]" />
            <span>White-Label Branding Settings</span>
          </h1>
          <p className="text-[11px] text-muted-foreground">Replace Proofly branding entirely, configure domains, customize themes, and send transactional email headers.</p>
        </div>
      </header>

      <main className="p-8 space-y-6 max-w-6xl w-full text-left relative">
        
        {/* Workspace selector */}
        <div className="flex items-center space-x-3 bg-[#18181B] border border-border-primary p-4 rounded-xl shadow-md w-full max-w-md">
          <label className="text-xs font-black uppercase text-slate-400 tracking-wider">Select Space:</label>
          <select
            value={selectedSpaceId}
            onChange={(e) => handleSpaceChange(e.target.value)}
            className="flex-1 bg-[#09090B] border border-border-primary rounded-lg text-xs font-semibold py-2 px-3 text-slate-200 focus:border-brand-emerald outline-none cursor-pointer"
          >
            {collections.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>

        {/* Tab Filters */}
        <div className="flex space-x-2 border-b border-border-primary/50 pb-2  overflow-x-auto scrollbar-none">
          {[
            { id: 'branding', label: 'Brand Assets', icon: <Layers className="w-3.5 h-3.5" /> },
            { id: 'theme', label: 'Color Identity', icon: <Palette className="w-3.5 h-3.5" /> },
            { id: 'domains', label: 'Custom Domain', icon: <Globe className="w-3.5 h-3.5" /> },
            { id: 'smtp', label: 'SMTP Email Router', icon: <Mail className="w-3.5 h-3.5" /> }
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

        {/* ─── UPGRADE PLAN OVERLAY IF NOT BUSINESS OR ENTERPRISE ───────────────────── */}
        {!isBusinessUser && (
          <div className="absolute inset-x-8 bottom-8 top-32 bg-black/75 backdrop-blur-md rounded-2xl z-40 flex flex-col items-center justify-center p-8 text-center space-y-6 border border-zinc-800/80">
            <Crown className="w-16 h-16 text-[#F59E0B] animate-pulse" />
            <div className="space-y-2 max-w-md">
              <h2 className="text-white text-lg font-black uppercase tracking-wider">Unlock Enterprise White-Labeling</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Remove "Powered by Proofly" labels, configure custom CNAME reviews subdomains, and send email request notifications directly through your SMTP servers.
              </p>
            </div>
            <Link 
              href="/dashboard/settings?tab=billing" 
              className="bg-[#8B5CF6] hover:bg-[#7c4fe3] text-white font-black text-xs px-6 py-3 rounded-lg shadow-xl shadow-purple-900/10 transition"
            >
              Upgrade to Business Plan
            </Link>
          </div>
        )}

        {/* TAB 1: BRAND ASSETS */}
        {activeTab === 'branding' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="bg-[#18181B] border border-border-primary rounded-2xl p-6 shadow-xl">
              <h3 className="text-white text-xs font-black uppercase tracking-wider border-b border-border-primary/50 pb-2">Edit Brand Assets</h3>
              <form onSubmit={saveBranding} className="space-y-4 pt-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Brand Custom Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Acme Inc"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    className="w-full bg-[#09090B] border border-border-primary rounded-lg text-xs py-2 px-3 text-slate-200 focus:border-brand-emerald outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Logo URL (Light Theme)</label>
                  <input
                    type="url"
                    placeholder="https://acme.com/logo-light.png"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    className="w-full bg-[#09090B] border border-border-primary rounded-lg text-xs py-2 px-3 text-slate-200 focus:border-brand-emerald outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Logo URL (Dark Theme)</label>
                  <input
                    type="url"
                    placeholder="https://acme.com/logo-dark.png"
                    value={darkLogoUrl}
                    onChange={(e) => setDarkLogoUrl(e.target.value)}
                    className="w-full bg-[#09090B] border border-border-primary rounded-lg text-xs py-2 px-3 text-slate-200 focus:border-brand-emerald outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Favicon Icon URL</label>
                  <input
                    type="url"
                    placeholder="https://acme.com/favicon.ico"
                    value={faviconUrl}
                    onChange={(e) => setFaviconUrl(e.target.value)}
                    className="w-full bg-[#09090B] border border-border-primary rounded-lg text-xs py-2 px-3 text-slate-200 focus:border-brand-emerald outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Custom CSS Injector</label>
                  <textarea
                    placeholder=".widget-card { box-shadow: none; }"
                    value={customCss}
                    onChange={(e) => setCustomCss(e.target.value)}
                    rows={3}
                    className="w-full bg-[#09090B] border border-border-primary rounded-lg text-xs py-2 px-3 text-slate-200 focus:border-brand-emerald outline-none font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={processing}
                  className="w-full bg-brand-emerald text-white hover:opacity-95 font-black text-xs py-2.5 rounded-lg flex items-center justify-center space-x-1 cursor-pointer transition"
                >
                  {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Save Assets</span>}
                </button>
              </form>
            </div>

            {/* Asset Preview Mock */}
            <div className="bg-[#18181B] border border-border-primary rounded-2xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-white text-xs font-black uppercase tracking-wider border-b border-border-primary/50 pb-2">Branded Header Preview</h3>
                <div className="bg-[#09090B] border border-border-primary rounded-xl p-4 mt-6 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="h-6 object-contain" />
                    ) : (
                      <div className="w-6 h-6 bg-zinc-800 rounded flex items-center justify-center font-black">A</div>
                    )}
                    <span className="font-extrabold text-white">{brandName || 'Acme Workspace'}</span>
                  </div>
                  <span className="text-[11px] bg-zinc-900 border border-zinc-850 px-2 py-0.5 rounded text-slate-450 uppercase">Dashboard</span>
                </div>
              </div>

              <div className="p-3 bg-brand-teal/5 border border-brand-teal/20 rounded-lg text-xs leading-relaxed text-slate-350">
                ℹ️ Upload valid image URLs hosted on external domain CDNs or Cloudinary to render logos custom sizes.
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COLOR IDENTITY */}
        {activeTab === 'theme' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="bg-[#18181B] border border-border-primary rounded-2xl p-6 shadow-xl">
              <h3 className="text-white text-xs font-black uppercase tracking-wider border-b border-border-primary/50 pb-2">Color Palette Configuration</h3>
              <form onSubmit={saveBranding} className="space-y-4 pt-3">
                
                <div className="flex items-center justify-between bg-zinc-900/60 p-3 rounded-lg border border-zinc-850">
                  <div className="space-y-0.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Primary Accent Color</label>
                    <span className="text-[10px] text-slate-450 font-mono block">{primaryColor}</span>
                  </div>
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-10 h-10 border-0 bg-transparent rounded cursor-pointer outline-none"
                  />
                </div>

                <div className="flex items-center justify-between bg-zinc-900/60 p-3 rounded-lg border border-zinc-850">
                  <div className="space-y-0.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Secondary Highlight Color</label>
                    <span className="text-[10px] text-slate-450 font-mono block">{secondaryColor}</span>
                  </div>
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-10 h-10 border-0 bg-transparent rounded cursor-pointer outline-none"
                  />
                </div>

                <div className="flex items-center justify-between bg-zinc-900/60 p-3 rounded-lg border border-zinc-850">
                  <div className="space-y-0.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Accent Details Color</label>
                    <span className="text-[10px] text-slate-450 font-mono block">{accentColor}</span>
                  </div>
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-10 h-10 border-0 bg-transparent rounded cursor-pointer outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={processing}
                  className="w-full bg-brand-emerald text-white hover:opacity-95 font-black text-xs py-2.5 rounded-lg flex items-center justify-center space-x-1 cursor-pointer transition"
                >
                  {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Apply Colors</span>}
                </button>
              </form>
            </div>

            {/* Widget Mock Render Preview */}
            <div className="bg-[#18181B] border border-border-primary rounded-2xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-white text-xs font-black uppercase tracking-wider border-b border-border-primary/50 pb-2">Branded Widget Component Preview</h3>
                
                <div className="bg-[#09090B] border border-border-primary rounded-2xl p-6 mt-6 space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-800" />
                    <div>
                      <span className="text-xs font-bold text-white block">John Doe</span>
                      <span className="text-[11px] text-slate-450 block">CTO, TechCorp</span>
                    </div>
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-350 italic">"The automated conversion attribution is absolutely game changing. Setup took two minutes."</p>
                  
                  {/* Branded elements mock */}
                  <div className="flex gap-2 pt-2">
                    <span 
                      style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
                      className="text-[11px] font-bold px-2 py-0.5 rounded-full border border-current"
                    >
                      Verified Reviewer
                    </span>
                    <span 
                      style={{ backgroundColor: `${secondaryColor}15`, color: secondaryColor }}
                      className="text-[11px] font-bold px-2 py-0.5 rounded-full border border-current"
                    >
                      Featured
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CUSTOM DOMAIN */}
        {activeTab === 'domains' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Domain info & verifier */}
            <div className="lg:col-span-2 bg-[#18181B] border border-border-primary rounded-2xl p-6 space-y-4 shadow-xl">
              <h3 className="text-white text-xs font-black uppercase tracking-wider border-b border-border-primary/50 pb-2">Configure Review Domain</h3>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="love.acme.com"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    className="flex-1 bg-[#09090B] border border-border-primary rounded-lg text-xs py-2 px-3 text-slate-200 focus:border-brand-emerald outline-none"
                  />
                  <button
                    onClick={handleVerifyDomain}
                    disabled={processing}
                    className="bg-brand-emerald text-white hover:opacity-95 font-black text-xs px-5 rounded-lg transition cursor-pointer"
                  >
                    {processing ? '...' : 'Verify DNS'}
                  </button>
                </div>

                {activeSpace && activeSpace.customDomain && (
                  <div className="p-4 bg-brand-emerald/5 border border-brand-emerald/20 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-brand-emerald" />
                      <div>
                        <span className="font-extrabold text-white block">Domain connected successfully!</span>
                        <a 
                          href={`https://${activeSpace.customDomain}`} 
                          target="_blank" 
                          className="text-[10px] text-brand-teal underline flex items-center space-x-1.5 pt-0.5"
                        >
                          <span>Visit page</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                    <span className="text-[11px] bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/25 px-2 py-0.5 rounded-full font-bold uppercase">Active</span>
                  </div>
                )}

                {activeSpace && activeSpace.domainStatus === 'FAILED' && (
                  <div className="p-4 bg-red-600/5 border border-red-900/20 rounded-xl flex items-center space-x-2 text-xs">
                    <XCircle className="w-5 h-5 text-red-400" />
                    <div>
                      <span className="font-extrabold text-white block">Verification failed.</span>
                      <p className="text-[10px] text-slate-400">DNS propagation can take up to 24 hours. Ensure records match exactly.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* DNS details card */}
            <div className="bg-[#18181B] border border-border-primary rounded-2xl p-6 space-y-4 shadow-xl text-left">
              <h3 className="text-white text-xs font-black uppercase tracking-wider border-b border-border-primary/50 pb-2">DNS verification instructions</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">Add CNAME records inside your hosting dashboard (Cloudflare, GoDaddy, Vercel):</p>
              
              <div className="space-y-3 font-mono text-[11px] bg-[#09090B] border border-border-primary rounded-xl p-4">
                <div>
                  <span className="text-slate-450 block uppercase font-bold">Type:</span>
                  <span className="text-slate-200">CNAME</span>
                </div>
                <div>
                  <span className="text-slate-450 block uppercase font-bold">Host / Name:</span>
                  <span className="text-slate-200">{customDomain ? customDomain.split('.')[0] : 'reviews'}</span>
                </div>
                <div>
                  <span className="text-slate-450 block uppercase font-bold">Target Value:</span>
                  <span className="text-slate-200">cname.useproofly.com</span>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: SMTP EMAIL ROUTER */}
        {activeTab === 'smtp' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
            
            {/* SMTP form */}
            <div className="lg:col-span-2 bg-[#18181B] border border-border-primary rounded-2xl p-6 space-y-4 shadow-xl">
              <h3 className="text-white text-xs font-black uppercase tracking-wider border-b border-border-primary/50 pb-2">SMTP Mailer Settings</h3>
              
              <form onSubmit={saveSmtp} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">SMTP Host *</label>
                  <input
                    type="text"
                    required
                    placeholder="smtp.resend.com"
                    value={smtpHost}
                    onChange={(e) => setSmtpHost(e.target.value)}
                    className="w-full bg-[#09090B] border border-border-primary rounded-lg text-xs py-2 px-3 text-slate-200 focus:border-brand-emerald outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">SMTP Port *</label>
                  <input
                    type="number"
                    required
                    placeholder="587"
                    value={smtpPort}
                    onChange={(e) => setSmtpPort(Number(e.target.value))}
                    className="w-full bg-[#09090B] border border-border-primary rounded-lg text-xs py-2 px-3 text-slate-200 focus:border-brand-emerald outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Username *</label>
                  <input
                    type="text"
                    required
                    placeholder="smtp_username"
                    value={smtpUser}
                    onChange={(e) => setSmtpUser(e.target.value)}
                    className="w-full bg-[#09090B] border border-border-primary rounded-lg text-xs py-2 px-3 text-slate-200 focus:border-brand-emerald outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••••"
                    value={smtpPass}
                    onChange={(e) => setSmtpPass(e.target.value)}
                    className="w-full bg-[#09090B] border border-border-primary rounded-lg text-xs py-2 px-3 text-slate-200 focus:border-brand-emerald outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Sender Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Success Team"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                    className="w-full bg-[#09090B] border border-border-primary rounded-lg text-xs py-2 px-3 text-slate-200 focus:border-brand-emerald outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Sender Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="reviews@acme.com"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    className="w-full bg-[#09090B] border border-border-primary rounded-lg text-xs py-2 px-3 text-slate-200 focus:border-brand-emerald outline-none"
                  />
                </div>

                <div className="md:col-span-2 pt-2">
                  <button
                    type="submit"
                    disabled={processing}
                    className="w-full bg-brand-emerald text-white hover:opacity-95 font-black text-xs py-2.5 rounded-lg flex items-center justify-center space-x-1 cursor-pointer transition"
                  >
                    {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Apply SMTP configuration</span>}
                  </button>
                </div>
              </form>
            </div>

            {/* SMTP info card */}
            <div className="bg-[#18181B] border border-border-primary rounded-2xl p-6 space-y-4 shadow-xl text-left">
              <h3 className="text-white text-xs font-black uppercase tracking-wider border-b border-border-primary/50 pb-2">SMTP Mail routing info</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">By connecting your SMTP credentials, Proofly sends invitation links and receipt invoices directly using your email address domains.</p>
              <div className="p-3 bg-yellow-600/5 border border-yellow-600/25 rounded-lg text-xs text-yellow-300">
                ⚠️ Ensure your SPF & DKIM records authorize SMTP host relays for reviews.
              </div>
            </div>

          </div>
        )}

      </main>

    </div>
  );
}
