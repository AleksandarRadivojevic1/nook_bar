import { expect, test } from '@playwright/test';

test.describe('manifesto', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(
      testInfo.project.name === 'reduced-motion',
      'the word split only happens when motion is allowed',
    );
  });

  test('splits the manifesto into per-word spans', async ({ page }) => {
    await page.goto('/');
    const words = page.locator('[data-section="prostor"] .w');
    expect(await words.count()).toBeGreaterThan(20);
  });

  test('reveals the words on scroll', async ({ page }) => {
    await page.goto('/');
    const section = page.locator('[data-section="prostor"]');
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(900);
    const first = await section
      .locator('.w')
      .first()
      .evaluate((el) => Number(getComputedStyle(el).opacity));
    expect(first).toBeGreaterThan(0.5);
  });
});

test.describe('manifesto under reduced motion', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } });

  test('renders the manifesto at full opacity without splitting', async ({ page }) => {
    await page.goto('/');
    const p = page.locator('[data-section="prostor"] p').first();
    expect(await p.evaluate((el) => Number(getComputedStyle(el).opacity))).toBe(1);
    const text = await p.innerText();
    expect(text.length).toBeGreaterThan(60);
  });
});
