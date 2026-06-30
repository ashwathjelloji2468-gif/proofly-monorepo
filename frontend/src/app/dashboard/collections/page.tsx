'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { 
  Plus, 
  FolderHeart, 
  Trash2, 
  Link as LinkIcon, 
  QrCode, 
  Sparkles, 
  Layers,
  ChevronRight,
  ExternalLink,
  X,
  Palette,
  CheckCircle2,
  Settings,
  Star,
  Copy,
  Check,
  ChevronLeft,
  Activity,
  Laptop,
  Globe,
  Sliders,
  Calendar,
  Grid,
  Heart,
  Eye,
  FileText,
  User,
  PlusCircle,
  HelpCircle,
  CopyIcon,
  Download
} from 'lucide-react';
import Link from 'next/link';

interface QuestionInput {
  label: string;
  type: string; // SHORT_ANSWER, PARAGRAPH, DROPDOWN, CHECKBOX, RADIO, RATING, DATE
  options: string[];
  required: boolean;
  placeholder: string;
  order: number;
}

export default function CollectionsPage() {
  const user = useStore(state => state.user);
  const collections = useStore(state => state.collections); // workspaces list
  const collectionPages = useStore(state => state.collectionPages); // collections under workspace
  const collectionAnalytics = useStore(state => state.collectionAnalytics);

  const fetchCollectionPages = useStore(state => state.fetchCollectionPages);
  const createCollectionPage = useStore(state => state.createCollectionPage);
  const updateCollectionPage = useStore(state => state.updateCollectionPage);
  const deleteCollectionPage = useStore(state => state.deleteCollectionPage);
  const duplicateCollectionPage = useStore(state => state.duplicateCollectionPage);
  const fetchCollectionAnalytics = useStore(state => state.fetchCollectionAnalytics);

  const [selectedSpaceId, setSelectedSpaceId] = useState<string>('');
  const [activeView, setActiveView] = useState<'list' | 'editor' | 'analytics'>('list');
  const [activeColId, setActiveColId] = useState<string | null>(null);

  // Editor Wizard States
  const [colName, setColName] = useState('');
  const [colHeadline, setColHeadline] = useState('');
  const [colSubheadline, setColSubheadline] = useState('');
  const [colLogoUrl, setColLogoUrl] = useState('');
  const [colThankYouMessage, setColThankYouMessage] = useState('Thank you so much for your feedback!');
  const [colRedirectUrl, setColRedirectUrl] = useState('');
  const [colCustomDomain, setColCustomDomain] = useState('');
  const [colThemeColor, setColThemeColor] = useState('#10B981');
  const [colQuestions, setColQuestions] = useState<QuestionInput[]>([
    { label: 'How did our product help you?', type: 'PARAGRAPH', options: [], required: true, placeholder: 'Share your story...', order: 0 }
  ]);

  // QR & Snippet sharing states
  const [activeShareId, setActiveShareId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  // Install guide platform
  const [guidePlatform, setGuidePlatform] = useState<'html' | 'react' | 'nextjs'>('html');

  // Load spaces and collection pages
  useEffect(() => {
    if (collections.length > 0) {
      const defaultSpace = collections[0].id;
      setSelectedSpaceId(defaultSpace);
      fetchCollectionPages(defaultSpace);
    }
  }, [collections, fetchCollectionPages]);

  const handleSpaceChange = (spaceId: string) => {
    setSelectedSpaceId(spaceId);
    fetchCollectionPages(spaceId);
  };

  const handleCreateNew = () => {
    // Check tier limits for Free users (limit to 1 collection)
    if (user?.tier === 'FREE') {
      const pageCount = collectionPages.length;
      if (pageCount >= 1) {
        setErrorToast('LIMIT_REACHED: Free tier is limited to 1 Collection page. Please upgrade to Pro.');
        setTimeout(() => setErrorToast(null), 4000);
        return;
      }
    }

    setActiveColId(null);
    setColName('New Feedback Collection');
    setColHeadline('Love our product?');
    setColSubheadline('Please take 60 seconds to share your experience with us.');
    setColLogoUrl('');
    setColThankYouMessage('Thank you so much for your feedback! You are awesome.');
    setColRedirectUrl('');
    setColCustomDomain('');
    setColThemeColor('#10B981');
    setColQuestions([
      { label: 'How did our product help you?', type: 'PARAGRAPH', options: [], required: true, placeholder: 'Share your story...', order: 0 }
    ]);
    setActiveView('editor');
  };

  const handleEdit = (pageId: string) => {
    const page = collectionPages.find(p => p.id === pageId);
    if (!page) return;
    setActiveColId(page.id);
    setColName(page.name);
    setColHeadline(page.headline);
    setColSubheadline(page.subheadline);
    setColLogoUrl(page.logoUrl || '');
    setColThankYouMessage(page.thankYouMessage);
    setColRedirectUrl(page.redirectUrl || '');
    setColCustomDomain(page.customDomain || '');
    setColThemeColor(page.theme?.primaryColor || '#10B981');
    
    // Map backend questions to form inputs
    const mappedQs = page.questions.map(q => ({
      label: q.label,
      type: q.type,
      options: q.options || [],
      required: q.required,
      placeholder: q.placeholder || '',
      order: q.order
    }));
    setColQuestions(mappedQs.length > 0 ? mappedQs : [
      { label: 'How did our product help you?', type: 'PARAGRAPH', options: [], required: true, placeholder: 'Share your story...', order: 0 }
    ]);
    setActiveView('editor');
  };

  const handleSave = async () => {
    if (!colName.trim()) {
      setErrorToast('Validation Error: Collection Name is required');
      setTimeout(() => setErrorToast(null), 3000);
      return;
    }

    const payload = {
      spaceId: selectedSpaceId,
      name: colName,
      slug: colName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Math.floor(100 + Math.random() * 900),
      headline: colHeadline,
      subheadline: colSubheadline,
      logoUrl: colLogoUrl || null,
      thankYouMessage: colThankYouMessage,
      redirectUrl: colRedirectUrl || null,
      customDomain: colCustomDomain || null,
      themeColor: colThemeColor,
      questions: colQuestions.map((q, idx) => ({ ...q, order: idx }))
    };

    try {
      if (activeColId) {
        await updateCollectionPage(activeColId, {
          name: colName,
          headline: colHeadline,
          subheadline: colSubheadline,
          logoUrl: colLogoUrl || null,
          thankYouMessage: colThankYouMessage,
          redirectUrl: colRedirectUrl || null,
          customDomain: colCustomDomain || null,
          themeColor: colThemeColor,
          questions: colQuestions.map((q, idx) => ({ ...q, order: idx }))
        });
      } else {
        await createCollectionPage(payload);
      }
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
      setActiveView('list');
    } catch (e: any) {
      setErrorToast(e.message || 'Failed to save collection');
      setTimeout(() => setErrorToast(null), 4000);
    }
  };

  const handleDeletePage = async (pageId: string) => {
    if (confirm('Are you sure you want to delete this collection page? All submission logs will be permanently deleted.')) {
      await deleteCollectionPage(pageId);
    }
  };

  const handleDuplicate = async (pageId: string) => {
    await duplicateCollectionPage(pageId);
  };

  const handleViewAnalytics = (pageId: string) => {
    setActiveColId(pageId);
    fetchCollectionAnalytics(pageId);
    setActiveView('analytics');
  };

  const handleDownloadQR = (slug: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://useproofly.com';
    const link = `${origin}/collect/${slug}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(link)}`;
    
    // open in new tab for downloading/copying
    window.open(qrUrl, '_blank');
  };

  const copyCollectLink = (slug: string, id: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://useproofly.com';
    navigator.clipboard.writeText(`${origin}/collect/${slug}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Questions Wizard Handlers
  const addQuestionField = () => {
    setColQuestions([
      ...colQuestions,
      { label: '', type: 'SHORT_ANSWER', options: [], required: false, placeholder: '', order: colQuestions.length }
    ]);
  };

  const updateQuestionField = (idx: number, updates: Partial<QuestionInput>) => {
    setColQuestions(colQuestions.map((q, i) => i === idx ? { ...q, ...updates } : q));
  };

  const removeQuestionField = (idx: number) => {
    setColQuestions(colQuestions.filter((_, i) => i !== idx));
  };

  const getGuideCode = (pageId: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://useproofly.com';
    const embedUrl = `${origin}/collect/${pageId}`;
    
    switch (guidePlatform) {
      case 'html':
        return `<iframe src="${embedUrl}" width="100%" height="800px" frameborder="0" style="border-radius:12px; border:1px solid rgba(255,255,255,0.08);"></iframe>`;
      case 'react':
        return `import React from 'react';\n\nexport default function FeedbackEmbed() {\n  return (\n    <iframe\n      src="${embedUrl}"\n      width="100%"\n      height="800px"\n      frameBorder="0"\n      style={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)' }}\n    />\n  );\n}`;
      case 'nextjs':
        return `export default function Page() {\n  return (\n    <div className="w-full max-w-4xl mx-auto py-8">\n      <iframe\n        src="${embedUrl}"\n        width="100%"\n        height="800px"\n        className="w-full rounded-2xl border border-zinc-800"\n      />\n    </div>\n  );\n}`;
    }
  };

  return (
    <div className="flex-1 bg-[#09090B] flex flex-col min-w-0 text-slate-100 font-sans">
      
      {/* Toast notifications */}
      {saveSuccess && (
        <div className="fixed top-5 right-5 z-50 bg-brand-emerald text-white font-bold text-xs px-4 py-3 rounded-lg flex items-center space-x-2 shadow-2xl transition animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>Collection Saved Successfully!</span>
        </div>
      )}
      {errorToast && (
        <div className="fixed top-5 right-5 z-50 bg-red-650 text-white font-bold text-xs px-4 py-3 rounded-lg flex items-center space-x-2 shadow-2xl transition animate-pulse">
          <HelpCircle className="w-4 h-4" />
          <span>{errorToast}</span>
        </div>
      )}

      {/* ─── 1. LIST VIEW OF COLLECTION PAGES ────────────────────────────────────── */}
      {activeView === 'list' && (
        <>
          <header className="border-b border-border-primary bg-[#09090B]/80 backdrop-blur sticky top-0 z-30 px-8 py-5 flex items-center justify-between">
            <div className="space-y-1">
              <h1 className="font-extrabold text-lg text-white flex items-center space-x-2">
                <FolderHeart className="w-5 h-5 text-brand-emerald" />
                <span>Testimonial Collections</span>
              </h1>
              <p className="text-[11px] text-muted-foreground">Manage multi-step feedback landing pages and check response metrics.</p>
            </div>
            
            {collections.length > 0 && (
              <button 
                onClick={handleCreateNew}
                className="bg-gradient-to-r from-brand-emerald to-brand-teal text-white hover:opacity-90 font-bold text-xs py-2.5 px-4 rounded-lg flex items-center space-x-1.5 transition shadow-lg shadow-brand-emerald/10 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>New Collection Page</span>
              </button>
            )}
          </header>

          <main className="p-8 space-y-6 max-w-6xl w-full text-left">
            {/* Active space filters dropdown */}
            <div className="flex items-center space-x-3 bg-[#18181B] border border-border-primary p-4 rounded-xl shadow-md w-full max-w-md">
              <label className="text-xs font-black uppercase text-slate-400 tracking-wider">Active Workspace:</label>
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

            {collectionPages.length === 0 ? (
              <div className="bg-[#18181B] border border-dashed border-border-primary p-12 rounded-xl text-center flex flex-col items-center justify-center space-y-4 max-w-xl mx-auto mt-10">
                <FolderHeart className="w-12 h-12 text-slate-650" />
                <div className="space-y-1">
                  <h3 className="text-white text-sm font-extrabold">No Collection Pages</h3>
                  <p className="text-xs text-muted-foreground">Create a direct landing URL to send to customers for recording testimonials.</p>
                </div>
                <button 
                  onClick={handleCreateNew}
                  className="bg-gradient-to-r from-brand-emerald to-brand-teal text-white hover:opacity-90 font-bold text-xs py-2 px-4 rounded-lg flex items-center space-x-1.5 transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Build Collection Form</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {collectionPages.map(page => (
                  <div key={page.id} className="bg-[#18181B] border border-border-primary rounded-xl p-5 hover:border-zinc-800 transition flex flex-col justify-between space-y-5 shadow-lg relative">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3.5">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-xs font-black shadow-md border border-white/[0.04]"
                          style={{ backgroundColor: page.theme?.primaryColor || '#10B981' }}
                        >
                          {page.name.substring(0,2).toUpperCase()}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-white font-extrabold text-sm leading-tight">{page.name}</h3>
                            <span className="text-[7px] bg-zinc-800 text-slate-350 border border-zinc-700 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">{page.status}</span>
                          </div>
                          <p className="text-[10px] text-muted-foreground font-mono truncate max-w-[200px]">/collect/{page.slug}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleViewAnalytics(page.id)}
                          className="p-1.5 bg-zinc-800 text-slate-350 hover:text-white rounded border border-zinc-700 transition cursor-pointer"
                          title="View response telemetry"
                        >
                          <Activity className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(page.id)}
                          className="p-1.5 bg-zinc-800 text-slate-350 hover:text-white rounded border border-zinc-700 transition cursor-pointer"
                          title="Duplicate form settings"
                        >
                          <Sliders className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePage(page.id)}
                          className="p-1.5 bg-zinc-800 text-red-400 hover:text-red-300 rounded border border-zinc-700 transition cursor-pointer"
                          title="Delete collection"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => copyCollectLink(page.slug, page.id)}
                        className="flex-1 bg-zinc-800 hover:bg-zinc-750 border border-border-primary text-slate-200 text-xs font-bold py-2 rounded-lg flex items-center justify-center space-x-1.5 transition cursor-pointer"
                      >
                        {copiedId === page.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-brand-emerald" />
                            <span>Copied Link!</span>
                          </>
                        ) : (
                          <>
                            <LinkIcon className="w-3.5 h-3.5" />
                            <span>Copy URL</span>
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={() => handleDownloadQR(page.slug)}
                        className="bg-zinc-800 hover:bg-zinc-750 border border-border-primary text-slate-200 p-2 rounded-lg transition cursor-pointer"
                        title="Get QR code page"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                      
                      <button 
                        onClick={() => handleEdit(page.id)}
                        className="bg-brand-emerald/10 hover:bg-brand-emerald/15 border border-brand-emerald/20 text-brand-emerald text-xs font-black py-2 px-4 rounded-lg transition cursor-pointer"
                      >
                        Edit Wizard
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </>
      )}

      {/* ─── 2. CREATOR / EDITOR WIZARD VIEW ────────────────────────────────────── */}
      {activeView === 'editor' && (
        <div className="flex-1 flex flex-col min-h-0 select-none">
          <header className="border-b border-border-primary bg-[#09090B] px-8 py-4 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setActiveView('list')}
                className="p-1.5 bg-zinc-800 text-slate-300 hover:text-white rounded-lg transition border border-zinc-700 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <h2 className="text-white font-extrabold text-sm">Feedback Collection Wizard</h2>
            </div>
            <button 
              onClick={handleSave}
              className="bg-gradient-to-r from-brand-emerald to-brand-teal text-white font-bold text-xs py-2 px-6 rounded-lg transition cursor-pointer"
            >
              Save Collection Page
            </button>
          </header>

          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Left Options Panel */}
            <div className="w-full lg:w-[420px] border-r border-border-primary flex flex-col bg-[#141417] overflow-y-auto shrink-0 text-left">
              
              {/* General details */}
              <div className="p-5 border-b border-border-primary space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center space-x-1.5">
                  <Grid className="w-4 h-4 text-brand-emerald" />
                  <span>General Settings</span>
                </h3>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Collection Name</label>
                    <input
                      type="text"
                      value={colName}
                      onChange={(e) => setColName(e.target.value)}
                      placeholder="e.g. Q3 Customer Survey"
                      className="w-full bg-[#09090B] border border-border-primary rounded-lg text-xs py-2 px-3 text-slate-200 focus:border-brand-emerald outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Headline Title</label>
                    <input
                      type="text"
                      value={colHeadline}
                      onChange={(e) => setColHeadline(e.target.value)}
                      placeholder="e.g. Love our service?"
                      className="w-full bg-[#09090B] border border-border-primary rounded-lg text-xs py-2 px-3 text-slate-200 focus:border-brand-emerald outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Subheadline Message</label>
                    <textarea
                      rows={3}
                      value={colSubheadline}
                      onChange={(e) => setColSubheadline(e.target.value)}
                      placeholder="Give users brief instructions..."
                      className="w-full bg-[#09090B] border border-border-primary rounded-lg text-xs py-2 px-3 text-slate-200 focus:border-brand-emerald outline-none resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Branding Customizations */}
              <div className="p-5 border-b border-border-primary space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center space-x-1.5">
                  <Palette className="w-4 h-4 text-brand-teal" />
                  <span>Branding & Colors</span>
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Brand Color</label>
                    <input
                      type="color"
                      value={colThemeColor}
                      onChange={(e) => setColThemeColor(e.target.value)}
                      className="w-full h-8 bg-transparent border-0 rounded cursor-pointer"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Logo Image URL</label>
                    <input
                      type="text"
                      value={colLogoUrl}
                      onChange={(e) => setColLogoUrl(e.target.value)}
                      placeholder="https://image..."
                      className="w-full bg-[#09090B] border border-border-primary rounded-lg text-xs py-2 px-3 text-slate-200 focus:border-brand-emerald outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Custom Questions Builder */}
              <div className="p-5 border-b border-border-primary space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center space-x-1.5">
                    <Sliders className="w-4 h-4 text-brand-emerald" />
                    <span>Custom Form Questions</span>
                  </h3>
                  <button 
                    onClick={addQuestionField}
                    className="p-1 text-brand-emerald hover:bg-brand-emerald/10 rounded transition cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  {colQuestions.map((q, idx) => (
                    <div key={idx} className="bg-[#09090B] border border-border-primary p-3 rounded-lg space-y-3 relative">
                      <button
                        onClick={() => removeQuestionField(idx)}
                        className="absolute top-2 right-2 text-slate-500 hover:text-red-400 text-xs"
                      >
                        ×
                      </button>
                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold uppercase text-slate-400">Question #{idx + 1} Label</label>
                        <input
                          type="text"
                          value={q.label}
                          onChange={(e) => updateQuestionField(idx, { label: e.target.value })}
                          placeholder="e.g. What features do you use most?"
                          className="w-full bg-zinc-900 border border-zinc-800 rounded py-1 px-2 text-xs text-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[9px] font-bold uppercase text-slate-400 block mb-0.5">Type</label>
                          <select
                            value={q.type}
                            onChange={(e) => updateQuestionField(idx, { type: e.target.value })}
                            className="w-full bg-zinc-900 border border-zinc-800 rounded py-1 px-1.5 text-xs text-white cursor-pointer"
                          >
                            <option value="SHORT_ANSWER">Short Answer</option>
                            <option value="PARAGRAPH">Paragraph Text</option>
                            <option value="RATING">Star Rating</option>
                            <option value="DATE">Date Picker</option>
                          </select>
                        </div>
                        <div className="flex items-end justify-center pb-2">
                          <label className="flex items-center space-x-1 text-xs text-slate-350 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={q.required}
                              onChange={(e) => updateQuestionField(idx, { required: e.target.checked })}
                              className="accent-brand-emerald"
                            />
                            <span>Required</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Thank you redirection rules */}
              <div className="p-5 border-b border-border-primary space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center space-x-1.5">
                  <Heart className="w-4 h-4 text-brand-teal" />
                  <span>Completion Screen</span>
                </h3>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">Thank You Note</label>
                    <input
                      type="text"
                      value={colThankYouMessage}
                      onChange={(e) => setColThankYouMessage(e.target.value)}
                      placeholder="e.g. Thank you so much for your review!"
                      className="w-full bg-[#09090B] border border-border-primary rounded-lg text-xs py-2 px-3 text-slate-200 focus:border-brand-emerald outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase">CTA Redirect Link</label>
                    <input
                      type="text"
                      value={colRedirectUrl}
                      onChange={(e) => setColRedirectUrl(e.target.value)}
                      placeholder="https://mywebsite.com/coupon"
                      className="w-full bg-[#09090B] border border-border-primary rounded-lg text-xs py-2 px-3 text-slate-200 focus:border-brand-emerald outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Interactive Preview Simulator */}
            <div className="flex-1 flex flex-col bg-[#09090B] overflow-y-auto">
              <div className="p-4 border-b border-border-primary text-xs font-black uppercase tracking-wider text-slate-400 text-left">
                Live Public Interface Mockup
              </div>

              <div className="flex-1 p-8 flex items-center justify-center bg-[#09090B]/50 min-h-[450px]">
                <div className="bg-[#141417] border border-border-primary rounded-2xl p-8 w-full max-w-lg shadow-2xl relative text-left">
                  {colLogoUrl && (
                    <img src={colLogoUrl} alt="Logo" className="w-12 h-12 rounded-xl object-cover mb-4 border border-zinc-800" />
                  )}
                  <div className="space-y-2 mb-6">
                    <h2 className="text-2xl font-black text-white">{colHeadline || 'Share feedback'}</h2>
                    <p className="text-xs text-slate-400 leading-relaxed">{colSubheadline || 'Fill out the questions to leave your review.'}</p>
                  </div>

                  <div className="space-y-5">
                    {/* Simulated Questions */}
                    {colQuestions.map((q, idx) => (
                      <div key={idx} className="space-y-1.5">
                        <label className="text-xs font-black text-slate-200 flex items-center space-x-1">
                          <span>{q.label || `Question #${idx+1}`}</span>
                          {q.required && <span className="text-brand-emerald">*</span>}
                        </label>
                        {q.type === 'SHORT_ANSWER' && (
                          <input type="text" placeholder={q.placeholder || 'Your reply...'} disabled className="w-full bg-zinc-900 border border-zinc-800 rounded-lg text-xs py-2 px-3 text-slate-400" />
                        )}
                        {q.type === 'PARAGRAPH' && (
                          <textarea rows={2} placeholder={q.placeholder || 'Type long answer...'} disabled className="w-full bg-zinc-900 border border-zinc-800 rounded-lg text-xs py-2 px-3 text-slate-400 resize-none" />
                        )}
                        {q.type === 'RATING' && (
                          <div className="flex space-x-1 text-lg text-yellow-400">
                            <span>★</span><span>★</span><span>★</span><span>★</span><span>★</span>
                          </div>
                        )}
                        {q.type === 'DATE' && (
                          <input type="date" disabled className="bg-zinc-900 border border-zinc-800 rounded-lg text-xs py-1.5 px-3 text-slate-400" />
                        )}
                      </div>
                    ))}

                    <div className="space-y-1.5 pt-4 border-t border-border-primary/50">
                      <label className="text-xs font-black text-slate-200">Reviewer Email Address</label>
                      <input type="email" placeholder="john@example.com" disabled className="w-full bg-zinc-900 border border-zinc-800 rounded-lg text-xs py-2 px-3 text-slate-400" />
                    </div>

                    <button 
                      style={{ backgroundColor: colThemeColor }}
                      className="w-full text-white font-black text-xs py-3 rounded-lg shadow-lg hover:opacity-95 cursor-pointer mt-4"
                    >
                      Submit Testimonial
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── 3. TELEMETRY ANALYTICS VIEW ────────────────────────────────────────── */}
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
                <span>Collection Telemetry Metrics</span>
              </h1>
            </div>
          </header>

          <main className="p-8 space-y-8 max-w-6xl w-full text-left">
            {collectionAnalytics ? (
              <>
                {/* Scorecards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { label: 'Page Views', value: collectionAnalytics.views, icon: <Eye className="w-4 h-4 text-brand-emerald" /> },
                    { label: 'Unique Visitors', value: collectionAnalytics.visitors, icon: <Globe className="w-4 h-4 text-brand-teal" /> },
                    { label: 'Started Forms', value: collectionAnalytics.starts, icon: <Sliders className="w-4 h-4 text-[#8B5CF6]" /> },
                    { label: 'Completions', value: collectionAnalytics.completions, icon: <CheckCircle2 className="w-4 h-4 text-[#EC4899]" /> },
                    { label: 'Avg Time (s)', value: collectionAnalytics.avgTime, icon: <Calendar className="w-4 h-4 text-yellow-450" /> }
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

                {/* Grid devices, countries, browsers */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Devices */}
                  <div className="bg-[#18181B] border border-border-primary p-6 rounded-xl space-y-4 shadow-xl">
                    <h3 className="text-white text-xs font-black uppercase tracking-wider flex items-center space-x-1.5 border-b border-border-primary/50 pb-2">
                      <Laptop className="w-4 h-4 text-brand-emerald" />
                      <span>Device Types</span>
                    </h3>
                    <div className="space-y-3 pt-2">
                      {collectionAnalytics.devices.length === 0 ? (
                        <div className="text-xs text-muted-foreground py-4">No data logged yet.</div>
                      ) : (
                        collectionAnalytics.devices.map(dev => (
                          <div key={dev.device} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-350">{dev.device}</span>
                              <span className="text-slate-200 font-bold">{dev.count}</span>
                            </div>
                            <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-brand-emerald" 
                                style={{ width: `${Math.min((dev.count / Math.max(...collectionAnalytics.devices.map(d => d.count), 1)) * 100, 100)}%` }}
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
                      <span>Browsers</span>
                    </h3>
                    <div className="space-y-3 pt-2">
                      {collectionAnalytics.browsers.length === 0 ? (
                        <div className="text-xs text-muted-foreground py-4">No data logged yet.</div>
                      ) : (
                        collectionAnalytics.browsers.map(b => (
                          <div key={b.browser} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-350">{b.browser}</span>
                              <span className="text-slate-200 font-bold">{b.count}</span>
                            </div>
                            <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-brand-teal" 
                                style={{ width: `${Math.min((b.count / Math.max(...collectionAnalytics.browsers.map(d => d.count), 1)) * 100, 100)}%` }}
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
                      <span>Countries</span>
                    </h3>
                    <div className="space-y-3 pt-2">
                      {collectionAnalytics.countries.length === 0 ? (
                        <div className="text-xs text-muted-foreground py-4">No data logged yet.</div>
                      ) : (
                        collectionAnalytics.countries.map(c => (
                          <div key={c.country} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-350">{c.country}</span>
                              <span className="text-slate-200 font-bold">{c.count}</span>
                            </div>
                            <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-[#8B5CF6]" 
                                style={{ width: `${Math.min((c.count / Math.max(...collectionAnalytics.countries.map(d => d.count), 1)) * 100, 100)}%` }}
                              />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Embed snippet view */}
                <div className="bg-[#18181B] border border-border-primary rounded-xl p-6 shadow-xl space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-white text-sm font-extrabold">Embed Collection Iframe</h3>
                    <p className="text-[11px] text-muted-foreground">Load this collection page layout as an inline form inside your own site.</p>
                  </div>
                  <div className="flex space-x-2 border-b border-border-primary/50 pb-2">
                    {['html', 'react', 'nextjs'].map(plat => (
                      <button
                        key={plat}
                        onClick={() => setGuidePlatform(plat as any)}
                        className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-lg border cursor-pointer transition ${
                          guidePlatform === plat
                            ? 'bg-brand-emerald/10 text-brand-emerald border-brand-emerald/20'
                            : 'bg-[#09090B] text-slate-400 border-border-primary hover:text-white'
                        }`}
                      >
                        {plat === 'html' ? 'HTML Iframe' : plat}
                      </button>
                    ))}
                  </div>

                  <div className="bg-[#09090B] border border-border-primary p-4 rounded-xl relative">
                    <pre className="text-slate-300 text-[11px] font-mono leading-relaxed whitespace-pre-wrap pr-16 select-text">
                      {getGuideCode(activeColId || '')}
                    </pre>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(getGuideCode(activeColId || ''));
                        setCopiedId('iframe');
                        setTimeout(() => setCopiedId(null), 2000);
                      }}
                      className="absolute top-4 right-4 bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-slate-350 hover:text-white p-2 rounded-lg cursor-pointer"
                    >
                      {copiedId === 'iframe' ? <Check className="w-3.5 h-3.5 text-brand-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-24 text-center text-xs text-slate-500 font-bold">Querying collection telemetry logs...</div>
            )}
          </main>
        </>
      )}

    </div>
  );
}
