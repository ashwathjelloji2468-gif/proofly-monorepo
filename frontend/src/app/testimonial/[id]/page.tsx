'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { 
  Heart, 
  Sparkles, 
  Copy, 
  Check, 
  Star, 
  ChevronLeft,
  Share2,
  Calendar,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export default function IndividualTestimonialDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const fetchTestimonialDetail = useStore(state => state.fetchTestimonialDetail);
  const trackShowcaseShare = useStore(state => state.trackShowcaseShare);

  const [loading, setLoading] = useState(true);
  const [testimonial, setTestimonial] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (id) {
      setLoading(true);
      fetchTestimonialDetail(id).then(res => {
        setLoading(false);
        if (res) {
          setTestimonial(res);
        }
      });
    }
  }, [id, fetchTestimonialDetail]);

  const copyDetailUrl = () => {
    if (!testimonial) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://useproofly.com';
    navigator.clipboard.writeText(`${origin}/testimonial/${testimonial.id}`);
    setCopied(true);
    trackShowcaseShare(testimonial.spaceId, 'COPY', testimonial.id);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareSocial = (platform: string) => {
    if (!testimonial) return;
    trackShowcaseShare(testimonial.spaceId, platform.toUpperCase(), testimonial.id);

    const shareUrl = encodeURIComponent(`${window.location.origin}/testimonial/${testimonial.id}`);
    const text = encodeURIComponent(`Check out this customer testimonial from ${testimonial.reviewerName}:`);

    if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${text}&url=${shareUrl}`, '_blank');
    } else if (platform === 'linkedin') {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090B] text-slate-100 flex items-center justify-center font-sans">
        <div className="w-10 h-10 border-4 border-brand-emerald/30 border-t-brand-emerald rounded-full animate-spin" />
      </div>
    );
  }

  if (!testimonial) {
    return (
      <div className="min-h-screen bg-[#09090B] text-slate-100 flex items-center justify-center font-sans p-6">
        <div className="bg-[#18181B] border border-border-primary rounded-2xl p-8 max-w-md w-full text-center space-y-4 shadow-xl">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <h2 className="text-lg font-black text-white">Review Not Found</h2>
          <p className="text-xs text-muted-foreground">The testimonial detail page you are looking for has been archived or does not exist.</p>
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

  // Schema.org single Review metadata
  const reviewSchema = {
    "@context": "https://schema.org",
    "@type": "Review",
    "itemReviewed": {
      "@type": "Organization",
      "name": "Proofly Customer Base"
    },
    "author": {
      "@type": "Person",
      "name": testimonial.reviewerName
    },
    "datePublished": new Date(testimonial.createdAt).toISOString().split('T')[0],
    "reviewBody": testimonial.textContent || "Video review submission",
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": testimonial.rating || 5,
      "bestRating": "5"
    }
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-slate-200 font-sans flex flex-col items-center justify-center p-4 md:p-8 select-none">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewSchema) }} />

      <div className="w-full max-w-2xl space-y-6">
        
        {/* Back Link */}
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white transition cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Wall</span>
        </button>

        {/* Core Review Card */}
        <div className="bg-[#141417] border border-border-primary rounded-3xl p-6 md:p-10 shadow-2xl space-y-8 text-left">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border-primary/50 pb-5">
            <div className="flex items-center space-x-4">
              <img 
                src={testimonial.reviewerAvatar || 'https://api.dicebear.com/7.x/initials/svg?seed=' + testimonial.reviewerName} 
                alt={testimonial.reviewerName} 
                className="w-12 h-12 rounded-full border border-border-primary object-cover"
              />
              <div>
                <h3 className="text-white font-extrabold text-sm flex items-center gap-1.5 leading-tight">
                  {testimonial.reviewerName}
                  <ShieldCheck className="w-4 h-4 text-brand-emerald fill-brand-emerald" />
                </h3>
                {testimonial.reviewerTitle && (
                  <p className="text-xs text-muted-foreground">{testimonial.reviewerTitle}</p>
                )}
              </div>
            </div>

            <div className="flex space-x-0.5 text-xs text-yellow-450">
              {Array.from({ length: testimonial.rating || 5 }).map((_, i) => (
                <span key={i}>★</span>
              ))}
            </div>
          </div>

          {/* Media players if video reviews */}
          {testimonial.videoUrl && (
            <div className="rounded-2xl overflow-hidden bg-black border border-border-primary shadow-lg max-h-96">
              <video src={testimonial.videoUrl} controls className="w-full h-full object-cover" />
            </div>
          )}

          {/* Review Quote text */}
          {testimonial.textContent && (
            <blockquote className="text-sm leading-relaxed text-slate-300 italic pl-4 border-l-2 border-brand-emerald">
              "{testimonial.textContent}"
            </blockquote>
          )}

          <div className="text-[10px] text-slate-500 font-bold">
            Submitted on {new Date(testimonial.createdAt).toLocaleDateString()}
          </div>

          {/* Share links */}
          <div className="pt-6 border-t border-border-primary/50 space-y-4">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Share Testimonial Details</span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <button
                onClick={() => shareSocial('twitter')}
                className="bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-xs font-bold py-2 rounded-lg text-slate-350 hover:text-white cursor-pointer transition flex items-center justify-center space-x-1.5"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                <span>Twitter</span>
              </button>
              <button
                onClick={() => shareSocial('linkedin')}
                className="bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-xs font-bold py-2 rounded-lg text-slate-350 hover:text-white cursor-pointer transition flex items-center justify-center space-x-1.5"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                <span>LinkedIn</span>
              </button>
              <button
                onClick={() => shareSocial('facebook')}
                className="bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-xs font-bold py-2 rounded-lg text-slate-350 hover:text-white cursor-pointer transition flex items-center justify-center space-x-1.5"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                <span>Facebook</span>
              </button>
              <button
                onClick={copyDetailUrl}
                className="bg-zinc-800 hover:bg-zinc-750 border border-zinc-700 text-xs font-bold py-2 rounded-lg text-slate-200 hover:text-white cursor-pointer transition flex items-center justify-center space-x-1.5"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-brand-emerald" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
