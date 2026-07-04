'use client';

import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { 
  Sparkles,
  TrendingUp,
  Cpu,
  History,
  Copy,
  Check,
  Languages,
  PenTool,
  Award,
  Globe,
  FileText,
  Layout,
  Plus,
  MessageSquare,
  AlertCircle,
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';

export default function AIStudioDashboardPage() {
  const user = useStore(state => state.user);
  const collections = useStore(state => state.collections); // spaces list
  const testimonials = useStore(state => state.testimonials); // testimonials list

  const aiUsage = useStore(state => state.aiUsage);
  const aiHistory = useStore(state => state.aiHistory);
  const aiInsights = useStore(state => state.aiInsights);

  const fetchAIUsage = useStore(state => state.fetchAIUsage);
  const fetchAIHistory = useStore(state => state.fetchAIHistory);
  const fetchAIInsights = useStore(state => state.fetchAIInsights);

  const rewriteTestimonial = useStore(state => state.rewriteTestimonial);
  const analyzeTestimonial = useStore(state => state.analyzeTestimonial);
  const translateTestimonial = useStore(state => state.translateTestimonial);
  const generateSocialContent = useStore(state => state.generateSocialContent);
  const generateLandingPageContent = useStore(state => state.generateLandingPageContent);
  const generateCaseStudyContent = useStore(state => state.generateCaseStudyContent);

  const [selectedSpaceId, setSelectedSpaceId] = useState<string>('');
  const [activeTool, setActiveTool] = useState<'rewrite' | 'quality' | 'social' | 'landing' | 'case_study' | 'usage'>('rewrite');

  // Tool states
  const [selectedTestimonialId, setSelectedTestimonialId] = useState<string>('');
  const [selectedTone, setSelectedTone] = useState('PROFESSIONAL');
  const [selectedLocale, setSelectedLocale] = useState('ES');
  const [rewriteOutput, setRewriteOutput] = useState('');
  
  const [qualityScore, setQualityScore] = useState<any | null>(null);
  const [socialOutput, setSocialOutput] = useState('');
  const [socialPlatform, setSocialPlatform] = useState('LINKEDIN');

  const [landingLayout, setLandingLayout] = useState('HERO');
  const [landingOutput, setLandingOutput] = useState('');

  const [selectedReviewIds, setSelectedReviewIds] = useState<string[]>([]);
  const [caseStudyOutput, setCaseStudyOutput] = useState('');

  const [processing, setProcessing] = useState(false);
  const [copiedFeature, setCopiedFeature] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  useEffect(() => {
    if (collections.length > 0) {
      const defaultSpace = collections[0].id;
      setSelectedSpaceId(defaultSpace);
      loadAIData(defaultSpace);
    }
  }, [collections]);

  const loadAIData = (spaceId: string) => {
    fetchAIUsage(spaceId);
    fetchAIHistory(spaceId);
    fetchAIInsights(spaceId);
  };

  const handleSpaceChange = (spaceId: string) => {
    setSelectedSpaceId(spaceId);
    loadAIData(spaceId);
  };

  // Filter testimonials for space
  const spaceTestimonials = testimonials.filter(t => t.collection_id === selectedSpaceId && t.status === 'approved');

  // Sync default testimonial ID
  useEffect(() => {
    if (spaceTestimonials.length > 0) {
      setSelectedTestimonialId(spaceTestimonials[0].id);
    }
  }, [selectedSpaceId]);

  const triggerRewrite = async () => {
    if (!selectedTestimonialId) return;
    setProcessing(true);
    try {
      const res = await rewriteTestimonial(selectedTestimonialId, selectedTone);
      if (res) {
        setRewriteOutput(res);
        loadAIData(selectedSpaceId);
      }
    } catch (e: any) {
      setErrorToast(e.message || 'Credit limit error.');
      setTimeout(() => setErrorToast(null), 4000);
    } finally {
      setProcessing(false);
    }
  };

  const triggerTranslate = async () => {
    if (!selectedTestimonialId) return;
    setProcessing(true);
    try {
      const res = await translateTestimonial(selectedTestimonialId, selectedLocale);
      if (res) {
        setRewriteOutput(res.translatedText);
        loadAIData(selectedSpaceId);
      }
    } catch (e: any) {
      setErrorToast(e.message || 'Credit limit error.');
      setTimeout(() => setErrorToast(null), 4000);
    } finally {
      setProcessing(false);
    }
  };

  const triggerQualityAudit = async () => {
    if (!selectedTestimonialId) return;
    setProcessing(true);
    try {
      const res = await analyzeTestimonial(selectedTestimonialId);
      if (res) {
        setQualityScore(res);
        loadAIData(selectedSpaceId);
      }
    } catch (e: any) {
      setErrorToast(e.message || 'Credit limit error.');
      setTimeout(() => setErrorToast(null), 4000);
    } finally {
      setProcessing(false);
    }
  };

  const triggerSocialGenerator = async () => {
    if (!selectedTestimonialId) return;
    setProcessing(true);
    try {
      const res = await generateSocialContent(selectedTestimonialId, socialPlatform);
      if (res) {
        setSocialOutput(res);
        loadAIData(selectedSpaceId);
      }
    } catch (e: any) {
      setErrorToast(e.message || 'Credit limit error.');
      setTimeout(() => setErrorToast(null), 4000);
    } finally {
      setProcessing(false);
    }
  };

  const triggerLandingGenerator = async () => {
    setProcessing(true);
    try {
      const res = await generateLandingPageContent(selectedSpaceId, landingLayout);
      if (res) {
        setLandingOutput(res);
        loadAIData(selectedSpaceId);
      }
    } catch (e: any) {
      setErrorToast(e.message || 'Credit limit error.');
      setTimeout(() => setErrorToast(null), 4000);
    } finally {
      setProcessing(false);
    }
  };

  const triggerCaseStudyGenerator = async () => {
    setProcessing(true);
    try {
      const res = await generateCaseStudyContent(selectedSpaceId, selectedReviewIds);
      if (res) {
        setCaseStudyOutput(res);
        loadAIData(selectedSpaceId);
      }
    } catch (e: any) {
      setErrorToast(e.message || 'Credit limit error.');
      setTimeout(() => setErrorToast(null), 4000);
    } finally {
      setProcessing(false);
    }
  };

  const copyTextOutput = (text: string, feature: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFeature(feature);
    setTimeout(() => setCopiedFeature(null), 2000);
  };

  const handleToggleCaseStudyReview = (id: string) => {
    if (selectedReviewIds.includes(id)) {
      setSelectedReviewIds(selectedReviewIds.filter(x => x !== id));
    } else {
      setSelectedReviewIds([...selectedReviewIds, id]);
    }
  };

  return (
    <div className="flex-1 bg-[#09090B] flex flex-col min-w-0 text-slate-100 font-sans">
      
      {/* Toast Alert */}
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
            <Sparkles className="w-5 h-5 text-brand-emerald fill-brand-emerald/10" />
            <span>AI Testimonial Studio</span>
          </h1>
          <p className="text-[11px] text-muted-foreground">Improve content readability, translate reviews, compile case study results, and generate marketing posts.</p>
        </div>
      </header>

      <main className="p-8 space-y-6 max-w-6xl w-full text-left">
        
        {/* Workspace selector & usage indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center space-x-3 bg-[#18181B] border border-border-primary p-4 rounded-xl shadow-md">
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

          {aiUsage && (
            <div className="bg-[#18181B] border border-border-primary p-4 rounded-xl shadow-md flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-[11px] uppercase font-bold text-slate-450 tracking-wider">Monthly AI Usage Credits</span>
                <div className="text-lg font-black text-white">
                  <span>{aiUsage.credits}</span>
                  <span className="text-slate-550"> / {aiUsage.limit} credits used</span>
                </div>
              </div>
              {user?.tier === 'FREE' && (
                <a 
                  href="/dashboard/settings" 
                  className="bg-brand-emerald text-white hover:opacity-95 font-bold text-[10px] py-1.5 px-3 rounded transition"
                >
                  Upgrade
                </a>
              )}
            </div>
          )}
        </div>

        {/* AI Tool Menu Tabs */}
        <div className="flex space-x-2 border-b border-border-primary/50 pb-2  overflow-x-auto scrollbar-none">
          {[
            { id: 'rewrite', label: 'Rewrite & Translate', icon: <PenTool className="w-3.5 h-3.5" /> },
            { id: 'quality', label: 'Quality Audit', icon: <Award className="w-3.5 h-3.5" /> },
            { id: 'social', label: 'Social Generator', icon: <Cpu className="w-3.5 h-3.5" /> },
            { id: 'landing', label: 'Landing Page Copy', icon: <Layout className="w-3.5 h-3.5" /> },
            { id: 'case_study', label: 'Case Studies', icon: <FileText className="w-3.5 h-3.5" /> },
            { id: 'usage', label: 'Usage History', icon: <History className="w-3.5 h-3.5" /> }
          ].map(tool => (
            <button
              key={tool.id}
              onClick={() => setActiveTool(tool.id as any)}
              className={`flex items-center space-x-1.5 text-xs font-black uppercase px-4 py-2 border rounded-lg transition cursor-pointer whitespace-nowrap ${
                activeTool === tool.id
                  ? 'bg-brand-emerald/10 text-brand-emerald border-brand-emerald/20'
                  : 'bg-[#18181B] text-slate-400 border-border-primary hover:text-white'
              }`}
            >
              {tool.icon}
              <span>{tool.label}</span>
            </button>
          ))}
        </div>

        {/* TOOL 1: REWRITE & TRANSLATE */}
        {activeTool === 'rewrite' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Input choices */}
            <div className="bg-[#18181B] border border-border-primary p-6 rounded-2xl space-y-4 shadow-xl text-left">
              <h3 className="text-white text-xs font-black uppercase tracking-wider border-b border-border-primary/50 pb-2 flex items-center space-x-1.5">
                <PenTool className="w-4 h-4 text-brand-emerald" />
                <span>Configure Input Options</span>
              </h3>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Select Testimonial</label>
                  <select
                    value={selectedTestimonialId}
                    onChange={(e) => setSelectedTestimonialId(e.target.value)}
                    className="w-full bg-[#09090B] border border-border-primary rounded-lg text-xs py-2 px-3 text-slate-200 focus:border-brand-emerald outline-none cursor-pointer"
                  >
                    {spaceTestimonials.map(t => (
                      <option key={t.id} value={t.id}>{t.name} - {t.review?.substring(0, 40)}...</option>
                    ))}
                  </select>
                </div>

                <div className="border-t border-border-primary/50 pt-4 space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-brand-teal">Option A: AI Rewrite</h4>
                  <div className="flex gap-2.5">
                    <select
                      value={selectedTone}
                      onChange={(e) => setSelectedTone(e.target.value)}
                      className="flex-1 bg-[#09090B] border border-border-primary rounded-lg text-xs py-2 px-2 text-slate-200 focus:border-brand-emerald outline-none cursor-pointer"
                    >
                      <option value="PROFESSIONAL">Professional Tone</option>
                      <option value="FRIENDLY">Friendly Tone</option>
                      <option value="TECHNICAL">Technical Details Tone</option>
                      <option value="MARKETING">Marketing Tone</option>
                    </select>
                    <button
                      onClick={triggerRewrite}
                      disabled={processing}
                      className="bg-brand-emerald text-white hover:opacity-95 font-bold text-xs px-4 rounded-lg cursor-pointer"
                    >
                      {processing ? '...' : 'Rewrite'}
                    </button>
                  </div>
                </div>

                <div className="border-t border-border-primary/50 pt-4 space-y-3">
                  <h4 className="text-[10px] font-black uppercase text-brand-teal">Option B: Translate Review</h4>
                  <div className="flex gap-2.5">
                    <select
                      value={selectedLocale}
                      onChange={(e) => setSelectedLocale(e.target.value)}
                      className="flex-1 bg-[#09090B] border border-border-primary rounded-lg text-xs py-2 px-2 text-slate-200 focus:border-brand-emerald outline-none cursor-pointer"
                    >
                      <option value="ES">Spanish (ES)</option>
                      <option value="FR">French (FR)</option>
                      <option value="DE">German (DE)</option>
                      <option value="JA">Japanese (JA)</option>
                    </select>
                    <button
                      onClick={triggerTranslate}
                      disabled={processing}
                      className="bg-brand-teal text-white hover:opacity-95 font-bold text-xs px-4 rounded-lg cursor-pointer"
                    >
                      {processing ? '...' : 'Translate'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Preview Output */}
            <div className="bg-[#18181B] border border-border-primary p-6 rounded-2xl space-y-4 shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-white text-xs font-black uppercase tracking-wider border-b border-border-primary/50 pb-2">AI Generated Preview</h3>
                <div className="bg-[#09090B] border border-border-primary rounded-xl p-4 min-h-[160px] text-xs leading-relaxed text-slate-300 italic pt-6 relative">
                  {rewriteOutput ? `"${rewriteOutput}"` : 'Your processed testimonial output preview will render here...'}
                  {rewriteOutput && (
                    <button
                      onClick={() => copyTextOutput(rewriteOutput, 'rewrite')}
                      className="absolute top-2 right-2 bg-zinc-900 border border-zinc-800 p-1.5 rounded hover:text-white"
                    >
                      {copiedFeature === 'rewrite' ? <Check className="w-3.5 h-3.5 text-brand-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TOOL 2: QUALITY SCORE AUDIT */}
        {activeTool === 'quality' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="bg-[#18181B] border border-border-primary p-6 rounded-2xl space-y-4 shadow-xl">
              <h3 className="text-white text-xs font-black uppercase tracking-wider border-b border-border-primary/50 pb-2">Select Testimonial to Audit</h3>
              <div className="space-y-4">
                <select
                  value={selectedTestimonialId}
                  onChange={(e) => setSelectedTestimonialId(e.target.value)}
                  className="w-full bg-[#09090B] border border-border-primary rounded-lg text-xs py-2 px-3 text-slate-200 focus:border-brand-emerald outline-none cursor-pointer"
                >
                  {spaceTestimonials.map(t => (
                    <option key={t.id} value={t.id}>{t.name} - {t.review?.substring(0, 40)}...</option>
                  ))}
                </select>

                <button
                  onClick={triggerQualityAudit}
                  disabled={processing}
                  className="w-full bg-brand-emerald text-white hover:opacity-95 font-black text-xs py-2.5 rounded-lg flex items-center justify-center space-x-1 cursor-pointer transition shadow-md shadow-brand-emerald/10"
                >
                  <Award className="w-4 h-4" />
                  <span>Audit Testimonial Quality</span>
                </button>
              </div>
            </div>

            {/* Audit Output Score */}
            <div className="bg-[#18181B] border border-border-primary p-6 rounded-2xl space-y-4 shadow-xl flex flex-col justify-between">
              {qualityScore ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-border-primary/50 pb-2">
                    <span className="text-xs font-black uppercase text-slate-400">Quality Index</span>
                    <span className="text-xl font-black text-brand-emerald">{qualityScore.qualityScore} / 100</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-zinc-900 border border-zinc-800 p-2.5 rounded-lg">
                      <span className="text-[11px] uppercase text-slate-450 block font-bold">Credibility</span>
                      <span className="text-xs font-bold text-slate-200">{qualityScore.credibility}</span>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 p-2.5 rounded-lg">
                      <span className="text-[11px] uppercase text-slate-450 block font-bold">Specificity</span>
                      <span className="text-xs font-bold text-slate-200">{qualityScore.specificity}</span>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 p-2.5 rounded-lg">
                      <span className="text-[11px] uppercase text-slate-450 block font-bold">Storytelling</span>
                      <span className="text-xs font-bold text-slate-200">{qualityScore.storytelling}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-brand-teal/5 border border-brand-teal/20 rounded-lg text-xs leading-relaxed text-slate-300">
                    💡 <strong>Suggestions:</strong> {qualityScore.suggestions}
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-slate-500 font-bold">Select a testimonial on the side to run a quality audit analysis.</div>
              )}
            </div>
          </div>
        )}

        {/* TOOL 3: SOCIAL GENERATOR */}
        {activeTool === 'social' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="bg-[#18181B] border border-border-primary p-6 rounded-2xl space-y-4 shadow-xl">
              <h3 className="text-white text-xs font-black uppercase tracking-wider border-b border-border-primary/50 pb-2">Social Post Settings</h3>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Select Testimonial</label>
                  <select
                    value={selectedTestimonialId}
                    onChange={(e) => setSelectedTestimonialId(e.target.value)}
                    className="w-full bg-[#09090B] border border-border-primary rounded-lg text-xs py-2 px-3 text-slate-200 focus:border-brand-emerald outline-none cursor-pointer"
                  >
                    {spaceTestimonials.map(t => (
                      <option key={t.id} value={t.id}>{t.name} - {t.review?.substring(0, 40)}...</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Social Channel</label>
                  <select
                    value={socialPlatform}
                    onChange={(e) => setSocialPlatform(e.target.value)}
                    className="w-full bg-[#09090B] border border-border-primary rounded-lg text-xs py-2 px-3 text-slate-200 focus:border-brand-emerald outline-none cursor-pointer"
                  >
                    <option value="LINKEDIN">LinkedIn Post</option>
                    <option value="TWITTER">Twitter/X Post</option>
                  </select>
                </div>

                <button
                  onClick={triggerSocialGenerator}
                  className="w-full bg-brand-emerald text-white hover:opacity-95 font-black text-xs py-2.5 rounded-lg flex items-center justify-center space-x-1 cursor-pointer transition"
                >
                  <span>Generate Post</span>
                </button>
              </div>
            </div>

            {/* Social Post Preview Output */}
            <div className="bg-[#18181B] border border-border-primary p-6 rounded-2xl space-y-4 shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-white text-xs font-black uppercase tracking-wider border-b border-border-primary/50 pb-2">Social Copy Preview</h3>
                <div className="bg-[#09090B] border border-border-primary rounded-xl p-4 min-h-[160px] text-xs leading-relaxed text-slate-300 whitespace-pre-wrap pt-6 relative">
                  {socialOutput || 'Your social copy templates will render here...'}
                  {socialOutput && (
                    <button
                      onClick={() => copyTextOutput(socialOutput, 'social')}
                      className="absolute top-2 right-2 bg-zinc-900 border border-zinc-800 p-1.5 rounded hover:text-white"
                    >
                      {copiedFeature === 'social' ? <Check className="w-3.5 h-3.5 text-brand-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TOOL 4: LANDING PAGE COPY */}
        {activeTool === 'landing' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="bg-[#18181B] border border-border-primary p-6 rounded-2xl space-y-4 shadow-xl">
              <h3 className="text-white text-xs font-black uppercase tracking-wider border-b border-border-primary/50 pb-2">Landing Page Settings</h3>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Section Focus</label>
                  <select
                    value={landingLayout}
                    onChange={(e) => setLandingLayout(e.target.value)}
                    className="w-full bg-[#09090B] border border-border-primary rounded-lg text-xs py-2 px-3 text-slate-200 focus:border-brand-emerald outline-none cursor-pointer"
                  >
                    <option value="HERO">Hero Section Copies</option>
                    <option value="FEATURES">Product Feature Copy</option>
                    <option value="FAQ">Social Proof FAQs</option>
                  </select>
                </div>

                <button
                  onClick={triggerLandingGenerator}
                  className="w-full bg-brand-emerald text-white hover:opacity-95 font-black text-xs py-2.5 rounded-lg flex items-center justify-center space-x-1 cursor-pointer transition"
                >
                  <span>Generate Landing Copy</span>
                </button>
              </div>
            </div>

            {/* Landing Output Preview */}
            <div className="bg-[#18181B] border border-border-primary p-6 rounded-2xl space-y-4 shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-white text-xs font-black uppercase tracking-wider border-b border-border-primary/50 pb-2">Page Copy Preview</h3>
                <div className="bg-[#09090B] border border-border-primary rounded-xl p-4 min-h-[160px] text-xs leading-relaxed text-slate-350 whitespace-pre-wrap pt-6 relative">
                  {landingOutput || 'Your landing copy details will render here...'}
                  {landingOutput && (
                    <button
                      onClick={() => copyTextOutput(landingOutput, 'landing')}
                      className="absolute top-2 right-2 bg-zinc-900 border border-zinc-800 p-1.5 rounded hover:text-white"
                    >
                      {copiedFeature === 'landing' ? <Check className="w-3.5 h-3.5 text-brand-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TOOL 5: CASE STUDY GENERATOR */}
        {activeTool === 'case_study' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="bg-[#18181B] border border-border-primary p-6 rounded-2xl space-y-4 shadow-xl">
              <h3 className="text-white text-xs font-black uppercase tracking-wider border-b border-border-primary/50 pb-2">Select Reference Reviews</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {spaceTestimonials.map(t => (
                  <label key={t.id} className="flex items-start space-x-2.5 p-2 bg-zinc-900 border border-zinc-800 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedReviewIds.includes(t.id)}
                      onChange={() => handleToggleCaseStudyReview(t.id)}
                      className="mt-0.5 accent-brand-emerald"
                    />
                    <div className="space-y-0.5">
                      <span className="text-[11px] font-bold text-white block">{t.name}</span>
                      <p className="text-[10px] text-slate-450 line-clamp-1">{t.review}</p>
                    </div>
                  </label>
                ))}
              </div>

              <button
                onClick={triggerCaseStudyGenerator}
                className="w-full bg-brand-emerald text-white hover:opacity-95 font-black text-xs py-2.5 rounded-lg flex items-center justify-center space-x-1 cursor-pointer transition"
              >
                <span>Compile Case Study Story</span>
              </button>
            </div>

            {/* Case Study Output Preview */}
            <div className="bg-[#18181B] border border-border-primary p-6 rounded-2xl space-y-4 shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-white text-xs font-black uppercase tracking-wider border-b border-border-primary/50 pb-2">Case Study Outline Preview</h3>
                <div className="bg-[#09090B] border border-border-primary rounded-xl p-4 min-h-[160px] text-xs leading-relaxed text-slate-350 whitespace-pre-wrap pt-6 relative">
                  {caseStudyOutput || 'Your case study outline details will render here...'}
                  {caseStudyOutput && (
                    <button
                      onClick={() => copyTextOutput(caseStudyOutput, 'case_study')}
                      className="absolute top-2 right-2 bg-zinc-900 border border-zinc-800 p-1.5 rounded hover:text-white"
                    >
                      {copiedFeature === 'case_study' ? <Check className="w-3.5 h-3.5 text-brand-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TOOL 6: USAGE HISTORY */}
        {activeTool === 'usage' && (
          <div className="bg-[#18181B] border border-border-primary rounded-2xl p-6 space-y-4 shadow-xl text-left">
            <h3 className="text-white text-xs font-black uppercase tracking-wider border-b border-border-primary/50 pb-2">AI History Logs</h3>
            
            <div className="overflow-x-auto ">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border-primary text-[10px] text-slate-400 font-black uppercase tracking-wider">
                    <th className="py-3 px-2">Operation</th>
                    <th className="py-3 px-2">Credits Used</th>
                    <th className="py-3 px-2">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {aiHistory.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-6 text-center text-slate-500 font-bold">No operations logged yet.</td>
                    </tr>
                  ) : (
                    aiHistory.map(log => (
                      <tr key={log.id} className="border-b border-border-primary/40 hover:bg-[#202024] transition">
                        <td className="py-3.5 px-2 text-white font-bold">{log.feature}</td>
                        <td className="py-3.5 px-2 font-mono text-brand-emerald font-black">-{log.creditsUsed} credit</td>
                        <td className="py-3.5 px-2 text-slate-400">{new Date(log.createdAt).toLocaleDateString()}</td>
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
