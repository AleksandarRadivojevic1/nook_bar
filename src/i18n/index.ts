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

/** The three forms Serbian needs. English fills `few` with its plural. */
export interface PluralForms {
  one: string;
  few: string;
  other: string;
}

/**
 * The right form of a counted noun.
 *
 * Serbian agreement is not "one versus many": 1 and 21 take one form, 2 to 4
 * and 22 to 24 take another, and 5 to 20 take a third. So a template with the
 * noun baked in — "{count} recenzija" — is correct at 20 and wrong at 22,
 * which is the same class of bug as the hours that were hard-typed and wrong
 * on all seven days. Intl knows the rules; the dictionary supplies the words.
 */
export function pluralNoun(count: number, locale: Locale, forms: PluralForms): string {
  const rule = new Intl.PluralRules(localeTag(locale)).select(count);
  return forms[rule as keyof PluralForms] ?? forms.other;
}
