import { sr, type Dictionary } from './sr';
import { en } from './en';

export const locales = ['sr', 'en'] as const;
export type Locale = (typeof locales)[number];
export type { Dictionary };

const dictionaries = { sr, en } satisfies Record<Locale, Dictionary>;

export function useTranslations(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

// Plain 'sr' resolves to Cyrillic in Intl. The brand is Latin.
const TAGS = { sr: 'sr-Latn-RS', en: 'en-GB' } as const;

export function localeTag(locale: Locale): (typeof TAGS)[Locale] {
  return TAGS[locale];
}

/** Fills {name} placeholders — used by the open/closed status strings. */
export function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? `{${key}}`);
}
