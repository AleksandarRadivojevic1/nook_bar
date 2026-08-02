import { expect, test } from '@playwright/test';

test('the desktop bar carries the primary sections, including the gallery', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', '.nav-links is hidden below 720px by design');
  await page.goto('/');
  // Galerija used to be reachable on a phone and invisible here.
  for (const href of ['#dan', '#karta', '#galerija', '#kontakt']) {
    await expect(page.locator(`#nav .nav-links a[href="${href}"]`)).toBeVisible();
  }
});

test('every nav link resolves to a section that is actually on the page', async ({ page }) => {
  await page.goto('/');
  const hrefs = await page
    .locator('#nav a[href^="#"], #navmenu a[href^="#"], .footer a[href^="#"]')
    .evaluateAll((els) => els.map((el) => el.getAttribute('href')!));
  expect(hrefs.length).toBeGreaterThan(0);
  for (const href of new Set(hrefs)) {
    await expect(page.locator(href!), `${href} has no target`).toHaveCount(1);
  }
});

test('the footer index and the overlay menu agree', async ({ page }) => {
  await page.goto('/');
  const read = (sel: string) =>
    page
      .locator(sel)
      .evaluateAll((els) =>
        els.map((el) => el.getAttribute('href')!).filter((h) => h.startsWith('#')),
      );
  const footer = await read('.footer .fcol a[href^="#"]');
  // Excludes the CTA, which is a duplicate link to #kontakt, not an index entry.
  const menu = await read('#navmenu a[href^="#"]:not(.nav-menu-cta)');
  expect(footer).toEqual(menu);
  expect(footer.length).toBeGreaterThan(0);
});

test('the nav marks the section you are looking at', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'mobile', 'the primary bar is hidden below 720px');
  await page.goto('/');
  await page.locator('[data-section="karta"]').scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  await expect(page.locator('#nav .nav-links a[href="#karta"]')).toHaveAttribute(
    'aria-current',
    'true',
  );
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

test.describe('mobile menu', () => {
  // Below 720px the inline links are display:none, so this menu is the only
  // route to the sections. The desktop projects run wider and skip it.
  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'only exists below 720px');
    await page.goto('/');
  });

  test('the inline links are replaced by a toggle, not simply dropped', async ({ page }) => {
    await expect(page.locator('.nav-links')).toBeHidden();
    await expect(page.locator('.nav-toggle')).toBeVisible();
    await expect(page.locator('.nav-toggle')).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#navmenu')).toBeHidden();
  });

  test('opens, reaches every section, and closes on Escape', async ({ page }) => {
    const toggle = page.locator('.nav-toggle');
    const menu = page.locator('#navmenu');

    await toggle.click();
    await expect(menu).toBeVisible();
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');

    for (const href of ['#karta', '#dan', '#galerija', '#kontakt']) {
      await expect(menu.locator(`a[href="${href}"]`).first()).toBeVisible();
    }

    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await expect(toggle).toBeFocused();
  });

  test('closing after a link dismisses the panel', async ({ page }) => {
    await page.locator('.nav-toggle').click();
    // The CTA also points at #kontakt, so scope to the index entry.
    await page.locator('#navmenu a[href="#kontakt"]:not(.nav-menu-cta)').click();
    await expect(page.locator('#navmenu')).toBeHidden();
    await expect(page.locator('body')).not.toHaveClass(/nav-menu-open/);
  });

  test('the toggle clears the 44px touch-target floor', async ({ page }) => {
    const box = await page.locator('.nav-toggle').boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });
});
