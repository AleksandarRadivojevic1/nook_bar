import type { SchemaContext } from 'astro:content';
import { z } from 'astro/zod';

export const localized = z.object({
  sr: z.string().min(1),
  en: z.string().min(1),
});

/**
 * Keystatic writes `{}` for an untouched localized field and `''` for empty
 * text, neither of which `.optional()` accepts. Wholly empty means absent;
 * partly filled still fails.
 */
export const optional = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((value) => {
    if (value === '' || value === null) return undefined;
    if (typeof value === 'object' && !Array.isArray(value)) {
      const parts = Object.values(value as Record<string, unknown>);
      if (parts.every((part) => part === '' || part === undefined || part === null)) {
        return undefined;
      }
    }
    return value;
  }, schema.optional());

export const menuItemSchema = (image: SchemaContext['image']) =>
  z.object({
    name: z.string().min(1),
    price: z.number().int().nonnegative(),
    desc: localized,
    order: z.number().int(),
    photo: optional(image()),
    /** CSS gradient stand-in until a photo exists. Hidden from Keystatic. */
    crop: optional(z.string().min(1)),
    placeholder: z.boolean().default(false),
  });

export const reviewSchema = z.object({
  /** Verbatim, and never translated. See the EN marker in Recenzije.astro. */
  quote: z.string().min(1),
  /** First name and last initial only. */
  author: z.string().min(1),
  source: z.enum(['google', 'localGuide']).default('google'),
  guideReviews: optional(z.number().int().positive()),
  /** Hidden from Keystatic, so it needs a default or the next edit drops it. */
  stars: z.number().int().min(1).max(5).default(5),
  /** What it was written in, not what it is read in. Drives the EN marker. */
  lang: z.enum(['sr', 'en']),
  featured: z.boolean().default(false),
  order: z.number().int(),
  placeholder: z.boolean().default(false),
});

export const signatureSchema = (image: SchemaContext['image']) =>
  z.object({
    name: z.string().min(1),
    tagline: localized,
    spec: localized,
    price: z.number().int().nonnegative(),
    origin: optional(localized),
    notes: optional(localized),
    photo: optional(image()),
    /** CSS gradient stand-in until a photo exists. Hidden from Keystatic. */
    media: optional(z.string().min(1)),
    order: z.number().int(),
    placeholder: z.boolean().default(false),
  });

export const galleryTileSchema = (image: SchemaContext['image']) =>
  z.object({
    src: image(),
    /** Doubles as the alt text. */
    caption: localized,
    order: z.number().int(),
  });

export const danCardSchema = (image: SchemaContext['image']) =>
  z.object({
    n: z.number().int().min(1).max(4),
    title: localized,
    body: localized,
    when: localized,
    photo: optional(image()),
    /** CSS gradient stand-in until a photo exists. Hidden from Keystatic. */
    media: optional(z.string().min(1)),
    placeholder: z.boolean().default(false),
  });

/** Siros and Ljudi. Looked up by id, so there is no order field. */
export const storySchema = z.object({
  eyebrow: localized,
  title: localized,
  /** One entry per paragraph. */
  body: z.array(localized).min(1),
  /** A handwritten name, the same in both languages. */
  signature: optional(z.string().min(1)),
});

/** Photo and instagram are optional so Ljudi ships before the photography. */
export const personSchema = (image: SchemaContext['image']) =>
  z.object({
    name: z.string().min(1),
    photo: optional(image()),
    instagram: optional(z.url()),
    order: z.number().int(),
  });

/** Q&A only. Hours and address stay derived from config. */
export const practicalSchema = z.object({
  question: localized,
  answer: localized,
  order: z.number().int(),
});

/** Curated, not fetched: the Instagram API needs a token refreshed every 60 days. */
export const instagramPostSchema = (image: SchemaContext['image']) =>
  z.object({
    image: image(),
    /** Doubles as the alt text. */
    caption: localized,
    permalink: z.url(),
    /** Sorted by this. There is no order field. */
    postedAt: z.coerce.date(),
  });

export type MenuItem = z.infer<ReturnType<typeof menuItemSchema>>;
export type InstagramPost = z.infer<ReturnType<typeof instagramPostSchema>>;
export type Practical = z.infer<typeof practicalSchema>;
export type Story = z.infer<typeof storySchema>;
export type Person = z.infer<ReturnType<typeof personSchema>>;
export type Review = z.infer<typeof reviewSchema>;
export type DanCard = z.infer<ReturnType<typeof danCardSchema>>;
export type Signature = z.infer<ReturnType<typeof signatureSchema>>;
export type GalleryTile = z.infer<ReturnType<typeof galleryTileSchema>>;
