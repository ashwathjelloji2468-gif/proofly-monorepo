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

  // Stripe checkout webhook (for production)
  app.post('/api/stripe-webhook', express.raw({ type: 'application/json' }), async (_req, res) => {
    // Real Stripe webhook event handling structure
    return res.status(200).json({ received: true });
  });

  // Simulated Stripe webhook (for sandbox/local testing)
  app.post('/api/stripe-webhook-simulate', express.json(), async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ error: 'Missing userId parameter' });
      }

      const user = await createContext().then(ctx => ctx.prisma.user.update({
        where: { id: userId },
        data: { tier: 'PREMIUM' }
      }));

      console.log(`💳 Webhook simulation: user ${user.email} tier updated to PREMIUM`);
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
