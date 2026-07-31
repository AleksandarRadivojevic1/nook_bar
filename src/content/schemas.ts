import { z } from 'astro/zod';

/**
 * Translatable fields are objects rather than parallel per-locale folders.
 * Parallel folders drift the moment someone adds an item to one and not the
 * other; a required nested field fails the build instead.
 */
export const localized = z.object({
  sr: z.string().min(1),
  en: z.string().min(1),
});

export const menuItemSchema = z.object({
  name: z.string().min(1),
  price: z.number().int().nonnegative(),
  desc: localized,
  order: z.number().int(),
  /** CSS background shorthand for the cursor-trailing crop in the Karta section. */
  crop: z.string().optional(),
  placeholder: z.boolean().default(false),
});

export const reviewSchema = z.object({
  quote: localized,
  author: z.string().min(1),
  source: z.string().default('Google'),
  stars: z.number().int().min(1).max(5),
  order: z.number().int(),
  placeholder: z.boolean().default(false),
});

export const danCardSchema = z.object({
  n: z.number().int().min(1).max(4),
  title: localized,
  body: localized,
  when: localized,
  /**
   * Waypoint in the boundary SVG's own viewBox coordinates (0 0 1000 1435.4).
   * These are the route anchors. Do not eyeball them; the route is drawn
   * through these exact points. See src/assets/ASSETS.md.
   */
  anchor: z.tuple([z.number(), z.number()]),
  /**
   * CSS background standing in for the card's photograph. Replaced by a real
   * image path once the bar supplies photography.
   */
  media: z.string(),
  placeholder: z.boolean().default(false),
});

export type MenuItem = z.infer<typeof menuItemSchema>;
export type Review = z.infer<typeof reviewSchema>;
export type DanCard = z.infer<typeof danCardSchema>;
