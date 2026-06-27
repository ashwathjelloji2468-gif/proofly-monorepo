'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { 
  CheckCircle, 
  ArrowRight, 
  Sparkles, 
  TrendingUp, 
  FileText, 
  ShieldCheck, 
  Zap, 
  HelpCircle,
  XCircle,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';

// Static Data Configuration for the 6 solutions
const solutionsData: Record<string, {
  tag: string;
  title: string;
  heading: string;
  description: string;
  accentColor: string;
  glowColor: string;
  painPoints: string[];
  prooflySolutions: string[];
  highlights: { title: string; desc: string }[];
  testimonial: { name: string; role: string; company: string; quote: string; avatar: string };
  faqs: { q: string; a: string }[];
}> = {
  saas: {
    tag: 'For SaaS Teams',
    title: 'SaaS',
    heading: 'Turn customer success into your highest-converting growth loop',
    description: 'Reduce onboarding churn, drive premium tier expansions, and automate social proof distribution with frictionless integrations.',
    accentColor: '#8677FF',
    glowColor: 'rgba(134, 119, 255, 0.15)',
    painPoints: [
      'High engineering customization overhead for review pages.',
      'Text reviews on landing pages feel fake or low trust to enterprise buyers.',
      'Gathering video reviews is chaotic and requires separate tools.'
    ],
    prooflySolutions: [
      'Deploy custom collector spaces in under 5 minutes with no code.',
      'Embed authenticated, interactive, high-trust video testimonial widgets.',
      'Automatically extract feature insights using conversational AI models.'
    ],
    highlights: [
      { title: '1-Line Integration', desc: 'Add our responsive script tags directly to your React or HTML code.' },
      { title: 'AI Sentiment Flags', desc: 'Automatically flag and tag testimonials by feature name.' },
      { title: 'Reward Coupons', desc: 'Offer coupons or discount keys post-submission to increase collection rates.' }
    ],
    testimonial: {
      name: 'Sarah Jenkins',
      role: 'Founder',
      company: 'DevFlow Inc.',
      quote: 'Proofly integrated in less than 30 minutes! Onboarding pipeline speed doubled immediately, and our checkout conversions went up by 18%. Highly recommended.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'
    },
    faqs: [
      { q: 'How does Proofly prevent spam reviews?', a: 'We verify reviewer authentication (GitHub/Google OAuth) and flag suspicious submissions automatically.' },
      { q: 'Can we white-label the collection page?', a: 'Yes! Customize logos, accent colors, custom messages, and custom questions.' }
    ]
  },
  agencies: {
    tag: 'For Digital Agencies',
    title: 'Agencies',
    heading: 'Deliver premium, high-converting social proof widgets for clients',
    description: 'Manage multiple client spaces from a single console, white-label widgets, and deliver verifiable conversion uplifts.',
    accentColor: '#10B981',
    glowColor: 'rgba(16, 185, 129, 0.15)',
    painPoints: [
      'Managing client credentials across different plugins is exhausting.',
      'Clients demand white-labeling which usually takes custom development time.',
      'Attributing client conversion rates improvement to social proof is hard.'
    ],
    prooflySolutions: [
      'Multi-tenant agency dashboard to partition client data securely.',
      'Custom domains and brand accent configurations for collection interfaces.',
      'Granular attribution analytics tracking widget CTR and video play rates.'
    ],
    highlights: [
      { title: 'Agency Dashboard', desc: 'Manage unlimited client verification workspaces from one credential.' },
      { title: 'Custom Themes', desc: 'Renders gorgeous glassmorphic cards configured to client guides.' },
      { title: 'Attribution Tracking', desc: 'Visual analytics dashboards showing clients the conversion lift value.' }
    ],
    testimonial: {
      name: 'David Miller',
      role: 'Growth Director',
      company: 'Apex Agency',
      quote: 'Deploying Proofly widgets on client landing pages yielded a massive +22% conversion lift. Client reporting has never been this seamless.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'
    },
    faqs: [
      { q: 'Can client companies manage their own spaces?', a: 'Yes, you can invite client members with read-only dashboard permissions.' },
      { q: 'Is there white-label hosting?', a: 'Yes, agency plans support binding custom domains for collection pages.' }
    ]
  },
  startups: {
    tag: 'For Fast-Growing Startups',
    title: 'Startups',
    heading: 'Build instant user trust on day one of your product launch',
    description: 'Acquire early testimonials, showcase validation widgets, and convert launch traffic into recurring users without setup friction.',
    accentColor: '#14B8A6',
    glowColor: 'rgba(20, 184, 166, 0.15)',
    painPoints: [
      'Zero initial social proof results in high visitor bounce rates.',
      'Spent launch day manually compiling feedback screenshots from Twitter.',
      'Custom widgets development diverts focus from refining core features.'
    ],
    prooflySolutions: [
      'Pre-launch collection templates to capture early beta tester reviews.',
      'One-click Twitter/ProductHunt review importers.',
      'Instant interactive Wall of Love displays that load instantly on Webflow or custom HTML.'
    ],
    highlights: [
      { title: 'beta collectors', desc: 'Collect beta user reviews before your official public launch.' },
      { title: 'Social Importers', desc: 'Convert social media posts into styled review cards instantly.' },
      { title: 'Frictionless setup', desc: 'No complex database tables required—plug and play.' }
    ],
    testimonial: {
      name: 'Marcus Brody',
      role: 'Growth Hacker',
      company: 'LaunchPad',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
      quote: 'We embedded a custom Proofly wall for our ProductHunt launch. Collected 15 video reviews inside 2 hours and closed 3 enterprise leads.'
    },
    faqs: [
      { q: 'Is there a free tier for early startups?', a: 'Yes, our Free plan includes up to 10 approved text and video testimonials.' },
      { q: 'Can we export testimonials?', a: 'Yes, all plans support exporting reviews in CSV and JSON formats.' }
    ]
  },
  creators: {
    tag: 'For Independent Creators',
    title: 'Creators',
    heading: 'Monetize validation assets and scale your brand authority',
    description: 'Capture video reviews from your audience, compile them on your link-in-bio, and command higher sponsor rates.',
    accentColor: '#8677FF',
    glowColor: 'rgba(134, 119, 255, 0.15)',
    painPoints: [
      'Social screenshots look disorganized and messy on personal portfolios.',
      'Awkward review instructions result in generic comments from audience.',
      'Lost monetization opportunities due to lack of verifiable proof.'
    ],
    prooflySolutions: [
      'Beautiful portfolio-grade Link Tree integrations.',
      'Video recorders optimized for mobile browsers with zero downloads.',
      'Guide prompts helping fans record highly descriptive video testimonials.'
    ],
    highlights: [
      { title: 'Mobile Optimized', desc: 'Followers can record video reviews instantly from iOS or Android.' },
      { title: 'Verifiable Badges', desc: 'Showcase verified reviews with linking attributions.' },
      { title: 'Profile Integrations', desc: 'Add Wall of Love widgets to Carrd, Webflow, or Notion sites.' }
    ],
    testimonial: {
      name: 'Lily Chen',
      role: 'Educator & YouTuber',
      company: 'Lily Codes',
      quote: 'Proofly lets my course students leave video feedback in 1 click. Sharing these reviews in my newsletters has doubled sign-ups!',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100'
    },
    faqs: [
      { q: 'Do viewers need to download anything to leave a video?', a: 'No! They record directly inside their native browser.' },
      { q: 'Can I add custom sponsor widgets?', a: 'Yes, custom badge embeddings are supported.' }
    ]
  },
  ecommerce: {
    tag: 'For E-commerce Brands',
    title: 'E-commerce',
    heading: 'Display authentic product reviews that reduce cart dropoff',
    description: 'Increase cart additions, reduce abandonment rates, and showcase video product reviews with fast loading speeds.',
    accentColor: '#EC4899',
    glowColor: 'rgba(236, 72, 153, 0.15)',
    painPoints: [
      'Generic text comments like "nice product" do not convince buyers.',
      'Heavy image reviews slow down shop speed and catalog scores.',
      'High shopping cart abandonment rates at checkout steps.'
    ],
    prooflySolutions: [
      'Interactive video showcases displaying product use cases.',
      'Fast CDN caching returning assets with zero page load lag.',
      'Coupons incentives post-review to drive repeat purchases.'
    ],
    highlights: [
      { title: 'Product Video proof', desc: 'Showcase authentic product fit videos on product description pages.' },
      { title: 'Lighthouse Optimized', desc: 'Asynchronous widget loads keeping page speed score at 95+.' },
      { title: 'Discount Integrations', desc: 'Connects directly to checkout coupon codes.' }
    ],
    testimonial: {
      name: 'Chloe Jones',
      role: 'Owner',
      company: 'Fashion Loft',
      quote: 'Integrating product video reviews reduced our cart abandonment rate by 14% in month 1. Repeat orders have tripled!',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'
    },
    faqs: [
      { q: 'Does this integrate with Shopify?', a: 'Yes, easily embed the widget code using Shopify custom Liquid templates.' },
      { q: 'Is it mobile responsive?', a: 'All widgets adjust perfectly to phone screen widths.' }
    ]
  },
  marketing: {
    tag: 'For Growth Marketing Teams',
    title: 'Marketing Teams',
    heading: 'Optimize your marketing ad spend with verification assets',
    description: 'Increase conversions across search campaigns, generate social posts, and track attribution analytics.',
    accentColor: '#F59E0B',
    glowColor: 'rgba(245, 158, 11, 0.15)',
    painPoints: [
      'Marketing designers take days to build testimonial ad graphics.',
      'Attributing ROI metric lift to specific reviews is impossible.',
      'Static websites lack engagement to capture high-value enterprise leads.'
    ],
    prooflySolutions: [
      'AI social drafts composer translating reviews to formatted copy.',
      'Granular Conversion Analytics tracking views, CTR, and Play rates.',
      'Premium hover micro-animations driving higher widget interaction rates.'
    ],
    highlights: [
      { title: 'ROI Analytics', desc: 'Track exactly which review card gets the most click attributions.' },
      { title: 'AI Copy Composer', desc: 'Format customer quotes into marketing posts instantly.' },
      { title: 'Ad Asset Builders', desc: 'Export high-res testimonial graphics in standard ratios.' }
    ],
    testimonial: {
      name: 'James Cole',
      role: 'Product Lead',
      company: 'TaskGrid',
      quote: 'The ad generator has cut asset creation time in half. Proofly is an essential growth tool for modern marketing teams.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'
    },
    faqs: [
      { q: 'Can we sync conversions with Google Analytics?', a: 'Yes, the widget fires custom javascript triggers on click and view events.' },
      { q: 'Are standard design sizes supported?', a: 'Yes, export square, portrait, or landscape formats for ad campaigns.' }
    ]
  }
};

