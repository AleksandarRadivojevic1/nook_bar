import { describe, expect, it } from 'vitest';
import { langMarker, orderReviews, type ReviewLike } from '../../src/lib/reviews';

const r = (order: number, featured = false, lang: ReviewLike['lang'] = 'en') => ({
  order,
  featured,
  lang,
});

describe('orderReviews', () => {
  it('sorts by order regardless of file name', () => {
    expect(orderReviews([r(3), r(1), r(2)]).map((x) => x.order)).toEqual([1, 2, 3]);
  });

  // Without this the section renders as a flat wall of small type, which is
  // the grid-of-cards look the whole rework exists to avoid.
  it('promotes the first quote when nobody marked one', () => {
    const out = orderReviews([r(2), r(1)]);
    expect(out[0].featured).toBe(true);
    expect(out[1].featured).toBe(false);
  });

  it('leaves an explicit selection alone', () => {
    const out = orderReviews([r(1), r(2, true), r(3, true)]);
    expect(out.map((x) => x.featured)).toEqual([false, true, true]);
  });

  it('handles an empty collection', () => {
    expect(orderReviews([])).toEqual([]);
  });

  it('does not mutate what it was given', () => {
    const input = [r(2), r(1)];
    orderReviews(input);
    expect(input.map((x) => x.order)).toEqual([2, 1]);
    expect(input.every((x) => x.featured === false)).toBe(true);
  });
});

describe('langMarker', () => {
  it('says nothing when the quote is in the language being read', () => {
    expect(langMarker('sr', 'sr')).toBeNull();
    expect(langMarker('en', 'en')).toBeNull();
  });

  // The point is not "this is English" — it is "this is not the language you
  // are reading, and we did not translate it".
  it('marks an English quote on the Serbian page', () => {
    expect(langMarker('en', 'sr')).toBe('EN');
  });

  it('marks a Serbian quote on the English page', () => {
    expect(langMarker('sr', 'en')).toBe('SR');
  });
});
