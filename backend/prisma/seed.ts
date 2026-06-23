import { PrismaClient, TestimonialType, Sentiment, BillingTier } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data to ensure a clean starting point
  await prisma.testimonial.deleteMany();
  await prisma.space.deleteMany();
  await prisma.user.deleteMany();

  // 1. Create default admin user
  const passwordHash = await bcrypt.hash('password123', 10);
  const user = await prisma.user.create({
    data: {
      id: 'user-1',
      email: 'ashwathjeloji2468@gmail.com',
      name: 'Jelloji ASHWATH',
      passwordHash,
      tier: BillingTier.FREE,
    },
  });
  console.log(`👤 Created user: ${user.email}`);

  // 2. Create Default Spaces
  await prisma.space.create({
    data: {
      id: 'col-1',
      userId: user.id,
      name: 'Acme SaaS Suite',
      slug: 'acme-saas',
      headerTitle: 'Love our Product?',
      customMessage: 'Feedback for our primary web dashboard and developer APIs.',
      theme: '#6C5CFF',
      collectVideo: true,
      collectText: true,
      logoUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=acme',
    },
  });

  await prisma.space.create({
    data: {
      id: 'col-2',
      userId: user.id,
      name: 'Mobile App Launch',
      slug: 'mobile-app',
      headerTitle: 'Tell us how we did!',
      customMessage: 'iOS and Android client beta testers feedback.',
      theme: '#8677FF',
      collectVideo: true,
      collectText: true,
      logoUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=mobile',
    },
  });
  console.log('📁 Created spaces: acme-saas, mobile-app');

  // 3. Create Testimonials for space1 (Acme SaaS Suite)
  const testimonialsData = [
    // --- 6 APPROVED VIDEO TESTIMONIALS ---
    {
      id: 'vid-1',
      type: TestimonialType.VIDEO,
      textContent: 'Setup took less than 15 minutes. We integrated the REST APIs in less than 30 minutes, and our onboarding pipeline speed immediately doubled. The developer documentation is state-of-the-art.',
      videoUrl: 'https://vjs.zencdn.net/v/oceans.mp4',
      rating: 5,
      reviewerName: 'Sarah Jenkins',
      reviewerEmail: 'sarah@devflow.io',
      reviewerTitle: 'SaaS Founder',
      reviewerSocial: 'https://linkedin.com/in/sarah-jenkins',
      reviewerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      isApproved: true,
      sentiment: Sentiment.POSITIVE,
    },
    {
      id: 'vid-2',
      type: TestimonialType.VIDEO,
      textContent: 'We increased conversion rates by 18% for our clients within the first week of adding PowerTestimonials widgets. The custom branding makes it blend beautifully into any SaaS layout.',
      videoUrl: 'https://media.w3.org/2010/05/sintel/trailer_hd.mp4',
      rating: 5,
      reviewerName: 'James Cole',
      reviewerEmail: 'james@vortex.agency',
      reviewerTitle: 'Agency Owner',
      reviewerSocial: 'https://linkedin.com/in/james-cole',
      reviewerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      isApproved: true,
      sentiment: Sentiment.POSITIVE,
    },
    {
      id: 'vid-3',
      type: TestimonialType.VIDEO,
      textContent: 'Customers trust us much more now. Seeing real face-to-face feedback right next to our signup form has reduced bounce rates by nearly 30%. Embedding was dead simple.',
      videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
      rating: 5,
      reviewerName: 'Alex Rivera',
      reviewerEmail: 'alex@saasify.co',
      reviewerTitle: 'Startup Founder',
      reviewerSocial: 'https://x.com/alex_rivera',
      reviewerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      isApproved: true,
      sentiment: Sentiment.POSITIVE,
    },
    {
      id: 'vid-4',
      type: TestimonialType.VIDEO,
      textContent: 'Video testimonials doubled engagement on our product pages. Our customers love recording short webcam reviews in exchange for our checkout promo coupons.',
      videoUrl: 'https://www.w3schools.com/html/movie.mp4',
      rating: 5,
      reviewerName: 'Emma Stone',
      reviewerEmail: 'emma@styleco.com',
      reviewerTitle: 'E-commerce Owner',
      reviewerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      isApproved: true,
      sentiment: Sentiment.POSITIVE,
    },
    {
      id: 'vid-5',
      type: TestimonialType.VIDEO,
      textContent: 'The AI insights revealed trends we missed. Having automated keyword extraction and summaries helps us pinpoint exact feature requests from direct customer videos instantly.',
      videoUrl: 'https://media.w3.org/2010/05/bunny/movie.mp4',
      rating: 5,
      reviewerName: 'Priya Sharma',
      reviewerEmail: 'priya@taskflow.io',
      reviewerTitle: 'Product Manager',
      reviewerAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
      isApproved: true,
      sentiment: Sentiment.POSITIVE,
    },
    {
      id: 'vid-6',
      type: TestimonialType.VIDEO,
      textContent: 'Wall of Love became our highest-performing section. It is the emotional center of our product site, and our developers are mesmerized by the interactive 3D coordinate bulge hovering effects.',
      videoUrl: 'https://media.w3.org/2010/05/bunny/trailer.mp4',
      rating: 5,
      reviewerName: 'Marcus Vance',
      reviewerEmail: 'marcus@authcore.io',
      reviewerTitle: 'Marketing Lead',
      reviewerAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
      isApproved: true,
      sentiment: Sentiment.POSITIVE,
    },
    // --- 6 APPROVED TEXT TESTIMONIALS ---
    {
      id: 'txt-1',
      type: TestimonialType.TEXT,
      textContent: 'Integrating the widgets took under 5 minutes with the simple HTML script tags. We love the automatic translations and the dark emerald theme.',
      rating: 5,
      reviewerName: 'David Chen',
      reviewerEmail: 'david@datapulse.cloud',
      reviewerTitle: 'Engineering Manager',
      reviewerAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
      isApproved: true,
      sentiment: Sentiment.POSITIVE,
    },
    {
      id: 'txt-2',
      type: TestimonialType.TEXT,
      textContent: 'The Apple-like card tilt and hover spotlights look stunning on developer portfolio sites. It feels incredibly alive and premium.',
      rating: 5,
      reviewerName: 'Sophia Rodriguez',
      reviewerEmail: 'sophia@designhaus.io',
      reviewerTitle: 'UX Designer',
      reviewerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      isApproved: true,
      sentiment: Sentiment.POSITIVE,
    },
    {
      id: 'txt-3',
      type: TestimonialType.TEXT,
      textContent: 'We imported 50+ reviews from LinkedIn and X with a single click. The tool saved us hours of manual copying and pasting.',
      rating: 5,
      reviewerName: 'Liam O\'Connor',
      reviewerEmail: 'liam@fitlife.co',
      reviewerTitle: 'Marketing Lead',
      reviewerAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
      isApproved: true,
      sentiment: Sentiment.POSITIVE,
    },
    {
      id: 'txt-4',
      type: TestimonialType.TEXT,
      textContent: 'AI summaries synthesize 10-minute videos into 3 bullet points. Our product teams read summaries directly in Slack channels!',
      rating: 5,
      reviewerName: 'Zoe Kaufmann',
      reviewerEmail: 'zoe@scaleup.cs',
      reviewerTitle: 'Customer Success',
      reviewerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      isApproved: true,
      sentiment: Sentiment.POSITIVE,
    },
    {
      id: 'txt-5',
      type: TestimonialType.TEXT,
      textContent: 'The webcam recorder works directly in mobile browsers. Our testers recorded reviews from their phones without downloading any apps.',
      rating: 5,
      reviewerName: 'Vikram Malhotra',
      reviewerEmail: 'vikram@apiflow.dev',
      reviewerTitle: 'Developer Relations',
      reviewerAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
      isApproved: true,
      sentiment: Sentiment.POSITIVE,
    },
    {
      id: 'txt-6',
      type: TestimonialType.TEXT,
      textContent: 'Zustand mock state management behaves exactly like a real Supabase database. The widget sandbox allows quick prototyping.',
      rating: 5,
      reviewerName: 'Nadia Petrova',
      reviewerEmail: 'nadia@cloudsync.io',
      reviewerTitle: 'VP of Product',
      reviewerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      isApproved: true,
      sentiment: Sentiment.POSITIVE,
    },
    // --- PENDING/REJECTED ---
    {
      id: 'test-pending-1',
      type: TestimonialType.TEXT,
      textContent: 'The mobile app interface is super clean. We loved the haptic feedback on swiping reviews, though the webcam recording tool takes a few seconds to load the audio streams on Android. Text review collection works flawlessly.',
      rating: 4,
      reviewerName: 'Helena Rostova',
      reviewerEmail: 'helena@linear.app',
      reviewerTitle: 'Product Lead',
      reviewerSocial: 'https://linkedin.com/in/helena-rostova',
      reviewerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      isApproved: false,
      sentiment: Sentiment.NEUTRAL,
    },
    {
      id: 'test-rejected-1',
      type: TestimonialType.TEXT,
      textContent: 'Very poor customer support. I reached out twice about webhooks delivery logs failing, and I received no response for 48 hours. The pricing plans are also confusing.',
      rating: 2,
      reviewerName: 'David Miller',
      reviewerEmail: 'david@saasify.co',
      reviewerTitle: 'Founder',
      reviewerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      isApproved: false,
      isArchived: true, // Mark archived to represent 'rejected' in the schema
      sentiment: Sentiment.NEGATIVE,
    },
  ];

  for (const t of testimonialsData) {
    await prisma.testimonial.create({
      data: {
        ...t,
        spaceId: 'col-1',
      },
    });
  }
  console.log(`✍️ Created ${testimonialsData.length} testimonials for acme-saas`);

  console.log('✅ Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
