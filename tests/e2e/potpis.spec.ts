import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';

/**
 * Counted from the collection, not hardcoded. The owners add and remove
 * drinks through Keystatic now, so a literal 3 in here is a test that fails
 * the first time somebody does their job.
 */
const DRINKS = readdirSync(
  join(import.meta.dirname, '..', '..', 'src', 'content', 'signature'),
).filter((f) => f.endsWith('.json')).length;

// Potpis is held off the page until the cocktail sheet is photographed and the
// signature collection is filled — see the karta suite for that assertion.
// These render tests come back to life the moment a real drink lands.
test.beforeEach(() => {
  test.skip(DRINKS === 0, 'potpis is absent until the signature collection has real cocktails');
});

test('renders one full-width row per drink', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#potpis .p-drink')).toHaveCount(DRINKS);
  await expect(page.locator('#potpis .p-card')).toHaveCount(0);
});

// The alternation is the point: three identical rows are the card grid again,
// just taller.
test('the image side alternates down the column', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'rows stack below 820px, so there is no side');
  await page.goto('/');
  const lefts = await page
    .locator('#potpis .p-drink .p-media')
    .evaluateAll((els) => els.map((el) => el.getBoundingClientRect().left));
  expect(lefts[0]).toBeLessThan(lefts[1]);
  expect(lefts[2]).toBeLessThan(lefts[1]);
});

test('every row still carries its name, price and spec', async ({ page }) => {
  await page.goto('/');
  const first = page.locator('#potpis .p-drink').first();
  await expect(first.locator('h3')).toHaveText('Siros');
  await expect(first.locator('.p-price')).toContainText('640');
  await expect(first.locator('.p-spec')).toContainText('Džin');
});

// Notes do not exist yet. The row has to look finished without one.
test('renders no empty note slot while the owners have not written them', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#potpis .p-notes')).toHaveCount(0);
});

test('rows stack into one column on a phone', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'this is the mobile layout');
  await page.goto('/');
  const lefts = await page
    .locator('#potpis .p-drink .p-media')
    .evaluateAll((els) => els.map((el) => el.getBoundingClientRect().left));
  expect(new Set(lefts).size).toBe(1);
});

test.describe('reduced motion', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } });

  test('every row is at rest and fully visible', async ({ page }) => {
    await page.goto('/');
    const opacities = await page
      .locator('#potpis .p-drink')
      .evaluateAll((els) => els.map((el) => Number(getComputedStyle(el).opacity)));
    expect(opacities).toHaveLength(DRINKS);
    expect(opacities.every((o) => o === 1)).toBe(true);
  });
});
