'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { 
  Code, 
  Sparkles, 
  Copy, 
  Check, 
  Layout as LayoutIcon, 
  Smartphone, 
  Tablet, 
  Monitor, 
  Eye, 
  Settings as SettingsIcon, 
  Star, 
  Trash2, 
  Plus, 
  ChevronLeft, 
  Activity, 
  Laptop, 
  Globe, 
  Play, 
  MousePointer, 
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

interface WidgetSettings {
  minRating: number;
  onlyVideo: boolean;
  onlyText: boolean;
  featuredOnly: boolean;
  maxTestimonials: number;
  sortBy: 'newest' | 'oldest' | 'random';
  showAvatar: boolean;
  showCompany: boolean;
  showRating: boolean;
  showVideo: boolean;
  showDate: boolean;
  showVerifiedBadge: boolean;
  showProoflyBranding: boolean;
  primaryColor: string;
  textColor: string;
  cardColor: string;
  backgroundColor: string;
  borderRadius: string; // "0px", "8px", "16px", "30px"
  shadowType: 'none' | 'sm' | 'md' | 'lg';
  darkLightMode: 'dark' | 'light';
  autoplay: boolean;
  autoplaySpeed: number;
  popupDelay: number;
  customCss?: string;
}

const DEFAULT_SETTINGS: WidgetSettings = {
  minRating: 1,
  onlyVideo: false,
  onlyText: false,
  featuredOnly: false,
  maxTestimonials: 20,
  sortBy: 'newest',
  showAvatar: true,
  showCompany: true,
  showRating: true,
  showVideo: true,
  showDate: true,
  showVerifiedBadge: true,
  showProoflyBranding: true,
  primaryColor: '#10B981',
  textColor: '#E4E4E7',
  cardColor: '#18181B',
  backgroundColor: '#09090B',
  borderRadius: '8px',
  shadowType: 'md',
  darkLightMode: 'dark',
  autoplay: true,
  autoplaySpeed: 4000,
  popupDelay: 3000,
  customCss: ''
};

