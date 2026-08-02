import type { Locale } from '../i18n';

/** Structural, so it can be unit-tested without Astro's content layer. */
export interface ReviewLike {
  order: number;
  featured: boolean;
  lang: Locale;
}

/** Sorted by order, promoting the first if nothing is marked featured. */
export function orderReviews<T extends ReviewLike>(items: readonly T[]): T[] {
  const sorted = [...items].sort((a, b) => a.order - b.order);
  if (sorted.length > 0 && !sorted.some((item) => item.featured)) {
    sorted[0] = { ...sorted[0], featured: true };
  }
  return sorted;
}

/** 'EN' or 'SR' beside a quote foreign to the current locale, else null. */
export function langMarker(lang: Locale, locale: Locale): string | null {
  return lang === locale ? null : lang.toUpperCase();
}
