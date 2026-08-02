import { describe, expect, it } from 'vitest';
import { sr } from '../../src/i18n/sr';
import { en } from '../../src/i18n/en';
import { isLocale, localeTag, locales, pluralNoun, useTranslations } from '../../src/i18n';

function paths(obj: unknown, prefix = ''): string[] {
  if (typeof obj !== 'object' || obj === null) return [prefix];
  return Object.entries(obj).flatMap(([k, v]) => paths(v, prefix ? `${prefix}.${k}` : k));
}

describe('dictionaries', () => {
  it('define exactly the same keys in both locales', () => {
    expect(paths(en).sort()).toEqual(paths(sr).sort());
  });

  it('has no empty strings', () => {
    for (const dict of [sr, en]) {
      const empties = paths(dict).filter((p) => {
        const value = p.split('.').reduce<any>((o, k) => o[k], dict);
        return typeof value === 'string' && value.trim() === '';
      });
      expect(empties).toEqual([]);
    }
  });

  it('resolves a dictionary per locale', () => {
    expect(useTranslations('sr')).toBe(sr);
    expect(useTranslations('en')).toBe(en);
    expect(locales).toEqual(['sr', 'en']);
  });

  it('uses Latin Serbian, not Cyrillic', () => {
    expect(localeTag('sr')).toBe('sr-Latn-RS');
    expect(localeTag('en')).toBe('en-GB');
  });

  it('narrows unknown locale strings', () => {
    expect(isLocale('sr')).toBe(true);
    expect(isLocale('de')).toBe(false);
  });
});

describe('pluralNoun', () => {
  const sr_forms = { one: 'recenzija', few: 'recenzije', other: 'recenzija' };
  const en_forms = { one: 'review', few: 'reviews', other: 'reviews' };

  // Serbian agreement is not "1 vs many". 22 takes a different form from 25,
  // and both differ from 1 — so a template that hardcodes one noun is wrong
  // the moment the review count moves off its current value.
  it('follows Serbian numeral agreement', () => {
    expect(pluralNoun(1, 'sr', sr_forms)).toBe('recenzija');
    expect(pluralNoun(2, 'sr', sr_forms)).toBe('recenzije');
    expect(pluralNoun(4, 'sr', sr_forms)).toBe('recenzije');
    expect(pluralNoun(5, 'sr', sr_forms)).toBe('recenzija');
    expect(pluralNoun(20, 'sr', sr_forms)).toBe('recenzija');
    expect(pluralNoun(21, 'sr', sr_forms)).toBe('recenzija');
    expect(pluralNoun(22, 'sr', sr_forms)).toBe('recenzije');
    expect(pluralNoun(25, 'sr', sr_forms)).toBe('recenzija');
  });

  it('follows English, which only has two forms', () => {
    expect(pluralNoun(1, 'en', en_forms)).toBe('review');
    expect(pluralNoun(2, 'en', en_forms)).toBe('reviews');
    expect(pluralNoun(20, 'en', en_forms)).toBe('reviews');
    expect(pluralNoun(21, 'en', en_forms)).toBe('reviews');
  });

  // Latin script matters here too: bare 'sr' resolves to Cyrillic in Intl.
  it('uses the Latin Serbian tag', () => {
    expect(pluralNoun(3, 'sr', sr_forms)).toBe('recenzije');
  });
});
