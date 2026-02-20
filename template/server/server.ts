import 'dotenv/config';
import express, { type Request, type Response, type NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import config from '../stoix.config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';

function getRouteFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getRouteFiles(fullPath));
      continue;
    }

    const isRouteModule = /\.(ts|js)$/.test(entry.name) && !entry.name.includes('.d.');
    if (isRouteModule) files.push(fullPath);
  }
  return files;
}

async function start() {
  const app = express();
  const port = Number(process.env.PORT) || config.port;

  app.use(helmet(isProduction ? undefined : { contentSecurityPolicy: false }));
  if (config.server.cors) app.use(cors({ origin: config.server.cors }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Auto-mount route files in server/routes recursively at /api/<path-to-file>.
  // Supports two patterns:
  //   1. export default router   -- mounts the Router directly
  //   2. export function GET / POST / PUT / PATCH / DELETE -- maps each method to the route
  // Optional: export const route = { auth, rateLimit, tags } metadata (available via res.locals.route)
  const routesDir = path.join(__dirname, 'routes');
  if (fs.existsSync(routesDir)) {
    for (const filePath of getRouteFiles(routesDir).sort()) {
      const relativeFilePath = path.relative(routesDir, filePath);
      const routeFromFile = relativeFilePath
        .replace(/\.(ts|js)$/, '')
        .split(path.sep)
        .join('/')
        .replace(/\/index$/, '');
      const routePath = routeFromFile ? `${config.server.apiPrefix}/${routeFromFile}` : config.server.apiPrefix;

      const mod = await import(pathToFileURL(filePath).href);
      const meta = mod.route;

      // Attach route metadata so downstream middleware can read res.locals.route
      if (meta) {
        app.use(routePath, (_req: Request, res: Response, next: NextFunction) => {
          res.locals.route = meta;
          next();
        });
      }

      if (mod.default) {
        app.use(routePath, mod.default);
      } else {
        // Build a router from named method exports
        const methodRouter = express.Router();
        const methods = ['get', 'post', 'put', 'patch', 'delete'] as const;
        for (const method of methods) {
          const handler = mod[method] || mod[method.toUpperCase()];
          if (typeof handler === 'function') {
            methodRouter[method]('/', handler);
          }
        }
        app.use(routePath, methodRouter);
      }
    }
  }

  app.use(config.server.apiPrefix, (_req: Request, res: Response) => {
    res.status(404).json({ error: 'Not Found' });
  });

  if (isProduction) {
    const dist = path.join(process.cwd(), 'dist', 'client');
    app.use(express.static(dist));
    app.get('*', (_req: Request, res: Response) => res.sendFile(path.join(dist, 'index.html')));
  } else {
    const { createServer } = await import('vite');
    app.use((await createServer({ server: { middlewareMode: true }, appType: 'spa' })).middlewares);
  }

  app.use((err: Error & { status?: number }, _req: Request, res: Response, _next: NextFunction) => {
    res.status(err.status || 500).json({ error: err.message });
  });

  const server = app.listen(port, () => console.log(`Stoix running on http://localhost:${port}`));

  const shutdown = () => server.close(() => process.exit(0));
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

start();
