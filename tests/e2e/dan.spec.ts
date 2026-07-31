import { expect, test } from '@playwright/test';

test('renders four cards from the dan collection', async ({ page }) => {
  await page.goto('/');
  expect(await page.locator('[data-section="dan"] .j-item').count()).toBe(4);
});

test('the pin sits on the real Leskovac coordinate', async ({ page }) => {
  await page.goto('/');
  const pin = page.locator('.j-pin');
  await expect(pin).toHaveAttribute('cx', '747.1');
  await expect(pin).toHaveAttribute('cy', '1059.2');
});

test('card copy is localised', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-section="dan"]')).toContainText('Jutro');
  await page.goto('/en');
  await expect(page.locator('[data-section="dan"]')).toContainText('Morning');
});

test.describe('with motion', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(
      testInfo.project.name === 'reduced-motion',
      'the route is drawn complete up-front when motion is reduced',
    );
  });

  test('the boundary keeps its own aspect ratio at every width', async ({ page }, testInfo) => {
    await page.goto('/');
    const aspect = (selector: string) =>
      page.locator(selector).evaluate((el) => getComputedStyle(el).aspectRatio.replace(/\s/g, ''));

    if (testInfo.project.name === 'mobile') {
      // The stage grows to hold four stacked cards, so it cannot also carry
      // the boundary's aspect — .journey-art gets its own box instead.
      expect(await aspect('.journey-stage')).toBe('auto');
      expect(await aspect('.journey-art')).toBe('1000/1435.4');
    } else {
      // Equal aspects are what make preserveAspectRatio="none" distortion-free.
      expect(await aspect('.journey-stage')).toBe('1000/1435.4');
    }
  });

  test('the route draws and arrives as the section scrolls', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'the route is hidden below 820px');
    await page.goto('/');
    const route = page.locator('#jroute');
    const total = await route.evaluate((el) => (el as unknown as SVGPathElement).getTotalLength());

    await page.locator('[data-section="dan"]').scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);
    await page.mouse.wheel(0, 2500);
    await page.waitForTimeout(1500);

    const offset = await route.evaluate((el) =>
      Number(getComputedStyle(el).strokeDashoffset.replace('px', '')),
    );
    expect(offset).toBeLessThan(total * 0.95);
  });
});

test.describe('reduced motion', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } });

  test('card media is visible rather than left under the veil', async ({ page }) => {
    await page.goto('/');
    const veils = page.locator('.j-media-veil');
    const count = await veils.count();
    expect(count).toBe(4);
    for (let i = 0; i < count; i++) {
      expect(await veils.nth(i).evaluate((el) => Number(getComputedStyle(el).opacity))).toBe(0);
    }
  });

  test('all four cards are fully visible', async ({ page }) => {
    await page.goto('/');
    const items = page.locator('[data-section="dan"] .j-item');
    for (let i = 0; i < 4; i++) {
      expect(await items.nth(i).evaluate((el) => Number(getComputedStyle(el).opacity))).toBe(1);
    }
  });

  test('the route is drawn complete', async ({ page }) => {
    await page.goto('/');
    const offset = await page
      .locator('#jroute')
      .evaluate((el) => Number(getComputedStyle(el).strokeDashoffset.replace('px', '')));
    expect(offset).toBe(0);
  });
});
