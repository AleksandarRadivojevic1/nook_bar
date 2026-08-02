import { describe, expect, it } from 'vitest';
import { INSTAGRAM_TILES, recentPosts } from '../../src/lib/instagram';

const at = (iso: string) => ({ postedAt: new Date(iso) });

describe('recentPosts', () => {
  it('puts the newest first', () => {
    const out = recentPosts([at('2026-01-01'), at('2026-06-01'), at('2026-03-01')]);
    expect(out.map((p) => p.postedAt.getUTCMonth())).toEqual([5, 2, 0]);
  });

  // The row must not grow into a second gallery as the owners keep adding.
  it('shows no more than a row', () => {
    const many = Array.from({ length: 20 }, (_, i) =>
      at(`2026-01-${String(i + 1).padStart(2, '0')}`),
    );
    expect(recentPosts(many)).toHaveLength(INSTAGRAM_TILES);
  });

  it('takes the newest of many, not the first four it was given', () => {
    const many = [
      at('2020-01-01'),
      at('2026-05-05'),
      at('2021-01-01'),
      at('2026-06-06'),
      at('2019-01-01'),
    ];
    const out = recentPosts(many, 2);
    expect(out.map((p) => p.postedAt.getUTCFullYear())).toEqual([2026, 2026]);
  });

  // Below four the row narrows rather than leaving gaps.
  it('returns what it has when there are fewer than a row', () => {
    expect(recentPosts([at('2026-01-01'), at('2026-02-01')])).toHaveLength(2);
  });

  it('handles an empty collection', () => {
    expect(recentPosts([])).toEqual([]);
  });

  it('does not mutate what it was given', () => {
    const input = [at('2026-01-01'), at('2026-06-01')];
    recentPosts(input);
    expect(input[0].postedAt.getUTCMonth()).toBe(0);
  });
});