export default function WidgetsPage() {
  const user = useStore(state => state.user);
  const collections = useStore(state => state.collections);
  const testimonials = useStore(state => state.testimonials);
  const widgets = useStore(state => state.widgets);
  const widgetAnalytics = useStore(state => state.widgetAnalytics);

  const fetchWidgets = useStore(state => state.fetchWidgets);
  const createWidget = useStore(state => state.createWidget);
  const updateWidget = useStore(state => state.updateWidget);
  const deleteWidget = useStore(state => state.deleteWidget);
  const fetchWidgetAnalytics = useStore(state => state.fetchWidgetAnalytics);

  // UI state
  const [selectedSpaceId, setSelectedSpaceId] = useState<string>('');
  const [activeView, setActiveView] = useState<'list' | 'builder' | 'analytics'>('list');
  const [activeWidgetId, setActiveWidgetId] = useState<string | null>(null);
  
  // Builder state
  const [widgetName, setWidgetName] = useState('');
  const [widgetLayout, setWidgetLayout] = useState<'CAROUSEL' | 'MASONRY' | 'SINGLE' | 'POPUP' | 'FLOATING' | 'WALL'>('MASONRY');
  const [widgetTheme, setWidgetTheme] = useState<'LIGHT' | 'DARK' | 'CUSTOM'>('DARK');
  const [widgetSettings, setWidgetSettings] = useState<WidgetSettings>(DEFAULT_SETTINGS);
  
  // Preview frame layout
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  // Active guide instructions platform
  const [guidePlatform, setGuidePlatform] = useState<'html' | 'react' | 'nextjs' | 'wordpress' | 'webflow'>('html');

  // Load spaces and widgets
  useEffect(() => {
    if (collections.length > 0) {
      const defaultSpace = collections[0].id;
      setSelectedSpaceId(defaultSpace);
      fetchWidgets(defaultSpace);
    }
  }, [collections, fetchWidgets]);

  const handleSpaceChange = (spaceId: string) => {
    setSelectedSpaceId(spaceId);
    fetchWidgets(spaceId);
  };

  const handleCreateNew = async () => {
    // Check tier limits for Free users (limit to 1 widget)
    if (user?.tier === 'FREE') {
      const widgetCount = widgets.length;
      if (widgetCount >= 1) {
        setErrorToast('Free tier is limited to 1 widget. Please upgrade to Pro.');
        setTimeout(() => setErrorToast(null), 4000);
        return;
      }
    }

    try {
      const newWidget = await createWidget(
        selectedSpaceId,
        'My Testimonials Widget',
        'MASONRY',
        'DARK',
        JSON.stringify(DEFAULT_SETTINGS)
      );
      if (newWidget) {
        handleEdit(newWidget.id);
      }
    } catch (e: any) {
      setErrorToast(e.message || 'Failed to create widget');
      setTimeout(() => setErrorToast(null), 4000);
    }
  };

  const handleEdit = (widgetId: string) => {
    const w = widgets.find(item => item.id === widgetId);
    if (!w) return;
    setActiveWidgetId(w.id);
    setWidgetName(w.name);
    setWidgetLayout(w.layout as any);
    setWidgetTheme(w.theme as any);
    
    let parsedSettings = DEFAULT_SETTINGS;
    try {
      parsedSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(w.settings) };
    } catch(e) {}
    
    // Force branding for FREE tier
    if (user?.tier === 'FREE') {
      parsedSettings.showProoflyBranding = true;
    }

    setWidgetSettings(parsedSettings);
    setActiveView('builder');
  };

  const handleSave = async () => {
    if (!activeWidgetId) return;
    try {
      const payloadSettings = { ...widgetSettings };
      if (user?.tier === 'FREE') {
        payloadSettings.showProoflyBranding = true;
      }

      await updateWidget(activeWidgetId, {
        name: widgetName,
        layout: widgetLayout,
        theme: widgetTheme,
        settings: JSON.stringify(payloadSettings)
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (e: any) {
      setErrorToast(e.message || 'Failed to update settings');
      setTimeout(() => setErrorToast(null), 4000);
    }
  };

  const handleDelete = async (widgetId: string) => {
    if (confirm('Are you sure you want to delete this widget? This action is permanent.')) {
      await deleteWidget(widgetId);
    }
  };

  const handleViewAnalytics = (widgetId: string) => {
    setActiveWidgetId(widgetId);
    fetchWidgetAnalytics(widgetId);
    setActiveView('analytics');
  };

  const copyEmbedCode = (widgetId: string) => {
    // Dynamically resolve URL
    const host = typeof window !== 'undefined' ? window.location.origin : 'https://useproofly.com';
    const code = `<script src="${host}/widget.js" data-widget="${widgetId}" defer></script>\n<div class="proofly-widget" data-widget="${widgetId}"></div>`;
    navigator.clipboard.writeText(code);
    setCopiedId(widgetId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Preview filtering logic simulation
  const getFilteredPreviewTestimonials = () => {
    let list = [...testimonials];
    
    // Only approved
    list = list.filter(t => t.status === 'approved');

    // Rating filter
    list = list.filter(t => t.rating >= widgetSettings.minRating);

    // Type filter
    if (widgetSettings.onlyVideo) {
      list = list.filter(t => t.video_url);
    } else if (widgetSettings.onlyText) {
      list = list.filter(t => !t.video_url);
    }

    // Featured only
    if (widgetSettings.featuredOnly) {
      // Simulate featured via rating or index
      list = list.filter(t => t.rating === 5);
    }

    // Sorting
    if (widgetSettings.sortBy === 'oldest') {
      list = list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (widgetSettings.sortBy === 'random') {
      list = list.sort(() => Math.random() - 0.5);
    } else {
      list = list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    // Limits
    const limit = user?.tier === 'FREE' ? Math.min(widgetSettings.maxTestimonials, 25) : widgetSettings.maxTestimonials;
    return list.slice(0, limit);
  };

  const previewTestimonials = getFilteredPreviewTestimonials();

  // Install guides codes
  const getGuideCode = () => {
    const host = typeof window !== 'undefined' ? window.location.origin : 'https://useproofly.com';
    const id = activeWidgetId || 'WIDGET_ID';
    
    switch (guidePlatform) {
      case 'html':
        return `<!-- Place this in the head or right before closing body tag -->\n<script src="${host}/widget.js" data-widget="${id}" defer></script>\n\n<!-- Place this where you want the widget to render -->\n<div class="proofly-widget" data-widget="${id}"></div>`;
      case 'react':
        return `import React, { useEffect } from 'react';\n\nexport default function ProoflyWidget() {\n  useEffect(() => {\n    const script = document.createElement('script');\n    script.src = '${host}/widget.js';\n    script.async = true;\n    document.body.appendChild(script);\n    return () => {\n      document.body.removeChild(script);\n    };\n  }, []);\n\n  return <div className="proofly-widget" data-widget="${id}" />;\n}`;
      case 'nextjs':
        return `import Script from 'next/script';\n\nexport default function Page() {\n  return (\n    <>\n      <Script src="${host}/widget.js" strategy="afterInteractive" />\n      <div className="proofly-widget" data-widget="${id}" />\n    </>\n  );\n}`;
      case 'wordpress':
        return `1. Edit your page/post in WordPress.\n2. Add a Custom HTML block.\n3. Paste the following snippet:\n\n<script src="${host}/widget.js" data-widget="${id}" defer></script>\n<div class="proofly-widget" data-widget="${id}"></div>`;
      case 'webflow':
        return `1. In Webflow, add an "Embed" component to your canvas.\n2. Paste the following script code inside the editor:\n\n<script src="${host}/widget.js" data-widget="${id}" defer></script>\n<div class="proofly-widget" data-widget="${id}"></div>`;
    }
  };

  return (
    <div className="flex-1 bg-[#09090B] flex flex-col min-w-0 text-slate-100">
      
      {/* Dynamic Alerts/Toasts */}
      {saveSuccess && (
        <div className="fixed top-5 right-5 z-50 bg-brand-emerald text-white font-bold text-xs px-4 py-3 rounded-lg flex items-center space-x-2 shadow-2xl border border-brand-emerald/20 transition animate-pulse">
          <CheckCircle className="w-4 h-4" />
          <span>Widget saved successfully!</span>
        </div>
      )}
      {errorToast && (
        <div className="fixed top-5 right-5 z-50 bg-red-600 text-white font-bold text-xs px-4 py-3 rounded-lg flex items-center space-x-2 shadow-2xl border border-red-600/20 transition animate-pulse">
          <AlertCircle className="w-4 h-4" />
          <span>{errorToast}</span>
        </div>
      )}

      {/* ─── 1. WIDGET LIST VIEW ────────────────────────────────────────────────── */}
      {activeView === 'list' && (
        <>
          <header className="border-b border-border-primary bg-[#09090B]/80 backdrop-blur sticky top-0 z-30 px-8 py-5 flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="font-extrabold text-lg text-white flex items-center space-x-2">
                <Code className="w-5 h-5 text-brand-emerald" />
                <span>Testimonial Widgets</span>
              </h1>
              <p className="text-[11px] text-muted-foreground">Build, customize, and embed high-fidelity testimonial walls and sliders on any platform.</p>
            </div>
            
            {collections.length > 0 && (
              <button 
                onClick={handleCreateNew}
                className="bg-gradient-to-r from-brand-emerald to-brand-teal text-white hover:opacity-90 font-bold text-xs py-2.5 px-4 rounded-lg flex items-center space-x-1.5 cursor-pointer transition shadow-lg shadow-brand-emerald/10"
              >
                <Plus className="w-4 h-4" />
                <span>Create Widget</span>
              </button>
            )}
          </header>

          <main className="p-8 space-y-6 max-w-6xl w-full text-left">
            {/* Space filter header dropdown */}
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

            {widgets.length === 0 ? (
              <div className="bg-[#18181B] border border-dashed border-border-primary p-12 rounded-xl text-center flex flex-col items-center justify-center space-y-4 max-w-xl mx-auto mt-10">
                <LayoutIcon className="w-12 h-12 text-slate-650" />
                <div className="space-y-1">
                  <h3 className="text-white text-sm font-extrabold">No Widgets Created Yet</h3>
                  <p className="text-xs text-muted-foreground">Generate a carousel slider or wall of love layout to display testimonials on your website.</p>
                </div>
                <button 
                  onClick={handleCreateNew}
                  className="bg-gradient-to-r from-brand-emerald to-brand-teal text-white hover:opacity-90 font-bold text-xs py-2 px-4 rounded-lg flex items-center space-x-1.5 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Build First Widget</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                {widgets.map(w => (
                  <div key={w.id} className="bg-[#18181B] border border-border-primary rounded-xl p-5 hover:border-zinc-800 transition flex flex-col justify-between space-y-5 shadow-lg">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1.5">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-white font-extrabold text-sm">{w.name}</h3>
                          <span className="text-[11px] bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/20 px-2 py-0.5 rounded font-black uppercase">{w.layout}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground font-mono">ID: {w.id}</p>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button 
                          onClick={() => handleViewAnalytics(w.id)}
                          className="p-1.5 bg-zinc-800 text-slate-300 hover:text-white rounded-lg transition border border-zinc-700 cursor-pointer"
                          title="View telemetry analytics"
                        >
                          <Activity className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(w.id)}
                          className="p-1.5 bg-zinc-800 text-red-400 hover:text-red-300 rounded-lg transition border border-zinc-700 cursor-pointer"
                          title="Delete widget"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between border-t border-border-primary/50 pt-4 gap-2">
                      <button 
                        onClick={() => copyEmbedCode(w.id)}
                        className="flex-1 bg-zinc-800 hover:bg-zinc-750 border border-border-primary text-slate-200 text-xs font-bold py-2 rounded-lg flex items-center justify-center space-x-1.5 transition cursor-pointer"
                      >
                        {copiedId === w.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-brand-emerald" />
                            <span>Copied Snippet!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Embed Code</span>
                          </>
                        )}
                      </button>
                      
                      <button 
                        onClick={() => handleEdit(w.id)}
                        className="bg-brand-emerald/10 hover:bg-brand-emerald/15 border border-brand-emerald/20 text-brand-emerald text-xs font-black py-2 px-4 rounded-lg transition cursor-pointer"
                      >
                        Edit & Preview
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </>
      )}

      {/* ─── 2. WIDGET CUSTOMIZATION & LIVE BUILDER VIEW ─────────────────────────── */}
      {activeView === 'builder' && (
        <div className="flex-1 flex flex-col min-h-0">
          <header className="border-b border-border-primary bg-[#09090B] px-8 py-4 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setActiveView('list')}
                className="p-1.5 bg-zinc-800 text-slate-300 hover:text-white rounded-lg transition border border-zinc-700 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={widgetName}
                  onChange={(e) => setWidgetName(e.target.value)}
                  className="bg-transparent border-b border-transparent hover:border-slate-700 focus:border-brand-emerald text-white text-base font-extrabold outline-none py-0.5 px-1 w-64 transition"
                />
              </div>
            </div>

            <button 
              onClick={handleSave}
              className="bg-gradient-to-r from-brand-emerald to-brand-teal text-white hover:opacity-95 font-bold text-xs py-2 px-6 rounded-lg transition cursor-pointer"
            >
              Save Widget
            </button>
          </header>

          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Left Column: Panel settings */}
            <div className="w-full lg:w-96 border-r border-border-primary flex flex-col bg-[#141417] overflow-y-auto shrink-0 ">
              
              {/* Layout Config */}
              <div className="p-5 border-b border-border-primary space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center space-x-1.5">
                  <LayoutIcon className="w-4 h-4 text-brand-emerald" />
                  <span>Layout & Type</span>
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'MASONRY', label: 'Pinterest Grid' },
                    { id: 'CAROUSEL', label: 'Auto Slider' },
                    { id: 'WALL', label: 'Full Wall' },
                    { id: 'SINGLE', label: 'Single Feature' },
                    { id: 'POPUP', label: 'Rotating Popup' },
                    { id: 'FLOATING', label: 'Floating Badge' }
                  ].map(layout => (
                    <button
                      key={layout.id}
                      onClick={() => setWidgetLayout(layout.id as any)}
                      className={`text-left p-2.5 rounded-lg border text-xs transition cursor-pointer ${
                        widgetLayout === layout.id
                          ? 'bg-brand-emerald/10 border-brand-emerald/30 text-white font-bold'
                          : 'bg-[#09090B] border-border-primary text-slate-400 hover:text-white'
                      }`}
                    >
                      {layout.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme Settings */}
              <div className="p-5 border-b border-border-primary space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4 text-brand-teal" />
                  <span>Theme & Aesthetics</span>
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'DARK', label: 'Dark Mode' },
                    { id: 'LIGHT', label: 'Light Mode' },
                    { id: 'CUSTOM', label: 'Custom' }
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => setWidgetTheme(t.id as any)}
                      className={`text-[10px] py-1.5 rounded-lg border font-bold text-center transition cursor-pointer ${
                        widgetTheme === t.id
                          ? 'bg-brand-teal/15 text-brand-teal border-brand-teal/30'
                          : 'bg-[#09090B] text-slate-400 border-border-primary hover:text-white'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {widgetTheme === 'CUSTOM' && (
                  <div className="space-y-3 pt-2">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-extrabold uppercase text-slate-400">Primary Color</label>
                        <input
                          type="color"
                          value={widgetSettings.primaryColor}
                          onChange={(e) => setWidgetSettings({ ...widgetSettings, primaryColor: e.target.value })}
                          className="w-full h-8 bg-transparent border-0 rounded cursor-pointer"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-extrabold uppercase text-slate-400">Background</label>
                        <input
                          type="color"
                          value={widgetSettings.backgroundColor}
                          onChange={(e) => setWidgetSettings({ ...widgetSettings, backgroundColor: e.target.value })}
                          className="w-full h-8 bg-transparent border-0 rounded cursor-pointer"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-extrabold uppercase text-slate-400">Card Color</label>
                        <input
                          type="color"
                          value={widgetSettings.cardColor}
                          onChange={(e) => setWidgetSettings({ ...widgetSettings, cardColor: e.target.value })}
                          className="w-full h-8 bg-transparent border-0 rounded cursor-pointer"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-extrabold uppercase text-slate-400">Text Color</label>
                        <input
                          type="color"
                          value={widgetSettings.textColor}
                          onChange={(e) => setWidgetSettings({ ...widgetSettings, textColor: e.target.value })}
                          className="w-full h-8 bg-transparent border-0 rounded cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Filtering Rules */}
              <div className="p-5 border-b border-border-primary space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center space-x-1.5">
                  <SlidersIcon className="w-4 h-4 text-brand-emerald" />
                  <span>Testimonial Filters</span>
                </h3>

                {/* Min rating */}
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold uppercase text-slate-400">Min Rating</label>
                  <select
                    value={widgetSettings.minRating}
                    onChange={(e) => setWidgetSettings({ ...widgetSettings, minRating: parseInt(e.target.value, 10) })}
                    className="w-full bg-[#09090B] border border-border-primary rounded-lg text-xs py-1.5 px-3 text-slate-200 outline-none cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5].map(val => (
                      <option key={val} value={val}>{val} Star{val > 1 ? 's' : ''} & Up</option>
                    ))}
                  </select>
                </div>

                {/* Type Filter */}
                <div className="space-y-1.5 pt-1">
                  <label className="text-[11px] font-extrabold uppercase text-slate-400 block">Content Type</label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setWidgetSettings({ ...widgetSettings, onlyVideo: false, onlyText: false })}
                      className={`flex-1 text-[10px] py-1 rounded border font-semibold text-center cursor-pointer transition ${
                        !widgetSettings.onlyVideo && !widgetSettings.onlyText
                          ? 'bg-zinc-800 border-zinc-700 text-white'
                          : 'bg-[#09090B] border-border-primary text-slate-400 hover:text-white'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setWidgetSettings({ ...widgetSettings, onlyVideo: false, onlyText: true })}
                      className={`flex-1 text-[10px] py-1 rounded border font-semibold text-center cursor-pointer transition ${
                        widgetSettings.onlyText
                          ? 'bg-zinc-800 border-zinc-700 text-white'
                          : 'bg-[#09090B] border-border-primary text-slate-400 hover:text-white'
                      }`}
                    >
                      Text Only
                    </button>
                    <button
                      onClick={() => setWidgetSettings({ ...widgetSettings, onlyVideo: true, onlyText: false })}
                      className={`flex-1 text-[10px] py-1 rounded border font-semibold text-center cursor-pointer transition ${
                        widgetSettings.onlyVideo
                          ? 'bg-zinc-800 border-zinc-700 text-white'
                          : 'bg-[#09090B] border-border-primary text-slate-400 hover:text-white'
                      }`}
                    >
                      Video Only
                    </button>
                  </div>
                </div>

                {/* Testimonials Limit Slider */}
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-extrabold uppercase text-slate-400">Max Testimonials</label>
                    <span className="text-xs text-brand-emerald font-black">{widgetSettings.maxTestimonials}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={widgetSettings.maxTestimonials}
                    onChange={(e) => setWidgetSettings({ ...widgetSettings, maxTestimonials: parseInt(e.target.value, 10) })}
                    className="w-full accent-brand-emerald cursor-pointer"
                  />
                  {user?.tier === 'FREE' && (
                    <span className="text-[11px] text-yellow-500 font-bold block mt-1">⚠️ Free tier limits list to maximum 25.</span>
                  )}
                </div>

                {/* Sort logic */}
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold uppercase text-slate-400">Sort Testimonials By</label>
                  <select
                    value={widgetSettings.sortBy}
                    onChange={(e) => setWidgetSettings({ ...widgetSettings, sortBy: e.target.value as any })}
                    className="w-full bg-[#09090B] border border-border-primary rounded-lg text-xs py-1.5 px-3 text-slate-200 outline-none cursor-pointer"
                  >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="random">Randomize order</option>
                  </select>
                </div>
              </div>

              {/* Visibility options */}
              <div className="p-5 border-b border-border-primary space-y-3.5">
                <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center space-x-1.5">
                  <Eye className="w-4 h-4 text-brand-teal" />
                  <span>Card Content Toggles</span>
                </h3>

                {[
                  { key: 'showAvatar', label: 'Show Reviewer Avatar' },
                  { key: 'showCompany', label: 'Show Reviewer Title' },
                  { key: 'showRating', label: 'Show Review Rating' },
                  { key: 'showVideo', label: 'Show Review Videos' },
                  { key: 'showDate', label: 'Show Review Date' },
                  { key: 'showVerifiedBadge', label: 'Show Verified Check' }
                ].map(item => (
                  <label key={item.key} className="flex items-center justify-between cursor-pointer group text-xs text-slate-300 hover:text-white transition">
                    <span>{item.label}</span>
                    <input
                      type="checkbox"
                      checked={(widgetSettings as any)[item.key]}
                      onChange={(e) => setWidgetSettings({ ...widgetSettings, [item.key]: e.target.checked })}
                      className="w-4 h-4 accent-brand-emerald cursor-pointer"
                    />
                  </label>
                ))}

                {/* Proofly Branding */}
                <label className="flex items-center justify-between cursor-pointer group text-xs text-slate-300 hover:text-white transition pt-3 border-t border-border-primary/50">
                  <div className="space-y-0.5">
                    <span className="block font-bold">Show Proofly Branding</span>
                    <span className="text-[11px] text-muted-foreground block">Support our project with a small footer link.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={widgetSettings.showProoflyBranding}
                    disabled={user?.tier === 'FREE'}
                    onChange={(e) => setWidgetSettings({ ...widgetSettings, showProoflyBranding: e.target.checked })}
                    className="w-4 h-4 accent-brand-emerald disabled:opacity-50 cursor-pointer"
                  />
                </label>
                {user?.tier === 'FREE' && (
                  <div className="p-2 rounded bg-yellow-500/10 border border-yellow-500/20 text-[11px] text-yellow-400 font-semibold leading-relaxed">
                    🌟 Removing Proofly branding requires upgrading to the **PRO** plan.
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Dynamic Live Preview Canvas & Installation guides */}
            <div className="flex-1 flex flex-col bg-[#09090B] overflow-y-auto">
              
              {/* Preview controls */}
              <div className="p-4 border-b border-border-primary flex items-center justify-between">
                <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Live Preview Sandbox</span>
                <div className="flex items-center space-x-1.5 bg-[#18181B] border border-border-primary p-1 rounded-lg">
                  {[
                    { id: 'desktop', icon: <Monitor className="w-3.5 h-3.5" /> },
                    { id: 'tablet', icon: <Tablet className="w-3.5 h-3.5" /> },
                    { id: 'mobile', icon: <Smartphone className="w-3.5 h-3.5" /> }
                  ].map(dev => (
                    <button
                      key={dev.id}
                      onClick={() => setPreviewDevice(dev.id as any)}
                      className={`p-1.5 rounded transition cursor-pointer ${
                        previewDevice === dev.id
                          ? 'bg-brand-emerald/10 text-brand-emerald'
                          : 'text-slate-500 hover:text-white'
                      }`}
                    >
                      {dev.icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Mock Preview Rendering */}
              <div className="flex-1 p-8 flex items-center justify-center border-b border-border-primary/50 min-h-[380px]">
                <div 
                  className={`border border-border-primary rounded-xl overflow-y-auto p-6 transition-all duration-300`}
                  style={{
                    width: previewDevice === 'desktop' ? '100%' : previewDevice === 'tablet' ? '680px' : '360px',
                    height: '100%',
                    maxHeight: '440px',
                    background: widgetSettings.backgroundColor,
                    borderColor: 'rgba(255,255,255,0.06)'
                  }}
                >
                  <div className="space-y-6">
                    {/* Masonry or Wall Layout simulator */}
                    {(widgetLayout === 'MASONRY' || widgetLayout === 'WALL') && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {previewTestimonials.slice(0, 4).map(t => (
                          <MockWidgetCard key={t.id} t={t} settings={widgetSettings} theme={widgetTheme} />
                        ))}
                      </div>
                    )}

                    {/* Single testimonial simulator */}
                    {widgetLayout === 'SINGLE' && (
                      <div className="flex justify-center">
                        <div className="w-full max-w-md">
                          <MockWidgetCard t={previewTestimonials[0]} settings={widgetSettings} theme={widgetTheme} />
                        </div>
                      </div>
                    )}

                    {/* Carousel simulator */}
                    {widgetLayout === 'CAROUSEL' && (
                      <div className="relative">
                        <div className="flex space-x-4 overflow-x-hidden">
                          {previewTestimonials.slice(0, 2).map(t => (
                            <div key={t.id} className="flex-1 shrink-0 min-w-[240px]">
                              <MockWidgetCard t={t} settings={widgetSettings} theme={widgetTheme} />
                            </div>
                          ))}
                        </div>
                        <div className="absolute top-1/2 -translate-y-1/2 left-2 p-1.5 rounded-full bg-zinc-800/80 border border-zinc-700 text-white cursor-pointer ">‹</div>
                        <div className="absolute top-1/2 -translate-y-1/2 right-2 p-1.5 rounded-full bg-zinc-800/80 border border-zinc-700 text-white cursor-pointer ">›</div>
                      </div>
                    )}

                    {/* Popup Simulator */}
                    {widgetLayout === 'POPUP' && (
                      <div className="flex justify-end pt-12">
                        <div className="w-72 border border-brand-emerald/30 shadow-2xl relative">
                          <MockWidgetCard t={previewTestimonials[0]} settings={widgetSettings} theme={widgetTheme} />
                          <span className="absolute top-1 right-2 text-xs text-slate-400 font-bold">×</span>
                        </div>
                      </div>
                    )}

                    {/* Floating Badge Simulator */}
                    {widgetLayout === 'FLOATING' && (
                      <div className="flex justify-start pt-12">
                        <div className="bg-zinc-850 hover:bg-zinc-800 border border-zinc-700 py-2 px-4 rounded-full flex items-center space-x-2 text-xs font-black text-white cursor-pointer shadow-lg shadow-black/35">
                          <span>⭐</span>
                          <span>{(previewTestimonials.reduce((sum, t) => sum + t.rating, 0) / previewTestimonials.length).toFixed(1)} / 5.0 Rating ({previewTestimonials.length} reviews)</span>
                        </div>
                      </div>
                    )}

                    {/* Powered by Proofly footer badge */}
                    {widgetSettings.showProoflyBranding && (
                      <div className="flex items-center justify-center space-x-1.5 text-[10px] text-slate-450 font-bold  cursor-pointer">
                        <span>Powered by</span>
                        <span className="text-[#8B5CF6]">Proofly</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Integration copy guides */}
              <div className="p-8 space-y-5">
                <div className="space-y-1">
                  <h3 className="text-white text-sm font-extrabold">Embed Code & Installation Guide</h3>
                  <p className="text-[11px] text-muted-foreground">Copy and paste this snippet to embed the widget in any page builder or source code.</p>
                </div>

                <div className="flex space-x-2 border-b border-border-primary/50 pb-2 overflow-x-auto ">
                  {[
                    { id: 'html', label: 'HTML / JS' },
                    { id: 'react', label: 'React' },
                    { id: 'nextjs', label: 'Next.js' },
                    { id: 'wordpress', label: 'WordPress' },
                    { id: 'webflow', label: 'Webflow' }
                  ].map(platform => (
                    <button
                      key={platform.id}
                      onClick={() => setGuidePlatform(platform.id as any)}
                      className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-lg border transition cursor-pointer ${
                        guidePlatform === platform.id
                          ? 'bg-brand-emerald/10 text-brand-emerald border-brand-emerald/20'
                          : 'bg-[#18181B] text-slate-400 border-border-primary hover:text-white'
                      }`}
                    >
                      {platform.label}
                    </button>
                  ))}
                </div>

                <div className="bg-[#18181B] border border-border-primary rounded-xl p-4 relative shadow-lg">
                  <pre className="text-slate-300 text-[11px] font-mono whitespace-pre-wrap overflow-x-auto pr-16 select-text max-h-48 text-left leading-relaxed">
                    {getGuideCode()}
                  </pre>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(getGuideCode());
                      setCopiedId('guide');
                      setTimeout(() => setCopiedId(null), 2000);
                    }}
                    className="absolute top-4 right-4 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-slate-300 hover:text-white p-2 rounded-lg transition cursor-pointer"
                  >
                    {copiedId === 'guide' ? <Check className="w-3.5 h-3.5 text-brand-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ─── 3. WIDGET TELEMETRY ANALYTICS VIEW ──────────────────────────────────── */}
      {activeView === 'analytics' && (
        <>
          <header className="border-b border-border-primary bg-[#09090B] px-8 py-4 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setActiveView('list')}
                className="p-1.5 bg-zinc-800 text-slate-300 hover:text-white rounded-lg transition border border-zinc-700 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h1 className="font-extrabold text-base text-white flex items-center space-x-2">
                <Activity className="w-5 h-5 text-brand-teal" />
                <span>Widget Telemetry Analytics</span>
              </h1>
            </div>
          </header>

          <main className="p-8 space-y-8 max-w-6xl w-full text-left">
            {widgetAnalytics ? (
              <>
                {/* Visual Cards Summary metrics */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { label: 'Impressions', value: widgetAnalytics.views, icon: <Eye className="w-4 h-4 text-brand-emerald" /> },
                    { label: 'Widget Clicks', value: widgetAnalytics.clicks, icon: <MousePointer className="w-4 h-4 text-brand-teal" /> },
                    { label: 'Widget CTR', value: widgetAnalytics.ctr + '%', icon: <Activity className="w-4 h-4 text-[#8B5CF6]" /> },
                    { label: 'Video Plays', value: widgetAnalytics.videoPlays, icon: <Play className="w-4 h-4 text-[#EC4899]" /> },
                    { label: 'Conversions', value: widgetAnalytics.conversions, icon: <Star className="w-4 h-4 text-yellow-400" /> }
                  ].map(stat => (
                    <div key={stat.label} className="bg-[#18181B] border border-border-primary p-5 rounded-xl shadow-lg flex flex-col justify-between h-28 hover:border-zinc-800 transition">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-400 uppercase font-black tracking-wider">{stat.label}</span>
                        {stat.icon}
                      </div>
                      <div className="text-2xl font-black text-white">{stat.value}</div>
                    </div>
                  ))}
                </div>

                {/* Demographic details split */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Device splits */}
                  <div className="bg-[#18181B] border border-border-primary p-6 rounded-xl space-y-4 shadow-xl">
                    <h3 className="text-white text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 border-b border-border-primary/50 pb-2">
                      <Laptop className="w-4 h-4 text-brand-emerald" />
                      <span>Device Types</span>
                    </h3>
                    <div className="space-y-3 pt-2">
                      {widgetAnalytics.devices.length === 0 ? (
                        <div className="text-xs text-muted-foreground py-4">No data logged yet.</div>
                      ) : (
                        widgetAnalytics.devices.map(dev => (
                          <div key={dev.device} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-350">{dev.device}</span>
                              <span className="text-slate-200 font-bold">{dev.count}</span>
                            </div>
                            <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-brand-emerald" 
                                style={{ width: `${Math.min((dev.count / Math.max(...widgetAnalytics.devices.map(d => d.count), 1)) * 100, 100)}%` }}
                              />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Browser splits */}
                  <div className="bg-[#18181B] border border-border-primary p-6 rounded-xl space-y-4 shadow-xl">
                    <h3 className="text-white text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 border-b border-border-primary/50 pb-2">
                      <Globe className="w-4 h-4 text-brand-teal" />
                      <span>Browser Telemetry</span>
                    </h3>
                    <div className="space-y-3 pt-2">
                      {widgetAnalytics.browsers.length === 0 ? (
                        <div className="text-xs text-muted-foreground py-4">No data logged yet.</div>
                      ) : (
                        widgetAnalytics.browsers.map(b => (
                          <div key={b.browser} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-350">{b.browser}</span>
                              <span className="text-slate-200 font-bold">{b.count}</span>
                            </div>
                            <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-brand-teal" 
                                style={{ width: `${Math.min((b.count / Math.max(...widgetAnalytics.browsers.map(d => d.count), 1)) * 100, 100)}%` }}
                              />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Country splits */}
                  <div className="bg-[#18181B] border border-border-primary p-6 rounded-xl space-y-4 shadow-xl">
                    <h3 className="text-white text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 border-b border-border-primary/50 pb-2">
                      <Globe className="w-4 h-4 text-[#8B5CF6]" />
                      <span>Traffic Geography</span>
                    </h3>
                    <div className="space-y-3 pt-2">
                      {widgetAnalytics.countries.length === 0 ? (
                        <div className="text-xs text-muted-foreground py-4">No data logged yet.</div>
                      ) : (
                        widgetAnalytics.countries.map(c => (
                          <div key={c.country} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-350">{c.country}</span>
                              <span className="text-slate-200 font-bold">{c.count}</span>
                            </div>
                            <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-[#8B5CF6]" 
                                style={{ width: `${Math.min((c.count / Math.max(...widgetAnalytics.countries.map(d => d.count), 1)) * 100, 100)}%` }}
                              />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Top Testimonial display */}
                {widgetAnalytics.topTestimonialId && (
                  <div className="bg-[#18181B] border border-border-primary rounded-xl p-6 shadow-xl">
                    <h3 className="text-white text-xs font-black uppercase tracking-wider mb-4 border-b border-border-primary/50 pb-2">Standout Top Testimonial</h3>
                    {(() => {
                      const topT = testimonials.find(t => t.id === widgetAnalytics.topTestimonialId);
                      if (!topT) return <span className="text-xs text-slate-400 font-bold">Top Testimonial ID: {widgetAnalytics.topTestimonialId}</span>;
                      return (
                        <div className="flex items-start space-x-4 max-w-xl text-left">
                          <img 
                            src={topT.reviewerAvatar || 'https://api.dicebear.com/7.x/initials/svg?seed=' + topT.name} 
                            alt={topT.name} 
                            className="w-10 h-10 rounded-full border border-border-primary"
                          />
                          <div className="space-y-1">
                            <span className="text-slate-200 font-bold text-xs">{topT.name} ({topT.role})</span>
                            <p className="text-slate-400 text-xs italic">"{topT.review}"</p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </>
            ) : (
              <div className="py-24 text-center text-xs text-slate-500 font-black">Loading analytics telemetry...</div>
            )}
          </main>
        </>
      )}

    </div>
  );
}

// Mock card renderer for live sandbox
function MockWidgetCard({ t, settings, theme }: { t: any; settings: WidgetSettings; theme: string }) {
  if (!t) return null;

  const isDark = theme === 'DARK' || settings.darkLightMode === 'dark';
  const cardColor = settings.cardColor;
  const textColor = settings.textColor;
  const accent = settings.primaryColor;
  const radius = settings.borderRadius;

  return (
    <div 
      className="p-4 border transition-all duration-300 text-left"
      style={{
        background: theme === 'CUSTOM' ? cardColor : isDark ? '#18181B' : '#F4F4F5',
        borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
        color: theme === 'CUSTOM' ? textColor : isDark ? '#E4E4E7' : '#27272A',
        borderRadius: radius
      }}
    >
      {/* Header */}
      {(settings.showAvatar || settings.showCompany) && (
        <div className="flex items-center space-x-3 mb-3">
          {settings.showAvatar && (
            <img 
              src={t.reviewerAvatar || t.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=' + t.name} 
              alt={t.name} 
              className="w-8 h-8 rounded-full object-cover border border-border-primary"
            />
          )}
          <div className="flex flex-col overflow-hidden">
            <span className="text-xs font-bold flex items-center gap-1 leading-tight">
              {t.name || t.reviewerName}
              {settings.showVerifiedBadge && (
                <svg className="w-3.5 h-3.5 text-brand-emerald fill-brand-emerald" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6.267 3.455a.75.75 0 00-.708-.523 4.25 4.25 0 00-.507 8.47 7.502 7.502 0 00-.3 2.842.75.75 0 001.272.545l2.06-1.545a2.75 2.75 0 011.65-.545h3.016A4.25 4.25 0 0017 8.5v-.25a4.25 4.25 0 00-4.25-4.25h-6.49M10 11a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd"/></svg>
              )}
            </span>
            {settings.showCompany && (t.reviewerTitle || t.company || t.role) && (
              <span className="text-[10px] text-muted-foreground text-ellipsis overflow-hidden white-space-nowrap">
                {t.reviewerTitle || t.company || t.role}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Ratings */}
      {settings.showRating && (
        <div className="flex space-x-0.5 text-xs mb-2" style={{ color: theme === 'CUSTOM' ? accent : '#F59E0B' }}>
          {Array.from({ length: t.rating || 5 }).map((_, idx) => (
            <span key={idx}>★</span>
          ))}
        </div>
      )}

      {/* Text content */}
      {(t.textContent || t.review) && (
        <p className="text-[11px] leading-relaxed mb-3">
          "{t.textContent || t.review}"
        </p>
      )}

      {/* Video content */}
      {settings.showVideo && (t.videoUrl || t.video_url) && (
        <div className="relative rounded-lg overflow-hidden bg-black flex h-36 mt-2 border border-white/[0.04]">
          <video 
            src={t.videoUrl || t.video_url} 
            className="w-full h-full object-cover" 
            controls={false}
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/35">
            <span className="w-8 h-8 rounded-full bg-brand-emerald flex items-center justify-center text-white text-xs pl-0.5 font-bold shadow-md shadow-brand-emerald/20">▶</span>
          </div>
        </div>
      )}

      {/* Date */}
      {settings.showDate && t.createdAt && (
        <div className="text-[11px] text-slate-500 font-bold mt-2">
          {new Date(t.createdAt).toLocaleDateString()}
        </div>
      )}
    </div>
  );
}

// Sliders Icon defined locally for import fallback
function SlidersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="4" x2="4" y1="21" y2="14" />
      <line x1="4" x2="4" y1="10" y2="3" />
      <line x1="12" x2="12" y1="21" y2="12" />
      <line x1="12" x2="12" y1="8" y2="3" />
      <line x1="20" x2="20" y1="21" y2="16" />
      <line x1="20" x2="20" y1="12" y2="3" />
      <line x1="2" x2="6" y1="14" y2="14" />
      <line x1="10" x2="14" y1="8" y2="8" />
      <line x1="18" x2="22" y1="16" y2="16" />
    </svg>
  );
}
