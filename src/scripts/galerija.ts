import gsapFallback from 'gsap';
import { createGalleryModal, type ModalItem } from './gallery-modal';
import { motion, onSection, prefersReducedMotion } from './motion';

/**
 * The gallery lightbox.
 *
 * The photos render as a static two-column layout in the markup; this wires the
 * `.g-open` buttons to a shared lightbox. It is plain DOM — it works with no
 * motion and by keyboard alone. The desktop pin/parallax enhancement layers on
 * top of this in a later step.
 */
export function initGalerija(root: HTMLElement): void {
  const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>('.g-open'));
  const modalEl = document.querySelector<HTMLElement>('#galerija-modal');
  if (buttons.length === 0 || !modalEl) return;

  const items: ModalItem[] = buttons.map((btn) => ({
    full: btn.dataset.full ?? '',
    caption: btn.querySelector('img')?.alt ?? '',
  }));

  const m = motion();

  // Always animate with the instance motion() booted: that is the one driving
  // the shared ticker. A second copy of gsap has its own ticker, and callbacks
  // registered on it never run alongside the page's. The bare import is only a
  // stand-in for the reduced-motion path, where nothing animates anyway.
  const g = m?.gsap ?? gsapFallback;

  const modal = createGalleryModal(modalEl, items, g, {
    reducedMotion: prefersReducedMotion(),
    // Lenis keeps scrolling the page behind a fixed overlay otherwise.
    onOpen: () => m?.lenis.stop(),
    onClose: () => m?.lenis.start(),
  });

  buttons.forEach((btn, i) => {
    btn.addEventListener('click', () => modal.open(i));
  });

  // Desktop + motion only: pin the panel, translate the columns as the section
  // scrolls, and fill the progress rail. Mobile and reduced motion get the
  // static layout — motion() is null under reduced motion, and the width gate
  // keeps phones out. The finished-at-rest state is already in CSS.
  if (m && matchMedia('(min-width: 900px)').matches) {
    const { gsap, ScrollTrigger } = m;
    const cols = Array.from(root.querySelectorAll<HTMLElement>('.g-col'));
    const fill = root.querySelector<HTMLElement>('.g-fill');
    const track = root.querySelector<HTMLElement>('.g-cols');
    if (cols.length === 2 && track && fill) {
      // Travel = how far the taller column must rise to reveal its last photo.
      const travel = () => Math.max(0, track.scrollHeight - window.innerHeight * 0.9);
      ScrollTrigger.create({
        trigger: root,
        start: 'top top',
        end: () => `+=${travel()}`,
        pin: '.g-panel',
        pinSpacing: true,
        scrub: true,
        invalidateOnRefresh: true,
        // This pin inserts a spacer mid-page, so it must refresh before the nav
        // surface triggers below it (footer/ink) or they measure their start/end
        // against a layout without the spacer and never fire. Higher priority
        // refreshes first.
        refreshPriority: 1,
        onUpdate: (self) => {
          const p = self.progress;
          gsap.set(cols[0], { y: -travel() * p });
          gsap.set(cols[1], { y: -travel() * p * 0.86 }); // gentle parallax
          fill.style.width = `${p * 100}%`;
        },
      });
      ScrollTrigger.refresh();
    }
  }
}

onSection('galerija', initGalerija);
