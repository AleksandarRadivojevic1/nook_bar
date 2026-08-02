import { motion, onSection } from './motion';

/**
 * The three signature rows rise in as each is reached — their own trigger,
 * not welded to a single scroll position. Mirrors the Dan cards' behaviour so
 * the two product sections feel of a piece. With reduced motion motion() is
 * null and the finished state in CSS stands.
 */
export function initPotpis(root: HTMLElement): void {
  const m = motion();
  if (!m) return;
  const { gsap } = m;

  root.querySelectorAll<HTMLElement>('.p-drink').forEach((row) => {
    gsap.from(row, {
      y: 44,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: { trigger: row, start: 'top 84%', toggleActions: 'play none none reverse' },
    });
  });
}

onSection('potpis', initPotpis);
