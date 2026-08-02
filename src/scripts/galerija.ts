import gsapFallback from 'gsap';
import { createGalleryGL, type GalleryGL } from './gallery-gl';
import { createGalleryModal, type ModalItem } from './gallery-modal';
import { motion, onSection, prefersReducedMotion } from './motion';
import { advanceBulge, bulgeTarget } from './wave';

/** WebGL is required for the bulge; without it the CSS grid stands on its own. */
function hasWebGL(): boolean {
  try {
    const probe = document.createElement('canvas');
    return Boolean(probe.getContext('webgl2') || probe.getContext('webgl'));
  } catch {
    return false;
  }
}

/**
 * Two layers, one section.
 *
 * The lightbox is wired first and always: it is plain DOM driven by the tile
 * buttons, so it works with no WebGL, no motion, and keyboard only.
 *
 * On top of that — only when motion is allowed and WebGL is available — the
 * markup grid is folded away and replaced by a canvas whose photos bulge toward
 * the camera as the page scrolls. Clicks on the canvas are mapped back to a
 * photo index and open the same lightbox.
 */
export function initGalerija(root: HTMLElement): void {
  const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>('.g-open'));
  const modalEl = document.querySelector<HTMLElement>('.g-modal');
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

  if (!m) return;
  const { ScrollTrigger, lenis } = m;

  const canvas = root.querySelector<HTMLCanvasElement>('.g-canvas');
  const stage = root.querySelector<HTMLElement>('.g-stage');
  const images = Array.from(root.querySelectorAll<HTMLImageElement>('.g-img'));
  if (!canvas || !stage || images.length === 0 || !hasWebGL()) return;

  // Reveal the stage before measuring — the canvas needs its laid-out size.
  root.classList.add('is-webgl');

  let scene: GalleryGL;
  try {
    scene = createGalleryGL(canvas, images);
  } catch (err) {
    // A context that refuses to build is not worth breaking the section over,
    // but it should never fail silently either.
    console.warn('[galerija] WebGL layer unavailable, falling back to the grid', err);
    root.classList.remove('is-webgl');
    return;
  }

  // The stage has to be as tall as this breakpoint's grid needs; the layout
  // math in the scene is the only thing that knows how many rows there are.
  const sizeStage = () => {
    stage.style.height = scene.stageVh().toFixed(1) + 'vh';
  };
  sizeStage();

  // Drives the grid's vertical travel across the pinned stage.
  ScrollTrigger.create({
    trigger: stage,
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: (self) => scene.setScroll(self.progress),
  });

  // Gates the render loop on a wider window than the stage itself, so the grid
  // is already composed when it scrolls into view rather than popping in.
  let active = false;
  ScrollTrigger.create({
    trigger: stage,
    start: 'top bottom',
    end: 'bottom top',
    onToggle: (self) => {
      active = self.isActive;
    },
  });

  canvas.addEventListener('click', (e) => {
    // A click that lands while the grid is still flying is a scroll, not a pick.
    if (Math.abs(lenis.velocity) > 12) return;
    const hit = scene.hitTest(e.clientX, e.clientY);
    if (hit !== null) modal.open(hit);
  });

  canvas.addEventListener('pointermove', (e) => {
    const over = scene.hitTest(e.clientX, e.clientY) !== null;
    canvas.style.cursor = over ? 'pointer' : '';
  });

  let bulge = 0;
  g.ticker.add(() => {
    if (!active) return;
    // A frozen backdrop reads better than a grid drifting under the lightbox.
    if (!modal.isOpen()) {
      bulge = advanceBulge(bulge, bulgeTarget(lenis.velocity));
      scene.setBulge(bulge);
    }
    scene.render();
  });

  let raf = 0;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      scene.resize();
      // Order matters: the stage must be its new height before ScrollTrigger
      // measures, or every trigger below the gallery lands at the old offset.
      sizeStage();
      ScrollTrigger.refresh();
    });
  });
}

onSection('galerija', initGalerija);
