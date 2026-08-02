import type { Locale } from '../i18n';

/**
 * The parts of a review this module reasons about. Kept structural rather than
 * importing the collection type so it can be unit-tested without Astro's
 * content layer, and so a fixture is three fields rather than nine.
 */
export interface ReviewLike {
  order: number;
  featured: boolean;
  lang: Locale;
}

/**
 * Reviews in reading order, guaranteeing at least one pull-quote.
 *
 * The layout sets `featured` quotes large and the rest small. With nothing
 * marked, every quote would render small and the section would read as the
 * flat grid of testimonials this rework exists to get rid of, so the first
 * one is promoted. Explicit choices are never overridden.
 */
export function orderReviews<T extends ReviewLike>(items: readonly T[]): T[] {
  const sorted = [...items].sort((a, b) => a.order - b.order);
  if (sorted.length > 0 && !sorted.some((item) => item.featured)) {
    sorted[0] = { ...sorted[0], featured: true };
  }
  return sorted;
}

/**
 * The marker shown beside a quote written in a language other than the one
 * being read, or null when there is nothing to say.
 *
 * Quotes are never translated: they are verbatim public reviews, and putting
 * a translation in a real person's mouth would not be honest. The marker is
 * the six-word version of that explanation.
 */
export function langMarker(lang: Locale, locale: Locale): string | null {
  return lang === locale ? null : lang.toUpperCase();
}
