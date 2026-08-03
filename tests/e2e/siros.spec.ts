import { expect, test } from '@playwright/test';

test('sits between the manifesto and the journey', async ({ page }) => {
  await page.goto('/');
  const order = await page
    .locator('[data-section]')
    .evaluateAll((els) => els.map((el) => el.getAttribute('data-section')));
  expect(order.indexOf('siros')).toBe(order.indexOf('prostor') + 1);
  expect(order.indexOf('siros')).toBe(order.indexOf('dan') - 1);
});

test('carries the origin copy in both locales', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#siros')).toContainText('Kikladima');
  await expect(page.locator('#siros .display')).toHaveText('Zašto grčko ostrvo');
  await page.goto('/en');
  await expect(page.locator('#siros')).toContainText('Cyclades');
  await expect(page.locator('#siros .display')).toHaveText('Why a Greek island');
});

test('renders every paragraph as its own paragraph', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#siros .siros-p')).toHaveCount(3);
});

// Serbian writes 37,4 and English 37.4. The readout is formatted by Intl
// rather than typed into the content, so the same number serves both.
test('writes the coordinates the way each locale writes numbers', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#siros .eyebrow')).toContainText('37,4');
  await page.goto('/en');
  await expect(page.locator('#siros .eyebrow')).toContainText('37.4');
});

test('draws the coastline from the shared definition, not its own copy', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#syros')).toHaveCount(1);
  await expect(page.locator('#siros use[href="#syros"]')).toHaveCount(1);
  const box = await page.locator('#siros .siros-isle svg').boundingBox();
  expect(box!.width).toBeGreaterThan(100);
});

test('the nav indexes it', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#navmenu a[href="#siros"]')).toHaveCount(1);
});

test.describe('reduced motion', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } });

  // The deboss is CSS and SVG with no script behind it, so the reduced-motion
  // state is simply the design.
  test('renders exactly the same', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#siros .siros-isle')).toBeVisible();
    await expect(page.locator('#siros .display')).toBeVisible();
  });
});
