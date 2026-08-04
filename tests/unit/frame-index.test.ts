import { describe, expect, it } from 'vitest';
import { frameIndex } from '../../src/scripts/frame-index';

describe('frameIndex', () => {
  it('maps the endpoints to the first and last frame', () => {
    expect(frameIndex(0, 94)).toBe(0);
    expect(frameIndex(1, 94)).toBe(93);
  });

  it('clamps out-of-range progress', () => {
    expect(frameIndex(-0.5, 94)).toBe(0);
    expect(frameIndex(1.5, 94)).toBe(93);
  });

  it('is monotonic across the middle', () => {
    expect(frameIndex(0.25, 94)).toBeLessThan(frameIndex(0.75, 94));
    expect(frameIndex(0.5, 94)).toBe(Math.round(0.5 * 93));
  });

  it('is safe for degenerate counts', () => {
    expect(frameIndex(0.5, 1)).toBe(0);
    expect(frameIndex(0.5, 0)).toBe(0);
  });
});
