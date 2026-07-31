import { expect, test } from '@playwright/test';

test.describe('motion singleton', () => {
  test('boots smooth scrolling normally', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-motion', 'on');
    expect(await page.evaluate(() => Boolean((window as any).__lenis))).toBe(true);
  });

  test('boots exactly once even with several sections on the page', async ({ page }) => {
    await page.goto('/');
    expect(await page.evaluate(() => (window as any).__motionBoots ?? 0)).toBe(1);
  });
});

test.describe('reduced motion', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } });

  test('does not boot smooth scrolling', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).not.toHaveAttribute('data-motion', 'on');
    expect(await page.evaluate(() => Boolean((window as any).__lenis))).toBe(false);
  });
});
