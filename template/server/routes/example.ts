import { Router, type Request, type Response } from 'express';

const router = Router();

/**
 * GET /api/example
 * A sample API route to demonstrate Stoix auto-loading.
 *
 * Add more routes in server/routes/ — each file auto-mounts
 * at /api/<filename>.
 */
router.get('/', (_req: Request, res: Response) => {
  res.json({
    message: 'Hello from Stoix!',
    framework: 'Stoix v0.1',
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/example/health
 * A simple health check endpoint.
 */
router.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

export default router;
