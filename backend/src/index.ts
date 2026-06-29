import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

import fs from 'fs';
import path from 'path';

import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import compression from 'compression';
import Stripe from 'stripe';

import { typeDefs } from './schema';
import { resolvers } from './resolvers';
import { createContext } from './context';
import { authMiddleware } from './middleware/auth';
import { rateLimiter } from './security/rateLimiter';
import oauthRouter from './controllers/oauthController';

async function startServer() {
  const app = express();
  
  // Configure security headers, trust proxy, signed cookieParser, and compression
  app.set('trust proxy', 1);
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(compression());
  // Use COOKIE_SECRET so oauth_state cookies are signed and tamper-proof
  app.use(cookieParser(process.env.COOKIE_SECRET || 'fallback-dev-secret'));
  app.use(express.json());

  // ─── OAuth REST Routes (before Apollo, before auth middleware) ────────────────
  const oauthCors = cors<cors.CorsRequest>({
    origin: [
      'http://localhost:3000',
      'https://useproofly.vercel.app',
    ],
    credentials: true,
  });
  app.use('/auth', oauthCors, rateLimiter(30, 10 * 60 * 1000), oauthRouter);

  // Global authentication & token rotation middleware
  app.use(authMiddleware);

  const httpServer = http.createServer(app);

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });

  await server.start();

  app.use(
    '/graphql',
    cors<cors.CorsRequest>({
      origin: ['http://localhost:3000', 'https://useproofly.vercel.app'],
      credentials: true,
    }),
    rateLimiter(300, 15 * 60 * 1000), // Protect entire GraphQL endpoint from brute force
    expressMiddleware(server, {
      context: async ({ req, res }) => {
        return createContext({ req: req as any, res });
      },
    }),
  );

  // Health check route
  app.get('/health', async (_req, res) => {
    try {
      const userCount = await prisma.user.count();
      const sessionCount = await prisma.session.count();
      const oauthCount = await prisma.oAuthAccount.count();
      const refreshCount = await prisma.refreshToken.count();
      const auditCount = await prisma.auditLog.count();
      const loginCount = await prisma.loginHistory.count();
      res.status(200).json({
        status: 'ok',
        version: 'refactored-auth-v5',
        nodeEnv: process.env.NODE_ENV,
        database: 'connected',
        tables: {
          user: userCount >= 0 ? 'exists' : 'missing',
          session: sessionCount >= 0 ? 'exists' : 'missing',
          oAuthAccount: oauthCount >= 0 ? 'exists' : 'missing',
          refreshToken: refreshCount >= 0 ? 'exists' : 'missing',
          auditLog: auditCount >= 0 ? 'exists' : 'missing',
          loginHistory: loginCount >= 0 ? 'exists' : 'missing'
        },
        timestamp: new Date()
      });
    } catch (dbError: any) {
      res.status(500).json({
        status: 'error',
        version: 'refactored-auth-v5',
        database: 'error',
        message: dbError.message || 'Unknown database error',
        timestamp: new Date()
      });
    }
  });

  // Serve uploaded files statically
  app.use('/uploads', express.static(path.join(process.cwd(), 'public/uploads')));

  // Raw binary video upload endpoint
  app.post('/api/upload', express.raw({ type: 'video/*', limit: '50mb' }), async (req, res) => {
    try {
      const buffer = req.body;
      if (!buffer || buffer.length === 0) {
        return res.status(400).json({ error: 'No video data received' });
      }

      const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

      if (cloudName && uploadPreset) {
        // Cloudinary native upload via fetch REST API
        const formData = new FormData();
        const fileBlob = new Blob([buffer], { type: 'video/webm' });
        formData.append('file', fileBlob, 'video.webm');
        formData.append('upload_preset', uploadPreset);

        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(`Cloudinary upload failed: ${text}`);
        }

        const result = (await response.json()) as any;
        return res.status(200).json({ url: result.secure_url });
      } else {
        // Local fallback storage
        const uploadDir = path.join(process.cwd(), 'public/uploads');
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filename = `video-${Date.now()}.webm`;
        const filepath = path.join(uploadDir, filename);
        fs.writeFileSync(filepath, buffer);

        const protocol = req.secure ? 'https' : 'http';
        const localUrl = `${protocol}://${req.headers.host}/uploads/${filename}`;
        return res.status(200).json({ url: localUrl });
      }
    } catch (err: any) {
      console.error('Upload handler error:', err);
      return res.status(500).json({ error: err.message || 'Upload failed' });
    }
  });

  const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

  // Stripe Checkout Session generation endpoint
  app.post('/api/stripe-checkout', express.json(), async (req, res) => {
    try {
      const { userId, planName } = req.body;
      if (!userId) {
        return res.status(400).json({ error: 'Missing userId parameter' });
      }

      if (!stripe) {
        return res.status(500).json({ error: 'Stripe Secret Key is not configured on this server.' });
      }

      const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
      const lowerPlan = planName?.toLowerCase() || '';
      let priceId = '';
      let resolvedTier = 'PRO';

      if (lowerPlan.includes('enterprise')) {
        priceId = process.env.STRIPE_ENTERPRISE_PRICE_ID || '';
        resolvedTier = 'ENTERPRISE';
      } else if (lowerPlan.includes('business')) {
        priceId = process.env.STRIPE_BUSINESS_PRICE_ID || '';
        resolvedTier = 'BUSINESS';
      } else {
        priceId = process.env.STRIPE_PRO_PRICE_ID || '';
        resolvedTier = 'PRO';
      }

      if (!priceId) {
        return res.status(400).json({ error: `Price ID for plan '${planName}' is not configured.` });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${clientUrl}/dashboard?checkout=success`,
        cancel_url: `${clientUrl}/dashboard/settings?checkout=cancelled`,
        client_reference_id: userId,
        metadata: {
          tier: resolvedTier
        }
      });

      return res.status(200).json({ url: session.url });
    } catch (err: any) {
      console.error('Stripe checkout error:', err);
      return res.status(500).json({ error: err.message || 'Failed to create checkout session' });
    }
  });

  // Stripe checkout webhook (for production)
  app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !webhookSecret || !stripe) {
      console.warn('Webhook received but signature, secret, or Stripe instance was not configured.');
      return res.status(400).json({ error: 'Signature verification failed or Stripe not configured.' });
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id;
      const tier = session.metadata?.tier || 'PRO';

      if (userId) {
        try {
          const ctx = await createContext({ req: req as any, res });
          const user = await ctx.prisma.user.update({
            where: { id: userId },
            data: { tier: tier as any }
          });
          console.log(`💳 Real Webhook: User ${user.email} successfully upgraded to ${tier} tier.`);
        } catch (dbErr) {
          console.error('Failed to update user tier in database:', dbErr);
          return res.status(500).send('Database update failed');
        }
      }
    }

    return res.status(200).json({ received: true });
  });

  // Simulated Stripe webhook (for sandbox/local testing)
  app.post('/api/stripe-webhook-simulate', express.json(), async (req, res) => {
    try {
      const { userId, tier } = req.body;
      if (!userId) {
        return res.status(400).json({ error: 'Missing userId parameter' });
      }

      const assignedTier = tier || 'PRO';
      const user = await createContext({ req: req as any, res }).then(ctx => ctx.prisma.user.update({
        where: { id: userId },
        data: { tier: assignedTier as any }
      }));

      console.log(`💳 Webhook simulation: user ${user.email} tier updated to ${user.tier}`);
      return res.status(200).json({ success: true, tier: user.tier });
    } catch (err: any) {
      console.error('Webhook simulation error:', err);
      return res.status(500).json({ error: err.message || 'Simulation failed' });
    }
  });

  // Chatbot conversation agent endpoint
  app.post('/api/chat', express.json(), async (req, res) => {
    try {
      const { message } = req.body;
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Missing message parameter' });
      }

      const query = message.toLowerCase().trim();
      let reply = '';

      // 1. Try Gemini API if key is available
      const geminiApiKey = process.env.GEMINI_API_KEY;
      if (geminiApiKey) {
        try {
          const systemPrompt = `You are Fin, the friendly AI Customer Support Agent for Proofly (formerly PowerTestimonials). Proofly is a SaaS that collects text and video testimonials from customers and embeds them as widgets (Wall of Love, Carousel) on websites.
Tiers: Free ($0, 1 space, 10 text reviews), Pro ($49/mo, 5 active spaces, custom style, video capture), Business ($99/mo, unlimited spaces, custom domains, sentiment trends), Enterprise ($249/mo, vector search + SSO).
Always stay in character. Keep answers helpful, conversational, and concise (maximum 3 sentences).`;
          
          const apiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [{ text: `${systemPrompt}\n\nUser Message: ${message}` }]
                }
              ]
            })
          });

          if (apiResponse.ok) {
            const result = await apiResponse.json() as any;
            reply = result.candidates?.[0]?.content?.parts?.[0]?.text;
          }
        } catch (err) {
          console.warn('Gemini API call failed, falling back to local dialog agent:', err);
        }
      }

      // 2. Local Dialog Agent (Fallback / Offline mode)
      if (!reply) {
        if (query.match(/^(hi|hello|hey|hlo|hola|howdy|yo|greetings|sup|good morning|good afternoon)/)) {
          reply = "Hey there! 👋 I'm Fin, your Proofly assistant. How can I help you grow your business with social proof today?";
        } else if (query.includes('how are you') || query.includes('how\'s it going') || query.includes('how do you do')) {
          reply = "I'm doing great, thank you! 🚀 Ready to help you gather some awesome customer testimonials. What's on your mind?";
        } else if (query.includes('who are you') || query.includes('your name') || query.includes('what is fin')) {
          reply = "I'm Fin, the friendly AI support agent for Proofly! I can guide you on how to collect video testimonials, embed widgets, set up custom domains, or manage your billing plans.";
        } else if (query.includes('who created you') || query.includes('who made you') || query.includes('creator') || query.includes('developer')) {
          reply = "I was created by the engineering team at Proofly to make customer feedback collection seamless and beautiful for everyone!";
        } else if (query.includes('collect') || query.includes('request') || query.includes('gather') || query.includes('link')) {
          reply = "To collect testimonials:\n\n1. Head to your dashboard collections (`/dashboard/collections`).\n2. Click **Create Collection Space**.\n3. Input your branding preferences, reward coupons, and questions.\n4. Share the slug URL (e.g., `proofly.com/collect/your-slug`) with users. They can record high-fidelity video feedback or write text reviews instantly inside their browsers without installing anything!";
        } else if (query.includes('embed') || query.includes('widget') || query.includes('wall') || query.includes('carousel') || query.includes('code') || query.includes('iframe')) {
          reply = "Proofly offers responsive script embeds:\n\n• **Wall of Love**: A masonry grid display featuring highlights.\n• **Carousel**: Interactive horizontal sliders.\n• **Playground**: Tweak spacing, tilt intensity, and copy custom code at `/demo`.\n\nTo install, copy the `<iframe src=\"...\" />` code block from the dashboard and paste it inside Webflow, Framer, React, or standard HTML containers.";
        } else if (query.includes('pricing') || query.includes('cost') || query.includes('plan') || query.includes('free') || query.includes('upgrade') || query.includes('pro') || query.includes('business')) {
          reply = "We offer four billing tiers:\n\n• **Free ($0)**: 1 collection space, 10 text reviews, and standard masonry layouts.\n• **Pro ($49/mo)**: 5 active spaces, webcam video reviews capture, and customized styling accents.\n• **Business ($99/mo)**: Unlimited video reviews, AI keyword trends, and custom domains settings.\n• **Enterprise ($249/mo)**: Semantic vector searches and priority help.\n\nYou can trigger upgrades via the billing setting triggers (`/dashboard/settings`).";
        } else if (query.includes('video') || query.includes('webcam') || query.includes('camera') || query.includes('record')) {
          reply = "Our webcam recording is fully built on HTML5 video streaming:\n\n• Users record directly inside the public collectors screen.\n• Once uploaded, our server transcribes the speech, tags highlights, and analyzes client sentiment.\n• Admins can review details in the dashboard inbox and click **Approve** to showcase it instantly!";
        } else if (query.includes('ai') || query.includes('insights') || query.includes('sentiment') || query.includes('keyword') || query.includes('transcript')) {
          reply = "Proofly has integrated NLP pipelines:\n\n• **Auto-Transcripts**: Closed captioning and text extraction for all webcam videos.\n• **Sentiment Detection**: Classifies reviews as POSITIVE, NEUTRAL, or NEGATIVE.\n• **Keyword Mapping**: Extracts key search tags.\n• **Highlights Summaries**: Creates a bold summary snippet (`bestQuoteHighlight`) featured at the top of cards.";
        } else if (query.includes('search') || query.includes('vector') || query.includes('semantic')) {
          reply = "Our dashboard features an AI Semantic Vector Search bar. Users can search their testimonials library using natural sentences (e.g. 'Show reviews from founders who liked onboarding'). The system maps semantic meanings rather than literal matches to return relevant records instantly.";
        } else if (query.includes('api') || query.includes('rest') || query.includes('integration') || query.includes('developer')) {
          reply = "Yes! Proofly is developer-friendly. We expose full JSON API endpoints for fetching approved testimonials dynamically, allowing you to build custom client grids. Refer to developer sandbox settings at `/demo` for embed configurations.";
        } else if (query.includes('import') || query.includes('google') || query.includes('linkedin') || query.includes('twitter') || query.includes('reddit')) {
          reply = "To import reviews from external platforms:\n\n1. Navigate to the **Imports** dashboard (`/dashboard/imports`).\n2. Select your platform (Google Reviews, Twitter/X, LinkedIn, Reddit, or G2).\n3. Input reviews slugs or authorize syncing.\n4. Proofly imports the reviews into your inbox, preserving avatars, authors, and ratings.";
        } else if (query.includes('human') || query.includes('support') || query.includes('agent') || query.includes('talk') || query.includes('help')) {
          reply = "Got it. I can loop in a human representative. Please fill in your contact information below, and our support lead will email you within 15 minutes:";
        } else if (query.match(/^(thanks|thank you|awesome|cool|great|nice|perfect|ok|okay)/)) {
          reply = "You're very welcome! Let me know if there's anything else I can assist you with. Happy collecting! 🚀";
        } else {
          reply = `I've analyzed our documentation database regarding your question ("${message}").\n\nProofly supports fully responsive widget customizers, smart NLP sentiment analysis, and social platform integrations.\n\nIf you have a specific question about setup or features, feel free to ask about 'webcam recording', 'getting widget embeds', 'billing plans', or type 'human' to submit a support email!`;
        }
      }

      return res.status(200).json({ reply });
    } catch (err: any) {
      console.error('Chatbot error:', err);
      return res.status(500).json({ error: err.message || 'Failed to process chat message' });
    }
  });

  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
  await new Promise<void>((resolve) => httpServer.listen({ port: PORT }, resolve));
  console.log(`🚀 Testimonials Backend Server ready at http://localhost:${PORT}/graphql`);
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
