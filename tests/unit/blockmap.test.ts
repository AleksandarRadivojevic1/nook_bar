import { describe, expect, it } from 'vitest';
import meta from '../../src/assets/block.meta.json';
import { blockMap } from '../../src/lib/blockmap';
import { site } from '../../src/lib/site';

describe('the drawn block', () => {
  it('has a viewBox matching its declared size', () => {
    expect(blockMap.viewBox).toBe(`0 0 ${blockMap.width} ${blockMap.height}`);
  });

  it('draws streets and buildings', () => {
    expect(blockMap.streets.length).toBeGreaterThan(10);
    expect(blockMap.buildings.length).toBeGreaterThan(10);
  });

  // The bar is the reason the map exists; it has to be inside the frame.
  it('puts the bar inside the frame', () => {
    expect(blockMap.bar.x).toBeGreaterThan(0);
    expect(blockMap.bar.x).toBeLessThan(blockMap.width);
    expect(blockMap.bar.y).toBeGreaterThan(0);
    expect(blockMap.bar.y).toBeLessThan(blockMap.height);
  });

  it('centres the projection on the coordinates in site.json', () => {
    expect(meta.centre.lat).toBeCloseTo(site.lat, 6);
    expect(meta.centre.lng).toBeCloseTo(site.lng, 6);
  });

  it('every path is a real path, not an empty string', () => {
    for (const street of blockMap.streets) expect(street.d).toMatch(/^M[\d.\-\s L]+$/);
    for (const d of blockMap.buildings) expect(d).toMatch(/^M[\d.\-\s L]+Z$/);
  });

  // Streets are drawn thickest first so the through-roads sit under the
  // service lanes rather than being interrupted by them.
  it('ranks every street from 1 to 3', () => {
    for (const street of blockMap.streets) {
      expect(street.rank).toBeGreaterThanOrEqual(1);
      expect(street.rank).toBeLessThanOrEqual(3);
    }
  });

  // The brand is Latin. OSM names these streets in Cyrillic.
  it('carries no Cyrillic in any rendered label', () => {
    for (const street of blockMap.streets) {
      if (street.name) expect(street.name).not.toMatch(/[Ѐ-ӿ]/);
    }
  });

  it('names the street the bar is on', () => {
    const names = blockMap.streets.map((s) => s.name).filter(Boolean);
    expect(names.some((n) => n!.includes('Koste Stamenkovi'))).toBe(true);
  });

  it('records reproducible provenance', () => {
    expect(meta.source).toContain('Overpass');
    expect(meta.radius.streets).toBeGreaterThan(0);
    expect(meta.generator).toBe('scripts/generate-block-map.py');
  });
});
