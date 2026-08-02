/**
 * Serves the prerendered site out of dist/client.
 *
 * `astro preview` stopped working the moment the Vercel adapter had a real
 * server route to build (the Keystatic admin) — the adapter does not
 * implement preview, and it fails rather than serving anything. The whole
 * Playwright suite runs against a preview server, so it went with it.
 *
 * This serves exactly the bytes Vercel serves for the public site: the
 * prerendered HTML and the hashed assets. It deliberately does NOT run the
 * server route. The e2e suite tests the eleven sections a visitor sees, and
 * the one route it cannot serve is the admin, which no test touches.
 *
 * node:http and node:fs only — this exists precisely so that fixing the
 * preview did not add a sixth dependency.
 */
import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';

const ROOT = new URL('../dist/client/', import.meta.url).pathname;
const PORT = Number(process.env.PORT ?? 4321);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.txt': 'text/plain; charset=utf-8',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8',
};

/** Resolve a URL path to a file, trying the directory index as Astro does. */
function resolve(pathname) {
  // normalize() collapses any ".." before it can escape the root.
  const clean = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, '');
  const candidates = [
    join(ROOT, clean),
    join(ROOT, clean, 'index.html'),
    join(ROOT, `${clean}.html`),
  ];
  return candidates.find((file) => existsSync(file) && statSync(file).isFile());
}

createServer((request, response) => {
  const { pathname } = new URL(request.url, `http://localhost:${PORT}`);
  const file = resolve(pathname);

  if (!file) {
    response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    response.end('Not found');
    return;
  }

  response.writeHead(200, {
    'content-type': TYPES[extname(file)] ?? 'application/octet-stream',
  });
  createReadStream(file).pipe(response);
}).listen(PORT, () => {
  console.log(`Serving dist/client on http://localhost:${PORT}`);
});
