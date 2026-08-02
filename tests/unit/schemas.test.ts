import { z } from 'astro/zod';
import { describe, expect, it } from 'vitest';
import {
  danCardSchema,
  galleryTileSchema,
  localized,
  menuItemSchema,
  reviewSchema,
  storySchema,
} from '../../src/content/schemas';

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
  const base = {
    quote: 'The best bar in town.',
    author: 'M. P.',
    stars: 5,
    order: 1,
    lang: 'en',
  };

  it('bounds the star rating to 1..5', () => {
    expect(() => reviewSchema.parse(base)).not.toThrow();
    expect(() => reviewSchema.parse({ ...base, stars: 6 })).toThrow();
    expect(() => reviewSchema.parse({ ...base, stars: 0 })).toThrow();
  });

  // The language is a fact about the quote, not a preference, so there is no
  // default to fall back to: an untagged quote cannot be marked correctly.
  it('requires the language the quote was written in', () => {
    const { lang, ...untagged } = base;
    expect(() => reviewSchema.parse(untagged)).toThrow();
  });

  it('accepts only the two languages the site speaks', () => {
    expect(() => reviewSchema.parse({ ...base, lang: 'sr' })).not.toThrow();
    expect(() => reviewSchema.parse({ ...base, lang: 'de' })).toThrow();
  });

  it('is not featured unless it says so', () => {
    expect(reviewSchema.parse(base).featured).toBe(false);
    expect(reviewSchema.parse({ ...base, featured: true }).featured).toBe(true);
  });
});

describe('gallery tiles', () => {
  // image() is only available inside Astro's content-config context; a plain
  // string stands in for it in the unit test.
  // The real image() helper only exists in Astro's content-config context; a
  // plain string schema stands in, cast to the factory's parameter type.
  const schema = galleryTileSchema(
    (() => z.string()) as unknown as Parameters<typeof galleryTileSchema>[0],
  );
  const base = {
    src: '../../assets/gallery/sank.jpg',
    caption: { sr: 'Šank', en: 'The bar' },
    order: 1,
  };
  it('accepts a complete tile', () => {
    expect(() => schema.parse(base)).not.toThrow();
  });
  it('requires both caption languages', () => {
    expect(() => schema.parse({ ...base, caption: { sr: 'Šank' } })).toThrow();
  });
  it('requires an integer order', () => {
    expect(() => schema.parse({ ...base, order: 1.5 })).toThrow();
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

describe('story entries', () => {
  const base = {
    eyebrow: { sr: 'Poreklo', en: 'Origin' },
    title: { sr: 'Zašto grčko ostrvo', en: 'Why a Greek island' },
    body: [{ sr: 'Prvi pasus.', en: 'First paragraph.' }],
  };

  it('accepts a complete entry', () => {
    expect(() => storySchema.parse(base)).not.toThrow();
  });

  // Paragraphs are an array rather than one string split on a delimiter. The
  // addressLines.split('|') hack in the old Kontakt is the pattern being
  // avoided: a delimiter is a schema nobody validates.
  it('keeps paragraphs as separate entries', () => {
    const parsed = storySchema.parse({
      ...base,
      body: [
        { sr: 'Prvi.', en: 'First.' },
        { sr: 'Drugi.', en: 'Second.' },
      ],
    });
    expect(parsed.body).toHaveLength(2);
  });

  it('requires both languages in every paragraph', () => {
    expect(() =>
      storySchema.parse({ ...base, body: [{ sr: 'Samo srpski.' }] }),
    ).toThrow();
  });

  // A section with no words is not a section. There is no empty state here:
  // Page.astro simply does not render it.
  it('rejects an entry with no paragraphs', () => {
    expect(() => storySchema.parse({ ...base, body: [] })).toThrow();
  });

  // There is no meaningful order between Siros and Ljudi, so there is no
  // order field to get wrong. Entries are looked up by id.
  it('has no order field to sort by', () => {
    expect('order' in storySchema.parse(base)).toBe(false);
  });
});
