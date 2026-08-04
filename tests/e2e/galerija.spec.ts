import { expect, test } from '@playwright/test';

test('renders at least nine gallery tiles, each with a caption/alt', async ({ page }) => {
  await page.goto('/');
  const tiles = page.locator('[data-section="galerija"] .g-tile');
  const count = await tiles.count();
  expect(count).toBeGreaterThanOrEqual(9);

  const imgs = page.locator('[data-section="galerija"] .g-img');
  for (let i = 0; i < count; i++) {
    const alt = await imgs.nth(i).getAttribute('alt');
    expect(alt?.trim().length ?? 0).toBeGreaterThan(0);
  }
});

test('captions are hidden at rest and content is localised', async ({ page }) => {
  await page.goto('/');
  const cap = page.locator('[data-section="galerija"] .g-tile figcaption').first();
  expect(await cap.evaluate((el) => Number(getComputedStyle(el).opacity))).toBe(0);
  await expect(page.locator('[data-section="galerija"]')).toContainText('Šank');

  await page.goto('/en');
  await expect(page.locator('[data-section="galerija"]')).toContainText('The bar');
});

test('the fallback grid is a responsive multi-column masonry', async ({ page }, testInfo) => {
  await page.goto('/');
  const cols = await page
    .locator('[data-section="galerija"] .g-grid')
    .evaluate((el) => getComputedStyle(el).columnCount);
  // Desktop / reduced-motion run at 1920px → 4 columns; mobile (Pixel 7) → 2.
  expect(cols).toBe(testInfo.project.name === 'mobile' ? '2' : '4');
});

test('the gallery ships no WebGL layer', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#galerija canvas')).toHaveCount(0);
  await expect(page.locator('#galerija .g-stage')).toHaveCount(0);
});

test.describe('lightbox', () => {
  /**
   * Once the WebGL layer is up the markup grid is pointer-events:none — the
   * canvas owns the mouse and the tile buttons exist for the keyboard and the
   * fallback. Activating the button the way a keyboard does exercises the same
   * handler on every project.
   */
  const openFirstTile = (page: import('@playwright/test').Page) =>
    page
      .locator('[data-section="galerija"] .g-open')
      .first()
      .evaluate((el: HTMLElement) => el.click());

  test('opens from a tile, shows the caption, and closes on Escape', async ({ page }) => {
    await page.goto('/');
    const modal = page.locator('#galerija-modal');
    await expect(modal).toBeHidden();

    await openFirstTile(page);
    await expect(modal).toBeVisible();
    await expect(page.locator('#galerija-modal .g-modal-img')).toHaveAttribute('src', /\S/);
    await expect(page.locator('#galerija-modal .g-modal-caption')).toContainText(/\S/);

    await page.keyboard.press('Escape');
    await expect(modal).toBeHidden();
  });

  test('steps through photos with the arrow keys', async ({ page }) => {
    await page.goto('/');
    await openFirstTile(page);
    const src = () => page.locator('#galerija-modal .g-modal-img').getAttribute('src');

    const first = await src();
    await page.keyboard.press('ArrowRight');
    await expect.poll(src).not.toBe(first);
    await page.keyboard.press('ArrowLeft');
    await expect.poll(src).toBe(first);
  });

  test('wraps around and locks the page behind it', async ({ page }) => {
    await page.goto('/');
    await openFirstTile(page);
    await expect(page.locator('body')).toHaveClass(/g-modal-open/);

    // Stepping back from the first photo lands on the last one.
    const first = await page.locator('#galerija-modal .g-modal-img').getAttribute('src');
    await page.locator('#galerija-modal .g-modal-prev').click();
    await expect.poll(() => page.locator('#galerija-modal .g-modal-img').getAttribute('src')).not.toBe(first);

    await page.locator('#galerija-modal .g-modal-close').click();
    await expect(page.locator('body')).not.toHaveClass(/g-modal-open/);
  });

  test('the tile buttons are reachable by keyboard', async ({ page }) => {
    await page.goto('/');
    const first = page.locator('[data-section="galerija"] .g-open').first();
    await first.focus();
    await expect(first).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('#galerija-modal')).toBeVisible();
  });
});

test.describe('reduced motion', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } });

  test('shows a still grid with every photo at rest', async ({ page }) => {
    await page.goto('/');
    const section = page.locator('[data-section="galerija"]');
    await section.scrollIntoViewIfNeeded();

    const tiles = page.locator('[data-section="galerija"] .g-tile');
    const count = await tiles.count();
    for (let i = 0; i < count; i++) {
      const t = tiles.nth(i);
      expect(await t.evaluate((el) => Number(getComputedStyle(el).opacity))).toBe(1);
      expect(await t.evaluate((el) => getComputedStyle(el).transform)).toBe('none');
    }
  });
});
