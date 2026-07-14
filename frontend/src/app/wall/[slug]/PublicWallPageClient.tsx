'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { 
  Copy, 
  Check, 
  Search,
  User,
  ShieldCheck,
  X,
  ExternalLink
} from 'lucide-react';

export default function PublicWallPageClient() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const fetchPublicShowcase = useStore(state => state.fetchPublicShowcase);
  const trackShowcaseView = useStore(state => state.trackShowcaseView);
  const trackShowcaseShare = useStore(state => state.trackShowcaseShare);

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any | null>(null);

  // Filters & searches
  const [searchQuery, setSearchQuery] = useState('');
  const [minRating, setMinRating] = useState<number>(0);
  const [onlyVideo, setOnlyVideo] = useState(false);
  
  // Customer details popup state
  const [selectedReview, setSelectedReview] = useState<any | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      setLoading(true);
      fetchPublicShowcase(slug).then(res => {
        setLoading(false);
        if (res) {
          setData(res);

          // Track telemetry view
          let visitorId = localStorage.getItem('proofly_visitor_id');
          if (!visitorId) {
            visitorId = 'v_' + Math.random().toString(36).substring(2, 11);
            localStorage.setItem('proofly_visitor_id', visitorId);
          }

          const urlParams = new URLSearchParams(window.location.search);
          const utmSource = urlParams.get('utm_source');
          const utmMedium = urlParams.get('utm_medium');
          const utmCampaign = urlParams.get('utm_campaign');

          trackShowcaseView({
            spaceId: res.space.id,
            visitorId,
            referrer: document.referrer || null,
            utmSource,
            utmMedium,
            utmCampaign
          });
        }
      });
    }
  }, [slug, fetchPublicShowcase, trackShowcaseView]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090B] text-slate-100 flex items-center justify-center font-sans">
        <div className="w-10 h-10 border-4 border-brand-emerald/30 border-t-brand-emerald rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#09090B] text-slate-100 flex items-center justify-center font-sans p-6">
        <div className="bg-[#18181B] border border-border-primary rounded-2xl p-8 max-w-md w-full text-center space-y-4 shadow-xl">
          <AlertCircleIcon className="w-12 h-12 text-red-400 mx-auto" />
          <h2 className="text-lg font-black text-white">Wall Offline</h2>
          <p className="text-xs text-muted-foreground">The public testimonial wall settings are disabled or does not exist.</p>
          <button 
            onClick={() => router.push('/')}
            className="w-full bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-xs font-bold py-2.5 rounded-lg transition"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  const { space, settings, testimonials } = data;

  // Filter approved testimonials
  const approvedTestimonials = testimonials.filter((t: any) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = (t.reviewerName || '').toLowerCase().includes(q);
      const contentMatch = (t.textContent || '').toLowerCase().includes(q);
      const titleMatch = (t.reviewerTitle || '').toLowerCase().includes(q);
      if (!nameMatch && !contentMatch && !titleMatch) return false;
    }
    if (minRating > 0 && t.rating < minRating) return false;
    if (onlyVideo && !t.videoUrl) return false;
    return true;
  });

  // Limit to exactly 4 testimonials (2 video and 2 text if possible)
  const videos = approvedTestimonials.filter((t: any) => t.videoUrl).slice(0, 2);
  const texts = approvedTestimonials.filter((t: any) => !t.videoUrl).slice(0, 2);
  let combined = [...videos, ...texts];
  if (combined.length < 4) {
    const existingIds = new Set(combined.map((c: any) => c.id));
    const extra = approvedTestimonials.filter((t: any) => !existingIds.has(t.id));
    combined = [...combined, ...extra].slice(0, 4);
  }
  const filteredTestimonials = combined;

  // Calculate statistics metrics
  const totalReviews = testimonials.length;
  const avgRating = totalReviews > 0 ? (testimonials.reduce((sum: number, t: any) => sum + (t.rating || 5), 0) / totalReviews).toFixed(1) : '5.0';
  const totalVideos = testimonials.filter((t: any) => t.videoUrl).length;

  const jsonLdSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": space.name,
    "image": space.logoUrl || "https://useproofly.com/icon.svg",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": avgRating,
      "reviewCount": totalReviews || 1
    },
    "review": testimonials.map((t: any) => ({
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": t.reviewerName
      },
      "datePublished": new Date(t.createdAt).toISOString().split('T')[0],
      "reviewBody": t.textContent || "Video review submission",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": t.rating || 5
      }
    }))
  };

  const primaryColor = settings.themeColor || '#10B981';
  const isDark = settings.theme !== 'LIGHT';
  const ctaColor = settings.theme === 'GRADIENT' ? 'bg-gradient-to-r from-brand-emerald to-brand-teal' : 'bg-brand-emerald';

  const copyTestimonialUrl = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://useproofly.com';
    navigator.clipboard.writeText(`${origin}/testimonial/${id}`);
    setCopiedId(id);
    trackShowcaseShare(space.id, 'COPY', id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className={`min-h-screen font-sans ${isDark ? 'bg-[#09090B] text-slate-200' : 'bg-white text-slate-800'} transition-colors duration-300 pb-20 `}>
      {/* Structured SEO script */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }} />

      {/* Hero Banner settings background */}
      <header className={`relative py-16 px-6 border-b ${isDark ? 'border-border-primary bg-zinc-950/40' : 'border-zinc-150 bg-slate-50'} overflow-hidden`}>
        {settings.theme === 'GRADIENT' && (
          <div className="absolute inset-0 bg-gradient-to-tr from-brand-emerald/10 via-[#8B5CF6]/5 to-transparent pointer-events-none" />
        )}
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center space-y-6 relative">
          {space.logoUrl && (
            <img src={space.logoUrl} alt="Logo" className="w-16 h-16 rounded-2xl object-cover shadow-lg border border-white/[0.04]" />
          )}

          <div className="space-y-3">
            <h1 className={`text-4xl md:text-5xl font-black tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{settings.headline}</h1>
            <p className={`text-sm md:text-base max-w-xl mx-auto leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{settings.subheadline}</p>
          </div>

          {settings.ctaText && (
            <a
              href={settings.ctaUrl || `/collect/${space.slug}`}
              className={`${ctaColor} text-white font-black text-xs py-3 px-8 rounded-xl shadow-lg hover:opacity-95 cursor-pointer transition`}
            >
              {settings.ctaText}
            </a>
          )}
        </div>
      </header>

      {/* Stats Summary Panel */}
      <section className="max-w-5xl mx-auto px-6 py-10">
        <div className={`grid grid-cols-3 gap-4 border p-6 rounded-2xl shadow-md ${isDark ? 'bg-[#141417] border-border-primary' : 'bg-slate-50 border-zinc-200'}`}>
          <div className="text-center space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-455 tracking-wider">Average Rating</span>
            <div className={`text-2xl font-black flex items-center justify-center space-x-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              <span>{avgRating}</span>
              <span className="text-yellow-450 text-base">★</span>
            </div>
          </div>
          <div className="text-center space-y-1 border-x border-border-primary/50">
            <span className="text-[10px] uppercase font-bold text-slate-455 tracking-wider">Total Reviews</span>
            <div className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{totalReviews}</div>
          </div>
          <div className="text-center space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-455 tracking-wider">Video Reviews</span>
            <div className={`text-2xl font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{totalVideos}</div>
          </div>
        </div>
      </section>

      {/* Testimonials Showcase Gallery */}
      <main className="max-w-5xl mx-auto px-6 space-y-8">
        
        {/* Filters Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 max-w-sm relative">
            <Search className="w-4 h-4 text-slate-500 absolute top-1/2 -translate-y-1/2 left-3" />
            <input
              type="text"
              placeholder="Search reviews..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 text-xs rounded-xl border outline-none ${
                isDark 
                  ? 'bg-zinc-900 border-border-primary text-white focus:border-brand-emerald' 
                  : 'bg-slate-50 border-zinc-250 text-slate-800 focus:border-brand-emerald'
              }`}
            />
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-1.5 text-xs text-slate-400 cursor-pointer ">
              <input
                type="checkbox"
                checked={onlyVideo}
                onChange={(e) => setOnlyVideo(e.target.checked)}
                className="accent-brand-emerald"
              />
              <span>Video Reviews Only</span>
            </label>

            <select
              value={minRating}
              onChange={(e) => setMinRating(parseInt(e.target.value, 10))}
              className={`text-xs font-semibold py-1.5 px-3 border rounded-lg cursor-pointer outline-none ${
                isDark ? 'bg-zinc-900 border-border-primary text-slate-200' : 'bg-slate-50 border-zinc-250 text-slate-700'
              }`}
            >
              <option value="0">All Ratings</option>
              <option value="5">5 Stars only</option>
              <option value="4">4 Stars & up</option>
              <option value="3">3 Stars & up</option>
            </select>
          </div>
        </div>

        {/* Gallery Cards Layout rendering */}
        {filteredTestimonials.length === 0 ? (
          <div className="py-24 text-center text-slate-500 text-xs font-bold border border-dashed border-border-primary rounded-xl">
            No testimonials match your active filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {filteredTestimonials.map((t: any) => (
              <div
                key={t.id}
                onClick={() => setSelectedReview(t)}
                className={`border p-5 rounded-2xl shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col justify-between ${
                  isDark 
                    ? 'bg-[#18181B] border-border-primary hover:border-zinc-800' 
                    : 'bg-slate-50 border-zinc-150 hover:border-zinc-355'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <img 
                      src={t.reviewerAvatar || 'https://api.dicebear.com/7.x/initials/svg?seed=' + t.reviewerName} 
                      alt={t.reviewerName} 
                      className="w-9 h-9 rounded-full border border-border-primary"
                    />
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-xs font-bold text-slate-200 leading-tight flex items-center gap-1">
                        {t.reviewerName}
                        <ShieldCheck className="w-3.5 h-3.5 text-brand-emerald fill-brand-emerald" />
                      </span>
                      {t.reviewerTitle && (
                        <span className="text-[10px] text-muted-foreground truncate">{t.reviewerTitle}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-0.5 text-xs text-yellow-450">
                    {Array.from({ length: t.rating || 5 }).map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>

                  {t.textContent && (
                    <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                      "{t.textContent}"
                    </p>
                  )}

                  {t.videoUrl && (
                    <div className="relative rounded-xl overflow-hidden bg-black flex h-36">
                      <video src={t.videoUrl} preload="none" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <span className="w-8 h-8 rounded-full bg-brand-emerald flex items-center justify-center text-white text-xs pl-0.5 shadow-md shadow-brand-emerald/10">▶</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between border-t border-border-primary/40 pt-4 mt-5">
                  <span className="text-[11px] text-slate-550 font-bold">{new Date(t.createdAt).toLocaleDateString()}</span>
                  <button
                    onClick={(e) => copyTestimonialUrl(t.id, e)}
                    className="text-[10px] font-bold text-slate-350 hover:text-white transition flex items-center space-x-1"
                  >
                    {copiedId === t.id ? <Check className="w-3 h-3 text-brand-emerald" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedId === t.id ? 'Copied' : 'Share'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Powered by Proofly Footer */}
      {settings.showBranding && (
        <footer className="pt-16 pb-8 text-center flex items-center justify-center space-x-1 text-[10px] text-slate-500 font-bold">
          <span>Powered by</span>
          <a href="https://useproofly.com" className="text-[#8B5CF6]">Proofly</a>
        </footer>
      )}

      {/* CUSTOMER PROFILE DETAIL MODAL OVERLAY */}
      {selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className={`border p-6 rounded-2xl w-full max-w-md shadow-2xl relative text-left ${
            isDark ? 'bg-[#18181B] border-border-primary' : 'bg-white border-zinc-250'
          }`}>
            <button
              onClick={() => setSelectedReview(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
              aria-label="Close review details"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <img 
                  src={selectedReview.reviewerAvatar || 'https://api.dicebear.com/7.x/initials/svg?seed=' + selectedReview.reviewerName} 
                  alt={selectedReview.reviewerName} 
                  className="w-12 h-12 rounded-full border border-border-primary object-cover"
                />
                <div>
                  <h3 className="text-white font-extrabold text-sm flex items-center gap-1">
                    {selectedReview.reviewerName}
                    <ShieldCheck className="w-4 h-4 text-brand-emerald fill-brand-emerald" />
                  </h3>
                  {selectedReview.reviewerTitle && (
                    <p className="text-xs text-muted-foreground">{selectedReview.reviewerTitle}</p>
                  )}
                </div>
              </div>

              <div className="flex space-x-0.5 text-xs text-yellow-450 border-b border-border-primary/40 pb-3">
                {Array.from({ length: selectedReview.rating || 5 }).map((_, i) => (
                  <span key={i}>★</span>
                ))}
              </div>

              {selectedReview.videoUrl ? (
                <div className="rounded-xl overflow-hidden bg-black border border-border-primary shadow-lg">
                  <video src={selectedReview.videoUrl} controls className="w-full max-h-60 object-cover" />
                </div>
              ) : null}

              {selectedReview.textContent && (
                <p className="text-xs leading-relaxed text-slate-300 italic">
                  "{selectedReview.textContent}"
                </p>
              )}

              {selectedReview.reviewerSocial && (
                <div className="pt-4 border-t border-border-primary/45 flex justify-between items-center text-xs">
                  <span className="text-slate-400">Social handle</span>
                  <a href={selectedReview.reviewerSocial} target="_blank" rel="noreferrer" className="text-brand-emerald font-bold flex items-center space-x-0.5">
                    <span>Profile url</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

function AlertCircleIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <circle cx="12" cy="12" r="10" />
      <line x1="12" x2="12" y1="8" y2="12" />
      <line x1="12" x2="12" y1="16" y2="16" />
    </svg>
  );
}
