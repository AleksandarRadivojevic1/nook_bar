import { expect, test } from '@playwright/test';

test('renders the address and hours from the data', async ({ page }) => {
  await page.goto('/');
  const section = page.locator('[data-section="kontakt"]');
  await expect(section).toContainText('Koste Stamenkovića 23');
  // Three grouped rows, not one line: the week is not uniform.
  await expect(section).toContainText('Pon — Čet');
  await expect(section).toContainText('07h — 24h');
  await expect(section).toContainText('Pet — Sub');
  await expect(section).toContainText('07h — 01h');
  await expect(section).toContainText('Ned');
  await expect(section).toContainText('09h — 24h');
});

test('the hours are localised', async ({ page }) => {
  await page.goto('/en');
  const section = page.locator('[data-section="kontakt"]');
  await expect(section).toContainText('Mon — Thu');
  await expect(section).toContainText('Sun');
  await expect(section).not.toContainText('Pon');
});

test('the status pill says open or closed, never both and never blank', async ({ page }) => {
  await page.goto('/');
  const status = page.locator('#status');
  await expect(status).toBeVisible();
  const text = await status.innerText();
  expect(text.trim().length).toBeGreaterThan(3);
  const classes = (await status.getAttribute('class')) ?? '';
  expect(classes).toMatch(/is-open|is-shut/);
  expect(/is-open/.test(classes) && /is-shut/.test(classes)).toBe(false);
});

test('the pill is localised', async ({ page }) => {
  await page.goto('/en');
  const text = await page.locator('#status').innerText();
  expect(text).toMatch(/Open|Closed/i);
});

test('the Serbian pill is Latin, not Cyrillic', async ({ page }) => {
  await page.goto('/');
  const text = await page.locator('#status').innerText();
  expect(text).not.toMatch(/[Ѐ-ӿ]/);
  expect(text).toMatch(/Otvoreno|Zatvoreno/i);
});

test('the pill is already correct in the served HTML, before any script runs', async ({
  request,
}) => {
  const html = await (await request.get('/')).text();
  expect(html).toMatch(/id="status"[^>]*class="status is-(open|shut)"|class="status is-(open|shut)"[^>]*id="status"/);
});