export default function SolutionsDetailPage() {
  const params = useParams();
  const slug = typeof params.slug === 'string' ? params.slug.toLowerCase() : '';
  const data = solutionsData[slug];

  if (!data) {
    return notFound();
  }

  return (
    <div className="bg-[#09090B] text-white min-h-screen flex flex-col font-sans select-none relative overflow-hidden">
      <Navbar />

      {/* Dynamic Background Glow */}
      <div 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-[140px] pointer-events-none -z-10 transition-colors duration-300"
        style={{ backgroundColor: data.glowColor }}
      />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 pt-32 pb-16 w-full text-center relative">
        <span 
          className="border text-[10px] font-black uppercase tracking-widest px-3.5 py-1 rounded-full inline-block mb-4 transition-colors"
          style={{ 
            color: data.accentColor, 
            borderColor: `${data.accentColor}30`, 
            backgroundColor: `${data.accentColor}10` 
          }}
        >
          {data.tag}
        </span>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-none max-w-4xl mx-auto">
          {data.heading}
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl mx-auto mt-5 leading-relaxed">
          {data.description}
        </p>

        {/* Hero CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/signup">
            <button 
              className="w-full sm:w-auto font-bold text-xs py-3.5 px-8 rounded-full flex items-center justify-center space-x-1.5 shadow-lg transition duration-200 hover:scale-102 cursor-pointer focus:outline-none"
              style={{ backgroundColor: data.accentColor, color: slug === 'ecommerce' || slug === 'marketing' ? 'white' : '#09090B' }}
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4 shrink-0" />
            </button>
          </Link>
          <Link href="/company/contact-sales">
            <button className="w-full sm:w-auto bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs py-3.5 px-8 rounded-full transition duration-200 cursor-pointer focus:outline-none">
              <span>Contact Sales</span>
            </button>
          </Link>
        </div>
      </section>

      {/* Comparison Grid: Pain Points vs. Proofly Solutions */}
      <section className="max-w-7xl mx-auto px-6 py-12 w-full">
        <h2 className="text-xs font-black uppercase text-zinc-500 tracking-widest text-left border-b border-white/5 pb-2.5 mb-6">
          The Problem ➔ The Solution
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          
          {/* Pain Points Card */}
          <div className="bg-zinc-950/40 border border-white/[0.04] p-6 rounded-2xl space-y-4 text-left">
            <span className="text-[10px] font-black text-red-400 uppercase tracking-widest block">Core Challenges</span>
            <ul className="space-y-4">
              {data.painPoints.map((pain, idx) => (
                <li key={idx} className="flex items-start space-x-3.5 text-xs text-slate-400 leading-relaxed">
                  <XCircle className="w-4.5 h-4.5 text-red-500 shrink-0 mt-0.5" />
                  <span>{pain}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Proofly Solutions Card */}
          <div className="bg-[#0c0d16] border border-white/[0.06] p-6 rounded-2xl space-y-4 text-left relative overflow-hidden shadow-xl">
            <div 
              className="absolute top-0 right-0 w-24 h-24 rounded-full blur-[40px] pointer-events-none -z-10"
              style={{ backgroundColor: data.accentColor, opacity: 0.1 }}
            />
            <span className="text-[10px] font-black uppercase tracking-widest block" style={{ color: data.accentColor }}>How Proofly Helps</span>
            <ul className="space-y-4">
              {data.prooflySolutions.map((sol, idx) => (
                <li key={idx} className="flex items-start space-x-3.5 text-xs text-slate-200 leading-relaxed">
                  <CheckCircle className="w-4.5 h-4.5 text-brand-emerald shrink-0 mt-0.5" />
                  <span>{sol}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="max-w-7xl mx-auto px-6 py-12 w-full">
        <h2 className="text-xs font-black uppercase text-zinc-500 tracking-widest text-left border-b border-white/5 pb-2.5 mb-6">
          Feature Highlights
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {data.highlights.map((hl, idx) => (
            <div 
              key={idx}
              className="bg-[#0c0d16] border border-white/[0.05] p-5 rounded-2xl text-left space-y-2 relative"
            >
              <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5" style={{ color: data.accentColor }} />
              </div>
              <h3 className="text-xs font-bold text-white tracking-wide pt-1">{hl.title}</h3>
              <p className="text-[10px] text-slate-400 leading-relaxed">{hl.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Customized Customer Testimonial Screen */}
      <section className="max-w-7xl mx-auto px-6 py-12 w-full">
        <h2 className="text-xs font-black uppercase text-zinc-500 tracking-widest text-left border-b border-white/5 pb-2.5 mb-6">
          Client Validation
        </h2>

        <div className="bg-[#0c0d16] border border-white/[0.05] rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row items-center sm:space-x-8 text-left relative overflow-hidden">
          
          <img 
            src={data.testimonial.avatar || 'https://api.dicebear.com/7.x/pixel-art/svg?seed=user'} 
            alt={data.testimonial.name}
            className="w-18 h-18 sm:w-20 sm:h-20 rounded-full object-cover shrink-0 border border-white/10 shadow-lg mb-4 sm:mb-0"
          />

          <div className="space-y-3">
            <div className="flex space-x-0.5">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-sm select-none" style={{ color: data.accentColor }}>★</span>
              ))}
            </div>
            <p className="text-sm text-slate-200 italic leading-relaxed font-medium">
              "{data.testimonial.quote}"
            </p>
            <div className="leading-none pt-1">
              <span className="text-xs font-bold text-white block">{data.testimonial.name}</span>
              <span className="text-[9.5px] text-zinc-500 block mt-1">{data.testimonial.role} at {data.testimonial.company}</span>
            </div>
          </div>

        </div>
      </section>

      {/* Customized FAQ */}
      <section className="max-w-7xl mx-auto px-6 py-12 w-full pb-24">
        <h2 className="text-xs font-black uppercase text-zinc-500 tracking-widest text-left border-b border-white/5 pb-2.5 mb-6">
          Frequently Asked Questions
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {data.faqs.map((faq, idx) => (
            <div 
              key={idx}
              className="bg-[#0c0d16] border border-white/[0.05] p-5 rounded-2xl text-left space-y-2"
            >
              <div className="flex items-center space-x-2 text-[#8677FF]">
                <HelpCircle className="w-4 h-4 shrink-0" style={{ color: data.accentColor }} />
                <h4 className="text-xs font-black text-white">{faq.q}</h4>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed pl-6">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
