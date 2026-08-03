import { expect, test } from '@playwright/test';

test('the card lists every group, closed', async ({ page }) => {
  await page.goto('/');
  const groups = page.locator('#karta .k-group');
  await expect(groups).toHaveCount(25);
  expect(await groups.first().evaluate((el: HTMLDetailsElement) => el.open)).toBe(false);
});

test('opening a group shows its items and prices', async ({ page }) => {
  await page.goto('/');
  const group = page.locator('#karta .k-group').first();
  await group.locator('.k-summary').click();
  await expect(group.locator('.k-row')).toHaveCount(18);
  await expect(group.locator('.k-price').first()).toHaveText(/220/);
});

test('kokteli says where the list is and has no rows', async ({ page }) => {
  await page.goto('/');
  const kokteli = page.locator('#karta .k-group', { hasText: 'Kokteli' });
  await expect(kokteli.locator('.k-note')).toContainText(/u lokalu/i);
  await expect(kokteli.locator('.k-row')).toHaveCount(0);
});

test('shows Serbian titles on / and English on /en', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#karta')).toContainText('Kafa i još nešto');
  await page.goto('/en');
  await expect(page.locator('#karta')).toContainText('Coffee and then some');
});

test('the card never scrolls sideways on a phone', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'narrow layout only');
  await page.goto('/');
  await page.locator('#karta .k-summary').first().click();
  const overflows = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
  );
  expect(overflows).toBe(false);
});

test('a described row opens the popup with its description', async ({ page }) => {
  await page.goto('/');
  const group = page.locator('#karta .k-group', { hasText: 'Breakfast' });
  await group.locator('.k-summary').click();
  await group.locator('.k-row.is-openable').first().click();

  const modal = page.locator('#karta-modal');
  await expect(modal).toBeVisible();
  await expect(modal.locator('.g-modal-title')).toContainText(/\S/);
  await expect(modal.locator('.g-modal-caption')).toContainText(/semenke|granola|brioche/i);
  await page.keyboard.press('Escape');
  await expect(modal).toBeHidden();
});

test('a bare row is not a button', async ({ page }) => {
  await page.goto('/');
  const group = page.locator('#karta .k-group').first();
  await group.locator('.k-summary').click();
  const espresso = group.locator('.k-row', { hasText: 'Espresso' }).first();
  expect(await espresso.evaluate((el) => el.tagName)).toBe('DIV');
});

test('potpis stays off the page while there are no real cocktails', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-section="potpis"]')).toHaveCount(0);
  await expect(page.locator('a[data-nav-link="potpis"]')).toHaveCount(0);
});
