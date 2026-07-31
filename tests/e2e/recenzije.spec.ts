import { expect, test } from '@playwright/test';

test('renders one quote per review with a dot each', async ({ page }) => {
  await page.goto('/');
  expect(await page.locator('.rev-item').count()).toBe(3);
  expect(await page.locator('#revdots i').count()).toBe(3);
});

test('shows the same verbatim quote in both locales', async ({ page }) => {
  await page.goto('/');
  const sr = await page.locator('.rev-item').first().innerText();
  await page.goto('/en');
  const en = await page.locator('.rev-item').first().innerText();
  expect(sr).toBe(en);
  expect(sr).toContain('Amazing new spot in town');
});

test('shows exactly one quote at a time', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-section="recenzije"]').scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  const opacities = await page
    .locator('.rev-item')
    .evaluateAll((els) => els.map((el) => Number(getComputedStyle(el).opacity)));
  expect(opacities.filter((o) => o > 0.5)).toHaveLength(1);
});

test('clicking a dot switches the quote', async ({ page }) => {
  await page.goto('/');
  await page.locator('[data-section="recenzije"]').scrollIntoViewIfNeeded();
  await page.locator('#revdots i').nth(2).click();
  await page.waitForTimeout(1200);
  const third = await page
    .locator('.rev-item')
    .nth(2)
    .evaluate((el) => Number(getComputedStyle(el).opacity));
  expect(third).toBeGreaterThan(0.8);
});

test.describe('reduced motion', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } });

  test('does not stack every review on top of every other', async ({ page }) => {
    await page.goto('/');
    const opacities = await page
      .locator('.rev-item')
      .evaluateAll((els) => els.map((el) => Number(getComputedStyle(el).opacity)));
    expect(opacities.filter((o) => o > 0.5)).toHaveLength(1);
  });

  test('dots remain clickable — switching quotes is navigation, not decoration', async ({ page }) => {
    await page.goto('/');
    await page.locator('#revdots i').nth(1).click();
    await page.waitForTimeout(300);
    const second = await page
      .locator('.rev-item')
      .nth(1)
      .evaluate((el) => Number(getComputedStyle(el).opacity));
    expect(second).toBeGreaterThan(0.8);
  });
});
