import type { Request, Response } from 'express';

/** Optional route metadata -- available via res.locals.route in middleware. */
export const route = {
  tags: ['example'],
};

/**
 * GET /api/example
 *
 * Named exports (GET, POST, PUT, PATCH, DELETE) map to the route path.
 * For sub-paths, create additional files (e.g., routes/example/health.ts).
 * You can also export default a Router for full control.
 */
export function GET(_req: Request, res: Response) {
  res.json({
    message: 'Hello from Stoix!',
    framework: 'Stoix v0.1',
    timestamp: new Date().toISOString(),
  });
}
