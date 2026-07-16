import { join, sep, resolve } from 'node:path';

/**
 * Minimal Bun static file server for the Yatzy client.
 *
 * Serves the Vite build output (`client/dist`) and falls back to `index.html`
 * for unknown paths so the SPA / PWA routes resolve. Hashed assets are cached
 * aggressively; the HTML shell and service worker are served `no-cache` so new
 * deploys are picked up.
 */

const PORT = Number(process.env.PORT ?? 3000);

// Absolute path to the built client. Override with DIST_DIR if it lives
// elsewhere; defaults to ../client/dist relative to this file.
const DIST = process.env.DIST_DIR
  ? resolve(process.env.DIST_DIR)
  : new URL('../client/dist', import.meta.url).pathname.replace(/\/$/, '');

function cacheControl(pathname: string): string {
  // Content-hashed assets (…/assets/index-ABC123.js) never change.
  if (pathname.startsWith('/assets/')) {
    return 'public, max-age=31536000, immutable';
  }
  // Always revalidate the shell + PWA plumbing.
  if (
    pathname === '/index.html' ||
    pathname === '/sw.js' ||
    pathname === '/registerSW.js' ||
    pathname.endsWith('.webmanifest')
  ) {
    return 'no-cache';
  }
  return 'public, max-age=3600';
}

async function serveFile(filePath: string, cache: string): Promise<Response | null> {
  const file = Bun.file(filePath);
  if (!(await file.exists())) return null;
  return new Response(file, {
    headers: {
      'Content-Type': file.type || 'application/octet-stream',
      'Cache-Control': cache,
    },
  });
}

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    let pathname = decodeURIComponent(url.pathname);
    if (pathname === '/') pathname = '/index.html';

    // Resolve within DIST and reject any path-traversal attempts.
    const filePath = join(DIST, pathname);
    if (filePath !== DIST && !filePath.startsWith(DIST + sep)) {
      return new Response('Forbidden', { status: 403 });
    }

    const direct = await serveFile(filePath, cacheControl(pathname));
    if (direct) return direct;

    // SPA fallback → index.html
    const fallback = await serveFile(join(DIST, 'index.html'), 'no-cache');
    if (fallback) return fallback;

    return new Response(
      'Build not found. Run `npm run build` in ../client first.',
      { status: 404 },
    );
  },
});

console.log(`Yatzy server listening on http://localhost:${server.port}`);
console.log(`Serving static files from ${DIST}`);
