import raw from '../content/site.json';
import { localeTag, type Locale } from '../i18n';

export interface Site {
  streetAddress: string;
  addressLocality: string;
  postalCode: string;
  countryCode: string;
  phone: string;
  /** Still true: the number is a stand-in until the owners confirm one. */
  phonePlaceholder: boolean;
  mapsUrl: string;
  lat: number;
  lng: number;
  instagramUrl: string;
  instagramHandle: string;
  reviewCount: number;
  reviewScore: number;
}

/**
 * Every business fact in one place.
 *
 * Same two-module split as hours: this file is client-safe, and
 * `site.schema.ts` holds the zod validator so it never reaches a browser
 * bundle. Before this existed the address was hardcoded in Base.astro, the
 * phone sat translated in both dictionaries and rendered nowhere, and the
 * Instagram and Maps links in the footer were `href="#"`.
 */
export const site: Site = raw;

/** `tel:` needs the number without spaces; the display keeps them. */
export const telHref = `tel:${site.phone.replace(/\s+/g, '')}`;

/**
 * Locale-aware so the score is never hard-coded as a string. "5,0" in sr.ts
 * and "5.0" in en.ts is one fact typed into two files that nobody remembers
 * to update — the same failure mode as the old opening hours.
 */
export function formatScore(score: number, locale: Locale): string {
  return new Intl.NumberFormat(localeTag(locale), {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(score);
}
