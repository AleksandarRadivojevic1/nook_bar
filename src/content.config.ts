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
  loader: glob({ pattern: '**/*.json', base: './src/content/people' }),
  schema: ({ image }) => personSchema(image),
});

const practical = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/practical' }),
  schema: practicalSchema,
});

const instagram = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/instagram' }),
  schema: ({ image }) => instagramPostSchema(image),
});

export const collections = { menu, reviews, dan, signature, gallery, story, people, practical, instagram };
