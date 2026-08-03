import { z } from 'astro/zod';
import { describe, expect, it } from 'vitest';
import {
  danCardSchema,
  galleryTileSchema,
  localized,
  menuGroupSchema,
  personSchema,
  practicalSchema,
  reviewSchema,
  signatureSchema,
  storySchema,
} from '../../src/content/schemas';

// image() only exists inside Astro's content-config context; a plain string
// schema stands in, cast to the factory's parameter type.
const imageStub = (() => z.string()) as unknown as Parameters<typeof galleryTileSchema>[0];
const menuGroup = menuGroupSchema(imageStub);
const signature = signatureSchema(imageStub);
const danCard = danCardSchema(imageStub);

describe('localized fields', () => {
  it('requires both languages', () => {
    expect(() => localized.parse({ sr: 'Rakija', en: 'Rakija' })).not.toThrow();
    expect(() => localized.parse({ sr: 'Rakija' })).toThrow();
    expect(() => localized.parse({ sr: 'Rakija', en: '' })).toThrow();
  });
});

describe('menu groups', () => {
  const valid = {
    title: { sr: 'Viski', en: 'Whisky' },
    card: 'pice',
    measures: ['0.03'],
    order: 14,
    items: [
      { name: 'Macallan', prices: [1100], subgroup: 'Single malt' },
      { name: 'Jameson', prices: [320], subgroup: 'Irish' },
    ],
  };

  it('accepts a complete group', () => {
    expect(() => menuGroup.parse(valid)).not.toThrow();
  });
  it('rejects a card that is neither drink nor kitchen', () => {
    expect(() => menuGroup.parse({ ...valid, card: 'terasa' })).toThrow();
  });
  it('rejects a missing English title', () => {
    expect(() => menuGroup.parse({ ...valid, title: { sr: 'Viski' } })).toThrow();
  });
  it('rejects a negative price', () => {
    expect(() => menuGroup.parse({ ...valid, items: [{ name: 'x', prices: [-1] }] })).toThrow();
  });
  it('defaults measures and items to empty', () => {
    const parsed = menuGroup.parse({
      title: { sr: 'Kokteli', en: 'Cocktails' },
      card: 'pice',
      order: 24,
    });
    expect(parsed.measures).toEqual([]);
    expect(parsed.items).toEqual([]);
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

  // The source used to be free text and it was Serbian: "Google recenzija"
  // rendered verbatim under an English quote on /en. It is a platform now,
  // and the words come from the dictionary.
  it('takes the source as a platform, not a sentence', () => {
    expect(reviewSchema.parse(base).source).toBe('google');
    expect(() => reviewSchema.parse({ ...base, source: 'localGuide' })).not.toThrow();
    expect(() => reviewSchema.parse({ ...base, source: 'Google recenzija' })).toThrow();
  });

  // Local Guides show how many reviews they have written; nobody else does.
  it('carries the guide review count only as a number', () => {
    expect(reviewSchema.parse(base).guideReviews).toBeUndefined();
    expect(reviewSchema.parse({ ...base, guideReviews: 45 }).guideReviews).toBe(45);
    expect(() => reviewSchema.parse({ ...base, guideReviews: '45 recenzija' })).toThrow();
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
    expect(() => danCard.parse(base)).not.toThrow();
  });
  it('numbers cards 1 to 4 only', () => {
    expect(() => danCard.parse({ ...base, n: 5 })).toThrow();
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

describe('people', () => {
  // The real image() helper only exists in Astro's content-config context; a
  // plain string schema stands in, cast to the factory's parameter type.
  const schema = personSchema(
    (() => z.string()) as unknown as Parameters<typeof personSchema>[0],
  );
  const base = { name: 'Anđela', order: 1 };

  // This is the whole point of the collection's shape: the section has to be
  // finishable before anyone has been photographed.
  it('accepts a person with no photograph', () => {
    expect(() => schema.parse(base)).not.toThrow();
    expect(schema.parse(base).photo).toBeUndefined();
  });

  it('accepts a person with one', () => {
    expect(() => schema.parse({ ...base, photo: '../../assets/people/a.jpg' })).not.toThrow();
  });

  it('requires a name', () => {
    expect(() => schema.parse({ order: 1 })).toThrow();
    expect(() => schema.parse({ ...base, name: '' })).toThrow();
  });

  // Optional, and deliberately unset for now: which of the two known handles
  // belongs to which founder is inferred, and linking a personal account from
  // a business page needs the person's agreement.
  it('leaves the Instagram link optional but rejects a non-URL', () => {
    expect(() => schema.parse(base)).not.toThrow();
    expect(() => schema.parse({ ...base, instagram: 'callme_angelique' })).toThrow();
    expect(() =>
      schema.parse({ ...base, instagram: 'https://www.instagram.com/callme_angelique/' }),
    ).not.toThrow();
  });
});

describe('story signatures', () => {
  const base = {
    eyebrow: { sr: 'Ljudi', en: 'The people' },
    title: { sr: 'Naslov', en: 'Title' },
    body: [{ sr: 'Pasus.', en: 'Paragraph.' }],
  };

  // A signature is a name written by hand, so it is the same in both
  // languages. Siros has none, which is why it is optional rather than
  // required with an empty default.
  it('is optional and not localized', () => {
    expect(storySchema.parse(base).signature).toBeUndefined();
    expect(storySchema.parse({ ...base, signature: 'Anđela i Dimitrije' }).signature).toBe(
      'Anđela i Dimitrije',
    );
  });
});

describe('signature tasting notes', () => {
  const base = {
    name: 'Siros',
    tagline: { sr: 'Egejsko veče u čaši.', en: 'An Aegean evening in a glass.' },
    spec: { sr: 'Džin, morska trava, med, limun.', en: 'Gin, sea herbs, honey, lemon.' },
    price: 640,
    media: 'linear-gradient(150deg,#DCE3E8,#7FA0B0 46%,#2C3F4C 88%)',
    order: 1,
  };

  // Optional on purpose. The owners have not written the notes yet, and a
  // required field would mean inventing three tasting notes for a bar whose
  // drinks nobody on this side of the screen has tasted.
  it('accepts a drink with no note yet', () => {
    expect(() => signature.parse(base)).not.toThrow();
    expect(signature.parse(base).notes).toBeUndefined();
  });

  it('takes a note in both languages once it exists', () => {
    const notes = { sr: 'Slano, pa medeno.', en: 'Saline, then honeyed.' };
    expect(signature.parse({ ...base, notes }).notes).toEqual(notes);
  });

  it('will not take a note in only one', () => {
    expect(() => signature.parse({ ...base, notes: { sr: 'Samo srpski.' } })).toThrow();
  });
});

describe('practical questions', () => {
  const base = {
    question: { sr: 'Ima li hrane?', en: 'Is there food?' },
    answer: { sr: 'Doručak do 12.', en: 'Breakfast until 12.' },
    order: 1,
  };

  it('accepts a complete pair', () => {
    expect(() => practicalSchema.parse(base)).not.toThrow();
  });

  it('requires both languages on both sides', () => {
    expect(() => practicalSchema.parse({ ...base, question: { sr: 'Samo srpski?' } })).toThrow();
    expect(() => practicalSchema.parse({ ...base, answer: { en: 'English only.' } })).toThrow();
  });

  // Facts stay derived. This collection is Q&A only — an hours or address
  // answer typed in here would be the fourth copy of something config knows.
  it('has no place to put a fact', () => {
    const parsed = practicalSchema.parse(base);
    expect(Object.keys(parsed).sort()).toEqual(['answer', 'order', 'question']);
  });
});

/**
 * Keystatic does not omit fields the editor left alone: it writes `{}` for an
 * untouched localized object and an empty string for untouched text. Every
 * optional field in every schema has to survive that, or an owner filling in
 * one section breaks the build of the whole site.
 */
describe('what Keystatic writes for fields nobody filled in', () => {
  const drink = {
    name: 'Test',
    tagline: { sr: 'ovo je test', en: 'this is a test' },
    spec: { sr: 'test', en: 'test' },
    price: 700,
    order: 4,
  };

  it('accepts an untouched tasting note written as {}', () => {
    const parsed = signature.parse({ ...drink, notes: {} });
    expect(parsed.notes).toBeUndefined();
  });

  it('accepts an untouched origin note written as empty strings', () => {
    const parsed = signature.parse({ ...drink, origin: { sr: '', en: '' } });
    expect(parsed.origin).toBeUndefined();
  });

  // A drink with no image stand-in is fine; the row renders without one.
  it('accepts a drink with no image stand-in at all', () => {
    expect(() => signature.parse(drink)).not.toThrow();
    expect(signature.parse({ ...drink, media: '' }).media).toBeUndefined();
  });

  // Half-filled is NOT the same as untouched. Someone who wrote the Serbian
  // and forgot the English should be told, not silently have both dropped.
  it('still rejects a note filled in only one language', () => {
    expect(() => signature.parse({ ...drink, notes: { sr: 'Slano.', en: '' } })).toThrow();
  });

  it('accepts an untouched story signature', () => {
    const base = {
      eyebrow: { sr: 'a', en: 'a' },
      title: { sr: 'b', en: 'b' },
      body: [{ sr: 'c', en: 'c' }],
    };
    expect(storySchema.parse({ ...base, signature: '' }).signature).toBeUndefined();
  });

  it('accepts a person with untouched photo and instagram fields', () => {
    const schema = personSchema(
      (() => z.string()) as unknown as Parameters<typeof personSchema>[0],
    );
    const parsed = schema.parse({ name: 'Anđela', order: 1, photo: '', instagram: '' });
    expect(parsed.photo).toBeUndefined();
    expect(parsed.instagram).toBeUndefined();
  });
});
