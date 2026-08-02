import { expect, test } from '@playwright/test';

const GOOGLE = /google\.com|gstatic\.com|googleapis\.com/;

test('draws the block without touching Google', async ({ page }) => {
  const hits: string[] = [];
  page.on('request', (r) => {
    // The webfonts are Google-hosted and deliberate. This test is about maps.
    if (GOOGLE.test(r.url()) && !r.url().includes('fonts.')) hits.push(r.url());
  });
  await page.goto('/');
  await page.locator('#kontakt').scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  await expect(page.locator('.mapf-draw')).toBeVisible();
  await expect(page.locator('.mapf-frame')).toHaveCount(0);
  expect(hits, `requests to Google before any click:\n${hits.join('\n')}`).toEqual([]);
});

test('loads the real map only when asked', async ({ page }) => {
  await page.goto('/');
  await page.locator('#kontakt').scrollIntoViewIfNeeded();
  await page.locator('.mapf-open').click();
  await expect(page.locator('.mapf-frame')).toHaveCount(1);
  await expect(page.locator('.mapf-frame')).toHaveAttribute('src', /google\.com\/maps/);
});

test('the drawing marks where the bar is', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.mapf-draw .mapf-pin')).toHaveCount(1);
});

test('the control is a real button, reachable by keyboard', async ({ page }) => {
  await page.goto('/');
  const button = page.locator('.mapf-open');
  await expect(button).toHaveJSProperty('tagName', 'BUTTON');
  await button.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('.mapf-frame')).toHaveCount(1);
});

// Someone who cannot or will not load the embed still needs the address.
test('offers a plain link to the listing regardless', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#kontakt a[href*="google.com/maps"]').first()).toBeVisible();
});
