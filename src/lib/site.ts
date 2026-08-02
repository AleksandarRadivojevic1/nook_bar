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
 * Client-safe; the zod validator is in site.schema.ts, out of the bundle.
 * No `phone` until there is a real one to render.
 */
export const site: Site = raw;

/** Locale-aware, so the score is never typed into a dictionary. */
export function formatScore(score: number, locale: Locale): string {
  return new Intl.NumberFormat(localeTag(locale), {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(score);
}

/** Street, then postcode and town. The address is not translated. */
export function addressLines(): [string, string] {
  return [site.streetAddress, `${site.postalCode} ${site.addressLocality}`];
}
