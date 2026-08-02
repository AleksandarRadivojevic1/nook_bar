import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';

const DRINKS = readdirSync(
  join(import.meta.dirname, '..', '..', 'src', 'content', 'signature'),
).filter((f) => f.endsWith('.json')).length;

test.describe('signature (potpis)', () => {
  test('renders every signature drink, and Siros carries its origin line', async ({ page }) => {
    await page.goto('/');
    // Count comes from the collection; the owners edit it through Keystatic.
    await expect(page.locator('#potpis .p-drink')).toHaveCount(DRINKS);
    await expect(page.locator('#potpis')).toContainText('Siros');
    // Assert the Syros drink HAS an origin line, rather than that nobody else
    // does — whether another drink has one is the owners' editorial call.
    const siros = page.locator('#potpis .p-drink').filter({ hasText: 'Siros' }).first();
    await expect(siros.locator('.p-origin')).toHaveCount(1);
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
