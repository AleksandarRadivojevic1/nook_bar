import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';

const dir = 'src/content/menu';
const groups = readdirSync(dir)
  .filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(readFileSync(`${dir}/${f}`, 'utf8')));

describe('the menu is the real card', () => {
  it('has 25 groups and 131 items', () => {
    expect(groups).toHaveLength(25);
    expect(groups.reduce((n, g) => n + g.items.length, 0)).toBe(131);
  });

  it('gives every group a unique order and both locales', () => {
    const orders = groups.map((g) => g.order);
    expect(new Set(orders).size).toBe(orders.length);
    for (const g of groups) {
      expect(g.title.sr.length).toBeGreaterThan(0);
      expect(g.title.en.length).toBeGreaterThan(0);
      expect(['pice', 'kuhinja']).toContain(g.card);
    }
  });

  it('prices every item against its group measures', () => {
    for (const g of groups) {
      for (const item of g.items) {
        const expected = g.measures.length > 1 ? g.measures.length : 1;
        expect(item.prices.length, `${g.title.sr} / ${item.name}`).toBe(expected);
        // 0 means "not sold at this size" — only the two-measure wine group.
        for (const p of item.prices) expect(p).toBeGreaterThanOrEqual(0);
        expect(item.prices.some((p) => p > 0), item.name).toBe(true);
      }
    }
  });

  it('allows exactly one empty group, and only with a note', () => {
    const empty = groups.filter((g) => g.items.length === 0);
    expect(empty).toHaveLength(1);
    expect(empty[0].note.sr.length).toBeGreaterThan(0);
  });

  it('ships nothing marked placeholder', () => {
    for (const g of groups) expect(g.placeholder).toBeUndefined();
  });
});
