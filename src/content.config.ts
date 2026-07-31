import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { danCardSchema, menuItemSchema, reviewSchema } from './content/schemas';

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

export const collections = { menu, reviews, dan };
