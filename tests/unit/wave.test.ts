import { describe, expect, it } from 'vitest';
import { advanceBulge, bulgeTarget } from '../../src/scripts/wave';

describe('bulgeTarget', () => {
  it('is flat at rest', () => {
    expect(bulgeTarget(0)).toBe(0);
  });
  it('ignores scroll direction', () => {
    expect(bulgeTarget(-40)).toBe(bulgeTarget(40));
  });
  it('grows with speed but never past the cap', () => {
    expect(bulgeTarget(20, 0.014)).toBeCloseTo(0.28, 5);
    expect(bulgeTarget(9999)).toBe(1);
    expect(bulgeTarget(9999, 0.014, 0.6)).toBe(0.6);
  });
});

describe('advanceBulge', () => {
  it('eases up toward a rising target without overshooting it', () => {
    const next = advanceBulge(0, 1);
    expect(next).toBeGreaterThan(0);
    expect(next).toBeLessThan(1);
  });
  it('relaxes to flat once scrolling stops', () => {
    let b = 1;
    for (let i = 0; i < 400; i++) b = advanceBulge(b, 0);
    expect(b).toBeCloseTo(0, 4);
  });
  it('decays faster than a plain lerp when falling', () => {
    const lerped = 1 + (0 - 1) * 0.09;
    expect(advanceBulge(1, 0)).toBeLessThan(lerped);
  });
  it('stays within 0..1 across a full ramp up and down', () => {
    let b = 0;
    for (let i = 0; i < 200; i++) {
      b = advanceBulge(b, i < 100 ? 1 : 0);
      expect(b).toBeGreaterThanOrEqual(0);
      expect(b).toBeLessThanOrEqual(1);
    }
  });
});
