'use client';

import React, { useState } from 'react';
import { useStore, Testimonial } from '@/store/useStore';
import { 
  Inbox, 
  Check, 
  X, 
  Archive, 
  Trash2, 
  Search, 
  Star, 
  ExternalLink, 
  Sparkles,
  Calendar,
  Smile,
  Meh,
  Frown,
  MessageSquare,
  Video,
  Eye,
  Share2,
  Tag,
  ChevronDown,
  Loader2,
  User,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InboxPage() {
  const collections = useStore(state => state.collections);
  const testimonials = useStore(state => state.testimonials);
  const updateStatus = useStore(state => state.updateTestimonialStatus);
  const deleteTestimonial = useStore(state => state.deleteTestimonial);

  // Filters
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'archived'>('all');
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected Testimonial for Master-Detail view
  const [activeId, setActiveId] = useState<string | null>(null);

  // AI Avatar Synthesis states
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [avatarName, setAvatarName] = useState('J. Ashwath');
  const [avatarRole, setAvatarRole] = useState('Growth Lead');
  const [avatarCompany, setAvatarCompany] = useState('Stripe');
  const [avatarScript, setAvatarScript] = useState('The checkout speed has skyrocketed. Highly recommended for all developer workspaces!');
  const [avatarGender, setAvatarGender] = useState<'male' | 'female'>('female');
  const [synthesisStep, setSynthesisStep] = useState<'idle' | 'voice' | 'video' | 'save' | 'success'>('idle');

  const handleGenerateAvatar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!avatarName || !avatarScript) return;
    
    setSynthesisStep('voice');
    
    setTimeout(() => {
      setSynthesisStep('video');
    }, 1000);
    
    setTimeout(() => {
      setSynthesisStep('save');
    }, 2000);
    
    setTimeout(() => {
      const generatedId = `vid-ai-${Date.now()}`;
      const videoUrl = avatarGender === 'female'
        ? 'https://www.w3schools.com/html/mov_bbb.mp4'
        : 'https://www.w3schools.com/html/movie.mp4';
      
      const avatarUrl = avatarGender === 'female'
        ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
        : 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150';

      const newTestimonial: Testimonial = {
        id: generatedId,
        collection_id: selectedCollectionId === 'all' ? (collections[0]?.id || 'col-1') : selectedCollectionId,
        name: avatarName,
        company: avatarCompany,
        role: avatarRole,
        review: avatarScript,
        video_url: videoUrl,
        status: 'pending', // place in pending queue first so user can approve it!
        rating: 5,
        reviewerEmail: `${avatarName.toLowerCase().replace(/[^a-z]+/g, '')}@company.com`,
        reviewerAvatar: avatarUrl,
        sentiment: 'POSITIVE',
        keywords: ['AI generated', 'avatar', 'synthesis', 'checkout'],
        aiSummary: `AI-Synthesized video feedback from ${avatarName} highlighting positive workspace experiences.`,
        aiHighlights: ['AI voice synced', 'High conversion assets', 'Avatar generated'],
        aiQuotes: [avatarScript],
        createdAt: new Date().toISOString(),
        views: 0,
        clicks: 0,
        shares: 0,
        trustScore: 95,
        bestQuoteHighlight: avatarScript.substring(0, 35) + '...'
      };

      // Inject directly into Zustand state testimonials array
      useStore.setState(state => ({
        testimonials: [newTestimonial, ...state.testimonials]
      }));

      setActiveId(generatedId);
      setSynthesisStep('success');
    }, 2800);
  };

  // Filter logic
  const filteredTestimonials = testimonials.filter(t => {
    const statusMatch = selectedStatus === 'all' || t.status === selectedStatus;
    const collectionMatch = selectedCollectionId === 'all' || t.collection_id === selectedCollectionId;
    const query = searchQuery.toLowerCase().trim();
    const searchMatch = !query || 
      t.name.toLowerCase().includes(query) || 
      t.review.toLowerCase().includes(query) ||
      t.reviewerEmail.toLowerCase().includes(query) ||
      t.company.toLowerCase().includes(query) ||
      t.role.toLowerCase().includes(query) ||
      t.keywords.some(kw => kw.toLowerCase().includes(query));
    return statusMatch && collectionMatch && searchMatch;
  });

  // Active testimonial details object
  const activeTestimonial = filteredTestimonials.find(t => t.id === activeId) || filteredTestimonials[0];

  // Sync active id if list content changes and activeId is invalid
  React.useEffect(() => {
    if (activeTestimonial && activeId !== activeTestimonial.id) {
      setActiveId(activeTestimonial.id);
    }
  }, [filteredTestimonials, activeId, activeTestimonial]);

  const getSentimentIcon = (sentiment: Testimonial['sentiment']) => {
    switch (sentiment) {
      case 'POSITIVE':
        return <Smile className="w-3.5 h-3.5 text-brand-emerald shrink-0" />;
      case 'NEUTRAL':
        return <Meh className="w-3.5 h-3.5 text-brand-teal shrink-0" />;
      case 'NEGATIVE':
        return <Frown className="w-3.5 h-3.5 text-red-500 shrink-0" />;
    }
  };

  const getSentimentClass = (sentiment: Testimonial['sentiment']) => {
    switch (sentiment) {
      case 'POSITIVE':
        return 'bg-brand-emerald/10 text-brand-emerald border-brand-emerald/20';
      case 'NEUTRAL':
        return 'bg-brand-teal/10 text-brand-teal border-brand-teal/20';
      case 'NEGATIVE':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
    }
  };

  return (
    <div className="flex-1 bg-[#09090B] flex flex-col min-w-0 h-screen overflow-hidden">
      {/* Page Header */}
      <header className="border-b border-border-primary bg-[#09090B]/80 backdrop-blur shrink-0 px-8 py-5 flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center space-x-3">
            <h1 className="font-extrabold text-lg text-white flex items-center space-x-2">
              <Inbox className="w-5 h-5 text-brand-emerald" />
              <span>Testimonials Inbox</span>
            </h1>
            <button 
              onClick={() => setIsAvatarModalOpen(true)}
              className="bg-brand-teal/10 hover:bg-brand-teal/20 text-brand-teal border border-brand-teal/30 hover:border-brand-teal/50 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg flex items-center space-x-1.5 cursor-pointer transition duration-200 shadow shadow-brand-teal/5 hover:shadow-brand-teal/10"
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-brand-teal" />
              <span>Synthesize AI Avatar</span>
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground">Manage, review, tag, and approve incoming testimonials.</p>
        </div>

        {/* Filters Top Bar */}
        <div className="flex items-center space-x-3">
          {/* Collection Select */}
          <div className="relative">
            <select
              value={selectedCollectionId}
              onChange={(e) => setSelectedCollectionId(e.target.value)}
              className="bg-[#18181B] border border-border-primary rounded-lg text-xs font-semibold py-1.5 pl-3 pr-8 text-white focus:border-brand-emerald outline-none appearance-none cursor-pointer"
            >
              <option value="all">All Spaces</option>
              {collections.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Search Box */}
          <div className="relative w-48 sm:w-64">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, tags, words..."
              className="w-full bg-[#18181B] border border-border-primary rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 focus:border-brand-emerald outline-none transition"
            />
          </div>
        </div>
      </header>

      {/* Main Inbox Panel Layout */}
      <div className="flex-1 flex flex-row overflow-hidden">
        
        {/* Left Side: Testimonials List Queue */}
        <aside className="w-full md:w-[380px] border-r border-border-primary flex flex-col shrink-0 bg-[#09090B]">
          
          {/* Status filter tabs */}
          <div className="flex border-b border-border-primary/80 p-2 space-x-1 shrink-0 overflow-x-auto">
            {([
              { id: 'all', label: 'All' },
              { id: 'pending', label: 'Pending' },
              { id: 'approved', label: 'Approved' },
              { id: 'rejected', label: 'Rejected' },
              { id: 'archived', label: 'Archived' }
            ] as const).map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`text-[10px] font-extrabold px-3 py-1.5 rounded-md transition cursor-pointer select-none ${
                  selectedStatus === tab.id
                    ? 'bg-[#18181B] text-brand-emerald border border-border-primary'
                    : 'text-muted-foreground hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Scrollable list items */}
          <div className="flex-1 overflow-y-auto divide-y divide-border-primary/60">
            {filteredTestimonials.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <Inbox className="w-8 h-8 text-zinc-700 mx-auto" />
                <p className="text-xs text-muted-foreground font-bold">No testimonials found</p>
                <p className="text-[10px] text-zinc-600">Try adjusting your filters or search queries.</p>
              </div>
            ) : (
              filteredTestimonials.map(t => {
                const col = collections.find(c => c.id === t.collection_id);
                const isSelected = activeId === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setActiveId(t.id)}
                    className={`p-4 text-left cursor-pointer transition relative group border-l-2 ${
                      isSelected
                        ? 'bg-[#18181B] border-brand-emerald'
                        : 'hover:bg-[#18181B]/40 border-transparent'
                    }`}
                  >
                    {/* Top Row: Name and Space */}
                    <div className="flex items-start justify-between space-x-2">
                      <div className="truncate">
                        <span className="font-bold text-xs text-white block truncate">{t.name}</span>
                        <span className="text-[9px] text-zinc-500 block truncate">{col?.title || 'Unknown Space'}</span>
                      </div>
                      <span className="text-[8px] text-zinc-600 shrink-0 font-medium" suppressHydrationWarning>
                        {new Date(t.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    {/* Review Snippet */}
                    <p className="text-[11px] text-muted-foreground line-clamp-2 mt-2 leading-relaxed">
                      {t.review}
                    </p>

                    {/* Bottom Metadata row */}
                    <div className="flex items-center justify-between mt-3">
                      {/* Rating + media type */}
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center text-yellow-400">
                          {Array.from({ length: t.rating }).map((_, i) => (
                            <Star key={i} className="w-2.5 h-2.5 fill-current" />
                          ))}
                        </div>
                        {t.video_url ? (
                          <span className="bg-brand-teal/10 text-brand-teal border border-brand-teal/20 text-[8px] font-black px-1.5 py-0.5 rounded flex items-center space-x-0.5 uppercase">
                            <Video className="w-2.5 h-2.5" />
                            <span>Video</span>
                          </span>
                        ) : (
                          <span className="bg-brand-emerald/10 text-brand-emerald border border-brand-emerald/20 text-[8px] font-black px-1.5 py-0.5 rounded flex items-center space-x-0.5 uppercase">
                            <MessageSquare className="w-2.5 h-2.5" />
                            <span>Text</span>
                          </span>
                        )}
                      </div>

                      {/* Status badge */}
                      <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded uppercase border ${
                        t.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' :
                        t.status === 'approved' ? 'bg-brand-emerald/10 text-brand-emerald border-brand-emerald/20' :
                        t.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                        'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                      }`}>
                        {t.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* Right Side: Active Testimonial Master-Detail view */}
        <main className="flex-1 bg-[#09090B] overflow-y-auto flex flex-col">
          {activeTestimonial ? (
            <div className="p-8 space-y-6 max-w-3xl w-full text-left">
              
              {/* Details Header Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border-primary pb-5">
                <div className="flex items-center space-x-3.5">
                  <img
                    src={activeTestimonial.reviewerAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${activeTestimonial.name}`}
                    alt="Reviewer Avatar"
                    className="w-12 h-12 rounded-full border border-border-primary shrink-0 object-cover"
                  />
                  <div>
                    <h2 className="font-extrabold text-base text-white">{activeTestimonial.name}</h2>
                    <p className="text-xs text-muted-foreground">
                      {activeTestimonial.role && `${activeTestimonial.role}`} 
                      {activeTestimonial.role && activeTestimonial.company && ' at '}
                      {activeTestimonial.company && <span className="text-brand-emerald font-semibold">{activeTestimonial.company}</span>}
                    </p>
                    <p className="text-[10px] text-zinc-500 flex items-center space-x-1.5 mt-0.5">
                      <span>{activeTestimonial.reviewerEmail}</span>
                      {activeTestimonial.reviewerSocial && (
                        <>
                          <span>•</span>
                          <a 
                            href={activeTestimonial.reviewerSocial} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-brand-teal hover:underline flex items-center space-x-0.5 font-bold"
                          >
                            <span>Profile</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {/* Status action buttons */}
                <div className="flex items-center space-x-2 shrink-0 self-start sm:self-center">
                  <button
                    onClick={() => updateStatus(activeTestimonial.id, 'approved')}
                    disabled={activeTestimonial.status === 'approved'}
                    className="bg-brand-emerald/10 hover:bg-brand-emerald/20 disabled:bg-brand-emerald/5 disabled:opacity-40 text-brand-emerald border border-brand-emerald/30 font-bold text-xs py-2 px-3 rounded-lg flex items-center space-x-1.5 cursor-pointer disabled:cursor-not-allowed transition"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>

                  <button
                    onClick={() => updateStatus(activeTestimonial.id, 'rejected')}
                    disabled={activeTestimonial.status === 'rejected'}
                    className="bg-red-500/10 hover:bg-red-500/20 disabled:bg-red-500/5 disabled:opacity-40 text-red-400 border border-red-500/30 font-bold text-xs py-2 px-3 rounded-lg flex items-center space-x-1.5 cursor-pointer disabled:cursor-not-allowed transition"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>

                  <button
                    onClick={() => updateStatus(activeTestimonial.id, 'archived')}
                    disabled={activeTestimonial.status === 'archived'}
                    className="bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 text-slate-300 border border-border-primary font-bold text-xs py-2 px-3 rounded-lg flex items-center space-x-1.5 cursor-pointer disabled:cursor-not-allowed transition"
                  >
                    <Archive className="w-3.5 h-3.5" />
                    <span>Archive</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm('Delete this testimonial permanently?')) {
                        deleteTestimonial(activeTestimonial.id);
                      }
                    }}
                    className="bg-[#09090B] hover:bg-red-950/20 text-zinc-500 hover:text-red-400 border border-border-primary hover:border-red-500/30 font-bold text-xs p-2 rounded-lg cursor-pointer transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Review Media Playback/Text */}
              <div className="space-y-4">
                {/* 5-Star details */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-yellow-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${
                          i < activeTestimonial.rating ? 'fill-current' : 'text-zinc-600'
                        }`} 
                      />
                    ))}
                  </div>

                  <div className="flex items-center space-x-2 text-[10px]">
                    <span className="text-zinc-500 flex items-center space-x-1" suppressHydrationWarning>
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(activeTestimonial.createdAt).toLocaleString()}</span>
                    </span>
                    <span className={`px-2 py-0.5 rounded-full border text-[9px] font-extrabold flex items-center space-x-1 ${getSentimentClass(activeTestimonial.sentiment)}`}>
                      {getSentimentIcon(activeTestimonial.sentiment)}
                      <span className="uppercase">{activeTestimonial.sentiment} Sentiment</span>
                    </span>
                  </div>
                </div>

                {/* Video Review block */}
                {activeTestimonial.video_url && (
                  <div className="border border-border-primary rounded-xl overflow-hidden aspect-video bg-black relative max-w-md shadow-lg">
                    <video 
                      src={activeTestimonial.video_url} 
                      controls 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                )}

                {/* Review Text block */}
                <div className="bg-[#18181B]/60 border border-border-primary rounded-xl p-6 relative">
                  <span className="absolute -top-3 left-4 bg-brand-emerald text-white text-[9px] font-black uppercase px-2 py-0.5 rounded shadow">
                    {activeTestimonial.video_url ? 'Video Transcript' : 'Review Text'}
                  </span>
                  <p className="text-sm text-slate-200 leading-relaxed font-medium">
                    "{activeTestimonial.review}"
                  </p>
                </div>
              </div>

              {/* AI Insights & Summarization Section */}
              <div className="bg-[#18181B] border border-border-primary rounded-xl p-6 space-y-4 shadow-xl">
                <h3 className="text-xs font-black text-white flex items-center space-x-1.5 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-brand-emerald animate-pulse" />
                  <span>AI Video & Text Insights</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 pt-1 text-[11px] border-t border-border-primary/50">
                  {/* Summary */}
                  <div className="md:col-span-2 space-y-2">
                    <h4 className="font-extrabold text-slate-300">Autogenerated Summary</h4>
                    <p className="text-slate-400 leading-relaxed">
                      {activeTestimonial.aiSummary || 'AI analysis pending or text submission doesn\'t require video processing summary models.'}
                    </p>

                    {/* Bullet Highlights */}
                    {activeTestimonial.aiHighlights && activeTestimonial.aiHighlights.length > 0 && (
                      <div className="space-y-1.5 pt-2">
                        <h5 className="font-bold text-slate-300">Key Highlights</h5>
                        <ul className="space-y-1 text-slate-400">
                          {activeTestimonial.aiHighlights.map((h, i) => (
                            <li key={i} className="flex items-center space-x-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald" />
                              <span>{h}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Highlights/Quotes list */}
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <h4 className="font-extrabold text-slate-300">Extracted Quotes</h4>
                      <div className="space-y-2">
                        {activeTestimonial.aiQuotes && activeTestimonial.aiQuotes.length > 0 ? (
                          activeTestimonial.aiQuotes.map((q, i) => (
                            <div key={i} className="border-l-2 border-brand-teal pl-2.5 text-slate-400 italic">
                              "{q}"
                            </div>
                          ))
                        ) : (
                          <p className="text-zinc-600">No quotes extracted.</p>
                        )}
                      </div>
                    </div>

                    {/* Keywords tag clouds */}
                    <div className="space-y-2">
                      <h4 className="font-extrabold text-slate-300 flex items-center space-x-1">
                        <Tag className="w-3.5 h-3.5 text-brand-teal" />
                        <span>AI Keywords</span>
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {activeTestimonial.keywords.map(kw => (
                          <span 
                            key={kw} 
                            className="bg-[#09090B] border border-border-primary text-slate-400 font-semibold px-2 py-0.5 rounded-md text-[9px] hover:text-brand-emerald cursor-pointer transition"
                          >
                            #{kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
              <Inbox className="w-16 h-16 text-zinc-800 animate-pulse" />
              <div className="space-y-1.5">
                <h3 className="font-extrabold text-white text-base">Select a Testimonial</h3>
                <p className="text-xs text-muted-foreground max-w-xs">
                  Click on an incoming review from the list to display details, video playbacks, and AI sentiment analysis.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      <AnimatePresence>
        {isAvatarModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { if (synthesisStep !== 'voice' && synthesisStep !== 'video' && synthesisStep !== 'save') setIsAvatarModalOpen(false); }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-[#18181B] border border-border-primary rounded-2xl shadow-2xl overflow-hidden z-10 text-left"
            >
              {/* Close Button */}
              {synthesisStep === 'idle' && (
                <button 
                  onClick={() => setIsAvatarModalOpen(false)}
                  className="absolute top-4 right-4 text-zinc-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* STAGE 1: Input form */}
              {synthesisStep === 'idle' && (
                <form onSubmit={handleGenerateAvatar} className="p-6 space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-1.5 text-brand-teal">
                      <Sparkles className="w-4 h-4 text-brand-teal" />
                      <span className="text-[10px] font-black uppercase tracking-widest bg-brand-teal/10 border border-brand-teal/20 px-2 py-0.5 rounded">AI Video Studio</span>
                    </div>
                    <h3 className="text-white text-base font-black tracking-tight">AI Avatar Review Generator</h3>
                    <p className="text-[11px] text-slate-400 leading-normal">
                      Synthesize realistic video testimonial reviews from raw script scripts.
                    </p>
                  </div>

                  <div className="space-y-3.5">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-wider block">Customer Name</label>
                        <input
                          type="text"
                          required
                          value={avatarName}
                          onChange={(e) => setAvatarName(e.target.value)}
                          className="w-full bg-[#09090B] border border-border-primary p-2.5 rounded-lg text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-brand-teal"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-wider block">Avatar Gender</label>
                        <select
                          value={avatarGender}
                          onChange={(e) => setAvatarGender(e.target.value as 'male' | 'female')}
                          className="w-full bg-[#09090B] border border-border-primary p-2.5 rounded-lg text-xs text-white focus:outline-none focus:border-brand-teal appearance-none cursor-pointer"
                        >
                          <option value="female">👩 Female Avatar</option>
                          <option value="male">👨 Male Avatar</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-wider block">Role / Headline</label>
                        <input
                          type="text"
                          required
                          value={avatarRole}
                          onChange={(e) => setAvatarRole(e.target.value)}
                          className="w-full bg-[#09090B] border border-border-primary p-2.5 rounded-lg text-xs text-white focus:outline-none focus:border-brand-teal"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-wider block">Company</label>
                        <input
                          type="text"
                          required
                          value={avatarCompany}
                          onChange={(e) => setAvatarCompany(e.target.value)}
                          className="w-full bg-[#09090B] border border-border-primary p-2.5 rounded-lg text-xs text-white focus:outline-none focus:border-brand-teal"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[9px] font-extrabold text-zinc-400 uppercase tracking-wider block">AI Testimonial script (Text)</label>
                      <textarea
                        required
                        rows={3}
                        value={avatarScript}
                        onChange={(e) => setAvatarScript(e.target.value)}
                        placeholder="Write testimonial message..."
                        className="w-full bg-[#09090B] border border-border-primary p-2.5 rounded-lg text-xs text-white placeholder-zinc-650 focus:outline-none focus:border-brand-teal resize-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-brand-teal to-brand-emerald text-white py-3 rounded-lg text-xs font-black uppercase tracking-widest cursor-pointer shadow hover:opacity-90 hover:scale-[1.01] transition"
                  >
                    Generate Video Review
                  </button>
                </form>
              )}

              {/* STAGE 2: Loader timeline */}
              {(synthesisStep === 'voice' || synthesisStep === 'video' || synthesisStep === 'save') && (
                <div className="p-10 flex flex-col items-center justify-center space-y-5 text-center">
                  <Loader2 className="w-10 h-10 text-brand-teal animate-spin" />
                  
                  <div className="space-y-2">
                    <h4 className="text-white text-sm font-black uppercase tracking-wider animate-pulse">
                      {synthesisStep === 'voice' && "🎙️ Generating Speech Audio..."}
                      {synthesisStep === 'video' && "🎥 Rendering Avatar Video..."}
                      {synthesisStep === 'save' && "💾 Syncing Feed Data..."}
                    </h4>
                    
                    <div className="w-48 h-1 bg-zinc-800 rounded-full overflow-hidden mx-auto border border-border-primary">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ 
                          width: synthesisStep === 'voice' ? '33%' : synthesisStep === 'video' ? '66%' : '95%' 
                        }}
                        transition={{ duration: 0.9 }}
                        className="h-full bg-brand-teal"
                      />
                    </div>
                    
                    <p className="text-[10px] text-slate-500 leading-normal max-w-[240px]">
                      {synthesisStep === 'voice' && "Power AI synthesizer is generating natural voice transcripts..."}
                      {synthesisStep === 'video' && "DeepFake face mappings are blending video frames securely..."}
                      {synthesisStep === 'save' && "Saving the pending review in your testimonials inbox space..."}
                    </p>
                  </div>
                </div>
              )}

              {/* STAGE 3: Success */}
              {synthesisStep === 'success' && (
                <div className="p-8 flex flex-col items-center justify-center space-y-5 text-center">
                  <div className="w-12 h-12 rounded-full bg-brand-emerald/10 border border-brand-emerald flex items-center justify-center text-brand-emerald">
                    <Zap className="w-6 h-6 animate-bounce" />
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-white text-base font-black">AI Review Synthesized!</h3>
                    <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
                      The video testimonial from <span className="text-white font-extrabold">{avatarName}</span> has been created.
                    </p>
                  </div>

                  <div className="bg-[#09090B] border border-border-primary/50 p-2.5 rounded-lg text-[9px] text-zinc-500 font-mono w-full">
                    Space queue updated with status: pending
                  </div>

                  <button
                    onClick={() => { setSynthesisStep('idle'); setIsAvatarModalOpen(false); }}
                    className="w-full bg-brand-emerald text-white py-3 rounded-lg text-xs font-black uppercase tracking-widest cursor-pointer shadow hover:bg-brand-emerald-hover transition"
                  >
                    View in Inbox
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

