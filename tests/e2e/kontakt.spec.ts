import { expect, test } from '@playwright/test';

test('renders the address and hours from the data', async ({ page }) => {
  await page.goto('/');
  const section = page.locator('[data-section="kontakt"]');
  await expect(section).toContainText('Koste Stamenkovića 23');
  // One row per day, the way Google Maps lists them.
  await expect(page.locator('#hours-week .hrow')).toHaveCount(7);
  await expect(section).toContainText('Ponedeljak');
  await expect(section).toContainText('Nedelja');
  // The week is not uniform: 07-24 Mon-Thu, 07-01 Fri-Sat, 09-24 Sun.
  await expect(page.locator('.hrow[data-day="mon"]')).toContainText('07h — 24h');
  await expect(page.locator('.hrow[data-day="fri"]')).toContainText('07h — 01h');
  await expect(page.locator('.hrow[data-day="sun"]')).toContainText('09h — 24h');
});

test('exactly one day is marked as today, and it is the real one', async ({ page }) => {
  await page.goto('/');
  const marked = page.locator('#hours-week .hrow[aria-current]');
  await expect(marked).toHaveCount(1);
  // The build stamped its own day; clock.ts corrects it for the visitor.
  const expected = await page.evaluate(() => {
    const short = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Belgrade',
      weekday: 'short',
    }).format(new Date());
    return short.slice(0, 3).toLowerCase();
  });
  await expect(marked).toHaveAttribute('data-day', expected);
});

test('the hours are localised', async ({ page }) => {
  await page.goto('/en');
  const section = page.locator('[data-section="kontakt"]');
  await expect(section).toContainText('Monday');
  await expect(section).toContainText('Sunday');
  await expect(section).not.toContainText('Ponedeljak');
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
