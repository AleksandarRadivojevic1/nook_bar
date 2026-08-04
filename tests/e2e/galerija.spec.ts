import { expect, test, type Page } from '@playwright/test';

async function scrollTo(page: Page, y: number) {
  await page.evaluate((top) => {
    const l = (window as unknown as { __lenis?: { scrollTo(t: number, o: object): void } }).__lenis;
    if (l) l.scrollTo(top, { immediate: true });
    else window.scrollTo({ top, behavior: 'instant' as ScrollBehavior });
  }, y);
  await page.waitForTimeout(250);
}

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

test('a photo opens the lightbox with its caption and closes on Escape', async ({ page }) => {
  const modal = page.locator('#galerija-modal');
  await page.goto('/');
  await page.locator('#galerija .g-open').first().click();
  await expect(modal).toBeVisible();
  await expect(page.locator('#galerija-modal .g-modal-caption')).toContainText(/\S/);
  await page.keyboard.press('Escape');
  await expect(modal).toBeHidden();
});

test('the gallery never scrolls sideways on a phone', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'narrow layout only');
  await page.goto('/');
  const over = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
  expect(over).toBe(false);
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

test.describe('desktop pin', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'pin is a desktop, motion-on effect');
  });

  test('the section is a sane length, not many screens of scroll', async ({ page }) => {
    await page.goto('/');
    const screens = await page.evaluate(() => {
      const sec = document.querySelector('#galerija')!.getBoundingClientRect().height;
      return sec / window.innerHeight;
    });
    // A sticky panel + naturally-scrolling columns; no pin-spacer doubling.
    expect(screens).toBeLessThan(4);
  });

  test('the panel holds while the photos scroll, and the bar fills', async ({ page }) => {
    await page.goto('/');
    const secTop = await page
      .locator('#galerija')
      .evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
    await scrollTo(page, secTop + 200);
    const panelA = await page
      .locator('#galerija .g-panel')
      .evaluate((e) => e.getBoundingClientRect().top);
    const fillA = await page
      .locator('#galerija .g-fill')
      .evaluate((e) => e.getBoundingClientRect().width);
    await scrollTo(page, secTop + 900);
    const panelB = await page
      .locator('#galerija .g-panel')
      .evaluate((e) => e.getBoundingClientRect().top);
    const fillB = await page
      .locator('#galerija .g-fill')
      .evaluate((e) => e.getBoundingClientRect().width);
    expect(Math.abs(panelB - panelA)).toBeLessThan(30); // panel pinned
    expect(fillB).toBeGreaterThan(fillA); // progress advanced
  });
});
