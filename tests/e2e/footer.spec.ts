import { expect, test } from '@playwright/test';

test('renders the wordmark and a live clock', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.footer-mark svg')).toBeVisible();
  const first = await page.locator('#fclock').innerText();
  expect(first).toMatch(/^\d{2}:\d{2}:\d{2}$/);
  await page.waitForTimeout(1600);
  expect(await page.locator('#fclock').innerText()).not.toBe(first);
});

test('the date is localised and Serbian is Latin', async ({ page }) => {
  await page.goto('/');
  const sr = await page.locator('#fdate').innerText();
  expect(sr).not.toMatch(/[Ѐ-ӿ]/);
  expect(sr.length).toBeGreaterThan(8);
  await page.goto('/en');
  expect(await page.locator('#fdate').innerText()).toMatch(
    /January|February|March|April|May|June|July|August|September|October|November|December/,
  );
});

test('declares the ink nav surface', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.footer-wrap')).toHaveAttribute('data-nav-surface', 'ink');
});

test('credits OpenStreetMap for the boundary data', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.footer-legal')).toContainText('OpenStreetMap');
  await expect(page.locator('.footer-legal')).toContainText('ODbL');
});
