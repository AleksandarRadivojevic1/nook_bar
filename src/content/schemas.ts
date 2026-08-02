import type { SchemaContext } from 'astro:content';
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
  /**
   * NOT localized, deliberately. These are verbatim public Google reviews.
   * Translating a real person's words and presenting them as that person's
   * quote would not be honest, so each quote stays in the language it was
   * written in and is shown as-is in both locales.
   */
  quote: z.string().min(1),
  /** First name + last initial only — full names of real customers do not
   * belong on a page they never agreed to appear on. */
  author: z.string().min(1),
  source: z.string().default('Google'),
  stars: z.number().int().min(1).max(5),
  /**
   * The language the review was written in, which is not necessarily the
   * language it is being read in. Drives the small marker on quotes that are
   * foreign to the current locale. No default: an untagged quote would be
   * silently mislabelled, and there is no honest guess to make.
   */
  lang: z.enum(['sr', 'en']),
  /**
   * Set large as a pull-quote. Two or three out of roughly ten is the intended
   * editorial shape; the layout survives any number, including none.
   */
  featured: z.boolean().default(false),
  order: z.number().int(),
  placeholder: z.boolean().default(false),
});

export const signatureSchema = z.object({
  name: z.string().min(1),
  /** Short evocative line under the name. */
  tagline: localized,
  /** The build — spirits and botanicals, one line. */
  spec: localized,
  price: z.number().int().nonnegative(),
  /** Optional provenance note, e.g. the Syros drink names its island. */
  origin: localized.optional(),
  /**
   * A tasting note, a sentence or two. Optional because the owners write
   * these and have not yet: the row renders without one rather than carrying
   * invented prose about a drink nobody here has tasted. This field is the
   * reason the section is a column of rows instead of three squares — a
   * square has nowhere to put it.
   */
  notes: localized.optional(),
  /** CSS background standing in for the drink's photograph. */
  media: z.string(),
  order: z.number().int(),
  placeholder: z.boolean().default(false),
});

/**
 * Gallery tiles are image-backed. `image` is injected by the content config
 * (Astro's `image()` helper) so paths resolve and emit width/height; a plain
 * string stands in for it in unit tests. The caption doubles as the image alt,
 * so one localized string per photo covers both the hover label and assistive
 * text.
 */
export const galleryTileSchema = (image: SchemaContext['image']) =>
  z.object({
    src: image(),
    caption: localized,
    order: z.number().int(),
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

/**
 * Long-form prose for a section that is mostly words: Siros now, Ljudi next.
 *
 * Entries are looked up by id (`siros`, `ljudi`) rather than sorted, because
 * there is no meaningful order between two unrelated sections — so there is
 * no `order` field to keep in sync. A section whose entry is missing does not
 * render at all.
 */
export const storySchema = z.object({
  eyebrow: localized,
  title: localized,
  /** One entry per paragraph. A delimiter inside a single string is a schema
   * nobody validates; an array is one zod already checks. */
  body: z.array(localized).min(1),
  /**
   * A name written by hand, set in Caveat. Not localized: a signature is the
   * same in both languages. Optional because Siros has nobody to sign it.
   */
  signature: z.string().min(1).optional(),
});

/**
 * The founders. `photo` and `instagram` are BOTH optional, which is what lets
 * the Ljudi section ship as a finished thing before either of them has been
 * photographed: with no entries at all it is a signed statement, and portraits
 * are additive rather than a hole in the page.
 *
 * `image()` comes from the content config the same way the gallery's does, so
 * paths resolve and width/height are emitted.
 */
export const personSchema = (image: SchemaContext['image']) =>
  z.object({
    name: z.string().min(1),
    photo: image().optional(),
    instagram: z.url().optional(),
    order: z.number().int(),
  });

export type MenuItem = z.infer<typeof menuItemSchema>;
export type Story = z.infer<typeof storySchema>;
export type Person = z.infer<ReturnType<typeof personSchema>>;
export type Review = z.infer<typeof reviewSchema>;
export type DanCard = z.infer<typeof danCardSchema>;
export type Signature = z.infer<typeof signatureSchema>;
export type GalleryTile = z.infer<ReturnType<typeof galleryTileSchema>>;
