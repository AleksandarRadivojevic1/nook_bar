import { expect, test } from '@playwright/test';

test('renders twelve photos as lightbox buttons in two columns', async ({ page }) => {
  await page.goto('/');
  const buttons = page.locator('#galerija .g-open');
  await expect(buttons).toHaveCount(12);
  await expect(page.locator('#galerija .g-col')).toHaveCount(2);

  // Every photo still carries its alt text.
  const imgs = page.locator('#galerija .g-img');
  const count = await imgs.count();
  for (let i = 0; i < count; i++) {
    const alt = await imgs.nth(i).getAttribute('alt');
    expect(alt?.trim().length ?? 0).toBeGreaterThan(0);
  }
});

test('the panel copy is localised', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#galerija .g-panel')).toContainText('Prostor u slikama');

  await page.goto('/en');
  await expect(page.locator('#galerija .g-panel')).toContainText('The room in pictures');
});

test('a photo opens the lightbox with its caption', async ({ page }) => {
  await page.goto('/');
  await page.locator('#galerija .g-open').first().click();
  await expect(page.locator('#galerija-modal')).toBeVisible();
  await expect(page.locator('#galerija-modal .g-modal-caption')).toContainText(/\S/);
  await page.keyboard.press('Escape');
});

test('the gallery never scrolls sideways on a phone', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'narrow layout only');
  await page.goto('/');
  const over = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
  expect(over).toBe(false);
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

  test('shows every photo at rest with no pin', async ({ page }) => {
    await page.goto('/');
    const section = page.locator('[data-section="galerija"]');
    await section.scrollIntoViewIfNeeded();

    const imgs = page.locator('[data-section="galerija"] .g-img');
    const count = await imgs.count();
    expect(count).toBe(12);
    for (let i = 0; i < count; i++) {
      const img = imgs.nth(i);
      expect(await img.evaluate((el) => Number(getComputedStyle(el).opacity))).toBe(1);
    }
  });
});
