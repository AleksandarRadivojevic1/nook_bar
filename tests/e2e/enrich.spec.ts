import { expect, test } from '@playwright/test';

test.describe('signature (potpis)', () => {
  test('renders three signature drinks, one carrying the Syros name', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#potpis .p-drink')).toHaveCount(3);
    await expect(page.locator('#potpis')).toContainText('Siros');
    // The Syros drink is the only one with an origin line.
    await expect(page.locator('#potpis .p-origin')).toHaveCount(1);
  });

  test('translates on /en', async ({ page }) => {
    await page.goto('/en');
    await expect(page.locator('#potpis')).toContainText('Signature');
  });
});

// The gallery has its own dedicated spec (galerija.spec.ts) now that it is a
// multi-column, motion-driven contact sheet rather than the old offset grid.

test.describe('in-page navigation', () => {
  test('a nav link scrolls to its section rather than jumping', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name === 'mobile', 'nav links are hidden below 720px');
    await page.goto('/');
    await page.waitForTimeout(300);
    await page.locator('.nav-links a[href="#karta"]').click();
    // Lenis animates; poll until the section is roughly under the nav.
    await expect
      .poll(async () => {
        return page.locator('#karta').evaluate((el) => Math.abs(el.getBoundingClientRect().top));
      }, { timeout: 4000 })
      .toBeLessThan(140);
  });
});
