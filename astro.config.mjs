import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import keystatic from '@keystatic/astro';

// Static everywhere except the Keystatic admin. The adapter has been in this
// config since the beginning with a note saying nothing used it yet; the
// admin route is what it was for. Every one of the eleven sections is still
// prerendered, and React is bundled for /keystatic and nothing else, so a
// visitor downloads exactly what they downloaded before.
export default defineConfig({
  site: 'https://nookbar.rs',
  output: 'static',
  adapter: vercel(),
  integrations: [react(), keystatic()],
  i18n: {
    defaultLocale: 'sr',
    locales: ['sr', 'en'],
    routing: { prefixDefaultLocale: false },
  },
});
