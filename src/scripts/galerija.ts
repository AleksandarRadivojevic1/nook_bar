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

  // Desktop + motion. CSS position:sticky holds the panel; the two columns are
  // translated at different rates for a no-pin depth parallax.
  if (m && matchMedia('(min-width: 900px)').matches) {
    const { gsap, ScrollTrigger } = m;
    const cols = Array.from(root.querySelectorAll<HTMLElement>('.g-col'));
    const fill = root.querySelector<HTMLElement>('.g-fill');
    if (cols.length === 2 && fill) {
      ScrollTrigger.create({
        trigger: root,
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress;
          fill.style.width = `${p * 100}%`;
          const d = 0.5 - p;
          gsap.set(cols[0], { y: d * 160 });
          gsap.set(cols[1], { y: d * -160 });
        },
      });
    }
  }
}

onSection('galerija', initGalerija);
