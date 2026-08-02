import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import {
  danCardSchema,
  galleryTileSchema,
  instagramPostSchema,
  menuItemSchema,
  personSchema,
  practicalSchema,
  reviewSchema,
  signatureSchema,
  storySchema,
} from './content/schemas';

/**
 * `glob()` without the "No files found" warning.
 *
 * Three collections ship registered and deliberately empty — `people`,
 * `practical` and `instagram` — because their content is the owners' to
 * supply and inventing it would put claims about a real business on its own
 * site. The loader's warning is correct in general and wrong here, and three
 * lines of WARN on every single build is how warnings that DO matter stop
 * being read.
 *
 * Only that one message is dropped; anything else the loader says still comes
 * through.
 */
function optionalGlob(options: Parameters<typeof glob>[0]) {
  const loader = glob(options);
  return {
    ...loader,
    load: (context: Parameters<typeof loader.load>[0]) => {
      // Object.create, not a spread: the logger is a class instance, and
      // spreading it drops fork/info/error/debug off the prototype.
      const logger = Object.create(context.logger) as typeof context.logger;
      logger.warn = (message: string) => {
        if (!message.startsWith('No files found matching')) context.logger.warn(message);
      };
      return loader.load({ ...context, logger });
    },
  };
}

const menu = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/menu' }),
  schema: menuItemSchema,
});

const reviews = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/reviews' }),
  schema: reviewSchema,
});

const dan = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/dan' }),
  schema: danCardSchema,
});

const signature = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/signature' }),
  schema: signatureSchema,
});

const gallery = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/gallery' }),
  schema: ({ image }) => galleryTileSchema(image),
});

const story = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/story' }),
  schema: storySchema,
});

const people = defineCollection({
  loader: optionalGlob({ pattern: '**/*.json', base: './src/content/people' }),
  schema: ({ image }) => personSchema(image),
});

const practical = defineCollection({
  loader: optionalGlob({ pattern: '**/*.json', base: './src/content/practical' }),
  schema: practicalSchema,
});

const instagram = defineCollection({
  loader: optionalGlob({ pattern: '**/*.json', base: './src/content/instagram' }),
  schema: ({ image }) => instagramPostSchema(image),
});

export const collections = { menu, reviews, dan, signature, gallery, story, people, practical, instagram };
