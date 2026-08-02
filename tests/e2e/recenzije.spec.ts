import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Read from the config, not hardcoded. The owners change the review count in
 * Keystatic — a literal in here is a test that fails the first time they do.
 */
const COUNT = String(
  JSON.parse(
    readFileSync(join(import.meta.dirname, '..', '..', 'src', 'content', 'site.json'), 'utf8'),
  ).reviewCount,
);

test('shows every review at once, with no carousel left behind', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#recenzije .rev-item')).toHaveCount(3);
  await expect(page.locator('#revdots')).toHaveCount(0);
  await expect(page.locator('#recenzije [role="tablist"]')).toHaveCount(0);
});

test('the claim is a sentence carrying the real count and score', async ({ page }) => {
  await page.goto('/');
  const claim = page.locator('#recenzije .rev-claim');
  await expect(claim).toContainText(COUNT);
  // Serbian decimal comma, produced by Intl rather than typed into sr.ts.
  await expect(claim).toContainText('5,0');
  await page.goto('/en');
  await expect(page.locator('#recenzije .rev-claim')).toContainText('5.0');
});

test('the score is a sentence, not a badge with stars', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#recenzije .rev-stars')).toHaveCount(0);
  await expect(page.locator('#recenzije .rev-score')).toHaveCount(0);
});

// One idiom used once is a decision; used twice it is a tic. The debossed
// wordmark is reserved for the Siros section.
test('carries no debossed watermark', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#recenzije .deboss')).toHaveCount(0);
});

test('one quote is set as a pull-quote and the rest are not', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#recenzije .rev-item.is-featured')).toHaveCount(1);
  const sizes = await page
    .locator('#recenzije .rev-quote')
    .evaluateAll((els) => els.map((el) => parseFloat(getComputedStyle(el).fontSize)));
  expect(sizes[0]).toBeGreaterThan(sizes[1]);
});

test('shows the same verbatim quote in both locales', async ({ page }) => {
  await page.goto('/');
  const sr = await page.locator('#recenzije .rev-quote').first().innerText();
  await page.goto('/en');
  const en = await page.locator('#recenzije .rev-quote').first().innerText();
  expect(sr).toBe(en);
  expect(sr).toContain('Amazing new spot in town');
});

test('marks the English quotes on the Serbian page and not on the English one', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#recenzije .rev-lang')).toHaveCount(3);
  await expect(page.locator('#recenzije .rev-lang').first()).toHaveText('EN');
  await page.goto('/en');
  await expect(page.locator('#recenzije .rev-lang')).toHaveCount(0);
});

test.describe('reduced motion', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } });

  // The old section hid two of three quotes and relied on a timer to reveal
  // them. Nothing is hidden now, so there is nothing left to rewind.
  test('every quote is fully visible with no script running', async ({ page }) => {
    await page.goto('/');
    const opacities = await page
      .locator('#recenzije .rev-item')
      .evaluateAll((els) => els.map((el) => Number(getComputedStyle(el).opacity)));
    expect(opacities).toEqual([1, 1, 1]);
  });
});

// The source used to be free text and it was Serbian, so "Google recenzija"
// and "45 recenzija" printed verbatim under English quotes on /en.
test('names the source in the language being read', async ({ page }) => {
  // .rev-by is uppercased in CSS, so compare case-insensitively rather than
  // asserting the shouting.
  await page.goto('/');
  const sr = await page.locator('#recenzije .rev-by').first().innerText();
  expect(sr).toMatch(/local guide · 45 recenzija/i);

  await page.goto('/en');
  const en = await page.locator('#recenzije .rev-by').first().innerText();
  expect(en).toMatch(/local guide · 45 reviews/i);
  expect(en).not.toMatch(/recenzij/i);
});

test('no Serbian leaks into any attribution on the English page', async ({ page }) => {
  await page.goto('/en');
  const lines = await page
    .locator('#recenzije .rev-by')
    .evaluateAll((els) => els.map((el) => el.textContent ?? ''));
  expect(lines.length).toBeGreaterThan(0);
  for (const line of lines) expect(line).not.toMatch(/recenzij/i);
});
