'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { WebcamRecorder } from '@/components/WebcamRecorder';
import { 
  Sparkles, 
  Video, 
  PenTool, 
  Star, 
  ArrowLeft, 
  CheckCircle2, 
  Copy, 
  ArrowRight,
  User,
  ShieldCheck,
  Heart,
  Globe,
  Upload
} from 'lucide-react';

export default function CollectTestimonialPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const collections = useStore(state => state.collections);
  const submitTestimonial = useStore(state => state.submitTestimonial);
  const fetchCollectionBySlug = useStore(state => state.fetchCollectionBySlug);

  const collection = collections.find(c => c.slug === slug);
  const [loadingCollection, setLoadingCollection] = useState(!collection);

  // Form states
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1: Welcome, 2: Record/Write, 3: Profile Info, 4: Success
  const [mode, setMode] = useState<'video' | 'text' | null>(null);
  
  const [reviewText, setReviewText] = useState('');
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoURL, setVideoURL] = useState<string | null>(null);

  // Reviewer details
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerEmail, setReviewerEmail] = useState('');
  const [reviewerCompany, setReviewerCompany] = useState('');
  const [reviewerRole, setReviewerRole] = useState('');
  const [reviewerSocial, setReviewerSocial] = useState('');
  const [reviewerAvatar, setReviewerAvatar] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!collection && slug) {
      setLoadingCollection(true);
      fetchCollectionBySlug(slug).finally(() => {
        setLoadingCollection(false);
      });
    }
  }, [collection, slug, fetchCollectionBySlug]);

  // Generate dynamic seed avatar
  useEffect(() => {
    if (reviewerName.trim()) {
      setReviewerAvatar(`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(reviewerName)}`);
    } else {
      setReviewerAvatar('');
    }
  }, [reviewerName]);

  if (loadingCollection) {
    return (
      <div className="min-h-screen bg-[#09090B] text-slate-100 flex items-center justify-center font-sans p-6 text-center">
        <div className="w-10 h-10 border-4 border-brand-emerald/30 border-t-brand-emerald rounded-full animate-spin" />
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="min-h-screen bg-[#09090B] text-slate-100 flex items-center justify-center font-sans p-6 text-center">
        <div className="bg-[#18181B] border border-border-primary rounded-2xl p-8 max-w-md w-full space-y-5">
          <div className="w-16 h-16 rounded-full bg-red-950/30 border border-red-500/30 flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8 text-red-500" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-white">Space Not Found</h2>
            <p className="text-xs text-muted-foreground">
              The testimonials collection page you are looking for does not exist or has been removed.
            </p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-[#18181B] hover:bg-[#27272A] border border-border-primary text-xs font-bold py-2.5 rounded-lg transition"
          >
            Go Back Home
          </button>
        </div>
      </div>
    );
  }

  const handleRecordComplete = (blob: Blob, url: string) => {
    setVideoBlob(blob);
    setVideoURL(url);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReviewerAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName || !reviewerEmail) return;

    setIsSubmitting(true);
    try {
      await submitTestimonial(collection.id, {
        name: reviewerName,
        email: reviewerEmail, // wait, Omit removes 'reviewerEmail', let's check store interface
        // Oh! Wait. The store schema testimonial parameter requires Omit<Testimonial, 'id' | 'collection_id' | 'status' | 'sentiment' | 'keywords' | 'createdAt' | 'views' | 'clicks' | 'shares'> & { videoBlob?: Blob }
        // Let's check keys in Testimonial:
        // name, company, role, review, video_url, rating, reviewerEmail, reviewerSocial, reviewerAvatar
        reviewerEmail,
        reviewerSocial,
        reviewerAvatar: reviewerAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(reviewerName)}`,
        company: reviewerCompany,
        role: reviewerRole,
        review: mode === 'text' ? reviewText : 'Video Testimonial Submission',
        rating,
        video_url: videoURL || undefined,
        videoBlob: videoBlob || undefined
      } as any);

      setStep(4);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyCouponCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-slate-100 flex flex-col font-sans selection:bg-brand-emerald selection:text-white pb-12">
      {/* Top logo header */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-border-primary bg-[#09090B]/60 backdrop-blur sticky top-0 z-30">
        <div className="flex items-center space-x-2">
          {collection.logoUrl ? (
            <img src={collection.logoUrl} alt="Logo" className="w-8 h-8 rounded-lg object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-emerald to-brand-teal flex items-center justify-center shadow-md">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          )}
          <span className="font-extrabold text-sm text-white tracking-tight uppercase">{collection.title}</span>
        </div>
        <div className="text-[10px] text-muted-foreground bg-[#18181B] px-3 py-1 rounded-full border border-border-primary flex items-center space-x-1">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-emerald animate-pulse" />
          <span>Powered by Proofly</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-6 mt-4">
        <div className="w-full max-w-2xl bg-[#18181B] border border-border-primary rounded-2xl shadow-2xl overflow-hidden relative transition-all duration-300">
          
          {/* Progress Indicator */}
          {step < 4 && (
            <div className="h-1 bg-border-primary w-full flex">
              <div 
                className="bg-gradient-to-r from-brand-emerald to-brand-teal h-full transition-all duration-500" 
                style={{ width: `${(step / 3) * 100}%` }}
              />
            </div>
          )}

          {/* STEP 1: WELCOME SCREEN */}
          {step === 1 && (
            <div className="p-8 md:p-10 space-y-8 text-center md:text-left">
              <div className="space-y-4">
                <div className="flex justify-center md:justify-start">
                  {collection.logoUrl ? (
                    <img 
                      src={collection.logoUrl} 
                      alt="Logo" 
                      className="w-16 h-16 rounded-2xl object-cover border border-border-primary" 
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-emerald to-brand-teal flex items-center justify-center shadow-lg">
                      <Sparkles className="w-8 h-8 text-white" />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <h1 className="text-3xl font-black text-white leading-tight">
                    Submit your testimonial to <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-emerald to-brand-teal">{collection.title}</span>
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {collection.description}
                  </p>
                </div>
              </div>

              {/* Questions Helper */}
              {collection.customQuestions && collection.customQuestions.length > 0 && (
                <div className="bg-[#09090B] border border-border-primary rounded-xl p-5 text-left space-y-3">
                  <h4 className="text-xs font-extrabold text-brand-teal tracking-wider uppercase flex items-center space-x-1.5">
                    <Heart className="w-3.5 h-3.5" />
                    <span>Questions you can answer</span>
                  </h4>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {collection.customQuestions.map((q, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="text-brand-emerald font-black select-none mt-0.5">•</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action Buttons Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {collection.collectVideo && (
                  <button
                    onClick={() => {
                      setMode('video');
                      setStep(2);
                    }}
                    className="bg-gradient-to-r from-brand-emerald to-brand-teal text-white hover:opacity-90 font-bold py-3.5 px-6 rounded-xl flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-brand-emerald/10 transition group"
                  >
                    <Video className="w-5 h-5 group-hover:scale-110 transition" />
                    <span>Record Video Review</span>
                  </button>
                )}
                {collection.collectText && (
                  <button
                    onClick={() => {
                      setMode('text');
                      setStep(2);
                    }}
                    className="bg-[#09090B] hover:bg-[#18181B] border border-border-primary text-slate-200 font-bold py-3.5 px-6 rounded-xl flex items-center justify-center space-x-2 cursor-pointer transition group"
                  >
                    <PenTool className="w-5 h-5 text-brand-teal group-hover:scale-110 transition" />
                    <span>Write Text Review</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: RECORD / WRITE TESTIMONIAL */}
          {step === 2 && (
            <div className="p-8 md:p-10 space-y-6">
              {/* Back Link */}
              <button
                onClick={() => {
                  setStep(1);
                  setMode(null);
                  setVideoBlob(null);
                  setVideoURL(null);
                }}
                className="flex items-center space-x-1.5 text-xs text-muted-foreground hover:text-white transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Go Back</span>
              </button>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Questions side-guideline (Visible on md+) */}
                <div className="space-y-4 md:col-span-1 border-r border-border-primary/50 pr-4 hidden md:block text-left">
                  <h3 className="text-xs font-bold text-slate-200">Writing Prompts</h3>
                  <p className="text-[11px] text-muted-foreground">Keep these points in mind while preparing your testimonial:</p>
                  <div className="space-y-3 mt-4">
                    {collection.customQuestions.map((q, idx) => (
                      <div key={idx} className="bg-[#09090B] border border-border-primary/60 p-2.5 rounded-lg text-[10px] text-slate-300">
                        {q}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form fields */}
                <div className="md:col-span-2 space-y-4 text-left">
                  {mode === 'video' ? (
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-sm font-bold text-white">Record Video</h3>
                        <p className="text-xs text-muted-foreground mb-2">Record up to 60 seconds of webcam review.</p>
                      </div>
                      <WebcamRecorder 
                        onRecordComplete={handleRecordComplete} 
                        questions={collection.customQuestions}
                        spaceName={collection.title}
                      />
                      {videoURL && (
                        <div className="flex justify-end pt-3">
                          <button
                            onClick={() => setStep(3)}
                            className="bg-brand-emerald text-white hover:bg-brand-emerald-hover font-bold text-xs py-2 px-4 rounded-lg flex items-center space-x-1 cursor-pointer transition"
                          >
                            <span>Next: Profile Info</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-bold text-white">Write Review</h3>
                        <p className="text-xs text-muted-foreground">Share your genuine experience with {collection.title}.</p>
                      </div>
                      <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder="Write your review here... How has it helped you? What features do you like best?"
                        rows={8}
                        className="w-full bg-[#09090B] border border-border-primary focus:border-brand-emerald outline-none rounded-xl p-4 text-xs text-slate-100 placeholder:text-zinc-600 transition"
                      />
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>Min. 10 characters</span>
                        <span>{reviewText.length} characters</span>
                      </div>
                      <div className="flex justify-end pt-2">
                        <button
                          onClick={() => setStep(3)}
                          disabled={reviewText.trim().length < 10}
                          className="bg-gradient-to-r from-brand-emerald to-brand-teal text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-xs py-2.5 px-5 rounded-lg flex items-center space-x-1 cursor-pointer shadow-md transition"
                        >
                          <span>Next: Profile Info</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PROFILE INFO */}
          {step === 3 && (
            <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-6 text-left">
              {/* Back Link */}
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex items-center space-x-1.5 text-xs text-muted-foreground hover:text-white transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Go Back</span>
              </button>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-white">Tell us about yourself</h3>
                <p className="text-xs text-muted-foreground">This metadata will be visible alongside your testimonial.</p>
              </div>

              {/* Star Rating Selection */}
              <div className="space-y-2 border-b border-border-primary pb-5">
                <span className="text-xs font-semibold text-slate-300 block">Your Rating</span>
                <div className="flex items-center space-x-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      className="p-1 cursor-pointer focus:outline-none transition"
                    >
                      <Star 
                        className={`w-6 h-6 transition ${
                          star <= (hoverRating ?? rating)
                            ? 'text-yellow-400 fill-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]'
                            : 'text-zinc-600'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid Form Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full bg-[#09090B] border border-border-primary focus:border-brand-emerald outline-none rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-zinc-600 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={reviewerEmail}
                    onChange={(e) => setReviewerEmail(e.target.value)}
                    placeholder="e.g. john@company.com"
                    className="w-full bg-[#09090B] border border-border-primary focus:border-brand-emerald outline-none rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-zinc-600 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Company Name</label>
                  <input
                    type="text"
                    value={reviewerCompany}
                    onChange={(e) => setReviewerCompany(e.target.value)}
                    placeholder="e.g. Stripe"
                    className="w-full bg-[#09090B] border border-border-primary focus:border-brand-emerald outline-none rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-zinc-600 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Job Title / Role</label>
                  <input
                    type="text"
                    value={reviewerRole}
                    onChange={(e) => setReviewerRole(e.target.value)}
                    placeholder="e.g. Lead Engineer"
                    className="w-full bg-[#09090B] border border-border-primary focus:border-brand-emerald outline-none rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-zinc-600 transition"
                  />
                </div>
              </div>

              {/* Avatar Selector and Social Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border-primary/50">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300">Social Link (LinkedIn/Twitter)</label>
                  <input
                    type="url"
                    value={reviewerSocial}
                    onChange={(e) => setReviewerSocial(e.target.value)}
                    placeholder="e.g. https://linkedin.com/in/johndoe"
                    className="w-full bg-[#09090B] border border-border-primary focus:border-brand-emerald outline-none rounded-lg px-3 py-2 text-xs text-slate-100 placeholder:text-zinc-600 transition"
                  />
                </div>

                {/* Simulated profile avatar uploader */}
                <div className="flex items-center space-x-3 pt-3">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border border-border-primary bg-[#09090B] flex items-center justify-center shrink-0">
                    {reviewerAvatar ? (
                      <img src={reviewerAvatar} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-zinc-600" />
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-slate-300 block">Reviewer Avatar</span>
                    <label className="bg-[#09090B] hover:bg-[#18181B] border border-border-primary text-slate-300 font-bold text-[10px] py-1.5 px-3 rounded-lg flex items-center space-x-1 cursor-pointer transition">
                      <Upload className="w-3.5 h-3.5 text-brand-teal" />
                      <span>Upload Avatar</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleLogoUpload} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit Action */}
              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || !reviewerName || !reviewerEmail}
                  className="w-full sm:w-auto bg-gradient-to-r from-brand-emerald to-brand-teal text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed font-black text-xs py-3 px-6 rounded-lg flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-brand-emerald/10 transition"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>AI Analysing & Submitting...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Submit Testimonial</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 4: SUCCESS & REWARD EMBED */}
          {step === 4 && (
            <div className="p-10 space-y-8 text-center">
              <div className="space-y-3">
                <div className="w-16 h-16 rounded-full bg-brand-emerald/10 border border-brand-emerald/30 flex items-center justify-center mx-auto shadow-lg shadow-brand-emerald/5">
                  <CheckCircle2 className="w-8 h-8 text-brand-emerald animate-bounce" />
                </div>
                <div className="space-y-1.5">
                  <h2 className="text-2xl font-black text-white">Thank you!</h2>
                  <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                    Your testimonial was successfully submitted and processed. It is currently pending approval by the space admin.
                  </p>
                </div>
              </div>

              {/* Reward Coupon Overlay */}
              {collection.reward && collection.reward.isActive && (
                <div className="bg-[#09090B] border border-border-primary rounded-2xl p-6 max-w-sm mx-auto space-y-4 shadow-inner relative overflow-hidden">
                  {/* Glow orbs background decoration */}
                  <div className="absolute top-0 right-0 w-24 h-24 bg-brand-teal/5 rounded-full blur-2xl -z-10" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-brand-emerald/5 rounded-full blur-2xl -z-10" />
                  
                  <div className="space-y-1">
                    <span className="text-[10px] text-brand-teal font-extrabold uppercase tracking-widest block">Incentive Reward</span>
                    <h4 className="text-sm font-extrabold text-white">{collection.reward.message}</h4>
                    <p className="text-[10px] text-muted-foreground">Use this coupon code during your checkout process.</p>
                  </div>

                  <div className="bg-[#18181B] border border-border-primary/80 rounded-xl p-3 flex items-center justify-between">
                    <code className="font-mono text-sm font-black text-brand-emerald tracking-wider pl-2">
                      {collection.reward.discountCode}
                    </code>
                    <button
                      onClick={() => copyCouponCode(collection.reward!.discountCode)}
                      className="bg-[#09090B] hover:bg-[#18181B] text-slate-300 hover:text-white p-2 rounded-lg border border-border-primary transition flex items-center space-x-1 text-[10px] font-bold cursor-pointer"
                    >
                      <Copy className="w-3.5 h-3.5 text-brand-teal" />
                      <span>{copied ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  onClick={() => {
                    setStep(1);
                    setMode(null);
                    setReviewText('');
                    setVideoBlob(null);
                    setVideoURL(null);
                    setReviewerName('');
                    setReviewerEmail('');
                    setReviewerCompany('');
                    setReviewerRole('');
                    setReviewerSocial('');
                    setReviewerAvatar('');
                  }}
                  className="bg-[#18181B] hover:bg-[#27272A] border border-border-primary text-slate-300 font-bold text-xs py-2.5 px-5 rounded-lg transition cursor-pointer"
                >
                  Submit Another Testimonial
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto text-center text-[10px] text-muted-foreground space-y-1">
        <p>© {new Date().getFullYear()} {collection.title}. All rights reserved.</p>
        <p className="flex items-center justify-center space-x-1">
          <span>Collector page powered by</span>
          <span className="text-brand-emerald font-bold flex items-center space-x-0.5">
            <Sparkles className="w-3 h-3 text-brand-teal" />
            <span>Proofly</span>
          </span>
        </p>
      </footer>
    </div>
  );
}
