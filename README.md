# Stoix

Stoix is a TypeScript-first framework starter that scaffolds a Node + Express + React app with Vite.

## Quick Start

```bash
npx stoix create my-app
cd my-app
npm run dev
```

App URL: `http://localhost:3000`

## CLI

### Create a project

```bash
npx stoix create <project-name>
```

### Help and version

```bash
npx stoix --help
npx stoix --version
```

Project names must start with a letter and may contain letters, numbers, `.`, `_`, and `-`.

## What Stoix Generates

- Express server with auto-loaded API route modules
- React 18 client with Vite HMR in development
- Shared TypeScript setup across server, client, and config
- Production build pipeline for client and server output

## Generated Project Structure

```text
my-app/
├── package.json                  # Dependencies and scripts
├── stoix.config.ts               # Stoix framework configuration
├── tsconfig.json                 # TypeScript config (shared)
├── tsconfig.server.json          # TypeScript config (server)
├── vite.config.ts                # Vite build configuration
├── vite-env.d.ts                 # Vite environment types
├── index.html                    # HTML entry point
├── .env.example                  # Example environment variables
├── server/                       # Express server
│   ├── server.ts                 # Server entry point
│   └── routes/                   # Auto-loaded API routes
│       └── example.ts            # Example API route
├── src/                          # React client source
│   ├── App.tsx                   # Root React component
│   ├── main.tsx                  # Client entry point
│   ├── styles.css                # Global styles
│   └── pages/                    # SSR pages (if enabled)
│       └── index.tsx             # Home page
└── public/                       # Static assets
    └── favicon.svg               # Favicon
```

## Generated Scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Runs the Express server with Vite middleware in development (`tsx server/server.ts`). |
| `npm run build` | Runs TS checks, builds client assets with Vite, then compiles server output. |
| `npm start` | Starts the production server from compiled files. |
| `npm run typecheck` | Runs TypeScript checks without emit. |

## Configuration

Edit `stoix.config.ts`:

```ts
export interface StoixConfig {
  port: number;
  framework: 'react';
  server: {
    apiPrefix: string;
    cors: string | string[] | false;
  };
}
```

Default values:

- `port`: `3000`
- `server.apiPrefix`: `"/api"`
- `server.cors`: `false`

## API Routes

Any file in `server/routes/` that default-exports an Express router is auto-mounted at:

`<apiPrefix>/<path-to-file>`

Examples:

- `server/routes/users.ts` -> `/api/users`
- `server/routes/auth/me.ts` -> `/api/auth/me`
- `server/routes/user/profile.ts` -> `/api/user/profile`
- `server/routes/try/get.ts` -> `/api/try/get`
- `server/routes/auth/index.ts` -> `/api/auth`

## Environment Variables

`template/.env.example` includes:

```env
PORT=3000
NODE_ENV=development
```

Copy `.env.example` to `.env` if you want to override defaults locally.
`PORT` overrides the port in `stoix.config.ts`.

## Development and Production Flow

- Development: Express runs first, then mounts Vite as middleware for client HMR.
- Production: Express serves static files from `dist/client` and handles SPA fallback to `index.html`.

## Framework Development (this repo)

From this repository:

```bash
npm run build
```

`prepack` runs:

```bash
npm run clean && npm run build
```

This removes template build artifacts (`template/node_modules`, `template/dist`, `template/.vite`) before packaging.

## Current Limitations

- Route modules are expected to `export default` an Express router.

## License

MIT

