import { PNG } from 'pngjs';
import type { Page } from '@playwright/test';

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

export async function cornerPixels(page: Page): Promise<Rgb[]> {
  const buffer = await page.screenshot({ type: 'png' });
  const png = PNG.sync.read(buffer);
  const inset = 4;
  const points: Array<[number, number]> = [
    [inset, inset],
    [png.width - 1 - inset, inset],
    [inset, png.height - 1 - inset],
    [png.width - 1 - inset, png.height - 1 - inset],
  ];
  return points.map(([x, y]) => {
    const i = (png.width * y + x) << 2;
    return { r: png.data[i], g: png.data[i + 1], b: png.data[i + 2] };
  });
}

const BONE_TOLERANCE = 14;

/**
 * --bone is #F2ECE1. Grain overlays it, so allow a tolerance.
 *
 * Deliberately single-argument: an optional `tolerance` parameter here is a
 * trap, because `corners.every(isBone)` passes the array index as the second
 * argument and silently tightens the tolerance to 0 for the first corner.
 * Use `withTolerance()` when a different threshold is genuinely needed.
 */
export function isBone(pixel: Rgb): boolean {
  return withTolerance(pixel, BONE_TOLERANCE);
}

export function withTolerance({ r, g, b }: Rgb, tolerance: number): boolean {
  return (
    Math.abs(r - 0xf2) <= tolerance &&
    Math.abs(g - 0xec) <= tolerance &&
    Math.abs(b - 0xe1) <= tolerance
  );
}
