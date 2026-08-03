import { expect, test, type Page } from '@playwright/test';
import { PNG } from 'pngjs';

/**
 * Scrolling down through the reveal and back to the top used to leave the wall
 * painted in fragments — bone rectangles that have nothing to do with the
 * coastline, the room showing through the rest. GSAP's state was right the
 * whole time; it was the rasterisation of the scaled matte that came back
 * wrong, so the invariant worth holding is about the pixels: the frame at the
 * top of the page has to be the frame the visitor arrived on.
 *
 * Honest limitation: the original corruption needed real GPU compositing and
 * does NOT reproduce under Playwright's Chromium, headless or headed — this
 * test passed against the broken build too. It is here to hold the invariant,
 * not as proof of the fix.
 */
async function wheelBy(page: Page, delta: number, steps: number): Promise<void> {
  for (let i = 0; i < steps; i += 1) {
    await page.mouse.wheel(0, delta);
    await page.waitForTimeout(32);
  }
}

/** Viewport shot with the right edge dropped — headed Chrome draws a scrollbar there. */
async function heroFrame(page: Page): Promise<PNG> {
  const size = page.viewportSize()!;
  const buffer = await page.screenshot({
    type: 'png',
    clip: { x: 0, y: 0, width: size.width - 20, height: size.height },
  });
  return PNG.sync.read(buffer);
}

function differingFraction(a: PNG, b: PNG): number {
  let differing = 0;
  for (let i = 0; i < a.data.length; i += 4) {
    const dr = Math.abs(a.data[i] - b.data[i]);
    const dg = Math.abs(a.data[i + 1] - b.data[i + 1]);
    const db = Math.abs(a.data[i + 2] - b.data[i + 2]);
    if (dr > 12 || dg > 12 || db > 12) differing += 1;
  }
  return differing / (a.data.length / 4);
}

test.describe('hero after a round trip', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name === 'reduced-motion', 'there is no reveal to make a round trip through');
  });

  test('comes back to the top looking the way it arrived', async ({ page }) => {
    await page.goto('/');
    await page.waitForFunction(() => {
      const matte = document.querySelector('#matte');
      return !!matte && matte.getBoundingClientRect().width > 0;
    });
    await page.waitForTimeout(1200);
    const before = await heroFrame(page);

    // Through the reveal in small steps, so the matte is rasterised at every
    // intermediate scale rather than jumping straight to the end.
    await wheelBy(page, 120, 24);
    await page.waitForTimeout(600);
    await wheelBy(page, -120, 30);
    await page.waitForTimeout(1500);

    expect(await page.evaluate(() => Math.round(window.scrollY))).toBe(0);
    // The scrub is rewound: the island is back at its own size. If this holds
    // and the frame still differs, the difference is in the painting.
    expect(
      await page.evaluate(() => {
        const t = getComputedStyle(document.querySelector('#isle-hole')!).transform;
        return t === 'none' ? 1 : Number(t.slice(t.indexOf('(') + 1).split(',')[0]);
      }),
    ).toBeCloseTo(1, 2);

    const after = await heroFrame(page);
    expect(differingFraction(before, after)).toBeLessThan(0.01);
  });
});
