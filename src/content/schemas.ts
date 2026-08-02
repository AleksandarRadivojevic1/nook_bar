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

/**
 * An optional field, tolerant of what an editor writes for "I left this alone".
 *
 * Keystatic does not omit untouched fields. It writes `{}` for a localized
 * object nobody typed into and `''` for empty text, and `.optional()` accepts
 * neither — `{}` is not `undefined`, so zod parses it and fails on the missing
 * halves. The first time an owner added a drink without a tasting note, the
 * production build broke and they were given no reason why.
 *
 * Wholly empty means absent. PARTLY filled still fails: someone who wrote the
 * Serbian and forgot the English should be told, not have both silently
 * dropped.
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
  /** The photograph that trails the cursor. Uploaded by the owners. */
  photo: optional(image()),
  /** CSS gradient stand-in, used until a photo exists. Not owner-editable. */
  crop: optional(z.string().min(1)),
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
  /**
   * WHERE the review is from, not how to write it. This was free text and it
   * was Serbian — "Google recenzija" rendered verbatim under an English quote
   * on /en. The platform is the fact; the wording belongs in the dictionary.
   */
  source: z.enum(['google', 'localGuide']).default('google'),
  /** Local Guides show how many reviews they have written. Nobody else does. */
  guideReviews: optional(z.number().int().positive()),
  /**
   * Defaulted, and not shown in the editor: every review this bar has is five
   * stars, and a field Keystatic does not write is a field dropped from the
   * JSON on save. Anything hidden from the editor must have a default here or
   * the next edit breaks the build.
   */
  stars: z.number().int().min(1).max(5).default(5),
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

export const signatureSchema = (image: SchemaContext['image']) =>
  z.object({
  name: z.string().min(1),
  /** Short evocative line under the name. */
  tagline: localized,
  /** The build — spirits and botanicals, one line. */
  spec: localized,
  price: z.number().int().nonnegative(),
  /** Optional provenance note, e.g. the Syros drink names its island. */
  origin: optional(localized),
  /**
   * A tasting note, a sentence or two. Optional because the owners write
   * these and have not yet: the row renders without one rather than carrying
   * invented prose about a drink nobody here has tasted. This field is the
   * reason the section is a column of rows instead of three squares — a
   * square has nowhere to put it.
   */
  notes: optional(localized),
  photo: optional(image()),
  /** CSS gradient stand-in, used until a photo exists. Not owner-editable. */
  media: optional(z.string().min(1)),
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

export const danCardSchema = (image: SchemaContext['image']) =>
  z.object({
  n: z.number().int().min(1).max(4),
  title: localized,
  body: localized,
  when: localized,
  photo: optional(image()),
  /** CSS gradient stand-in, used until a photo exists. Not owner-editable. */
  media: optional(z.string().min(1)),
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
  signature: optional(z.string().min(1)),
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
    photo: optional(image()),
    instagram: optional(z.url()),
    order: z.number().int(),
  });

/**
 * The questions people actually ask, one line each. Q&A only: facts stay
 * derived from site.json and hours.json, because a hard-typed answer about
 * opening times would be a fourth copy of something config already knows.
 */
export const practicalSchema = z.object({
  question: localized,
  answer: localized,
  order: z.number().int(),
});

/**
 * A curated Instagram post. Content stays in-repo rather than coming from the
 * API: Instagram's Basic Display API was retired in 2024, and its replacement
 * needs a Business account plus a token refreshed every 60 days — which is a
 * section that silently goes blank two months after whoever set it up stops
 * thinking about it.
 *
 * No `order` field. The row is the most recent posts by `postedAt`, and a
 * hand-kept order beside a date is two sources of truth for one sequence.
 */
export const instagramPostSchema = (image: SchemaContext['image']) =>
  z.object({
    image: image(),
    /** Doubles as the image's alt text, which is why it is required in both. */
    caption: localized,
    permalink: z.url(),
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
