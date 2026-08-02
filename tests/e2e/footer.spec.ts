import { expect, test } from '@playwright/test';

test('renders the wordmark and a live clock', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.footer-mark svg')).toBeVisible();
  const first = await page.locator('#fclock').innerText();
  expect(first).toMatch(/^\d{2}:\d{2}:\d{2}$/);
  await page.waitForTimeout(1600);
  expect(await page.locator('#fclock').innerText()).not.toBe(first);
});

test('the date is localised and Serbian is Latin', async ({ page }) => {
  await page.goto('/');
  const sr = await page.locator('#fdate').innerText();
  expect(sr).not.toMatch(/[Ѐ-ӿ]/);
  expect(sr.length).toBeGreaterThan(8);
  await page.goto('/en');
  expect(await page.locator('#fdate').innerText()).toMatch(
    /January|February|March|April|May|June|July|August|September|October|November|December/,
  );
});

test('declares the ink nav surface', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.footer-wrap')).toHaveAttribute('data-nav-surface', 'ink');
});

test('credits OpenStreetMap for the boundary data', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.footer-legal')).toContainText('OpenStreetMap');
  await expect(page.locator('.footer-legal')).toContainText('ODbL');
});

test.describe('the frame paints in at the end', () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(
      testInfo.project.name === 'reduced-motion',
      'the frame is the CSS end state when motion is reduced; asserted separately',
    );
  });

  test('is full-bleed while scrolling through, framed once the page ends', async ({ page }) => {
    await page.goto('/');
    const border = () =>
      page.locator('.footer').evaluate((el) => parseFloat(getComputedStyle(el).borderTopWidth));

    // Footer visible, but not yet at the document end.
    await page.locator('.footer-wrap').scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    expect(await border()).toBeLessThan(2);

    await page.evaluate(() => {
      const target = document.documentElement.scrollHeight;
      const lenis = (window as any).__lenis;
      if (lenis) lenis.scrollTo(target, { immediate: true });
      else window.scrollTo({ top: target, behavior: 'instant' });
    });
    await page.waitForTimeout(1400);
    expect(await border()).toBeGreaterThan(20);
  });
});

test.describe('reduced motion', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } });

  test('renders the framed panel without needing the animation', async ({ page }) => {
    await page.goto('/');
    const width = await page
      .locator('.footer')
      .evaluate((el) => parseFloat(getComputedStyle(el).borderTopWidth));
    expect(width).toBeGreaterThan(20);
  });
});

// Both of these render the same two numbers from site.json. Before this they
// were typed independently — the footer in two dictionaries, the section from
// config — which is exactly how the opening hours drifted.
test('the footer rating and the reviews claim cannot disagree', async ({ page }) => {
  await page.goto('/');
  const rating = await page.locator('.footer .fcol').filter({ hasText: 'Ocena' }).innerText();
  const claim = await page.locator('#recenzije .rev-claim').innerText();
  for (const figure of ['20', '5,0']) {
    expect(rating, `footer is missing ${figure}`).toContain(figure);
    expect(claim, `claim is missing ${figure}`).toContain(figure);
  }
});

test('the English footer uses a decimal point, not a comma', async ({ page }) => {
  await page.goto('/en');
  const rating = await page.locator('.footer .fcol').filter({ hasText: 'Rating' }).innerText();
  expect(rating).toContain('5.0');
  expect(rating).toContain('reviews');
});
