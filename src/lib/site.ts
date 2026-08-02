import raw from '../content/site.json';
import { localeTag, type Locale } from '../i18n';

export interface Site {
  streetAddress: string;
  addressLocality: string;
  postalCode: string;
  countryCode: string;
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
 * bundle. Before this existed the address was hardcoded in Base.astro and the
 * Instagram and Maps links in the footer were `href="#"`.
 *
 * There is deliberately no `phone`: the only number anyone had was a
 * placeholder that nothing rendered. It comes back when there is a real one,
 * along with the `tel:` link that needs it.
 */
export const site: Site = raw;

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

/**
 * The address as two display lines, derived rather than typed.
 *
 * This replaces `addressLines: 'Koste Stamenkovića 23|Leskovac 16000'` in both
 * dictionaries, which the template split on a pipe. The address is the same in
 * Serbian and English, so it was never translation — it was one fact stored
 * twice, in the format most likely to drift.
 */
export function addressLines(): [string, string] {
  return [site.streetAddress, `${site.postalCode} ${site.addressLocality}`];
}
