import gsapFallback from 'gsap';
import { createGalleryModal, type ModalItem } from './gallery-modal';
import { motion, onSection, prefersReducedMotion } from './motion';

/**
 * The item popup. Openable rows — those with a photo or a description — reuse
 * the gallery lightbox, filled from the DOM the accordion already rendered.
 * With no JavaScript the rows are still legible; this only adds the lightbox.
 */
export function initKarta(root: HTMLElement): void {
  const modalEl = document.querySelector<HTMLElement>('#karta-modal');
  const rows = Array.from(root.querySelectorAll<HTMLElement>('.k-row.is-openable'));
  if (!modalEl || rows.length === 0) return;

  const items: ModalItem[] = rows.map((row) => ({
    full: row.dataset.full ?? '',
    title: row.querySelector('.k-name')?.firstChild?.textContent?.trim() ?? '',
    meta: row.dataset.meta ?? '',
    caption: row.querySelector('.k-desc')?.textContent?.trim() ?? '',
  }));

  const m = motion();
  const modal = createGalleryModal(modalEl, items, m?.gsap ?? gsapFallback, {
    reducedMotion: prefersReducedMotion(),
    onOpen: () => m?.lenis.stop(),
    onClose: () => m?.lenis.start(),
  });

  rows.forEach((row, i) => row.addEventListener('click', () => modal.open(i)));
}

onSection('karta', initKarta);
