import { PNG } from 'pngjs';
import { expect, test } from '@playwright/test';

/** White hero copy running off the island onto the bone wall is invisible. */
const VIEWPORTS = [
  { width: 1920, height: 1080 },
  { width: 1536, height: 720 },
  { width: 1440, height: 900 },
  { width: 1440, height: 700 },
  { width: 1280, height: 620 },
];

/** The island is a warm near-black; the wall is #F2ECE1. */
const DARK = 120;

for (const viewport of VIEWPORTS) {
  test(`hero copy stays on the island at ${viewport.width}x${viewport.height}`, async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'the matte is sized by width below 760px');
    await page.setViewportSize(viewport);
    await page.goto('/');
    await page.waitForTimeout(1200);

    // Per-line boxes of the glyphs, not of the element — the element box is
    // wider than the centred text inside it.
    const lines = await page.locator('#hb1 .display').evaluate((el) => {
      const range = document.createRange();
      range.selectNodeContents(el);
      return [...range.getClientRects()]
        .filter((r) => r.width > 1)
        .map((r) => ({ left: r.x, right: r.right, mid: r.y + r.height / 2 }));
    });
    expect(lines.length, 'no headline lines measured').toBeGreaterThan(0);

    const png = PNG.sync.read(await page.screenshot({ type: 'png' }));
    const overhangs: string[] = [];

    for (const line of lines) {
      const row = Math.round(line.mid);
      let first = -1;
      let last = -1;
      for (let x = 0; x < png.width; x++) {
        if (png.data[(png.width * row + x) << 2] < DARK) {
          if (first === -1) first = x;
          last = x;
        }
      }
      if (first === -1) {
        overhangs.push(`no island at y=${row}`);
        continue;
      }
      if (line.left < first) overhangs.push(`y=${row} left by ${Math.round(first - line.left)}px`);
      if (line.right > last) overhangs.push(`y=${row} right by ${Math.round(line.right - last)}px`);
    }

    expect(overhangs, `copy overhangs the island: ${overhangs.join('; ')}`).toEqual([]);
  });
}
