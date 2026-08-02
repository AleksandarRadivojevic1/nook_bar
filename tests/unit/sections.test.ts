import { describe, expect, it } from 'vitest';
import { SECTIONS, visibleSections, type SectionId } from '../../src/lib/sections';
import { en } from '../../src/i18n/en';
import { sr } from '../../src/i18n/sr';

const ALL = new Set<SectionId>(SECTIONS.map((s) => s.id));

describe('the registry', () => {
  it('has a nav label in both locales for every section', () => {
    for (const s of SECTIONS) {
      expect(sr.nav[s.id], `sr.nav.${s.id}`).toBeTruthy();
      expect(en.nav[s.id], `en.nav.${s.id}`).toBeTruthy();
    }
  });
  it('keeps the primary bar small enough to scan', () => {
    expect(SECTIONS.filter((s) => s.nav === 'primary').length).toBeLessThanOrEqual(5);
  });
  it('declares only nav surfaces the stylesheet knows', () => {
    for (const s of SECTIONS) {
      expect(['dark', 'bone', 'ink']).toContain(s.navSurface);
    }
  });
  it('has no duplicate ids', () => {
    expect(new Set(SECTIONS.map((s) => s.id)).size).toBe(SECTIONS.length);
  });
});

describe('visibleSections', () => {
  it('drops sections that did not render', () => {
    const present = new Set<SectionId>(['karta', 'kontakt']);
    expect(visibleSections(present, 'menu').map((s) => s.id)).toEqual(['karta', 'kontakt']);
  });
  it('never returns a section that is absent, even if it is primary', () => {
    const ids = visibleSections(new Set<SectionId>(['karta']), 'primary').map((s) => s.id);
    expect(ids).not.toContain('galerija');
  });
  it('primary is a subset of menu', () => {
    const primary = visibleSections(ALL, 'primary').map((s) => s.id);
    const menu = visibleSections(ALL, 'menu').map((s) => s.id);
    for (const id of primary) expect(menu).toContain(id);
  });
  it('preserves page order', () => {
    const ids = visibleSections(ALL, 'menu').map((s) => s.id);
    expect(ids.indexOf('karta')).toBeLessThan(ids.indexOf('kontakt'));
  });
  it('is empty when nothing rendered', () => {
    expect(visibleSections(new Set<SectionId>(), 'menu')).toEqual([]);
  });
});
