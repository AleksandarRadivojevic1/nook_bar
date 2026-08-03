import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { cornerPixels, isBone } from './helpers/pixels';

/**
 * The wall is a 29KB coastline mask — screenshotting before it has painted
 * samples the warm room underneath and reads as a failed reveal. Wait for the
 * matte to have real geometry rather than for an arbitrary number of ms.
 */
async function heroReady(page: Page): Promise<void> {
  await page.waitForLoadState('load');
  await page.waitForFunction(() => {
    const matte = document.querySelector('#matte');
    return !!matte && matte.getBoundingClientRect().width > 0;
  });
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
}

function skipAtRest(testInfo: TestInfo): void {
  test.skip(testInfo.project.name === 'reduced-motion', 'the reveal never runs when motion is reduced');
}

test.describe('hero reveal', () => {
  test('starts as a bone wall with the island cut out of it', async ({ page }) => {
    await page.goto('/');
    await heroReady(page);
    const corners = await cornerPixels(page);
    expect(corners.every((c) => isBone(c))).toBe(true);
  });

  test('the wall clears every corner by the end of the reveal', async ({ page }, testInfo) => {
    skipAtRest(testInfo);
    await page.goto('/');
    await heroReady(page);
    const heroHeight = await page.evaluate(
      () => document.querySelector('[data-section="hero"]')!.getBoundingClientRect().height,
    );
    // The reveal finishes at 42% of the hero. Scroll past it, to 60%.
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), heroHeight * 0.6);
    await page.waitForTimeout(1200);
    const corners = await cornerPixels(page);
    expect(corners.some((c) => isBone(c))).toBe(false);
  });

  test('all scrubbed beats finish before the sticky stage unpins', async ({ page }, testInfo) => {
    skipAtRest(testInfo);
    await page.goto('/');
    const { heroHeight, viewport } = await page.evaluate(() => ({
      heroHeight: document.querySelector('[data-section="hero"]')!.getBoundingClientRect().height,
      viewport: window.innerHeight,
    }));
    // Unpin point is heroHeight - 100vh. The last beat ends at 48% of the hero.
    expect(heroHeight * 0.48).toBeLessThan(heroHeight - viewport);
  });

  test('the second copy block is legible once the room is open', async ({ page }, testInfo) => {
    skipAtRest(testInfo);
    await page.goto('/');
    const heroHeight = await page.evaluate(
      () => document.querySelector('[data-section="hero"]')!.getBoundingClientRect().height,
    );
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), heroHeight * 0.5);
    await page.waitForTimeout(1200);
    await expect(page.locator('#hb2')).toBeVisible();
    expect(
      await page.locator('#hb2').evaluate((el) => Number(getComputedStyle(el).opacity)),
    ).toBeGreaterThan(0.9);
  });
});

test.describe('hero under reduced motion', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } });

  test('still opens on Syros', async ({ page }) => {
    await page.goto('/');
    await heroReady(page);
    const corners = await cornerPixels(page);
    expect(corners.every((c) => isBone(c))).toBe(true);
  });

  test('the copy over the open room is readable without any scroll', async ({ page }) => {
    await page.goto('/');
    const opacity = await page
      .locator('#hb2')
      .evaluate((el) => Number(getComputedStyle(el).opacity));
    expect(opacity).toBeGreaterThan(0.9);
  });
});
