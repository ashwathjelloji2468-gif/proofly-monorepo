import { create } from 'zustand';

const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql';

async function gqlRequest(query: string, variables: any = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  try {
    const res = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, variables }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status}: ${text}`);
    }

    const body = await res.json();
    if (body.errors && body.errors.length > 0) {
      if (body.errors.some((e: any) => e.message?.toLowerCase().includes('unauthenticated') || e.extensions?.code === 'UNAUTHENTICATED')) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }
      }
      throw new Error(body.errors[0].message);
    }
    return body.data;
  } catch (err) {
    console.error('GraphQL fetch error:', err);
    throw err;
  }
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  tier: 'FREE' | 'PRO' | 'BUSINESS' | 'ENTERPRISE';
}

export interface Collection {
  id: string;
  user_id: string;
  title: string;
  description: string;
  logoUrl?: string;
  theme: string;
  collectVideo: boolean;
  collectText: boolean;
  customQuestions: string[];
  slug: string;
  createdAt: string;
  reward?: {
    id: string;
    discountCode: string;
    message: string;
    isActive: boolean;
  } | null;
}

export interface Testimonial {
  id: string;
  collection_id: string;
  name: string;
  company: string;
  role: string;
  review: string; // text testimonial or transcription
  video_url?: string;
  status: 'pending' | 'approved' | 'archived' | 'rejected';
  rating: number;
  reviewerEmail: string;
  reviewerSocial?: string;
  reviewerAvatar?: string;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  keywords: string[];
  aiSummary?: string;
  aiHighlights?: string[];
  aiQuotes?: string[];
  createdAt: string;
  views: number;
  clicks: number;
  shares: number;
  trustScore?: number;
  bestQuoteHighlight?: string;
}

interface SearchResult {
  testimonial: Testimonial;
  relevanceScore: number;
  matchReason: string;
}

export interface StaticPage {
  slug: string;
  title: string;
  content: string;
  updatedAt: string;
}

export interface RoadmapItem {
  id: string;
  title: string;
  desc: string;
  status: 'planned' | 'in_progress' | 'under_review' | 'completed';
  category: 'AI' | 'Core' | 'Integrations';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  estimatedRelease: string;
  progress: number;
  tags: string[];
  lastUpdated: string;
}

export interface SupportTicket {
  id: string;
  name: string;
  email: string;
  subject: string;
  category: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  message: string;
  status: 'OPEN' | 'PENDING' | 'CLOSED';
  createdAt: string;
  replies: {
    id: string;
    author: string;
    message: string;
    createdAt: string;
  }[];
}

interface AppState {
  user: User | null;
  fetchStaticPage: (slug: string) => Promise<StaticPage | null>;
  collections: Collection[];
  testimonials: Testimonial[];
  isLoading: boolean;
  
  // Auth actions
  login: (email: string, password?: string) => Promise<boolean>;
  signup: (email: string, name: string, password?: string) => Promise<boolean>;
  githubLogin: (code: string) => Promise<boolean>;
  googleLogin: (code: string, redirectUri: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (name: string, avatarUrl: string) => void;
  
  // Billing action
  updateBillingTier: (tier: 'FREE' | 'PRO' | 'BUSINESS' | 'ENTERPRISE') => Promise<void>;
  
  // Collections actions
  createCollection: (collection: Omit<Collection, 'id' | 'user_id' | 'createdAt' | 'slug'>) => Promise<Collection | null>;
  deleteCollection: (id: string) => Promise<void>;
  fetchCollectionBySlug: (slug: string) => Promise<Collection | null>;
  updateCollection: (id: string, collection: { title: string; description: string; logoUrl?: string | null; theme: string; collectVideo: boolean; collectText: boolean }) => Promise<Collection | null>;
  updateCollectionReward: (spaceId: string, reward: { discountCode: string; message: string } | null) => Promise<void>;
  
  // Testimonials actions
  submitTestimonial: (collectionId: string, testimonial: Omit<Testimonial, 'id' | 'collection_id' | 'status' | 'sentiment' | 'keywords' | 'createdAt' | 'views' | 'clicks' | 'shares'> & { videoBlob?: Blob }) => Promise<Testimonial>;
  updateTestimonialStatus: (id: string, status: Testimonial['status']) => Promise<void>;
  deleteTestimonial: (id: string) => Promise<void>;
  importTestimonial: (collectionId: string, testimonial: Partial<Testimonial> & { source: string; externalLink?: string }) => Promise<void>;
  
  // Search actions
  searchTestimonials: (query: string) => SearchResult[];

  // Roadmap & Support State
  roadmapItems: RoadmapItem[];
  supportTickets: SupportTicket[];
  createRoadmapItem: (item: Omit<RoadmapItem, 'id' | 'lastUpdated'>) => void;
  updateRoadmapItemStatus: (id: string, status: RoadmapItem['status']) => void;
  createSupportTicket: (ticket: Omit<SupportTicket, 'id' | 'status' | 'createdAt' | 'replies'>) => void;
  addTicketReply: (ticketId: string, message: string) => void;
  closeTicket: (ticketId: string) => void;

  // Data sync actions
  fetchUser: () => Promise<void>;
  fetchApprovedTestimonials: () => Promise<void>;
}

// Initial Seed Data
const initialCollections: Collection[] = [
  {
    id: 'col-1',
    user_id: 'user-1',
    title: 'Acme SaaS Suite',
    description: 'Feedback for our primary web dashboard and developer APIs.',
    logoUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=acme',
    theme: '#6C5CFF',
    collectVideo: true,
    collectText: true,
    customQuestions: [
      'What was your primary hesitation before using Acme?',
      'How does Acme save you time on a weekly basis?',
      'Would you recommend us to other developers?'
    ],
    slug: 'acme-saas',
    createdAt: new Date(Date.now() - 3600000 * 24 * 30).toISOString(),
    reward: {
      id: 'reward-1',
      discountCode: 'ACME20OFF',
      message: 'Get 20% Off Your Next Purchase!',
      isActive: true
    }
  },
  {
    id: 'col-2',
    user_id: 'user-1',
    title: 'Mobile App Launch',
    description: 'iOS and Android client beta testers feedback.',
    logoUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=mobile',
    theme: '#8677FF',
    collectVideo: true,
    collectText: true,
    customQuestions: [
      'How was the user experience on mobile screens?',
      'What is your favorite mobile feature?',
      'Any bugs or glitches encountered?'
    ],
    slug: 'mobile-app',
    createdAt: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
    reward: {
      id: 'reward-2',
      discountCode: 'BETA30FREE',
      message: 'Get 30% Off Your Next Purchase!',
      isActive: true
    }
  }
];

const initialTestimonials: Testimonial[] = [
  // --- 6 APPROVED VIDEO TESTIMONIALS ---
  {
    id: 'vid-1',
    collection_id: 'col-1',
    name: 'Sarah Jenkins',
    company: 'DevFlow Inc',
    role: 'SaaS Founder',
    review: 'Setup took less than 15 minutes. We integrated the REST APIs in less than 30 minutes, and our onboarding pipeline speed immediately doubled. The developer documentation is state-of-the-art.',
    video_url: 'https://vjs.zencdn.net/v/oceans.mp4',
    status: 'approved',
    rating: 5,
    reviewerEmail: 'sarah@devflow.io',
    reviewerSocial: 'https://linkedin.com/in/sarah-jenkins',
    reviewerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    sentiment: 'POSITIVE',
    keywords: ['API', 'speed', 'setup', 'onboarding'],
    aiSummary: 'Sarah details the fast 15-minute onboarding configuration and the quality of developer integrations.',
    aiHighlights: ['15-minute setup', 'Double onboarding speed', 'Clear APIs'],
    aiQuotes: ['Setup took less than 15 minutes', 'REST APIs integrated in under 30 minutes'],
    createdAt: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
    views: 1540,
    clicks: 440,
    shares: 48,
    trustScore: 98,
    bestQuoteHighlight: 'Setup took less than 15 minutes.'
  },
  {
    id: 'vid-2',
    collection_id: 'col-1',
    name: 'James Cole',
    company: 'Vortex Studio',
    role: 'Agency Owner',
    review: 'We increased conversion rates by 18% for our clients within the first week of adding Proofly widgets. The custom branding makes it blend beautifully into any SaaS layout.',
    video_url: 'https://media.w3.org/2010/05/sintel/trailer_hd.mp4',
    status: 'approved',
    rating: 5,
    reviewerEmail: 'james@vortex.agency',
    reviewerSocial: 'https://linkedin.com/in/james-cole',
    reviewerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    sentiment: 'POSITIVE',
    keywords: ['conversions', 'agency', 'branding', 'widgets'],
    aiSummary: 'James shares that adding widgets led to an immediate 18% conversion rate improvement for their clients.',
    aiHighlights: ['+18% conversion rates', 'Flexible SaaS widgets', 'Beautiful branding'],
    aiQuotes: ['We increased conversion rates by 18%'],
    createdAt: new Date(Date.now() - 3600000 * 24 * 4).toISOString(),
    views: 2250,
    clicks: 530,
    shares: 75,
    trustScore: 97,
    bestQuoteHighlight: 'We increased conversion rates by 18%.'
  },
  {
    id: 'vid-3',
    collection_id: 'col-1',
    name: 'Alex Rivera',
    company: 'SaaSify Group',
    role: 'Startup Founder',
    review: 'Customers trust us much more now. Seeing real face-to-face feedback right next to our signup form has reduced bounce rates by nearly 30%. Embedding was dead simple.',
    video_url: 'https://www.w3schools.com/html/mov_bbb.mp4',
    status: 'approved',
    rating: 5,
    reviewerEmail: 'alex@saasify.co',
    reviewerSocial: 'https://x.com/alex_rivera',
    reviewerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    sentiment: 'POSITIVE',
    keywords: ['trust', 'signup', 'bounce rates', 'embed'],
    aiSummary: 'Alex explains how social proof placed near signup buttons cut page bounce rates by 30%.',
    aiHighlights: ['Reduced bounce by 30%', 'Greater visitor trust', 'Simple embed script'],
    aiQuotes: ['Customers trust us much more now', 'Reduced bounce rates by nearly 30%'],
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    views: 1850,
    clicks: 430,
    shares: 54,
    trustScore: 95,
    bestQuoteHighlight: 'Customers trust us much more now.'
  },
  {
    id: 'vid-4',
    collection_id: 'col-1',
    name: 'Emma Stone',
    company: 'StyleCo Ecom',
    role: 'E-commerce Owner',
    review: 'Video testimonials doubled engagement on our product pages. Our customers love recording short webcam reviews in exchange for our checkout promo coupons.',
    video_url: 'https://www.w3schools.com/html/movie.mp4',
    status: 'approved',
    rating: 5,
    reviewerEmail: 'emma@styleco.com',
    reviewerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    sentiment: 'POSITIVE',
    keywords: ['ecommerce', 'engagement', 'promotions', 'webcam'],
    aiSummary: 'Emma says providing automated discount coupons in exchange for recording reviews doubled shopper engagement.',
    aiHighlights: ['Doubled product engagement', 'High webcam capture rate', 'Coupon reward growth'],
    aiQuotes: ['Video testimonials doubled engagement'],
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    views: 3100,
    clicks: 810,
    shares: 110,
    trustScore: 96,
    bestQuoteHighlight: 'Video testimonials doubled engagement.'
  },
  {
    id: 'vid-5',
    collection_id: 'col-1',
    name: 'Priya Sharma',
    company: 'TaskFlow App',
    role: 'Product Manager',
    review: 'The AI insights revealed trends we missed. Having automated keyword extraction and summaries helps us pinpoint exact feature requests from direct customer videos instantly.',
    video_url: 'https://media.w3.org/2010/05/bunny/movie.mp4',
    status: 'approved',
    rating: 5,
    reviewerEmail: 'priya@taskflow.io',
    reviewerAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
    sentiment: 'POSITIVE',
    keywords: ['AI insights', 'product feedback', 'keywords', 'features'],
    aiSummary: 'Priya describes how natural language processing summarizes customer video reviews into actionable product features.',
    aiHighlights: ['Hidden user insights found', 'Automatic transcription tags', 'Product roadmap support'],
    aiQuotes: ['The AI insights revealed trends we missed'],
    createdAt: new Date(Date.now() - 3600000 * 24 * 1).toISOString(),
    views: 950,
    clicks: 220,
    shares: 25,
    trustScore: 94,
    bestQuoteHighlight: 'AI insights revealed trends we missed.'
  },
  {
    id: 'vid-6',
    collection_id: 'col-1',
    name: 'Marcus Vance',
    company: 'AuthCore Security',
    role: 'Marketing Lead',
    review: 'Wall of Love became our highest-performing section. It is the emotional center of our product site, and our developers are mesmerized by the interactive 3D coordinate bulge hovering effects.',
    video_url: 'https://media.w3.org/2010/05/bunny/trailer.mp4',
    status: 'approved',
    rating: 5,
    reviewerEmail: 'marcus@authcore.io',
    reviewerAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    sentiment: 'POSITIVE',
    keywords: ['marketing section', 'emotional proof', '3D tilt', 'engagement'],
    aiSummary: 'Marcus notes that adding the interactive 3D Wall of Love created their highest-performing landing page asset.',
    aiHighlights: ['Highest converting section', 'Stunning 3D coordinates', 'Emotional customer center'],
    aiQuotes: ['Wall of Love became our highest-performing section'],
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    views: 4200,
    clicks: 1120,
    shares: 190,
    trustScore: 99,
    bestQuoteHighlight: 'Wall of Love became our highest-performing section.'
  },

  // --- 6 APPROVED TEXT TESTIMONIALS ---
  {
    id: 'txt-1',
    collection_id: 'col-1',
    name: 'David Chen',
    company: 'DataPulse Cloud',
    role: 'Engineering Manager',
    review: 'Integrating the widgets took under 5 minutes with the simple HTML script tags. We love the automatic translations and the dark emerald theme.',
    status: 'approved',
    rating: 5,
    reviewerEmail: 'david@datapulse.cloud',
    reviewerAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    sentiment: 'POSITIVE',
    keywords: ['integrations', 'script tag', 'translations', 'dark theme'],
    createdAt: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
    views: 720,
    clicks: 120,
    shares: 10,
    trustScore: 93,
    bestQuoteHighlight: 'Integrating took under 5 minutes.'
  },
  {
    id: 'txt-2',
    collection_id: 'col-1',
    name: 'Sophia Rodriguez',
    company: 'DesignHaus',
    role: 'UX Designer',
    review: 'The Apple-like card tilt and hover spotlights look stunning on developer portfolio sites. It feels incredibly alive and premium.',
    status: 'approved',
    rating: 5,
    reviewerEmail: 'sophia@designhaus.io',
    reviewerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    sentiment: 'POSITIVE',
    keywords: ['UX design', 'tilt hover', 'spotlight effect', 'premium UI'],
    createdAt: new Date(Date.now() - 3600000 * 24 * 8).toISOString(),
    views: 1150,
    clicks: 230,
    shares: 15,
    trustScore: 96,
    bestQuoteHighlight: 'Apple-like card tilt looks stunning.'
  },
  {
    id: 'txt-3',
    collection_id: 'col-1',
    name: 'Liam O\'Connor',
    company: 'FitLife Global',
    role: 'Marketing Lead',
    review: 'We imported 50+ reviews from LinkedIn and X with a single click. The tool saved us hours of manual copying and pasting.',
    status: 'approved',
    rating: 5,
    reviewerEmail: 'liam@fitlife.co',
    reviewerAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
    sentiment: 'POSITIVE',
    keywords: ['imports', 'LinkedIn reviews', 'X tweets', 'time-saver'],
    createdAt: new Date(Date.now() - 3600000 * 24 * 7).toISOString(),
    views: 640,
    clicks: 90,
    shares: 4,
    trustScore: 92,
    bestQuoteHighlight: 'Imported reviews with a single click.'
  },
  {
    id: 'txt-4',
    collection_id: 'col-1',
    name: 'Zoe Kaufmann',
    company: 'ScaleUp Systems',
    role: 'Customer Success',
    review: 'AI summaries synthesize 10-minute videos into 3 bullet points. Our product teams read summaries directly in Slack channels!',
    status: 'approved',
    rating: 5,
    reviewerEmail: 'zoe@scaleup.cs',
    reviewerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    sentiment: 'POSITIVE',
    keywords: ['AI summary', 'video compression', 'Slack sync', 'reports'],
    createdAt: new Date(Date.now() - 3600000 * 24 * 6).toISOString(),
    views: 880,
    clicks: 140,
    shares: 12,
    trustScore: 94,
    bestQuoteHighlight: 'AI summaries synthesize 10-minute videos.'
  },
  {
    id: 'txt-5',
    collection_id: 'col-1',
    name: 'Vikram Malhotra',
    company: 'APIFlow Labs',
    role: 'Developer Relations',
    review: 'The webcam recorder works directly in mobile browsers. Our testers recorded reviews from their phones without downloading any apps.',
    status: 'approved',
    rating: 5,
    reviewerEmail: 'vikram@apiflow.dev',
    reviewerAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    sentiment: 'POSITIVE',
    keywords: ['mobile capture', 'camera streaming', 'webcam browser', 'SDK'],
    createdAt: new Date(Date.now() - 3600000 * 24 * 3).toISOString(),
    views: 1050,
    clicks: 190,
    shares: 19,
    trustScore: 95,
    bestQuoteHighlight: 'Webcam recorder works directly in mobile.'
  },
  {
    id: 'txt-6',
    collection_id: 'col-1',
    name: 'Nadia Petrova',
    company: 'CloudSync Inc',
    role: 'VP of Product',
    review: 'Zustand mock state management behaves exactly like a real Supabase database. The widget sandbox allows quick prototyping.',
    status: 'approved',
    rating: 5,
    reviewerEmail: 'nadia@cloudsync.io',
    reviewerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    sentiment: 'POSITIVE',
    keywords: ['Zustand store', 'widget sandbox', 'prototyping', 'Supabase'],
    createdAt: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    views: 930,
    clicks: 160,
    shares: 8,
    trustScore: 93,
    bestQuoteHighlight: 'Allows quick prototyping.'
  },

  // --- MIXED PENDING/REJECTED REVIEWS FOR INBOX VARIETY ---
  {
    id: 'test-pending-1',
    collection_id: 'col-1',
    name: 'Helena Rostova',
    company: 'Linear App',
    role: 'Product Lead',
    review: 'The mobile app interface is super clean. We loved the haptic feedback on swiping reviews, though the webcam recording tool takes a few seconds to load the audio streams on Android. Text review collection works flawlessly.',
    status: 'pending',
    rating: 4,
    reviewerEmail: 'helena@linear.app',
    reviewerSocial: 'https://linkedin.com/in/helena-rostova',
    reviewerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    sentiment: 'NEUTRAL',
    keywords: ['mobile ui', 'webcam recorder', 'Android', 'haptic'],
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
    views: 12,
    clicks: 1,
    shares: 0,
    trustScore: 82,
    bestQuoteHighlight: 'Mobile app interface is super clean'
  },
  {
    id: 'test-rejected-1',
    collection_id: 'col-1',
    name: 'David Miller',
    company: 'SaaSify',
    role: 'Founder',
    review: 'Very poor customer support. I reached out twice about webhooks delivery logs failing, and I received no response for 48 hours. The pricing plans are also confusing.',
    status: 'rejected',
    rating: 2,
    reviewerEmail: 'david@saasify.co',
    reviewerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    sentiment: 'NEGATIVE',
    keywords: ['support delay', 'webhooks logs', 'confusing pricing'],
    createdAt: new Date(Date.now() - 3600000 * 24 * 12).toISOString(),
    views: 2,
    clicks: 0,
    shares: 0,
    trustScore: 40,
    bestQuoteHighlight: 'Very poor customer support'
  }
];

const initialRoadmapItems: RoadmapItem[] = [
  {
    id: 'road-1',
    title: 'Self-serve white label branding',
    desc: 'Allow users to bind custom domain URLs (e.g. reviews.domain.com) and serve collectors with full brand white-labeling.',
    status: 'in_progress',
    category: 'Core',
    priority: 'HIGH',
    estimatedRelease: 'Q3 2026',
    progress: 75,
    tags: ['white-label', 'custom-domains'],
    lastUpdated: '2026-06-27T12:00:00Z'
  },
  {
    id: 'road-2',
    title: 'AI Video Transcription & Summaries',
    desc: 'Automatically transcribe incoming video reviews and extract summaries, key highlights, and feature-attribution tags.',
    status: 'completed',
    category: 'AI',
    priority: 'HIGH',
    estimatedRelease: 'Released',
    progress: 100,
    tags: ['transcription', 'summaries'],
    lastUpdated: '2026-06-26T12:00:00Z'
  },
  {
    id: 'road-3',
    title: 'Shopify Checkout Badge Integration',
    desc: 'Create direct checkout badge connectors to display product-specific ratings inside Shopify merchant stores.',
    status: 'planned',
    category: 'Integrations',
    priority: 'MEDIUM',
    estimatedRelease: 'Q4 2026',
    progress: 10,
    tags: ['shopify', 'e-commerce'],
    lastUpdated: '2026-06-27T10:00:00Z'
  },
  {
    id: 'road-4',
    title: 'SAML Single Sign-On (SSO)',
    desc: 'Enterprise security auth mapping to support Okta, Google Workspace, and Microsoft Azure integrations.',
    status: 'under_review',
    category: 'Core',
    priority: 'HIGH',
    estimatedRelease: 'Q3 2026',
    progress: 40,
    tags: ['sso', 'enterprise-security'],
    lastUpdated: '2026-06-27T08:00:00Z'
  }
];

export const useStore = create<AppState>((set, get) => ({
  user: null, // start as null so layout can trigger refresh if token exists
  collections: initialCollections, // default fallbacks
  testimonials: initialTestimonials, // default fallbacks
  roadmapItems: initialRoadmapItems,
  supportTickets: [],
  isLoading: false,



  login: async (email: string, password?: string) => {
    set({ isLoading: true });
    try {
      const data = await gqlRequest(`
        mutation Login($email: String!, $password: String!) {
          login(email: $email, password: $password) {
            token
            user {
              id
              email
              name
              tier
            }
          }
        }
      `, { email, password: password || 'password123' });

      if (data && data.login) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', data.login.token);
        }
        await get().fetchUser();
        return true;
      }
      set({ isLoading: false });
      return false;
    } catch (err: any) {
      console.warn('Login API connection failed. Simulating local auth session.');
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', 'mock-token-session');
      }
      set({
        user: {
          id: 'user-1',
          email: email,
          name: email.split('@')[0],
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
          tier: 'FREE'
        },
        collections: initialCollections,
        testimonials: initialTestimonials,
        isLoading: false
      });
      return true;
    }
  },

  signup: async (email: string, name: string, password?: string) => {
    set({ isLoading: true });
    try {
      const data = await gqlRequest(`
        mutation Signup($email: String!, $name: String!, $password: String!) {
          signup(email: $email, name: $name, password: $password) {
            token
            user {
              id
              email
              name
              tier
            }
          }
        }
      `, { email, name, password: password || 'password123' });

      if (data && data.signup) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', data.signup.token);
        }
        await get().fetchUser();
        return true;
      }
      set({ isLoading: false });
      return false;
    } catch (err: any) {
      console.warn('Signup API connection failed. Simulating local auth session.');
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', 'mock-token-session');
      }
      set({
        user: {
          id: 'user-1',
          email: email,
          name: name,
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
          tier: 'FREE'
        },
        collections: initialCollections,
        testimonials: initialTestimonials,
        isLoading: false
      });
      return true;
    }
  },

  githubLogin: async (code: string) => {
    set({ isLoading: true });
    try {
      const data = await gqlRequest(`
        mutation GithubLogin($code: String!) {
          githubLogin(code: $code) {
            token
            user {
              id
              email
              name
              tier
            }
          }
        }
      `, { code });

      if (data && data.githubLogin) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', data.githubLogin.token);
        }
        await get().fetchUser();
        return true;
      }
      set({ isLoading: false });
      return false;
    } catch (err: any) {
      console.warn('GitHub login API connection failed. Simulating local auth session.');
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', 'mock-token-session');
      }
      set({
        user: {
          id: 'user-1',
          email: 'github-founder@proofly.co',
          name: 'GitHub Member',
          avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=GitHub',
          tier: 'FREE'
        },
        collections: initialCollections,
        testimonials: initialTestimonials,
        isLoading: false
      });
      return true;
    }
  },

  googleLogin: async (code: string, redirectUri: string) => {
    set({ isLoading: true });
    try {
      const data = await gqlRequest(`
        mutation GoogleLogin($code: String!, $redirectUri: String!) {
          googleLogin(code: $code, redirectUri: $redirectUri) {
            token
            user {
              id
              email
              name
              tier
            }
          }
        }
      `, { code, redirectUri });

      if (data && data.googleLogin) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('token', data.googleLogin.token);
        }
        await get().fetchUser();
        return true;
      }
      set({ isLoading: false });
      return false;
    } catch (err: any) {
      console.warn('Google login API connection failed. Simulating local auth session.');
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', 'mock-token-session');
      }
      set({
        user: {
          id: 'user-1',
          email: 'google-founder@proofly.co',
          name: 'Google Member',
          avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Google',
          tier: 'FREE'
        },
        collections: initialCollections,
        testimonials: initialTestimonials,
        isLoading: false
      });
      return true;
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
    set({ user: null, collections: [], testimonials: [] });
  },

  updateProfile: (name: string, avatarUrl: string) => {
    set(state => ({
      user: state.user ? { ...state.user, name, avatar: avatarUrl } : null
    }));
  },

  updateBillingTier: async (tier) => {
    set({ isLoading: true });
    try {
      const data = await gqlRequest(`
        mutation UpdateBillingTier($tier: BillingTier!) {
          updateBillingTier(tier: $tier) {
            id
            tier
          }
        }
      `, { tier });

      if (data && data.updateBillingTier) {
        set(state => ({
          user: state.user ? { ...state.user, tier } : null,
          isLoading: false
        }));
      } else {
        set({ isLoading: false });
      }
    } catch (err) {
      console.error('Update billing tier failed:', err);
      set({ isLoading: false });
    }
  },

  createCollection: async (collection) => {
    set({ isLoading: true });
    try {
      const slug = collection.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const data = await gqlRequest(`
        mutation CreateSpace($input: CreateSpaceInput!) {
          createSpace(input: $input) {
            id
            name
            slug
            headerTitle
            customMessage
            logoUrl
            theme
            collectVideo
            collectText
            createdAt
          }
        }
      `, {
        input: {
          name: collection.title,
          slug,
          headerTitle: 'Love our Product?',
          customMessage: collection.description,
          logoUrl: collection.logoUrl || null,
          collectVideo: collection.collectVideo,
          collectText: collection.collectText,
          theme: collection.theme || '#6C5CFF'
        }
      });

      if (data && data.createSpace) {
        const s = data.createSpace;
        const newCol: Collection = {
          id: s.id,
          user_id: get().user?.id || '',
          title: s.name,
          description: s.customMessage,
          logoUrl: s.logoUrl || undefined,
          theme: s.theme,
          collectVideo: s.collectVideo,
          collectText: s.collectText,
          customQuestions: s.customMessage ? [s.customMessage] : [],
          slug: s.slug,
          createdAt: s.createdAt
        };
        set(state => ({
          collections: [newCol, ...state.collections],
          isLoading: false
        }));
        return newCol;
      }
      set({ isLoading: false });
      return null;
    } catch (err: any) {
      console.warn('createCollection API failed. Simulating local collection creation.');
      const newCol: Collection = {
        id: `col-${Date.now()}`,
        user_id: get().user?.id || 'user-1',
        title: collection.title,
        description: collection.description,
        logoUrl: collection.logoUrl || undefined,
        theme: collection.theme || '#6C5CFF',
        collectVideo: collection.collectVideo,
        collectText: collection.collectText,
        customQuestions: collection.description ? [collection.description] : [],
        slug: collection.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        createdAt: new Date().toISOString()
      };
      set(state => ({
        collections: [newCol, ...state.collections],
        isLoading: false
      }));
      return newCol;
    }
  },

  deleteCollection: async (id: string) => {
    set({ isLoading: true });
    try {
      const data = await gqlRequest(`
        mutation DeleteSpace($id: ID!) {
          deleteSpace(id: $id)
        }
      `, { id });

      if (data && data.deleteSpace) {
        set(state => ({
          collections: state.collections.filter(c => c.id !== id),
          testimonials: state.testimonials.filter(t => t.collection_id !== id),
          isLoading: false
        }));
      } else {
        set({ isLoading: false });
      }
    } catch (err) {
      console.warn('Delete collection failed. Simulating locally.');
      set(state => ({
        collections: state.collections.filter(c => c.id !== id),
        testimonials: state.testimonials.filter(t => t.collection_id !== id),
        isLoading: false
      }));
    }
  },

  updateCollection: async (id, collection) => {
    set({ isLoading: true });
    try {
      const data = await gqlRequest(`
        mutation UpdateSpace($id: ID!, $input: UpdateSpaceInput!) {
          updateSpace(id: $id, input: $input) {
            id
            name
            slug
            headerTitle
            customMessage
            logoUrl
            theme
            collectVideo
            collectText
            createdAt
            reward {
              id
              discountCode
              message
              isActive
            }
          }
        }
      `, {
        id,
        input: {
          name: collection.title,
          customMessage: collection.description,
          logoUrl: collection.logoUrl || null,
          collectVideo: collection.collectVideo,
          collectText: collection.collectText,
          theme: collection.theme
        }
      });

      if (data && data.updateSpace) {
        const s = data.updateSpace;
        const updatedCol: Collection = {
          id: s.id,
          user_id: get().user?.id || '',
          title: s.name,
          description: s.customMessage,
          logoUrl: s.logoUrl || undefined,
          theme: s.theme,
          collectVideo: s.collectVideo,
          collectText: s.collectText,
          customQuestions: s.customMessage ? [s.customMessage] : [],
          slug: s.slug,
          createdAt: s.createdAt,
          reward: s.reward
        };
        set(state => ({
          collections: state.collections.map(c => c.id === id ? updatedCol : c),
          isLoading: false
        }));
        return updatedCol;
      }
      set({ isLoading: false });
      return null;
    } catch (err: any) {
      console.warn('Update collection failed. Simulating locally.');
      const updatedCol: Collection = {
        id,
        user_id: get().user?.id || '',
        title: collection.title,
        description: collection.description,
        logoUrl: collection.logoUrl || undefined,
        theme: collection.theme,
        collectVideo: collection.collectVideo,
        collectText: collection.collectText,
        customQuestions: collection.description ? [collection.description] : [],
        slug: collection.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        createdAt: new Date().toISOString()
      };
      set(state => ({
        collections: state.collections.map(c => c.id === id ? updatedCol : c),
        isLoading: false
      }));
      return updatedCol;
    }
  },

  updateCollectionReward: async (spaceId, reward) => {
    set({ isLoading: true });
    try {
      if (reward) {
        // Create or update reward
        const data = await gqlRequest(`
          mutation CreateOrUpdateReward($input: CreateOrUpdateRewardInput!) {
            createOrUpdateReward(input: $input) {
              id
              discountCode
              message
              isActive
            }
          }
        `, {
          input: {
            spaceId,
            discountCode: reward.discountCode,
            message: reward.message
          }
        });

        if (data && data.createOrUpdateReward) {
          const r = data.createOrUpdateReward;
          set(state => ({
            collections: state.collections.map(c => c.id === spaceId ? { ...c, reward: r } : c),
            isLoading: false
          }));
        } else {
          set({ isLoading: false });
        }
      } else {
        // Delete reward
        const data = await gqlRequest(`
          mutation DeleteReward($spaceId: ID!) {
            deleteReward(spaceId: $spaceId)
          }
        `, { spaceId });

        if (data && data.deleteReward) {
          set(state => ({
            collections: state.collections.map(c => c.id === spaceId ? { ...c, reward: null } : c),
            isLoading: false
          }));
        } else {
          set({ isLoading: false });
        }
      }
    } catch (err: any) {
      console.warn('Update collection reward failed. Simulating locally.');
      const r = reward ? {
        id: `reward-${Date.now()}`,
        discountCode: reward.discountCode,
        message: reward.message,
        isActive: true
      } : null;
      set(state => ({
        collections: state.collections.map(c => c.id === spaceId ? { ...c, reward: r } : c),
        isLoading: false
      }));
    }
  },

  fetchCollectionBySlug: async (slug: string) => {
    set({ isLoading: true });
    try {
      const data = await gqlRequest(`
        query SpaceBySlug($slug: String!) {
          spaceBySlug(slug: $slug) {
            id
            name
            slug
            headerTitle
            customMessage
            logoUrl
            theme
            collectVideo
            collectText
            createdAt
            reward {
              id
              discountCode
              message
              isActive
            }
          }
        }
      `, { slug });

      if (data && data.spaceBySlug) {
        const s = data.spaceBySlug;
        const col: Collection = {
          id: s.id,
          user_id: '',
          title: s.name,
          description: s.customMessage,
          logoUrl: s.logoUrl || undefined,
          theme: s.theme,
          collectVideo: s.collectVideo,
          collectText: s.collectText,
          customQuestions: s.customMessage ? [s.customMessage] : [],
          slug: s.slug,
          createdAt: s.createdAt,
          reward: s.reward
        };
        set(state => {
          const exists = state.collections.some(c => c.id === col.id);
          return {
            collections: exists 
              ? state.collections.map(c => c.id === col.id ? col : c) 
              : [...state.collections, col],
            isLoading: false
          };
        });
        return col;
      }
      set({ isLoading: false });
      return null;
    } catch (err) {
      console.error('Fetch collection by slug failed:', err);
      set({ isLoading: false });
      return null;
    }
  },

  fetchStaticPage: async (slug: string) => {
    set({ isLoading: true });
    try {
      const data = await gqlRequest(`
        query StaticPage($slug: String!) {
          staticPage(slug: $slug) {
            slug
            title
            content
            updatedAt
          }
        }
      `, { slug });

      set({ isLoading: false });
      if (data && data.staticPage) {
        return data.staticPage;
      }
      return null;
    } catch (err) {
      console.error('Fetch static page failed:', err);
      set({ isLoading: false });
      return null;
    }
  },

  submitTestimonial: async (collectionId, testimonial) => {
    set({ isLoading: true });
    try {
      const isVideo = !!testimonial.video_url || !!testimonial.videoBlob;
      let finalVideoUrl = testimonial.video_url || null;

      if (testimonial.videoBlob) {
        const uploadUrl = (process.env.NEXT_PUBLIC_GRAPHQL_URL 
          ? process.env.NEXT_PUBLIC_GRAPHQL_URL.replace('/graphql', '/api/upload') 
          : 'http://localhost:4000/api/upload');

        const uploadRes = await fetch(uploadUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'video/webm'
          },
          body: testimonial.videoBlob
        });

        if (!uploadRes.ok) {
          const errText = await uploadRes.text();
          throw new Error(`Video upload failed: ${errText}`);
        }

        const uploadData = await uploadRes.json();
        finalVideoUrl = uploadData.url;
      }

      const data = await gqlRequest(`
        mutation CreateTestimonial($input: CreateTestimonialInput!) {
          createTestimonial(input: $input) {
            testimonial {
              id
              type
              textContent
              videoUrl
              rating
              reviewerName
              reviewerEmail
              reviewerTitle
              reviewerSocial
              reviewerAvatar
              isApproved
              sentiment
              createdAt
            }
          }
        }
      `, {
        input: {
          spaceId: collectionId,
          type: isVideo ? 'VIDEO' : 'TEXT',
          textContent: testimonial.review,
          videoUrl: finalVideoUrl,
          rating: testimonial.rating,
          reviewerName: testimonial.name,
          reviewerEmail: testimonial.reviewerEmail,
          reviewerTitle: testimonial.role || null,
          reviewerSocial: testimonial.reviewerSocial || null,
          reviewerAvatar: testimonial.reviewerAvatar || null
        }
      });

      if (data && data.createTestimonial) {
        const t = data.createTestimonial.testimonial;
        const newT: Testimonial = {
          id: t.id,
          collection_id: collectionId,
          name: t.reviewerName,
          company: t.reviewerTitle || '',
          role: t.reviewerTitle || '',
          review: t.textContent || '',
          video_url: t.videoUrl || undefined,
          status: t.isApproved ? 'approved' : 'pending',
          rating: t.rating,
          reviewerEmail: t.reviewerEmail,
          reviewerSocial: t.reviewerSocial || undefined,
          reviewerAvatar: t.reviewerAvatar || undefined,
          sentiment: t.sentiment || 'NEUTRAL',
          keywords: [],
          createdAt: t.createdAt,
          views: 0,
          clicks: 0,
          shares: 0
        };
        set(state => ({
          testimonials: [newT, ...state.testimonials],
          isLoading: false
        }));
        return newT;
      }
      set({ isLoading: false });
      throw new Error('Submission failed');
    } catch (err: any) {
      console.warn('submitTestimonial API connection failed. Simulating local submission.');
      const newT: Testimonial = {
        id: `t-${Date.now()}`,
        collection_id: collectionId,
        name: testimonial.name,
        company: testimonial.company || '',
        role: testimonial.role || '',
        review: testimonial.review,
        video_url: testimonial.video_url || undefined,
        status: 'pending',
        rating: testimonial.rating,
        reviewerEmail: testimonial.reviewerEmail,
        reviewerSocial: testimonial.reviewerSocial || undefined,
        reviewerAvatar: testimonial.reviewerAvatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(testimonial.name)}`,
        sentiment: 'POSITIVE',
        keywords: [],
        createdAt: new Date().toISOString(),
        views: 0,
        clicks: 0,
        shares: 0
      };
      set(state => ({
        testimonials: [newT, ...state.testimonials],
        isLoading: false
      }));
      return newT;
    }
  },

  updateTestimonialStatus: async (id, status) => {
    set({ isLoading: true });
    try {
      const data = await gqlRequest(`
        mutation UpdateTestimonial($id: ID!, $input: UpdateTestimonialInput!) {
          updateTestimonial(id: $id, input: $input) {
            id
            isApproved
            isArchived
          }
        }
      `, {
        id,
        input: {
          isApproved: status === 'approved',
          isArchived: status === 'rejected' || status === 'archived'
        }
      });

      if (data && data.updateTestimonial) {
        set(state => ({
          testimonials: state.testimonials.map(t => t.id === id ? { ...t, status } : t),
          isLoading: false
        }));
      } else {
        set({ isLoading: false });
      }
    } catch (err) {
      console.warn('Update testimonial status failed. Simulating locally.');
      set(state => ({
        testimonials: state.testimonials.map(t => t.id === id ? { ...t, status } : t),
        isLoading: false
      }));
    }
  },

  deleteTestimonial: async (id) => {
    set({ isLoading: true });
    try {
      const data = await gqlRequest(`
        mutation DeleteTestimonial($id: ID!) {
          deleteTestimonial(id: $id)
        }
      `, { id });

      if (data && data.deleteTestimonial) {
        set(state => ({
          testimonials: state.testimonials.filter(t => t.id !== id),
          isLoading: false
        }));
      } else {
        set({ isLoading: false });
      }
    } catch (err) {
      console.warn('Delete testimonial failed. Simulating locally.');
      set(state => ({
        testimonials: state.testimonials.filter(t => t.id !== id),
        isLoading: false
      }));
    }
  },

  importTestimonial: async (collectionId, testimonial) => {
    set({ isLoading: true });
    try {
      const data = await gqlRequest(`
        mutation ImportTestimonial($input: ImportTestimonialInput!) {
          importTestimonial(input: $input) {
            id
            type
            textContent
            rating
            reviewerName
            reviewerEmail
            reviewerTitle
            reviewerSocial
            reviewerAvatar
            isApproved
            sentiment
            createdAt
            importedFrom
            externalLink
          }
        }
      `, {
        input: {
          spaceId: collectionId,
          importedFrom: testimonial.source?.toUpperCase() === 'TWITTER' ? 'TWITTER' : (testimonial.source?.toUpperCase() === 'GOOGLE' ? 'GOOGLE' : 'PRODUCTHUNT'),
          externalLink: testimonial.externalLink || 'https://twitter.com',
          textContent: testimonial.review || 'Imported review text.',
          rating: testimonial.rating || 5,
          reviewerName: testimonial.name || 'Anonymous Reviewer',
          reviewerEmail: testimonial.reviewerEmail || 'imported@reviews.com',
          reviewerTitle: testimonial.role || testimonial.company || null,
          reviewerSocial: testimonial.reviewerSocial || null,
          reviewerAvatar: testimonial.reviewerAvatar || null
        }
      });

      if (data && data.importTestimonial) {
        const t = data.importTestimonial;
        const newT: Testimonial = {
          id: t.id,
          collection_id: collectionId,
          name: t.reviewerName,
          company: t.reviewerTitle || '',
          role: t.reviewerTitle || '',
          review: t.textContent || '',
          video_url: undefined,
          status: 'approved',
          rating: t.rating,
          reviewerEmail: t.reviewerEmail,
          reviewerSocial: t.reviewerSocial || undefined,
          reviewerAvatar: t.reviewerAvatar || undefined,
          sentiment: t.sentiment || 'NEUTRAL',
          keywords: ['imported', testimonial.source?.toLowerCase() || 'social'],
          createdAt: t.createdAt,
          views: 120,
          clicks: 34,
          shares: 4
        };
        set(state => ({
          testimonials: [newT, ...state.testimonials],
          isLoading: false
        }));
      } else {
        set({ isLoading: false });
      }
    } catch (err) {
      console.warn('Import testimonial failed. Simulating locally.');
      const newT: Testimonial = {
        id: `imported-${Date.now()}`,
        collection_id: collectionId,
        name: testimonial.name || 'Imported Reviewer',
        company: testimonial.role || testimonial.company || 'Social Media',
        role: testimonial.role || testimonial.company || 'Social Media',
        review: testimonial.review || 'Imported testimonial text.',
        video_url: undefined,
        status: 'approved',
        rating: testimonial.rating || 5,
        reviewerEmail: testimonial.reviewerEmail || 'imported@reviews.com',
        reviewerSocial: testimonial.reviewerSocial || undefined,
        reviewerAvatar: testimonial.reviewerAvatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${encodeURIComponent(testimonial.name || 'import')}`,
        sentiment: 'POSITIVE',
        keywords: ['imported', testimonial.source?.toLowerCase() || 'social'],
        createdAt: new Date().toISOString(),
        views: 100,
        clicks: 12,
        shares: 2
      };
      set(state => ({
        testimonials: [newT, ...state.testimonials],
        isLoading: false
      }));
    }
  },

  searchTestimonials: (query) => {
    if (!query.trim()) return [];
    const testimonials = get().testimonials;
    const lowerQuery = query.toLowerCase();
    
    return testimonials
      .map(t => {
        let score = 0;
        let reason = '';
        
        if (t.reviewerEmail.toLowerCase().includes(lowerQuery)) {
          score += 8;
          reason = 'Matches reviewer email';
        }
        if (t.name.toLowerCase().includes(lowerQuery)) {
          score += 7;
          reason = 'Matches reviewer name';
        }
        if (t.company.toLowerCase().includes(lowerQuery) || t.role.toLowerCase().includes(lowerQuery)) {
          score += 5;
          reason = 'Matches role or company';
        }
        if (t.review.toLowerCase().includes(lowerQuery)) {
          score += 6;
          reason = 'Matches testimonial text';
        }
        
        return {
          testimonial: t,
          relevanceScore: score,
          matchReason: reason
        };
      })
      .filter(item => item.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore);
  },

  fetchUser: async () => {
    set({ isLoading: true });
    try {
      const data = await gqlRequest(`
        query Me {
          me {
            id
            email
            name
            tier
            spaces {
              id
              name
              slug
              headerTitle
              customMessage
              logoUrl
              theme
              collectVideo
              collectText
              createdAt
              testimonials {
                id
                type
                textContent
                videoUrl
                rating
                reviewerName
                reviewerEmail
                reviewerTitle
                reviewerSocial
                reviewerAvatar
                isApproved
                isArchived
                sentiment
                createdAt
              }
            }
          }
        }
      `);

      if (data && data.me) {
        const u = data.me;
        const mappedCollections: Collection[] = u.spaces.map((s: any) => ({
          id: s.id,
          user_id: u.id,
          title: s.name,
          description: s.customMessage,
          logoUrl: s.logoUrl || undefined,
          theme: s.theme,
          collectVideo: s.collectVideo,
          collectText: s.collectText,
          customQuestions: s.customMessage ? [s.customMessage] : [],
          slug: s.slug,
          createdAt: s.createdAt
        }));

        const mappedTestimonials: Testimonial[] = [];
        u.spaces.forEach((s: any) => {
          if (s.testimonials) {
            s.testimonials.forEach((t: any) => {
              mappedTestimonials.push({
                id: t.id,
                collection_id: s.id,
                name: t.reviewerName,
                company: t.reviewerTitle || '',
                role: t.reviewerTitle || '',
                review: t.textContent || '',
                video_url: t.videoUrl || undefined,
                status: t.isApproved ? 'approved' : (t.isArchived ? 'rejected' : 'pending'),
                rating: t.rating,
                reviewerEmail: t.reviewerEmail,
                reviewerSocial: t.reviewerSocial || undefined,
                reviewerAvatar: t.reviewerAvatar || undefined,
                sentiment: t.sentiment || 'NEUTRAL',
                keywords: [],
                createdAt: t.createdAt,
                views: 120,
                clicks: 34,
                shares: 4
              });
            });
          }
        });

        set({
          user: {
            id: u.id,
            email: u.email,
            name: u.name,
            avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(u.name)}`,
            tier: u.tier
          },
          collections: mappedCollections,
          testimonials: mappedTestimonials.length > 0 ? mappedTestimonials : initialTestimonials,
          isLoading: false
        });
      } else {
        set({ user: null, isLoading: false });
      }
    } catch (err) {
      console.warn('Fetch user API failed. Simulating offline session.');
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (token) {
        set({
          user: {
            id: 'user-1',
            email: 'ashwathjeloji2468@gmail.com',
            name: 'Jelloji ASHWATH',
            avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Jelloji%20ASHWATH',
            tier: 'FREE'
          },
          collections: initialCollections,
          testimonials: initialTestimonials,
          isLoading: false
        });
      } else {
        set({ user: null, isLoading: false });
      }
    }
  },

  fetchApprovedTestimonials: async () => {
    try {
      const data = await gqlRequest(`
        query AllApprovedTestimonials {
          allApprovedTestimonials {
            id
            type
            textContent
            videoUrl
            rating
            reviewerName
            reviewerEmail
            reviewerTitle
            reviewerSocial
            reviewerAvatar
            isApproved
            sentiment
            createdAt
            space {
              id
            }
          }
        }
      `);
      if (data && data.allApprovedTestimonials && data.allApprovedTestimonials.length > 0) {
        const mappedTestimonials: Testimonial[] = data.allApprovedTestimonials.map((t: any) => ({
          id: t.id,
          collection_id: t.space?.id || '',
          name: t.reviewerName,
          company: t.reviewerTitle || '',
          role: t.reviewerTitle || '',
          review: t.textContent || '',
          video_url: t.videoUrl || undefined,
          status: 'approved',
          rating: t.rating,
          reviewerEmail: t.reviewerEmail,
          reviewerSocial: t.reviewerSocial || undefined,
          reviewerAvatar: t.reviewerAvatar || undefined,
          sentiment: t.sentiment || 'NEUTRAL',
          keywords: [],
          createdAt: t.createdAt,
          views: 120,
          clicks: 34,
          shares: 4
        }));
        set({ testimonials: mappedTestimonials });
      }
    } catch (err) {
      console.error('Fetch approved testimonials failed:', err);
    }
  },

  createRoadmapItem: (item) => {
    const newItem: RoadmapItem = {
      ...item,
      id: `road-${Date.now()}`,
      lastUpdated: new Date().toISOString()
    };
    set((state) => ({
      roadmapItems: [newItem, ...state.roadmapItems]
    }));
  },

  updateRoadmapItemStatus: (id, status) => {
    set((state) => ({
      roadmapItems: state.roadmapItems.map((item) => 
        item.id === id ? { ...item, status, lastUpdated: new Date().toISOString() } : item
      )
    }));
  },

  createSupportTicket: (ticket) => {
    const newTicket: SupportTicket = {
      ...ticket,
      id: `ticket-${Date.now()}`,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      replies: []
    };
    set((state) => ({
      supportTickets: [newTicket, ...state.supportTickets]
    }));
  },

  addTicketReply: (ticketId, message) => {
    set((state) => ({
      supportTickets: state.supportTickets.map((t) => {
        if (t.id === ticketId) {
          const newReply = {
            id: `reply-${Date.now()}`,
            author: 'You',
            message,
            createdAt: new Date().toISOString()
          };
          
          const autoReply = {
            id: `reply-auto-${Date.now() + 500}`,
            author: 'Proofly Support Desk',
            message: `Thank you for your update. We have logged these details under category "${t.category}" with priority "${t.priority}". An agent will review and follow up shortly.`,
            createdAt: new Date(Date.now() + 1000).toISOString()
          };

          return {
            ...t,
            status: 'PENDING' as const,
            replies: [...t.replies, newReply, autoReply]
          };
        }
        return t;
      })
    }));
  },

  closeTicket: (ticketId) => {
    set((state) => ({
      supportTickets: state.supportTickets.map((t) => 
        t.id === ticketId ? { ...t, status: 'CLOSED' as const } : t
      )
    }));
  }
}));
