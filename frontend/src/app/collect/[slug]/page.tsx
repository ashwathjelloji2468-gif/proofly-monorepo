'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Upload,
  Calendar,
  Camera,
  Check,
  AlertCircle
} from 'lucide-react';

export default function CollectTestimonialPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const currentCollectionPage = useStore(state => state.currentCollectionPage);
  const fetchCollectionPageBySlug = useStore(state => state.fetchCollectionPageBySlug);
  const submitCollectionTestimonial = useStore(state => state.submitCollectionTestimonial);
  const trackCollectionView = useStore(state => state.trackCollectionView);
  const startCollectionSubmission = useStore(state => state.startCollectionSubmission);
  const logCollectionShare = useStore(state => state.logCollectionShare);

  const [loading, setLoading] = useState(true);
  const [submissionId, setSubmissionId] = useState<string>('');

  // Form states wizard
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1); // 1: Welcome, 2: Questions, 3: Video/Text, 4: Consent & Profile, 5: Success
  const [mode, setMode] = useState<'video' | 'text' | null>(null);
  
  // Custom Answers object
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  // Reviewer assets
  const [reviewText, setReviewText] = useState('');
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoURL, setVideoURL] = useState<string | null>(null);
  const [isRecordingWebcam, setIsRecordingWebcam] = useState(false);

  const [rating, setRating] = useState<number>(5);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerEmail, setReviewerEmail] = useState('');
  const [reviewerTitle, setReviewerTitle] = useState('');
  const [reviewerSocial, setReviewerSocial] = useState('');
  const [reviewerAvatar, setReviewerAvatar] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [copiedShare, setCopiedShare] = useState<string | null>(null);

  // Generate dynamic seed avatar
  useEffect(() => {
    if (reviewerName.trim()) {
      setReviewerAvatar(`https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(reviewerName)}`);
    }
  }, [reviewerName]);

  // Load collection page config & log visitor view
  useEffect(() => {
    if (slug) {
      setLoading(true);
      fetchCollectionPageBySlug(slug).then(page => {
        setLoading(false);
        if (page) {
          // Generate unique visitor ID
          let visitorId = localStorage.getItem('proofly_visitor_id');
          if (!visitorId) {
            visitorId = 'v_' + Math.random().toString(36).substring(2, 11);
            localStorage.setItem('proofly_visitor_id', visitorId);
          }

          // Parse UTM search params
          const urlParams = new URLSearchParams(window.location.search);
          const utmSource = urlParams.get('utm_source');
          const utmMedium = urlParams.get('utm_medium');
          const utmCampaign = urlParams.get('utm_campaign');

          trackCollectionView({
            collectionId: page.id,
            visitorId,
            referrer: document.referrer || null,
            utmSource,
            utmMedium,
            utmCampaign
          });
        }
      });
    }
  }, [slug, fetchCollectionPageBySlug, trackCollectionView]);

  const handleStartForm = async () => {
    if (!currentCollectionPage) return;
    setStep(2);
    try {
      const subId = await startCollectionSubmission(currentCollectionPage.id);
      setSubmissionId(subId);
    } catch (e) {}
  };

  const handleRecordComplete = (blob: Blob, url: string) => {
    setVideoBlob(blob);
    setVideoURL(url);
    setIsRecordingWebcam(false);
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        setErrorText('Maximum Video upload limit is 50MB. Please choose a smaller file.');
        setTimeout(() => setErrorText(null), 4000);
        return;
      }
      const url = URL.createObjectURL(file);
      setVideoBlob(file);
      setVideoURL(url);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReviewerAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNextToSub = () => {
    // Validate required questions
    if (currentCollectionPage) {
      for (const q of currentCollectionPage.questions) {
        if (q.required && !answers[q.id]?.trim()) {
          setErrorText(`Please answer the required question: "${q.label}"`);
          setTimeout(() => setErrorText(null), 3000);
          return;
        }
      }
    }
    setStep(3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewerEmail.trim()) {
      setErrorText('Please enter your name and email address.');
      setTimeout(() => setErrorText(null), 3000);
      return;
    }
    if (!consentGiven) {
      setErrorText('Please check the consent box to submit your feedback.');
      setTimeout(() => setErrorText(null), 3000);
      return;
    }

    setIsSubmitting(true);
    try {
      if (!currentCollectionPage) return;

      const success = await submitCollectionTestimonial({
        collectionId: currentCollectionPage.id,
        type: mode === 'video' ? 'VIDEO' : 'TEXT',
        reviewerName,
        reviewerEmail,
        reviewerTitle: reviewerTitle || null,
        reviewerAvatar: reviewerAvatar || null,
        rating,
        textContent: mode === 'text' ? reviewText : 'Video testimonial submission',
        videoUrl: videoURL || null,
        consentGiven,
        customAnswers: JSON.stringify(answers)
      });

      if (success) {
        setStep(5);
        // Confetti could trigger here
        if (currentCollectionPage.redirectUrl) {
          setTimeout(() => {
            window.location.href = currentCollectionPage.redirectUrl!;
          }, 3500);
        }
      } else {
        setErrorText('Failed to save submission. Please try again.');
        setTimeout(() => setErrorText(null), 4000);
      }
    } catch (err: any) {
      setErrorText(err.message || 'An error occurred during submission.');
      setTimeout(() => setErrorText(null), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const shareToPlatform = (platform: string) => {
    if (!currentCollectionPage) return;
    logCollectionShare(currentCollectionPage.id, platform);
    
    const text = encodeURIComponent('I just left a review for ' + currentCollectionPage.name + '! Check it out:');
    const url = encodeURIComponent(window.location.origin);
    
    if (platform === 'twitter') {
      window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    } else if (platform === 'linkedin') {
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
    } else {
      navigator.clipboard.writeText(window.location.origin);
      setCopiedShare('clipboard');
      setTimeout(() => setCopiedShare(null), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#09090B] text-slate-100 flex items-center justify-center font-sans">
        <div className="w-10 h-10 border-4 border-brand-emerald/30 border-t-brand-emerald rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentCollectionPage) {
    return (
      <div className="min-h-screen bg-[#09090B] text-slate-100 flex items-center justify-center font-sans p-6">
        <div className="bg-[#18181B] border border-border-primary rounded-2xl p-8 max-w-md w-full text-center space-y-4 shadow-xl">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
          <h2 className="text-lg font-black text-white">Collection Page Offline</h2>
          <p className="text-xs text-muted-foreground">The testimonial collection form you are trying to visit is not found or has been disabled.</p>
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

  const primaryColor = currentCollectionPage.theme?.primaryColor || '#10B981';

  return (
    <div className="min-h-screen bg-[#09090B] text-slate-200 font-sans flex flex-col items-center justify-center p-4 md:p-8 select-none">
      
      {/* Toast Alert */}
      {errorText && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-red-650 text-white font-bold text-xs px-4 py-3 rounded-lg flex items-center space-x-2 shadow-2xl border border-red-500/20 animate-pulse">
          <AlertCircle className="w-4 h-4" />
          <span>{errorText}</span>
        </div>
      )}

      <div className="bg-[#141417] border border-border-primary rounded-3xl p-6 md:p-10 w-full max-w-xl shadow-2xl relative text-left">
        
        {/* Logo indicator */}
        {currentCollectionPage.logoUrl && (
          <img 
            src={currentCollectionPage.logoUrl} 
            alt="Workspace Logo" 
            className="w-12 h-12 rounded-xl object-cover mb-6 border border-zinc-800"
          />
        )}

        {/* ─── STEP 1: WELCOME SCREEN ───────────────────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-black text-white tracking-tight">{currentCollectionPage.headline}</h1>
              <p className="text-sm text-slate-400 leading-relaxed">{currentCollectionPage.subheadline}</p>
            </div>
            <button 
              onClick={handleStartForm}
              style={{ backgroundColor: primaryColor }}
              className="w-full text-white font-black text-xs py-3.5 rounded-xl shadow-lg hover:opacity-95 cursor-pointer flex items-center justify-center space-x-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ─── STEP 2: QUESTIONNAIRE ────────────────────────────────────────────── */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-lg font-black text-white border-b border-border-primary/50 pb-2">Questions</h2>
            <div className="space-y-5">
              {currentCollectionPage.questions.map(q => (
                <div key={q.id} className="space-y-2">
                  <label className="text-xs font-black text-slate-350 flex items-center space-x-1">
                    <span>{q.label}</span>
                    {q.required && <span className="text-brand-emerald">*</span>}
                  </label>
                  
                  {q.type === 'SHORT_ANSWER' && (
                    <input
                      type="text"
                      placeholder={q.placeholder || 'Your reply...'}
                      value={answers[q.id] || ''}
                      onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg text-xs py-2 px-3 text-slate-200 focus:border-brand-emerald outline-none"
                    />
                  )}

                  {q.type === 'PARAGRAPH' && (
                    <textarea
                      rows={3}
                      placeholder={q.placeholder || 'Your review description...'}
                      value={answers[q.id] || ''}
                      onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg text-xs py-2.5 px-3 text-slate-200 focus:border-brand-emerald outline-none resize-none"
                    />
                  )}

                  {q.type === 'RATING' && (
                    <div className="flex space-x-1.5 text-2xl text-slate-650 cursor-pointer">
                      {[1, 2, 3, 4, 5].map(val => (
                        <span 
                          key={val}
                          onClick={() => setAnswers({ ...answers, [q.id]: val.toString() })}
                          className={`hover:scale-110 transition ${parseInt(answers[q.id], 10) >= val ? 'text-yellow-400' : 'text-slate-600'}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  )}

                  {q.type === 'DATE' && (
                    <input
                      type="date"
                      value={answers[q.id] || ''}
                      onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                      className="bg-zinc-900 border border-zinc-800 rounded-lg text-xs py-2 px-3 text-slate-200 outline-none focus:border-brand-emerald"
                    />
                  )}
                </div>
              ))}
            </div>

            <button 
              onClick={handleNextToSub}
              style={{ backgroundColor: primaryColor }}
              className="w-full text-white font-black text-xs py-3.5 rounded-xl shadow-lg hover:opacity-95 cursor-pointer flex items-center justify-center space-x-2"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ─── STEP 3: SUBMISSION MEDIA (VIDEO/TEXT) ────────────────────────────── */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-lg font-black text-white border-b border-border-primary/50 pb-2">Record or Write Review</h2>
            
            {!mode ? (
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setMode('video')}
                  className="bg-zinc-900 border border-zinc-800 hover:border-brand-emerald/40 p-6 rounded-2xl flex flex-col items-center justify-center text-center space-y-3 cursor-pointer transition"
                >
                  <Video className="w-8 h-8 text-brand-emerald" />
                  <span className="text-xs font-bold text-slate-200">Record Video</span>
                </button>
                <button
                  onClick={() => setMode('text')}
                  className="bg-zinc-900 border border-zinc-800 hover:border-brand-teal/40 p-6 rounded-2xl flex flex-col items-center justify-center text-center space-y-3 cursor-pointer transition"
                >
                  <PenTool className="w-8 h-8 text-brand-teal" />
                  <span className="text-xs font-bold text-slate-200">Write Text</span>
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <button 
                  onClick={() => { setMode(null); setVideoURL(null); setVideoBlob(null); }}
                  className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-white"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Choose Another Option</span>
                </button>

                {mode === 'text' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black text-slate-350">Rating Score</label>
                      <div className="flex space-x-1 text-xl cursor-pointer">
                        {[1, 2, 3, 4, 5].map(val => (
                          <span 
                            key={val} 
                            onClick={() => setRating(val)}
                            className={val <= rating ? 'text-yellow-400' : 'text-slate-650'}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    <textarea
                      rows={5}
                      placeholder="Write your testimonial here..."
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg text-xs py-3 px-4 text-slate-200 focus:border-brand-emerald outline-none resize-none leading-relaxed"
                    />
                  </div>
                )}

                {mode === 'video' && (
                  <div className="space-y-4">
                    {videoURL ? (
                      <div className="relative rounded-2xl overflow-hidden bg-black border border-zinc-800">
                        <video src={videoURL} controls className="w-full max-h-64 object-cover" />
                        <button
                          onClick={() => { setVideoURL(null); setVideoBlob(null); }}
                          className="absolute top-3 right-3 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700 text-slate-300 p-1.5 rounded-full"
                          title="Reset video"
                        >
                          ✕
                        </button>
                      </div>
                    ) : isRecordingWebcam ? (
                      <div className="bg-black border border-zinc-850 rounded-2xl overflow-hidden p-4 relative">
                        <WebcamRecorder onRecordComplete={handleRecordComplete} />
                        <button 
                          onClick={() => setIsRecordingWebcam(false)}
                          className="absolute top-4 right-4 text-white text-xs bg-zinc-900/80 px-2 py-1 rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => setIsRecordingWebcam(true)}
                          className="bg-zinc-900 border border-zinc-850 p-6 rounded-2xl flex flex-col items-center justify-center space-y-2.5 transition hover:border-brand-emerald/30 cursor-pointer"
                        >
                          <Camera className="w-7 h-7 text-brand-emerald" />
                          <span className="text-xs font-bold text-slate-350">Use Camera</span>
                        </button>
                        <label className="bg-zinc-900 border border-zinc-850 p-6 rounded-2xl flex flex-col items-center justify-center space-y-2.5 transition hover:border-brand-teal/30 cursor-pointer text-center">
                          <Upload className="w-7 h-7 text-brand-teal" />
                          <span className="text-xs font-bold text-slate-350">Upload File</span>
                          <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
                        </label>
                      </div>
                    )}
                  </div>
                )}

                <button 
                  onClick={() => setStep(4)}
                  style={{ backgroundColor: primaryColor }}
                  className="w-full text-white font-black text-xs py-3.5 rounded-xl shadow-lg hover:opacity-95 cursor-pointer flex items-center justify-center space-x-2"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* ─── STEP 4: PROFILE INFO & CONSENT ─────────────────────────────────────── */}
        {step === 4 && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-lg font-black text-white border-b border-border-primary/50 pb-2">Profile Details</h2>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="relative cursor-pointer shrink-0">
                  <img 
                    src={reviewerAvatar || 'https://api.dicebear.com/7.x/initials/svg?seed=user'} 
                    alt="Reviewer Avatar" 
                    className="w-12 h-12 rounded-full object-cover border border-zinc-800 bg-zinc-900"
                  />
                  <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                  <span className="absolute bottom-0 right-0 bg-brand-emerald text-white p-0.5 rounded-full text-[8px]">✎</span>
                </label>
                <div className="space-y-1.5 flex-1">
                  <label className="text-[10px] font-black uppercase text-slate-450">Full Name *</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Jane Doe" 
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg text-xs py-1.5 px-3 text-slate-200 focus:border-brand-emerald outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-455">Email Address *</label>
                  <input 
                    type="email" 
                    required 
                    placeholder="jane@example.com" 
                    value={reviewerEmail}
                    onChange={(e) => setReviewerEmail(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg text-xs py-1.5 px-3 text-slate-200 focus:border-brand-emerald outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-455">Title / Company</label>
                  <input 
                    type="text" 
                    placeholder="e.g. CTO at Acme Inc" 
                    value={reviewerTitle}
                    onChange={(e) => setReviewerTitle(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg text-xs py-1.5 px-3 text-slate-200 focus:border-brand-emerald outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase text-slate-455">Social / Website URL</label>
                <input 
                  type="text" 
                  placeholder="https://linkedin.com/in/..." 
                  value={reviewerSocial}
                  onChange={(e) => setReviewerSocial(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg text-xs py-1.5 px-3 text-slate-200 focus:border-brand-emerald outline-none"
                />
              </div>

              {/* Consent check */}
              <label className="flex items-start space-x-2.5 pt-4 border-t border-border-primary/50 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                  className="mt-0.5 accent-brand-emerald" 
                />
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-slate-200">I give permission for this testimonial to be displayed publicly.</span>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">Your email is only used for verification and will not be shared publicly.</p>
                </div>
              </label>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              style={{ backgroundColor: primaryColor }}
              className="w-full text-white font-black text-xs py-3.5 rounded-xl shadow-lg hover:opacity-95 cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Submitting...' : 'Submit Testimonial'}</span>
            </button>
          </form>
        )}

        {/* ─── STEP 5: THANK YOU / SUCCESS SCREEN ─────────────────────────────────── */}
        {step === 5 && (
          <div className="text-center space-y-6 py-6 animate-pulse">
            <div className="w-16 h-16 rounded-full bg-brand-emerald/10 border border-brand-emerald/25 flex items-center justify-center mx-auto text-brand-emerald">
              <Check className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white">Review Submitted!</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {currentCollectionPage.thankYouMessage || 'Thank you so much for taking the time to share your feedback!'}
              </p>
            </div>

            {/* Redirection notice */}
            {currentCollectionPage.redirectUrl && (
              <p className="text-[10px] text-brand-teal font-bold animate-pulse">Redirecting you to checkout coupon page in a few seconds...</p>
            )}

            {/* Share layout */}
            <div className="pt-6 border-t border-border-primary/50 space-y-3 text-left">
              <span className="text-[10px] font-black uppercase text-slate-400">Share your review on social media</span>
              <div className="flex gap-2.5">
                <button
                  onClick={() => shareToPlatform('twitter')}
                  className="flex-1 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-xs font-bold py-2 rounded-lg text-slate-350 hover:text-white cursor-pointer transition text-center"
                >
                  Share to Twitter
                </button>
                <button
                  onClick={() => shareToPlatform('linkedin')}
                  className="flex-1 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-xs font-bold py-2 rounded-lg text-slate-350 hover:text-white cursor-pointer transition text-center"
                >
                  Share to LinkedIn
                </button>
                <button
                  onClick={() => shareToPlatform('copy')}
                  className="bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 p-2.5 rounded-lg text-slate-350 hover:text-white cursor-pointer transition"
                >
                  {copiedShare === 'clipboard' ? <Check className="w-4 h-4 text-brand-emerald" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
