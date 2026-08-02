import { describe, expect, it } from 'vitest';
import { addressLines, formatScore, site } from '../../src/lib/site';
import { assertSite, siteSchema } from '../../src/lib/site.schema';

describe('the site singleton', () => {
  it('validates against the schema', () => {
    expect(() => siteSchema.parse(site)).not.toThrow();
  });
  it('is exactly what the build-time check returns', () => {
    expect(site).toEqual(assertSite());
  });
  it('carries the real coordinates of the bar', () => {
    expect(site.lat).toBeCloseTo(42.9930343, 6);
    expect(site.lng).toBeCloseTo(21.9483644, 6);
  });
  it('has a real maps URL, not a placeholder anchor', () => {
    expect(site.mapsUrl).toMatch(/^https:\/\//);
    expect(site.mapsUrl).not.toBe('#');
  });
  it('points at the real Instagram profile', () => {
    expect(site.instagramUrl).toContain('instagram.com/nookbar__');
    expect(site.instagramHandle).toBe('@nookbar__');
  });
  it('rejects a non-URL maps link', () => {
    expect(() => siteSchema.parse({ ...site, mapsUrl: '#' })).toThrow();
  });
  it('rejects a handle without the @', () => {
    expect(() => siteSchema.parse({ ...site, instagramHandle: 'nookbar__' })).toThrow();
  });
  it('rejects an out-of-range score', () => {
    expect(() => siteSchema.parse({ ...site, reviewScore: 6 })).toThrow();
  });
  it('rejects a two-letter country code that is not two letters', () => {
    expect(() => siteSchema.parse({ ...site, countryCode: 'SRB' })).toThrow();
  });
});

describe('the phone', () => {
  // Removed rather than shipped as a stand-in: the only number available was
  // +381 00 000 0000 and nothing rendered it. It returns with a real one.
  it('is absent, not faked', () => {
    expect(site).not.toHaveProperty('phone');
  });
});

describe('formatScore', () => {
  // The score must never be typed into sr.ts and en.ts as a string — that is
  // how "08 — 24" ended up wrong in two files at once.
  it('uses a comma in Serbian', () => {
    expect(formatScore(5, 'sr')).toBe('5,0');
  });
  it('uses a point in English', () => {
    expect(formatScore(5, 'en')).toBe('5.0');
  });
  it('always shows one decimal', () => {
    expect(formatScore(4.5, 'en')).toBe('4.5');
  });
});

describe('addressLines', () => {
  // The old version of this lived in sr.ts and en.ts as the string
  // "Koste Stamenkovića 23|Leskovac 16000", split on a pipe in the template.
  // A delimiter inside a translated string is a schema nobody validates, and
  // the address was duplicated in three places besides.
  it('puts the street on the first line and the town on the second', () => {
    expect(addressLines()).toEqual(['Koste Stamenkovića 23', '16000 Leskovac']);
  });

  it('is built from the config, not from a dictionary', () => {
    const [street, town] = addressLines();
    expect(street).toBe(site.streetAddress);
    expect(town).toContain(site.postalCode);
    expect(town).toContain(site.addressLocality);
  });
});
