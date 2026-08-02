import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

let booted: { gsap: typeof gsap; ScrollTrigger: typeof ScrollTrigger; lenis: Lenis } | null = null;

/**
 * Creates the page-wide smooth-scroll and GSAP wiring once, or returns null
 * when the visitor asked for reduced motion. Section modules must treat null
 * as "do nothing" — the finished state is already in CSS.
 */
export function motion() {
  if (prefersReducedMotion()) return null;
  if (booted) return booted;

  gsap.registerPlugin(ScrollTrigger);

  // A slightly longer glide on an expo-out curve reads as weighted rather than
  // slippery, and easing back the wheel step keeps a single notch from
  // overshooting the scrubbed hero. Touch is left native (syncTouch:false) so
  // phones keep their own inertia; the multiplier only nudges its pace.
  const lenis = new Lenis({
    duration: 1.15,
    easing: (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    syncTouch: false,
    wheelMultiplier: 0.9,
    touchMultiplier: 1.4,
  });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  (window as any).__lenis = lenis;
  (window as any).__motionBoots = ((window as any).__motionBoots ?? 0) + 1;
  document.documentElement.dataset.motion = 'on';

  // Jost/Instrument Sans arrive after first paint and change the page height.
  // ScrollTrigger caches maxScroll on refresh, so without this any trigger
  // ending at 'max' — the nav's footer surfaces — is computed against a
  // shorter document and never fires.
  document.fonts?.ready.then(() => {
    ScrollTrigger.refresh();
    document.documentElement.dataset.motionRefreshed = 'on';
  });

  booted = { gsap, ScrollTrigger, lenis };
  return booted;
}

/** Runs `init` against every root marked with the given section name. */
export function onSection(name: string, init: (root: HTMLElement) => void): void {
  document.querySelectorAll<HTMLElement>(`[data-section="${name}"]`).forEach(init);
}
