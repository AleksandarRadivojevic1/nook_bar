import type { Dictionary } from '../i18n';

/**
 * Every section on the page, in page order.
 *
 * This is the single source of truth the desktop bar, the overlay menu and the
 * footer index all read. Before it existed they were three hand-maintained
 * lists that had already drifted: the bar carried three of eight sections, the
 * mobile menu four, and the footer six — so Galerija was reachable on a phone
 * and invisible on a desktop.
 *
 * `id` doubles as the DOM id, the anchor target and the dictionary key, so a
 * section cannot be added without also being labelled in both locales.
 */
export type SectionId = keyof Pick<
  Dictionary['nav'],
  | 'prostor'
  | 'siros'
  | 'dan'
  | 'karta'
  | 'potpis'
  | 'galerija'
  | 'ljudi'
  | 'recenzije'
  | 'kontakt'
>;

export interface SectionDef {
  id: SectionId;
  /**
   * Which treatment the NAV takes over this section — not the section's own
   * background. A sand section still wants the bone nav.
   */
  navSurface: 'dark' | 'bone' | 'ink';
  /**
   * `primary` shows in the desktop bar, the overlay menu and the footer.
   * `menu` shows in the overlay menu and the footer only.
   *
   * The desktop bar is deliberately a subset: ten links is past the point
   * anyone reads them. The complete index lives in the menu and the footer.
   */
  nav: 'primary' | 'menu';
}

export const SECTIONS: readonly SectionDef[] = [
  { id: 'prostor', navSurface: 'bone', nav: 'menu' },
  { id: 'siros', navSurface: 'dark', nav: 'menu' },
  { id: 'dan', navSurface: 'bone', nav: 'primary' },
  { id: 'karta', navSurface: 'bone', nav: 'primary' },
  { id: 'potpis', navSurface: 'bone', nav: 'menu' },
  { id: 'galerija', navSurface: 'bone', nav: 'primary' },
  { id: 'ljudi', navSurface: 'bone', nav: 'menu' },
  { id: 'recenzije', navSurface: 'bone', nav: 'menu' },
  { id: 'kontakt', navSurface: 'bone', nav: 'primary' },
] as const;

/**
 * The sections that actually rendered, filtered to a nav level.
 *
 * Page.astro passes the set of ids it rendered. A nav derived from what
 * rendered can never link to a section that is not on the page, which is what
 * makes the empty-collection behaviour of the later sections safe by
 * construction rather than by remembering.
 */
export function visibleSections(
  present: ReadonlySet<SectionId>,
  level: 'primary' | 'menu',
): SectionDef[] {
  return SECTIONS.filter(
    (s) => present.has(s.id) && (level === 'menu' || s.nav === 'primary'),
  );
}
