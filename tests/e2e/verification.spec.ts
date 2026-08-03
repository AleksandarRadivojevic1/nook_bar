import { expect, test } from '@playwright/test';

const ROUTES = ['/', '/en'];

for (const route of ROUTES) {
  test(`${route} renders every section in order`, async ({ page }) => {
    await page.goto(route);
    const order = await page
      .locator('[data-section]')
      .evaluateAll((els) => els.map((el) => el.getAttribute('data-section')));
    expect(order).toEqual([
      'hero',
      'prostor',
      'siros',
      'dan',
      'karta',
      'galerija',
      'ljudi',
      'recenzije',
      'kontakt',
    ]);
    await expect(page.locator('.footer-wrap')).toBeVisible();
    await expect(page.locator('#nav')).toBeVisible();
  });

  test(`${route} has no unresolved dictionary keys or leaked objects`, async ({ page }) => {
    await page.goto(route);
    const text = await page.locator('body').innerText();
    expect(text).not.toMatch(/\{[a-zA-Z]+\}/);
    expect(text).not.toMatch(/\b(undefined|NaN)\b/);
    expect(text).not.toContain('[object Object]');
  });

  test(`${route} raises no console errors while scrolling the whole page`, async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(route);
    const height = await page.evaluate(() => document.body.scrollHeight);
    for (let y = 0; y < height; y += 600) {
      await page.evaluate((top) => {
        const lenis = (window as any).__lenis;
        if (lenis) lenis.scrollTo(top, { immediate: true });
        else window.scrollTo({ top, behavior: 'instant' });
      }, y);
      await page.waitForTimeout(60);
    }
    expect(errors).toEqual([]);
  });

  test(`${route} never scrolls horizontally`, async ({ page }) => {
    await page.goto(route);
    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
    );
    expect(overflows).toBe(false);
  });

  test(`${route} declares one canonical and three hreflang alternates`, async ({ page }) => {
    await page.goto(route);
    expect(await page.locator('link[rel="canonical"]').count()).toBe(1);
    expect(await page.locator('link[rel="alternate"]').count()).toBe(3);
  });
}

test.describe('reduced motion, whole page', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } });

  test('nothing is left mid-animation', async ({ page }) => {
    await page.goto('/');
    const broken = await page.evaluate(() => {
      const mustBeVisible = [
        '.j-item',
        '#hb2',
        '.manifesto p',
        '.rev-item:first-child',
        '.p-card:first-child',
        '.g-tile:first-child',
      ];
      const failures: string[] = [];

      for (const sel of mustBeVisible) {
        const el = document.querySelector(sel);
        if (el && Number(getComputedStyle(el).opacity) < 0.9) failures.push(sel);
      }
      // The veil is the inverse: it must have faded out of the way.
      document.querySelectorAll('.j-media-veil').forEach((el, i) => {
        if (Number(getComputedStyle(el).opacity) > 0.01) failures.push(`.j-media-veil[${i}]`);
      });
      return failures;
    });
    expect(broken).toEqual([]);
  });

  test('the page is still navigable', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#nav')).toHaveClass(/is-solid/);
    await expect(page.locator('#nav a.nav-lang')).toBeVisible();
    await expect(page.locator('#status')).toBeVisible();
  });
});
