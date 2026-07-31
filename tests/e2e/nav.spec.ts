import { expect, test } from '@playwright/test';

test('links to the sections on wide screens', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', '.nav-links is hidden below 720px by design');
  await page.goto('/');
  await expect(page.locator('#nav a[href="#karta"]')).toBeVisible();
  await expect(page.locator('#nav a[href="#dan"]')).toBeVisible();
});

test('the language switch survives at every width', async ({ page }) => {
  await page.goto('/');
  const lang = page.locator('#nav a.nav-lang');
  await expect(lang).toBeVisible();
  await expect(lang).toHaveText('EN');
  await lang.click();
  await expect(page).toHaveURL(/\/en\/?$/);
  await expect(page.locator('#nav a.nav-lang')).toHaveText('SR');
});

test('every section declares a nav surface', async ({ page }) => {
  await page.goto('/');
  const surfaces = await page
    .locator('[data-section]')
    .evaluateAll((els) => els.map((el) => el.getAttribute('data-nav-surface')));
  expect(surfaces.length).toBeGreaterThan(0);
  expect(surfaces.every((s) => s === 'dark' || s === 'bone' || s === 'ink')).toBe(true);
});

test.describe('with motion', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(
      testInfo.project.name === 'reduced-motion',
      'surface flipping is scroll-driven; the reduced-motion fallback is asserted below',
    );
  });

  test('is transparent over the hero, solid over the body, dark in the footer', async ({ page }) => {
    await page.goto('/');
    const nav = page.locator('#nav');
    await expect(nav).not.toHaveClass(/is-solid/);

    await page.locator('[data-section="karta"]').scrollIntoViewIfNeeded();
    await page.waitForTimeout(800);
    await expect(nav).toHaveClass(/is-solid/);

    // Lenis owns the scroll position, so window.scrollTo does not drive
    // ScrollTrigger. Go through Lenis when it is running.
    await page.evaluate(() => {
      const target = document.body.scrollHeight;
      const lenis = (window as any).__lenis;
      if (lenis) lenis.scrollTo(target, { immediate: true });
      else window.scrollTo({ top: target, behavior: 'instant' });
    });
    await page.waitForTimeout(1000);
    await expect(nav).toHaveClass(/is-solid-dark/);
  });
});

test.describe('reduced motion', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } });

  test('the nav is still legible without scroll triggers', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#nav')).toHaveClass(/is-solid/);
  });
});
