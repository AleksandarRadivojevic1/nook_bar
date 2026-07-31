import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

// Static everywhere. The adapter is here so a future route that genuinely
// needs per-request work can set `export const prerender = false` without
// restructuring the project. Nothing uses it today.
export default defineConfig({
  site: 'https://nookbar.rs',
  output: 'static',
  adapter: vercel(),
  i18n: {
    defaultLocale: 'sr',
    locales: ['sr', 'en'],
    routing: { prefixDefaultLocale: false },
  },
});
