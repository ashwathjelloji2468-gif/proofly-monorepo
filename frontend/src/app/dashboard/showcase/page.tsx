'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { 
  Heart, 
  Sparkles, 
  LayoutGrid, 
  Columns, 
  Sliders, 
  List, 
  Code, 
  Copy, 
  Eye, 
  Settings, 
  Check, 
  Filter, 
  Star,
  Activity,
  Laptop,
  Globe,
  Plus,
  ChevronLeft,
  Settings2,
  Lock,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export default function ShowcaseDashboardPage() {
  const user = useStore(state => state.user);
  const collections = useStore(state => state.collections); // spaces list
  const showcaseSettings = useStore(state => state.showcaseSettings);
  const showcaseAnalytics = useStore(state => state.showcaseAnalytics);

  const fetchShowcaseSettings = useStore(state => state.fetchShowcaseSettings);
  const updateShowcaseSettings = useStore(state => state.updateShowcaseSettings);
  const fetchShowcaseAnalytics = useStore(state => state.fetchShowcaseAnalytics);

  const [selectedSpaceId, setSelectedSpaceId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'editor' | 'analytics'>('editor');

  // Form States
  const [headline, setHeadline] = useState('Our Wall of Love');
  const [subheadline, setSubheadline] = useState('See what our customers say about us.');
  const [ctaText, setCtaText] = useState('Leave a Review');
  const [ctaUrl, setCtaUrl] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [layout, setLayout] = useState('MASONRY');
  const [theme, setTheme] = useState('DARK');
  const [customCss, setCustomCss] = useState('');
  const [showBranding, setShowBranding] = useState(true);
  const [metaTitle, setMetaTitle] = useState('Customer Reviews & Testimonials');
  const [metaDescription, setMetaDescription] = useState('Check out our customer testimonials.');
  const [status, setStatus] = useState('ACTIVE');

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Load spaces on mount
  useEffect(() => {
    if (collections.length > 0) {
      const defaultSpace = collections[0].id;
      setSelectedSpaceId(defaultSpace);
      fetchShowcaseSettings(defaultSpace);
      fetchShowcaseAnalytics(defaultSpace);
    }
  }, [collections, fetchShowcaseSettings, fetchShowcaseAnalytics]);

  const handleSpaceChange = (spaceId: string) => {
    setSelectedSpaceId(spaceId);
    fetchShowcaseSettings(spaceId);
    fetchShowcaseAnalytics(spaceId);
  };

  // Sync settings when loaded
  useEffect(() => {
    if (showcaseSettings) {
      setHeadline(showcaseSettings.headline);
      setSubheadline(showcaseSettings.subheadline);
      setCtaText(showcaseSettings.ctaText);
      setCtaUrl(showcaseSettings.ctaUrl);
      setLogoUrl(showcaseSettings.logoUrl || '');
      setCoverImageUrl(showcaseSettings.coverImageUrl || '');
      setLayout(showcaseSettings.layout);
      setTheme(showcaseSettings.theme);
      setCustomCss(showcaseSettings.customCss || '');
      setShowBranding(showcaseSettings.showBranding);
      setMetaTitle(showcaseSettings.metaTitle);
      setMetaDescription(showcaseSettings.metaDescription);
      setStatus(showcaseSettings.status);
    }
  }, [showcaseSettings]);

  const handleSave = async () => {
    try {
      const payload: any = {
        headline,
        subheadline,
        ctaText,
        ctaUrl,
        logoUrl: logoUrl || null,
        coverImageUrl: coverImageUrl || null,
        layout,
        theme,
        customCss: customCss || null,
        showBranding,
        metaTitle,
        metaDescription,
        status
      };

      if (user?.tier === 'FREE') {
        payload.showBranding = true;
      }

      await updateShowcaseSettings(selectedSpaceId, payload);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (e: any) {
      setErrorToast(e.message || 'Failed to save showcase configurations.');
      setTimeout(() => setErrorToast(null), 4000);
    }
  };

  const copyShowcaseLink = () => {
    const space = collections.find(c => c.id === selectedSpaceId);
    if (!space) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://useproofly.com';
    const link = `${origin}/wall/${space.slug}`;
    navigator.clipboard.writeText(link);
    setCopiedId('url');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex-1 bg-[#09090B] flex flex-col min-w-0 text-slate-100 font-sans">
      
      {/* Toast notifications */}
      {saveSuccess && (
        <div className="fixed top-5 right-5 z-50 bg-brand-emerald text-white font-bold text-xs px-4 py-3 rounded-lg flex items-center space-x-2 shadow-2xl transition animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>Showcase configurations saved!</span>
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
            <Heart className="w-5 h-5 text-brand-emerald fill-brand-emerald/10" />
            <span>Public Showcase Wall</span>
          </h1>
          <p className="text-[11px] text-muted-foreground">Configure and design your workspace public reviews gallery.</p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={copyShowcaseLink}
            className="bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-slate-200 font-bold text-xs py-2 px-4 rounded-lg flex items-center space-x-1.5 transition cursor-pointer"
          >
            {copiedId === 'url' ? <Check className="w-3.5 h-3.5 text-brand-emerald" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedId === 'url' ? 'Link Copied!' : 'Copy Wall URL'}</span>
          </button>

          {collections.find(c => c.id === selectedSpaceId) && (
            <a
              href={`/wall/${collections.find(c => c.id === selectedSpaceId)?.slug}`}
              target="_blank"
              rel="noreferrer"
              className="bg-brand-emerald text-white hover:opacity-95 font-bold text-xs py-2 px-4 rounded-lg flex items-center space-x-1.5 transition cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Wall</span>
            </a>
          )}
        </div>
      </header>

      <main className="p-8 space-y-6 max-w-6xl w-full text-left">
        {/* Workspace filtering dropdown */}
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

        {/* Tab filters */}
        <div className="flex space-x-2 border-b border-border-primary/50 pb-2 select-none">
          <button
            onClick={() => setActiveTab('editor')}
            className={`text-xs font-black uppercase px-4 py-2 border rounded-lg transition cursor-pointer ${
              activeTab === 'editor'
                ? 'bg-brand-emerald/10 text-brand-emerald border-brand-emerald/20'
                : 'bg-[#18181B] text-slate-400 border-border-primary hover:text-white'
            }`}
          >
            Showcase Customizer
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`text-xs font-black uppercase px-4 py-2 border rounded-lg transition cursor-pointer ${
              activeTab === 'analytics'
                ? 'bg-brand-emerald/10 text-brand-emerald border-brand-emerald/20'
                : 'bg-[#18181B] text-slate-400 border-border-primary hover:text-white'
            }`}
          >
            Response Analytics
          </button>
        </div>

        {/* Tab 1: Customizer */}
        {activeTab === 'editor' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Editor form panel */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Header options */}
              <div className="bg-[#18181B] border border-border-primary rounded-2xl p-6 space-y-4 shadow-xl">
                <h3 className="text-white text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 border-b border-border-primary/50 pb-2">
                  <Settings2 className="w-4 h-4 text-brand-emerald" />
                  <span>Hero Configurations</span>
                </h3>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Hero Headline</label>
                    <input 
                      type="text" 
                      value={headline}
                      onChange={(e) => setHeadline(e.target.value)}
                      placeholder="e.g. Our Wall of Love"
                      className="w-full bg-[#09090B] border border-border-primary rounded-lg text-xs py-2 px-3 text-slate-200 focus:border-brand-emerald outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Hero Subheadline</label>
                    <textarea
                      rows={3}
                      value={subheadline}
                      onChange={(e) => setSubheadline(e.target.value)}
                      placeholder="e.g. See what our customers say about us."
                      className="w-full bg-[#09090B] border border-border-primary rounded-lg text-xs py-2 px-3 text-slate-200 focus:border-brand-emerald outline-none resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">CTA Button Text</label>
                      <input 
                        type="text" 
                        value={ctaText}
                        onChange={(e) => setCtaText(e.target.value)}
                        placeholder="Leave a review"
                        className="w-full bg-[#09090B] border border-border-primary rounded-lg text-xs py-2 px-3 text-slate-200 focus:border-brand-emerald outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase">CTA Redirection Link</label>
                      <input 
                        type="text" 
                        value={ctaUrl}
                        onChange={(e) => setCtaUrl(e.target.value)}
                        placeholder="/collect/space"
                        className="w-full bg-[#09090B] border border-border-primary rounded-lg text-xs py-2 px-3 text-slate-200 focus:border-brand-emerald outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Design parameters */}
              <div className="bg-[#18181B] border border-border-primary rounded-2xl p-6 space-y-4 shadow-xl">
                <h3 className="text-white text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 border-b border-border-primary/50 pb-2">
                  <Sparkles className="w-4 h-4 text-brand-teal" />
                  <span>Layout & Aesthetics</span>
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Layout Style</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['MASONRY', 'CLASSIC', 'CAROUSEL', 'MINIMAL'].map(lay => (
                        <button
                          key={lay}
                          onClick={() => setLayout(lay)}
                          className={`text-[10px] py-2 border rounded-lg transition font-bold ${
                            layout === lay
                              ? 'bg-brand-emerald/10 text-brand-emerald border-brand-emerald/30'
                              : 'bg-[#09090B] text-slate-400 border-border-primary hover:text-white'
                          }`}
                        >
                          {lay}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Color Theme</label>
                    <div className="grid grid-cols-2 gap-2">
                      {['DARK', 'LIGHT', 'GLASSMORPHISM', 'GRADIENT'].map(t => (
                        <button
                          key={t}
                          onClick={() => setTheme(t)}
                          className={`text-[10px] py-2 border rounded-lg transition font-bold ${
                            theme === t
                              ? 'bg-brand-teal/15 text-brand-teal border-brand-teal/30'
                              : 'bg-[#09090B] text-slate-400 border-border-primary hover:text-white'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-3 border-t border-border-primary/50">
                  <label className="flex items-center justify-between cursor-pointer group text-xs text-slate-350 hover:text-white transition">
                    <span>Show Proofly Branding watermark footer</span>
                    <input 
                      type="checkbox" 
                      checked={showBranding}
                      disabled={user?.tier === 'FREE'}
                      onChange={(e) => setShowBranding(e.target.checked)}
                      className="accent-brand-emerald cursor-pointer disabled:opacity-50"
                    />
                  </label>
                  {user?.tier === 'FREE' && (
                    <div className="p-2 rounded bg-yellow-500/10 border border-yellow-500/20 text-[9px] text-yellow-450 font-bold leading-relaxed">
                      🌟 Removing Proofly logo requires upgrading to the **PRO** plan.
                    </div>
                  )}
                </div>
              </div>

              {/* Advanced SEO Metatags */}
              <div className="bg-[#18181B] border border-border-primary rounded-2xl p-6 space-y-4 shadow-xl">
                <h3 className="text-white text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 border-b border-border-primary/50 pb-2">
                  <Globe className="w-4 h-4 text-[#8B5CF6]" />
                  <span>Showcase SEO Metadata</span>
                </h3>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Meta Title Tag</label>
                    <input 
                      type="text" 
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                      placeholder="e.g. Real customer testimonials & reviews"
                      className="w-full bg-[#09090B] border border-border-primary rounded-lg text-xs py-2 px-3 text-slate-200 focus:border-brand-emerald outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Meta Description</label>
                    <textarea 
                      rows={3} 
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                      placeholder="Meta descriptions summary..."
                      className="w-full bg-[#09090B] border border-border-primary rounded-lg text-xs py-2 px-3 text-slate-200 focus:border-brand-emerald outline-none resize-none"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleSave}
                className="bg-gradient-to-r from-brand-emerald to-brand-teal text-white hover:opacity-95 font-black text-xs py-3 px-8 rounded-xl shadow-lg shadow-brand-emerald/10 cursor-pointer"
              >
                Save Settings
              </button>

            </div>

            {/* Sidebar quick preview and settings controls */}
            <div className="space-y-6">
              <div className="bg-[#18181B] border border-border-primary rounded-2xl p-6 space-y-4 shadow-xl text-left">
                <h3 className="text-white text-xs font-black uppercase tracking-wider border-b border-border-primary/50 pb-2">Showcase Status</h3>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-350">Status Visibility</span>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="bg-[#09090B] border border-border-primary rounded-lg text-xs font-semibold py-1.5 px-3 text-slate-200 focus:border-brand-emerald outline-none cursor-pointer"
                  >
                    <option value="ACTIVE">Public / Active</option>
                    <option value="DRAFT">Offline / Disabled</option>
                  </select>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Analytics */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            {showcaseAnalytics ? (
              <>
                {/* Scorecards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Page Views', value: showcaseAnalytics.views, icon: <Eye className="w-4 h-4 text-brand-emerald" /> },
                    { label: 'Unique Visitors', value: showcaseAnalytics.visitors, icon: <Globe className="w-4 h-4 text-brand-teal" /> },
                    { label: 'Social Shares', value: showcaseAnalytics.shares, icon: <Heart className="w-4 h-4 text-[#8B5CF6]" /> },
                    { label: 'Share CTR', value: showcaseAnalytics.ctr + '%', icon: <Activity className="w-4 h-4 text-[#EC4899]" /> }
                  ].map(stat => (
                    <div key={stat.label} className="bg-[#18181B] border border-border-primary p-5 rounded-xl shadow-lg flex flex-col justify-between h-28 hover:border-zinc-800 transition">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] text-slate-400 uppercase font-black tracking-wider">{stat.label}</span>
                        {stat.icon}
                      </div>
                      <div className="text-2xl font-black text-white">{stat.value}</div>
                    </div>
                  ))}
                </div>

                {/* Country, devices lists */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Device Types */}
                  <div className="bg-[#18181B] border border-border-primary p-6 rounded-xl space-y-4 shadow-xl">
                    <h3 className="text-white text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 border-b border-border-primary/50 pb-2">
                      <Laptop className="w-4 h-4 text-brand-emerald" />
                      <span>Device Types</span>
                    </h3>
                    <div className="space-y-3 pt-2">
                      {showcaseAnalytics.devices.length === 0 ? (
                        <div className="text-xs text-muted-foreground py-4">No data logged yet.</div>
                      ) : (
                        showcaseAnalytics.devices.map(dev => (
                          <div key={dev.device} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-350">{dev.device}</span>
                              <span className="text-slate-200 font-bold">{dev.count}</span>
                            </div>
                            <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-brand-emerald" 
                                style={{ width: `${Math.min((dev.count / Math.max(...showcaseAnalytics.devices.map(d => d.count), 1)) * 100, 100)}%` }}
                              />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Browsers */}
                  <div className="bg-[#18181B] border border-border-primary p-6 rounded-xl space-y-4 shadow-xl">
                    <h3 className="text-white text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 border-b border-border-primary/50 pb-2">
                      <Globe className="w-4 h-4 text-brand-teal" />
                      <span>Browser Metrics</span>
                    </h3>
                    <div className="space-y-3 pt-2">
                      {showcaseAnalytics.browsers.length === 0 ? (
                        <div className="text-xs text-muted-foreground py-4">No data logged yet.</div>
                      ) : (
                        showcaseAnalytics.browsers.map(b => (
                          <div key={b.browser} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-350">{b.browser}</span>
                              <span className="text-slate-200 font-bold">{b.count}</span>
                            </div>
                            <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-brand-teal" 
                                style={{ width: `${Math.min((b.count / Math.max(...showcaseAnalytics.browsers.map(d => d.count), 1)) * 100, 100)}%` }}
                              />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Countries */}
                  <div className="bg-[#18181B] border border-border-primary p-6 rounded-xl space-y-4 shadow-xl">
                    <h3 className="text-white text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 border-b border-border-primary/50 pb-2">
                      <Globe className="w-4 h-4 text-[#8B5CF6]" />
                      <span>Geography</span>
                    </h3>
                    <div className="space-y-3 pt-2">
                      {showcaseAnalytics.countries.length === 0 ? (
                        <div className="text-xs text-muted-foreground py-4">No data logged yet.</div>
                      ) : (
                        showcaseAnalytics.countries.map(c => (
                          <div key={c.country} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-350">{c.country}</span>
                              <span className="text-slate-200 font-bold">{c.count}</span>
                            </div>
                            <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-[#8B5CF6]" 
                                style={{ width: `${Math.min((c.count / Math.max(...showcaseAnalytics.countries.map(d => d.count), 1)) * 100, 100)}%` }}
                              />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-24 text-center text-xs text-slate-500 font-bold">Querying wall response telemetries...</div>
            )}
          </div>
        )}
      </main>

    </div>
  );
}
