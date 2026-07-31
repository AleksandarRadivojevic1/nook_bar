import { describe, expect, it } from 'vitest';
import { danCardSchema, localized, menuItemSchema, reviewSchema } from '../../src/content/schemas';

describe('localized fields', () => {
  it('requires both languages', () => {
    expect(() => localized.parse({ sr: 'Rakija', en: 'Rakija' })).not.toThrow();
    expect(() => localized.parse({ sr: 'Rakija' })).toThrow();
    expect(() => localized.parse({ sr: 'Rakija', en: '' })).toThrow();
  });
});

describe('menu items', () => {
  const valid = {
    name: 'Negroni',
    price: 650,
    order: 1,
    desc: { sr: 'Džin, kampari, vermut.', en: 'Gin, Campari, vermouth.' },
    placeholder: true,
  };

  it('accepts a complete entry', () => {
    expect(() => menuItemSchema.parse(valid)).not.toThrow();
  });
  it('rejects a missing English description', () => {
    expect(() => menuItemSchema.parse({ ...valid, desc: { sr: 'Džin.' } })).toThrow();
  });
  it('rejects a negative price', () => {
    expect(() => menuItemSchema.parse({ ...valid, price: -1 })).toThrow();
  });
  it('defaults placeholder to false', () => {
    const { placeholder, ...rest } = valid;
    expect(menuItemSchema.parse(rest).placeholder).toBe(false);
  });
});

describe('reviews', () => {
  it('bounds the star rating to 1..5', () => {
    const base = {
      quote: { sr: 'Najbolji bar.', en: 'The best bar.' },
      author: 'M. P.',
      stars: 5,
      order: 1,
    };
    expect(() => reviewSchema.parse(base)).not.toThrow();
    expect(() => reviewSchema.parse({ ...base, stars: 6 })).toThrow();
    expect(() => reviewSchema.parse({ ...base, stars: 0 })).toThrow();
  });
});

describe('dan cards', () => {
  const base = {
    n: 1,
    title: { sr: 'Jutro', en: 'Morning' },
    body: { sr: 'Prva kafa.', en: 'First coffee.' },
    when: { sr: '08—11', en: '08—11' },
    anchor: [740, 225.5] as [number, number],
    media: 'linear-gradient(168deg,#D8C6A4,#3A2B18)',
  };

  it('accepts a card anchored on the route', () => {
    expect(() => danCardSchema.parse(base)).not.toThrow();
  });
  it('numbers cards 1 to 4 only', () => {
    expect(() => danCardSchema.parse({ ...base, n: 5 })).toThrow();
  });
  it('requires an [x, y] anchor pair', () => {
    expect(() => danCardSchema.parse({ ...base, anchor: [740] })).toThrow();
  });
});
