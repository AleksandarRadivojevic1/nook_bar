import { expect, test } from '@playwright/test';

test.describe('both locales', () => {
  test('Serbian renders at the root in Latin script', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'sr-Latn-RS');
    const text = await page.locator('body').innerText();
    expect(text).not.toMatch(/[Ѐ-ӿ]/);
  });

  test('English renders at /en', async ({ page }) => {
    await page.goto('/en');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en-GB');
  });

  test('each page declares hreflang alternates and x-default', async ({ page }) => {
    await page.goto('/');
    const hrefs = await page.locator('link[rel="alternate"]').evaluateAll((links) =>
      links.map((l) => [l.getAttribute('hreflang'), l.getAttribute('href')]),
    );
    const map = Object.fromEntries(hrefs);
    expect(map['sr']).toMatch(/\/$/);
    expect(map['en']).toMatch(/\/en\/?$/);
    expect(map['x-default']).toMatch(/\/$/);
  });

  test('each page has a canonical URL and a description', async ({ page }) => {
    await page.goto('/en');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/en\/?$/);
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description?.length ?? 0).toBeGreaterThan(40);
  });

  test('emits BarOrPub JSON-LD built from the hours data', async ({ page }) => {
    await page.goto('/');
    const raw = await page.locator('script[type="application/ld+json"]').first().textContent();
    const data = JSON.parse(raw ?? '{}');
    expect(data['@type']).toBe('BarOrPub');
    expect(data.name).toBe('Nook');
    expect(data.address.streetAddress).toContain('Koste Stamenkovića 23');
    expect(data.address.addressLocality).toBe('Leskovac');
    expect(data.address.postalCode).toBe('16000');
    expect(data.geo.latitude).toBeCloseTo(42.9930343, 5);
    expect(data.hasMap).toMatch(/^https:\/\//);

    // One specification per run of identical days: Mon-Thu, Fri-Sat, Sun.
    const spec = data.openingHoursSpecification;
    expect(spec).toHaveLength(3);
    expect(spec[0].dayOfWeek).toEqual(['Monday', 'Tuesday', 'Wednesday', 'Thursday']);
    expect(spec[0].opens).toBe('07:00');
    // schema.org has no 24:00; 23:59 is the conventional stand-in.
    expect(spec[0].closes).toBe('23:59');
    // A close earlier than the open is how a past-midnight session is expressed.
    expect(spec[1].dayOfWeek).toEqual(['Friday', 'Saturday']);
    expect(spec[1].closes).toBe('01:00');
    expect(spec[2].dayOfWeek).toEqual(['Sunday']);
    expect(spec[2].opens).toBe('09:00');
  });

  test('no console errors on either page', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.goto('/en');
    await page.waitForLoadState('networkidle');
    expect(errors).toEqual([]);
  });
});
