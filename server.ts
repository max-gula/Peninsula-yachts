import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { registerApi } from './server/api.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  const app = express();

  // Register all shared API routes and middleware
  registerApi(app);

  // Vite middleware in dev or static serving in production
  if (isProd) {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] Peninsula Yachts server running on port ${PORT}`);
    if (process.env.GOOGLE_APPS_SCRIPT_URL) {
      console.log('[Server] Google Sheets integration URL configured.');
    } else {
      console.log('[Server] GOOGLE_APPS_SCRIPT_URL not set yet; leads are safely queued locally.');
    }
  });
}

startServer().catch((err) => {
  console.error('[Server startup error]:', err);
  process.exit(1);
});
