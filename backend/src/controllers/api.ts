import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { IntegrationService } from '../services/IntegrationService';

const prisma = new PrismaClient();
const integrationService = new IntegrationService(prisma, null);

export const publicApiRouter = Router();

// Middleware to authorize public requests via API Key header
async function authorizeApiKey(req: Request, res: Response, next: NextFunction, requiredScope: string) {
  const authHeader = req.headers['authorization'];
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (req.query.key) {
    token = req.query.key as string;
  }

  if (!token) {
    res.status(401).json({ error: 'UNAUTHORIZED: Authorization Bearer token key required.' });
    return;
  }

  try {
    const spaceId = await integrationService.validateApiKey(token, requiredScope);
    (req as any).spaceId = spaceId;
    (req as any).plainKey = token;
    next();
  } catch (err: any) {
    res.status(403).json({ error: err.message || 'Forbidden' });
  }
}

// Global logger wrapper
async function logRequest(req: Request, _res: Response, statusCode: number, startTime: number) {
  const spaceId = (req as any).spaceId;
  const key = (req as any).plainKey;
  if (spaceId && key) {
    const duration = Date.now() - startTime;
    await integrationService.logApiRequest(spaceId, req.baseUrl + req.path, req.method, statusCode, duration, req.ip);
  }
}

// 1. GET /api/v1/testimonials
publicApiRouter.get('/testimonials', async (req: Request, res: Response, _next: NextFunction) => {
  await authorizeApiKey(req, res, async () => {
    const startTime = Date.now();
    const spaceId = (req as any).spaceId;
    
    try {
      const testimonials = await prisma.testimonial.findMany({
        where: { spaceId, isArchived: false },
        orderBy: { createdAt: 'desc' }
      });
      await logRequest(req, res, 200, startTime);
      res.json(testimonials);
    } catch (e: any) {
      await logRequest(req, res, 500, startTime);
      res.status(500).json({ error: e.message || 'Server error' });
    }
  }, 'READ_TESTIMONIALS');
});

// 2. POST /api/v1/testimonials
publicApiRouter.post('/testimonials', async (req: Request, res: Response, _next: NextFunction) => {
  await authorizeApiKey(req, res, async () => {
    const startTime = Date.now();
    const spaceId = (req as any).spaceId;
    const { name, email, rating, review, title, avatar } = req.body;

    if (!name || !email) {
      await logRequest(req, res, 400, startTime);
      res.status(400).json({ error: 'Bad Request: name and email are required.' });
      return;
    }

    try {
      const newReview = await prisma.testimonial.create({
        data: {
          spaceId,
          type: 'TEXT',
          reviewerName: name,
          reviewerEmail: email,
          rating: rating || 5,
          textContent: review || '',
          reviewerTitle: title || null,
          reviewerAvatar: avatar || null,
          isApproved: false
        }
      });

      // Trigger Webhooks
      await integrationService.triggerWebhook(spaceId, 'testimonial.created', newReview);
      await integrationService.syncIntegrationEvent(spaceId, 'created', newReview);

      await logRequest(req, res, 201, startTime);
      res.status(201).json(newReview);
    } catch (e: any) {
      await logRequest(req, res, 500, startTime);
      res.status(500).json({ error: e.message || 'Server error' });
    }
  }, 'WRITE_TESTIMONIALS');
});

// 3. GET /api/v1/widgets
publicApiRouter.get('/widgets', async (req: Request, res: Response, _next: NextFunction) => {
  await authorizeApiKey(req, res, async () => {
    const startTime = Date.now();
    const spaceId = (req as any).spaceId;

    try {
      const widgets = await prisma.widget.findMany({
        where: { spaceId }
      });
      await logRequest(req, res, 200, startTime);
      res.json(widgets);
    } catch (e: any) {
      await logRequest(req, res, 500, startTime);
      res.status(500).json({ error: e.message || 'Server error' });
    }
  }, 'READ_WIDGETS');
});

// 4. GET /api/v1/spaces
publicApiRouter.get('/spaces', async (req: Request, res: Response, _next: NextFunction) => {
  await authorizeApiKey(req, res, async () => {
    const startTime = Date.now();
    const spaceId = (req as any).spaceId;

    try {
      const space = await prisma.space.findUnique({
        where: { id: spaceId }
      });
      await logRequest(req, res, 200, startTime);
      res.json(space);
    } catch (e: any) {
      await logRequest(req, res, 500, startTime);
      res.status(500).json({ error: e.message || 'Server error' });
    }
  }, 'READ_SPACES');
});
