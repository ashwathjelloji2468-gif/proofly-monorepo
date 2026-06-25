import { PrismaClient, TestimonialType, Sentiment, BillingTier } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing data to ensure a clean starting point
  await prisma.reward.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.space.deleteMany();
  await prisma.user.deleteMany();
  await prisma.staticPage.deleteMany();

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

  // 2b. Create default rewards for spaces
  await prisma.reward.create({
    data: {
      spaceId: 'col-1',
      discountCode: 'ACME20OFF',
      message: 'Get 20% Off Your Next Purchase!',
      isActive: true,
    },
  });

  await prisma.reward.create({
    data: {
      spaceId: 'col-2',
      discountCode: 'BETA30FREE',
      message: 'Get 30% Off Your Next Purchase!',
      isActive: true,
    },
  });
  console.log('🎁 Created rewards: ACME20OFF, BETA30FREE');

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

  // 4. Seed Legal Pages
  const legalPages = [
    {
      slug: 'terms',
      title: 'Terms of Service',
      content: `# Terms of Service

*Last updated: June 2026*

Welcome to **Proofly** (referred to as "we", "our", or "us"). By accessing or using our platform, website, and services, you agree to comply with and be bound by these Terms of Service. Please read them carefully.

## 1. Acceptance of Terms
By creating an account, upgrading to premium plans (Pro or Business), or embedding our widgets, you agree to these Terms. If you do not agree, you must not use our platform.

## 2. Account Registration and Subscriptions
* You must provide accurate and complete information when registering.
* **Billing Tiers**: We offer Free, Pro, and Business tiers. Free users are restricted to 2 spaces and cannot configure webhooks or custom domains. Pro users can create up to 5 spaces and add webhooks. Business users have unlimited spaces, webhooks, and custom domain mapping.
* Payments are handled via Stripe checkout. All subscriptions will auto-renew until cancelled in your billing portal.

## 3. Reviewer Consent and Video Testimonials
* When collecting testimonials, you warrant that you have obtained appropriate consent from reviewers to display their names, titles, avatars, and comments/videos publicly.
* We process video testimonials using Mux. You are responsible for ensuring uploaded contents do not violate third-party intellectual property or copyright.

## 4. Limitation of Liability
Proofly is provided "as is". In no event shall we be liable for any indirect, incidental, or consequential damages resulting from service downtime, data loss, or testimonial widget display failures.`
    },
    {
      slug: 'privacy',
      title: 'Privacy Policy',
      content: `# Privacy Policy

*Last updated: June 2026*

At **Proofly**, we protect your privacy. This Privacy Policy describes how we collect, use, and share information when you use our platform.

## 1. Information We Collect
* **Account Information**: Name, email, password hash, and billing information (processed securely through Stripe).
* **Reviewer Content**: Text testimonials, video URLs (stored on Cloudinary and Mux), ratings, reviewer names, emails, titles, and social handles that you or your reviewers submit.
* **Imported Reviews**: If you connect Google, Twitter/X, or ProductHunt, we import selected public posts and reviewer avatars to display on your Wall of Love.

## 2. Cookies and Analytics
* We use essential session cookies to manage authentication.
* We track page views, testimonial widget clicks, and video plays through our custom Analytics service to give you insights in your creator dashboard.

## 3. Data Sharing and Third-Party Sub-processors
* We use **Prisma** to access PostgreSQL databases hosted on **Neon**.
* Video uploads are processed using **Mux**.
* Image and media file storage is managed by **Cloudinary**.
* Payment processing is secured by **Stripe**.`
    },
    {
      slug: 'gdpr',
      title: 'GDPR Compliance',
      content: `# GDPR Compliance

*Last updated: June 2026*

**Proofly** is committed to meeting the requirements of the General Data Protection Regulation (GDPR). We ensure all European Union user data is processed securely and with complete transparency.

## 1. Data Controller vs. Data Processor
* **Data Controller**: You (the Proofly account holder/space creator) act as the Controller for any reviewer testimonials, emails, names, or video recordings collected through your Proofly submission forms.
* **Data Processor**: Proofly acts as the Processor. We store and process reviews, videos, and reviewer details strictly on your behalf and in accordance with your instructions.

## 2. Reviewer Rights
Under the GDPR, individuals who submit testimonials to your spaces have the right to:
* Access their collected data.
* Correct incorrect information (e.g. updating reviewer name or avatar).
* Request complete erasure (the "Right to be Forgotten") from our database.

## 3. Erasure Procedure
If a reviewer requests testimonial deletion, you can delete their record in your **Proofly Inbox**. Deleting a testimonial permanently purges the text, rating, reviewer details, and Mux video file from our records and sub-processors.

## 4. Contact Us
For Data Processing Agreements (DPA) or GDPR queries, reach out to our team at \`gdpr@proofly.co\`.`
    },
    {
      slug: 'legal',
      title: 'Legal Overview',
      content: `# Proofly Legal Directory

Welcome to Proofly's central legal resource directory. We believe in absolute transparency, security, and giving you complete control over your customer review data.

Please select one of the core documents below to learn more about your rights, obligations, and data compliance when using Proofly widgets:

* **[Terms of Service](/terms)**: Understand usage rights, Billing Tiers (Free, Pro, Business limitations), and payment policies.
* **[Privacy Policy](/privacy)**: Learn what data we collect from you, how we handle reviewer data, and our third-party integrations (Mux, Stripe, Cloudinary).
* **[GDPR Compliance](/gdpr)**: View how we protect EU residents' rights, delete reviewer data, and act as a reliable Data Processor.

If you have any custom compliance requirements, feel free to contact us or interact with our Fin AI support bot.`
    }
  ];

  for (const page of legalPages) {
    await prisma.staticPage.create({
      data: page
    });
  }
  console.log(`📄 Seeded ${legalPages.length} legal static pages`);

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
