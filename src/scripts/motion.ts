import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

let booted: { gsap: typeof gsap; ScrollTrigger: typeof ScrollTrigger } | null = null;

/**
 * Creates the page-wide smooth-scroll and GSAP wiring once, or returns null
 * when the visitor asked for reduced motion. Section modules must treat null
 * as "do nothing" — the finished state is already in CSS.
 */
export function motion() {
  if (prefersReducedMotion()) return null;
  if (booted) return booted;

  gsap.registerPlugin(ScrollTrigger);

  const lenis = new Lenis({ duration: 0.9, smoothWheel: true, syncTouch: false });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);

  (window as any).__lenis = lenis;
  (window as any).__motionBoots = ((window as any).__motionBoots ?? 0) + 1;
  document.documentElement.dataset.motion = 'on';

  booted = { gsap, ScrollTrigger };
  return booted;
}

/** Runs `init` against every root marked with the given section name. */
export function onSection(name: string, init: (root: HTMLElement) => void): void {
  document.querySelectorAll<HTMLElement>(`[data-section="${name}"]`).forEach(init);
}
