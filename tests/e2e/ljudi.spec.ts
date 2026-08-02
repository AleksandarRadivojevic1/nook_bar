import { expect, test } from '@playwright/test';

test('sits between the gallery and the reviews', async ({ page }) => {
  await page.goto('/');
  const order = await page
    .locator('[data-section]')
    .evaluateAll((els) => els.map((el) => el.getAttribute('data-section')));
  expect(order.indexOf('ljudi')).toBe(order.indexOf('galerija') + 1);
  expect(order.indexOf('ljudi')).toBe(order.indexOf('recenzije') - 1);
});

test('speaks in the first person, in both locales', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#ljudi')).toContainText('Otvorili smo Nook');
  await page.goto('/en');
  await expect(page.locator('#ljudi')).toContainText('We opened Nook');
});

test('is signed by hand', async ({ page }) => {
  await page.goto('/');
  const signature = page.locator('#ljudi .lj-sign');
  await expect(signature).toHaveText('Anđela i Dimitrije');
  // Caveat is the script face. It loads for three words in the hero and
  // nothing else until this section gives it a real job.
  await expect(signature).toHaveCSS('font-family', /Caveat/);
});

// The section is finished without photography. This asserts the absence is
// clean rather than a gap where a portrait row should be.
test('renders complete with no portraits and no empty state', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#ljudi .lj-faces')).toHaveCount(0);
  await expect(page.locator('#ljudi')).not.toContainText(/uskoro|coming soon/i);
});

test('the nav indexes it', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#navmenu a[href="#ljudi"]')).toHaveCount(1);
});

test.describe('reduced motion', () => {
  test.use({ contextOptions: { reducedMotion: 'reduce' } });

  test('renders exactly the same', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#ljudi .lj-statement')).toBeVisible();
    await expect(page.locator('#ljudi .lj-sign')).toBeVisible();
  });
});
