import { z } from 'astro/zod';
import raw from '../content/site.json';
import type { Site } from './site';

/**
 * Build-time validation for site.json. Kept out of `site.ts` for the same
 * reason as hours: `site.ts` is client-safe and zod is ~60 KB.
 */
export const siteSchema = z.object({
  streetAddress: z.string().min(1),
  addressLocality: z.string().min(1),
  postalCode: z.string().min(1),
  countryCode: z.string().length(2),
  phone: z.string().min(1),
  phonePlaceholder: z.boolean().default(true),
  mapsUrl: z.url(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  instagramUrl: z.url(),
  instagramHandle: z.string().min(1).startsWith('@'),
  reviewCount: z.number().int().nonnegative(),
  reviewScore: z.number().min(0).max(5),
});

/** Throws during the build if site.json drifts out of shape. */
export function assertSite(): Site {
  return siteSchema.parse(raw);
}
