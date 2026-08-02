import { z } from 'astro/zod';
import raw from '../content/hours.json';
import type { Hours } from './hours';

/**
 * Build-time validation for hours.json, kept in its own module on purpose.
 *
 * zod is ~60 KB. `hours.ts` is imported by the footer clock, which is a client
 * script, so anything `hours.ts` imports is shipped to every visitor — and a
 * schema validator has no business running in a browser to re-check a JSON file
 * that was already fixed at build time. Importing this file from Astro
 * frontmatter runs the check during the build and nowhere else.
 */
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;
/** 24:00 is a legal CLOSING time only — it is not a wall-clock reading. */
const CLOSE = /^(([01]\d|2[0-3]):[0-5]\d|24:00)$/;

const dayHours = z.object({
  open: z.string().regex(TIME),
  close: z.string().regex(CLOSE),
});

export const hoursSchema = z.object({
  placeholder: z.boolean().default(true),
  week: z.object({
    mon: dayHours,
    tue: dayHours,
    wed: dayHours,
    thu: dayHours,
    fri: dayHours,
    sat: dayHours,
    sun: dayHours,
  }),
});

/** Throws during the build if hours.json drifts out of shape. */
export function assertHours(): Hours {
  return hoursSchema.parse(raw);
}
