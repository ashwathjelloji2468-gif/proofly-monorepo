import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';

import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import Stripe from 'stripe';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';
import { createContext } from './context';

async function startServer() {
  const app = express();
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
      origin: '*',
    }),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const authHeader = req.headers.authorization;
        return createContext(authHeader);
      },
    }),
  );

  // Health check route
  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date() });
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
      const priceId = planName === 'Business' ? process.env.STRIPE_BUSINESS_PRICE_ID : process.env.STRIPE_PRO_PRICE_ID;

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
          tier: planName === 'Business' ? 'BUSINESS' : 'PRO'
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
          const ctx = await createContext();
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
      const user = await createContext().then(ctx => ctx.prisma.user.update({
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

  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 4000;
  await new Promise<void>((resolve) => httpServer.listen({ port: PORT }, resolve));
  console.log(`🚀 Testimonials Backend Server ready at http://localhost:${PORT}/graphql`);
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
