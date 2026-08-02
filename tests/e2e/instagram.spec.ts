import { expect, test } from '@playwright/test';

// The collection is empty until the owners choose their posts, and the rule
// from spec §11 is that an empty collection removes the section entirely.
test('does not render while no posts are chosen', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#instagram')).toHaveCount(0);
  await expect(page.locator('[data-section="instagram"]')).toHaveCount(0);
});

// This is the half of the rule that is easy to get wrong: the section is
// gone, so no nav surface may link to it.
test('no nav surface links to a section that is not there', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('a[href="#instagram"]')).toHaveCount(0);
});

test('the footer still links out to the real profile', async ({ page }) => {
  await page.goto('/');
  const link = page.locator('.footer a[href*="instagram.com"]').first();
  await expect(link).toHaveAttribute('href', /instagram\.com\/nookbar__/);
});
