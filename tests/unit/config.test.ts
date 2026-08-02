import { describe, expect, it } from 'vitest';
import config from '../../astro.config.mjs';

describe('astro config', () => {
  it('serves Serbian unprefixed and English at /en', () => {
    expect(config.i18n?.defaultLocale).toBe('sr');
    expect(config.i18n?.locales).toEqual(['sr', 'en']);
    expect(config.i18n?.routing).toMatchObject({ prefixDefaultLocale: false });
  });

  it('prerenders everything by default', () => {
    expect(config.output ?? 'static').toBe('static');
  });

  it('has a site set, which hreflang and JSON-LD need', () => {
    expect(config.site).toMatch(/^https:\/\//);
  });
});
