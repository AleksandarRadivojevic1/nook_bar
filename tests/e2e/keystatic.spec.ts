import { expect, test } from '@playwright/test';

// The admin route must not become part of the public site.
test('the site does not link to the admin', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('a[href*="keystatic"]')).toHaveCount(0);
});

test('robots does not advertise it', async ({ page, request }) => {
  await page.goto('/');
  const robots = await request.get('/robots.txt');
  if (robots.ok()) expect(await robots.text()).not.toContain('keystatic');
});

// React is the admin route's dependency, not the site's. This is the claim
// the whole dependency trade rests on, so it should fail loudly if it stops
// being true.
test('no framework runtime reaches the public page', async ({ page }) => {
  const scripts: string[] = [];
  page.on('request', (r) => {
    if (r.resourceType() === 'script') scripts.push(r.url());
  });
  await page.goto('/');
  await page.waitForTimeout(800);
  expect(scripts.filter((s) => /react|keystatic/i.test(s))).toEqual([]);
});
