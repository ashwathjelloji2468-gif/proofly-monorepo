'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useStore, Testimonial } from '@/store/useStore';
import { 
  Sparkles, 
  Cpu, 
  Search, 
  Smile, 
  Meh, 
  Frown, 
  Tag, 
  MessageSquare, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle,
  Lightbulb,
  Play,
  ArrowRight,
  Copy,
  Check,
  Share2,
  Globe,
  ExternalLink
} from 'lucide-react';

export default function InsightsPage() {
  const testimonials = useStore(state => state.testimonials);
  const searchTestimonials = useStore(state => state.searchTestimonials);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ReturnType<typeof searchTestimonials>>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // AI Testimonial Amplifier states
  const approvedTestimonials = testimonials.filter(t => t.status === 'approved');
  const [selectedTestimonialId, setSelectedTestimonialId] = useState<string>(
    approvedTestimonials[0]?.id || ''
  );
  const [copiedTwitter, setCopiedTwitter] = useState(false);
  const [copiedLinkedIn, setCopiedLinkedIn] = useState(false);

  // Dynamic AI amplification generation logic (Killer Feature)
  const getTestimonialAIAmplification = (t: Testimonial | undefined) => {
    if (!t) return null;
    const company = t.company || 'their team';
    const name = t.name;
    const role = t.role || 'User';
    
    const twitterDraft = `🚀 Just heard from ${name} (${role} @ ${company}):\n\n"${t.bestQuoteHighlight || t.review.substring(0, 80) + '...'}"\n\nThis is why we built Proofly. Social proof that actually converts. Try it for free! 👇`;
    
    const linkedinDraft = `Nothing beats starting the day with customer love. ❤️\n\n${name}, ${role} at ${company}, shared their experience with us:\n\n"${t.review}"\n\nWith Proofly, we make it dead simple to collect, moderate, and display feedback just like this. How are you sharing social proof on your site?`;

    let placement = "Next to Main CTA";
    let lift = "+18% CTR Lift";
    let reason = "This testimonial emphasizes speed and quick setup. Placing it directly below your primary signup button addresses activation anxiety.";
    
    if (t.video_url) {
      placement = "Stripe Checkout Page";
      lift = "+24% Conversion Lift";
      reason = "Video testimonials drive high emotional connection. Displaying this face-to-face review on your checkout page reduces cart abandonment by validating security and real usage.";
    } else if (t.review.toLowerCase().includes('support') || t.review.toLowerCase().includes('repl')) {
      placement = "Pricing Table Header";
      lift = "+15% Signup Lift";
      reason = "Review highlights exceptional customer service. Placing it near pricing options mitigates buyers' risk anxiety about setup help.";
    } else if (t.review.toLowerCase().includes('api') || t.review.toLowerCase().includes('rest')) {
      placement = "Developer Docs Sidebar";
      lift = "+20% API Call Lift";
      reason = "Mentions technical REST integration speed. Perfect context for developers browsing documentation or API setups.";
    }

    const hooks = t.aiHighlights && t.aiHighlights.length > 0 ? t.aiHighlights : [
      '15-minute onboarding configuration',
      'Boosted trust in seconds',
      'Blazing fast layout widget load times'
    ];

    return {
      twitterDraft,
      linkedinDraft,
      placement,
      lift,
      reason,
      hooks
    };
  };

  const activeTestimonial = approvedTestimonials.find(t => t.id === selectedTestimonialId) || approvedTestimonials[0];
  const aiAmplified = getTestimonialAIAmplification(activeTestimonial);

  const copyToClipboard = (text: string, type: 'twitter' | 'linkedin') => {
    navigator.clipboard.writeText(text);
    if (type === 'twitter') {
      setCopiedTwitter(true);
      setTimeout(() => setCopiedTwitter(false), 2000);
    } else {
      setCopiedLinkedIn(true);
      setTimeout(() => setCopiedLinkedIn(false), 2000);
    }
  };

  // Sentiment counters
  const total = testimonials.length;
  const positive = testimonials.filter(t => t.sentiment === 'POSITIVE').length;
  const neutral = testimonials.filter(t => t.sentiment === 'NEUTRAL').length;
  const negative = testimonials.filter(t => t.sentiment === 'NEGATIVE').length;

  const positivePercent = total > 0 ? Math.round((positive / total) * 100) : 0;
  const neutralPercent = total > 0 ? Math.round((neutral / total) * 100) : 0;
  const negativePercent = total > 0 ? Math.round((negative / total) * 100) : 0;

  // Semantic search execution
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }
    const results = searchTestimonials(searchQuery);
    setSearchResults(results);
    setHasSearched(true);
  };

  // Keyword extraction
  const allKeywords = Array.from(
    new Set(testimonials.flatMap(t => t.keywords))
  ).slice(0, 10);

  // Common praise & issues
  const commonPraise = [
    { title: 'Super Fast Setup', desc: ' CTOS praise integrating REST APIs in under 30 minutes.', weight: 92 },
    { title: 'Time Savings', desc: 'Teams report saving 10+ hours weekly with automated moderation workflows.', weight: 85 },
    { title: 'Clean Interfaces', desc: 'Users love the responsive grid systems & masonry card displays.', weight: 74 }
  ];

  const commonIssues = [
    { title: 'Android camera stream load times', desc: 'A few mobile reviewers experienced lag loading webcam feeds.', severity: 'low' },
    { title: 'Pricing plans clarity', desc: 'Reviewers suggest simpler naming guidelines for plan limits.', severity: 'medium' }
  ];

  return (
    <div className="flex-1 bg-[#09090B] flex flex-col min-w-0">
      {/* Header */}
      <header className="border-b border-border-primary bg-[#09090B]/80 backdrop-blur sticky top-0 z-30 px-8 py-5 flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="font-extrabold text-lg text-white flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-brand-emerald" />
            <span>AI Insights Engine</span>
          </h1>
          <p className="text-[11px] text-muted-foreground">Vector search, sentiment analytics, and autogenerated key takeaways.</p>
        </div>
      </header>

      {/* Main Container */}
      <main className="p-8 space-y-8 max-w-6xl w-full text-left">
        
        {/* Row 1: AI Search Engine */}
        <section className="bg-[#18181B] border border-border-primary rounded-xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-emerald/5 rounded-full blur-3xl -z-10" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-teal/5 rounded-full blur-3xl -z-10" />

          <div className="max-w-2xl space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-brand-teal animate-pulse" />
                <span>AI Semantic & Vector Search</span>
              </h3>
              <p className="text-xs text-muted-foreground">
                Query testimonials using natural language. Try searching "developer documentation", "CTO", or "complaints".
              </p>
            </div>

            {/* Search Input Form */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. speed and api onboarding..."
                  className="w-full bg-[#09090B] border border-border-primary focus:border-brand-emerald outline-none rounded-lg pl-10 pr-4 py-2.5 text-xs text-slate-100 placeholder:text-zinc-600 transition"
                />
              </div>
              <button
                type="submit"
                className="bg-gradient-to-r from-brand-emerald to-brand-teal text-white hover:opacity-90 font-bold text-xs px-5 py-2.5 rounded-lg transition shrink-0 cursor-pointer shadow-md shadow-brand-emerald/15"
              >
                Query Vector
              </button>
            </form>
          </div>

          {/* Search results mapping */}
          {hasSearched && (
            <div className="mt-6 border-t border-border-primary/50 pt-5 space-y-4">
              <h4 className="text-[10px] font-extrabold text-brand-teal uppercase tracking-widest">
                Search Results ({searchResults.length})
              </h4>

              {searchResults.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">No vector matches found for your query. Try different keywords.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {searchResults.map(({ testimonial: t, relevanceScore, matchReason }) => (
                    <div 
                      key={t.id} 
                      className="bg-[#09090B] border border-border-primary p-4 rounded-xl space-y-3 hover:border-zinc-800 transition"
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-white">{t.name}</span>
                          <span className="text-zinc-500">{t.role}</span>
                        </div>
                        <span className="bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/20 px-2 py-0.5 rounded font-black text-[11px]">
                          {relevanceScore * 10}% match
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 line-clamp-3">"{t.review}"</p>

                      <div className="flex items-center space-x-1.5 text-[11px] text-zinc-500 pt-1 border-t border-border-primary/20">
                        <Lightbulb className="w-3 h-3 text-brand-teal" />
                        <span>AI Reason: {matchReason}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* AI TESTIMONIAL AMPLIFIER - ONE KILLER FEATURE */}
        {approvedTestimonials.length > 0 && aiAmplified && (
          <section className="bg-[#18181B] border border-border-primary rounded-xl p-6 shadow-xl relative overflow-hidden space-y-6">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-emerald/5 rounded-full blur-3xl -z-10" />
            
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-primary/50">
              <div className="space-y-1 text-left">
                <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                  <Share2 className="w-4 h-4 text-brand-emerald animate-pulse" />
                  <span>AI Testimonial Amplifier</span>
                  <span className="bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/20 text-[11px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
                    Killer Feature
                  </span>
                </h3>
                <p className="text-[11px] text-muted-foreground">
                  Select an approved testimonial to extract hooks, draft social posts, and get high-conversion placement advice.
                </p>
              </div>

              {/* Selector */}
              <div className="flex items-center space-x-2.5">
                <label htmlFor="testimonial-selector" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Select review:</label>
                <select
                  id="testimonial-selector"
                  value={selectedTestimonialId}
                  onChange={(e) => setSelectedTestimonialId(e.target.value)}
                  className="bg-[#09090B] border border-border-primary outline-none text-xs text-white rounded-lg px-3 py-2 cursor-pointer focus:border-brand-emerald transition"
                >
                  {approvedTestimonials.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.company || 'User'})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selector Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Column 1: Reviewer & Persuasive Hooks (4 cols) */}
              <div className="lg:col-span-4 bg-[#09090B] border border-border-primary/60 p-5 rounded-xl flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <span className="text-[11px] font-extrabold text-[#6366F1] uppercase tracking-widest block text-left">Review Details & Hooks</span>
                  
                  {/* Review Box */}
                  <div className="bg-[#12161D]/40 border border-border-primary/50 p-3.5 rounded-lg text-xs leading-relaxed italic text-slate-300 text-left">
                    "{activeTestimonial?.review}"
                  </div>

                  {/* Highlights */}
                  <div className="space-y-2 pt-2 text-left">
                    <span className="text-[11px] font-bold text-slate-500 uppercase block">Extracted conversion hooks:</span>
                    <div className="space-y-1.5">
                      {aiAmplified.hooks.map((hook, i) => (
                        <div key={i} className="flex items-center space-x-2 text-xs text-slate-200">
                          <CheckCircle2 className="w-3.5 h-3.5 text-brand-emerald shrink-0" />
                          <span>{hook}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2.5 pt-3 border-t border-border-primary/30">
                  <img 
                    src={activeTestimonial?.reviewerAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${activeTestimonial?.name}`}
                    alt={activeTestimonial?.name}
                    className="w-8 h-8 rounded-full border border-border-primary object-cover"
                  />
                  <div className="text-left">
                    <span className="text-xs font-bold text-white block">{activeTestimonial?.name}</span>
                    <span className="text-[10px] text-muted-foreground block leading-none mt-1">
                      {activeTestimonial?.role}{activeTestimonial?.company ? ` at ${activeTestimonial?.company}` : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Column 2: Social Media Autopilot (4 cols) */}
              <div className="lg:col-span-4 bg-[#09090B] border border-border-primary/60 p-5 rounded-xl flex flex-col justify-between space-y-4">
                <div className="space-y-4">
                  <span className="text-[11px] font-extrabold text-[#6366F1] uppercase tracking-widest block text-left">Social Media Autopilot</span>
                  
                  {/* Twitter Copy */}
                  <div className="space-y-2 text-left">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-slate-400">𝕏 (Twitter) Draft</span>
                      <button
                        onClick={() => copyToClipboard(aiAmplified.twitterDraft, 'twitter')}
                        className="text-brand-emerald hover:underline flex items-center space-x-1 cursor-pointer font-bold"
                      >
                        {copiedTwitter ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedTwitter ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <div className="bg-[#12161D]/40 border border-border-primary/50 p-3 rounded-lg text-[11px] font-mono leading-relaxed text-zinc-400 whitespace-pre-wrap select-all max-h-32 overflow-y-auto scrollbar-thin">
                      {aiAmplified.twitterDraft}
                    </div>
                  </div>

                  {/* LinkedIn Copy */}
                  <div className="space-y-2 text-left">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-slate-400">LinkedIn Draft</span>
                      <button
                        onClick={() => copyToClipboard(aiAmplified.linkedinDraft, 'linkedin')}
                        className="text-brand-emerald hover:underline flex items-center space-x-1 cursor-pointer font-bold"
                      >
                        {copiedLinkedIn ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedLinkedIn ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <div className="bg-[#12161D]/40 border border-border-primary/50 p-3 rounded-lg text-[11px] font-mono leading-relaxed text-zinc-400 h-28 overflow-y-auto scrollbar-thin whitespace-pre-wrap select-all">
                      {aiAmplified.linkedinDraft}
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 3: Conversion Placement Recommendations (4 cols) */}
              <div className="lg:col-span-4 bg-[#09090B] border border-border-primary/60 p-5 rounded-xl flex flex-col justify-between space-y-4">
                <div className="space-y-4 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold text-[#6366F1] uppercase tracking-widest block">Placement Recommendation</span>
                    <span className="bg-brand-teal/15 border border-brand-teal/30 text-brand-teal text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow-[0_0_12px_rgba(99,102,241,0.2)] animate-pulse">
                      {aiAmplified.lift}
                    </span>
                  </div>

                  {/* Placement Box */}
                  <div className="bg-gradient-to-r from-brand-emerald/10 to-brand-teal/10 border border-brand-emerald/20 p-4 rounded-xl space-y-2">
                    <div className="flex items-center space-x-2 text-xs font-bold text-white">
                      <Globe className="w-4 h-4 text-brand-teal" />
                      <span>Recommended Zone:</span>
                    </div>
                    <div className="text-sm font-black text-brand-emerald tracking-wide">
                      {aiAmplified.placement}
                    </div>
                  </div>

                  {/* Psychological Reason */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-500 uppercase block">Psychological conversion analysis:</span>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {aiAmplified.reason}
                    </p>
                  </div>
                </div>

                <Link href="/dashboard/widgets" className="w-full">
                  <button className="w-full bg-[#18181B] hover:bg-[#2E3445] border border-border-primary text-slate-300 hover:text-white font-bold text-xs py-2.5 rounded-lg flex items-center justify-center space-x-2 transition cursor-pointer">
                    <span>Configure Widgets</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </Link>
              </div>

            </div>
          </section>
        )}

        {/* Row 2: Sentiment breakdown & Tag Cloud */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Sentiment Summary */}
          <div className="bg-[#18181B] border border-border-primary rounded-xl p-6 shadow-xl space-y-4 md:col-span-2">
            <h3 className="text-white text-sm font-bold flex items-center space-x-1.5">
              <Smile className="w-4 h-4 text-brand-emerald" />
              <span>Sentiment Distribution Analytics</span>
            </h3>

            {/* Custom Horizontal Stacked Bar representation */}
            <div className="space-y-4 pt-2">
              <div className="h-6 bg-[#09090B] rounded-lg overflow-hidden flex border border-border-primary">
                {positivePercent > 0 && (
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-600 to-brand-emerald flex items-center justify-center text-[11px] font-black text-white" 
                    style={{ width: `${positivePercent}%` }}
                    title={`Positive: ${positive}`}
                  >
                    {positivePercent}%
                  </div>
                )}
                {neutralPercent > 0 && (
                  <div 
                    className="h-full bg-brand-teal flex items-center justify-center text-[11px] font-black text-white" 
                    style={{ width: `${neutralPercent}%` }}
                    title={`Neutral: ${neutral}`}
                  >
                    {neutralPercent}%
                  </div>
                )}
                {negativePercent > 0 && (
                  <div 
                    className="h-full bg-red-600 flex items-center justify-center text-[11px] font-black text-white" 
                    style={{ width: `${negativePercent}%` }}
                    title={`Negative: ${negative}`}
                  >
                    {negativePercent}%
                  </div>
                )}
              </div>

              {/* Labels details */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-[#09090B] border border-border-primary p-3 rounded-lg flex items-center justify-center space-x-2">
                  <Smile className="w-4 h-4 text-brand-emerald" />
                  <div className="text-left">
                    <span className="text-[10px] text-muted-foreground block font-bold">Positive</span>
                    <span className="text-sm font-black text-white">{positive} reviews</span>
                  </div>
                </div>

                <div className="bg-[#09090B] border border-border-primary p-3 rounded-lg flex items-center justify-center space-x-2">
                  <Meh className="w-4 h-4 text-brand-teal" />
                  <div className="text-left">
                    <span className="text-[10px] text-muted-foreground block font-bold">Neutral</span>
                    <span className="text-sm font-black text-white">{neutral} reviews</span>
                  </div>
                </div>

                <div className="bg-[#09090B] border border-border-primary p-3 rounded-lg flex items-center justify-center space-x-2">
                  <Frown className="w-4 h-4 text-red-500" />
                  <div className="text-left">
                    <span className="text-[10px] text-muted-foreground block font-bold">Negative</span>
                    <span className="text-sm font-black text-white">{negative} reviews</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Tag Cloud */}
          <div className="bg-[#18181B] border border-border-primary rounded-xl p-6 shadow-xl space-y-4">
            <h3 className="text-white text-sm font-bold flex items-center space-x-1.5">
              <Tag className="w-4 h-4 text-brand-teal" />
              <span>Keyword Extraction Cloud</span>
            </h3>
            <p className="text-[10px] text-muted-foreground">Recurring terms detected automatically by local transcription NLP models.</p>

            <div className="flex flex-wrap gap-2 pt-2">
              {allKeywords.map((kw, i) => (
                <span
                  key={kw}
                  className={`border rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer hover:border-brand-emerald ${
                    i % 3 === 0 
                      ? 'bg-brand-emerald/10 border-brand-emerald/20 text-brand-emerald' 
                      : i % 3 === 1
                      ? 'bg-brand-teal/10 border-brand-teal/20 text-brand-teal'
                      : 'bg-zinc-800 border-border-primary text-slate-400'
                  }`}
                >
                  #{kw}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Row 3: Praise & Complaints detailed analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Praise Points */}
          <div className="bg-[#18181B] border border-border-primary rounded-xl p-6 shadow-xl space-y-4">
            <h3 className="text-white text-sm font-bold flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-brand-emerald" />
              <span>Key Praise Metrics</span>
            </h3>

            <div className="space-y-4 pt-2">
              {commonPraise.map((p) => (
                <div key={p.title} className="bg-[#09090B] border border-border-primary p-4 rounded-xl space-y-2 text-left">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-white">{p.title}</span>
                    <span className="text-brand-emerald">{p.weight}% confidence</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Issues / Complaints */}
          <div className="bg-[#18181B] border border-border-primary rounded-xl p-6 shadow-xl space-y-4">
            <h3 className="text-white text-sm font-bold flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span>Detected Complaints</span>
            </h3>

            <div className="space-y-4 pt-2">
              {commonIssues.map((issue) => (
                <div key={issue.title} className="bg-[#09090B] border border-border-primary p-4 rounded-xl space-y-2 text-left">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-white">{issue.title}</span>
                    <span className={`text-[11px] font-black uppercase px-2 py-0.5 rounded border ${
                      issue.severity === 'medium'
                        ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        : 'bg-zinc-800 text-zinc-400 border-border-primary'
                    }`}>
                      {issue.severity} Priority
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{issue.desc}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
