import { expect, test } from '@playwright/test';

test('renders every menu item from the collection, in order', async ({ page }) => {
  await page.goto('/');
  const rows = page.locator('[data-section="karta"] .row');
  expect(await rows.count()).toBe(6);
  await expect(rows.first()).toContainText('Bela nedelja');
  await expect(rows.first()).toContainText('520');
});

test('shows Serbian descriptions on / and English on /en', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-section="karta"]')).toContainText('Džin, kamilica');
  await page.goto('/en');
  await expect(page.locator('[data-section="karta"]')).toContainText('Gin, chamomile');
});

test.describe('with motion', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name === 'reduced-motion', 'the crop is hidden when motion is reduced');
    test.skip(testInfo.project.name === 'mobile', 'there is no cursor to trail on touch');
  });

  test('the crop follows the cursor on hover', async ({ page }) => {
    await page.goto('/');
    const crop = page.locator('#crop');
    expect(await crop.evaluate((el) => Number(getComputedStyle(el).opacity))).toBe(0);
    await page.locator('[data-section="karta"] .row').first().hover();
    await page.waitForTimeout(600);
    expect(await crop.evaluate((el) => Number(getComputedStyle(el).opacity))).toBeGreaterThan(0.8);
  });
});

test.describe('reduced motion', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } });

  test('the menu is fully readable and the crop stays hidden', async ({ page }) => {
    await page.goto('/');
    expect(await page.locator('[data-section="karta"] .row').count()).toBe(6);
    expect(await page.locator('#crop').evaluate((el) => getComputedStyle(el).display)).toBe('none');
  });
});
