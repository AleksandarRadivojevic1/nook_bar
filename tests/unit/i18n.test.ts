import { describe, expect, it } from 'vitest';
import { sr } from '../../src/i18n/sr';
import { en } from '../../src/i18n/en';
import { isLocale, localeTag, locales, useTranslations } from '../../src/i18n';

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
