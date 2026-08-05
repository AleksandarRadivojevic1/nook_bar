import { motion } from './motion';

/**
 * The footer panel is full-bleed while you scroll through it, and only when
 * you actually reach the bottom of the page does the frame paint in — the
 * border is the page colour, so the panel appears to shrink and inset itself.
 *
 * That frame is the finished state and lives in CSS. This zeroes it at init
 * and plays it in, so with reduced motion the footer simply renders framed.
 * It is a short timed animation on reaching the end, not a scrub.
 */
export function initFooter(): void {
  const wrap = document.querySelector<HTMLElement>('.footer-wrap');
  const panel = document.querySelector<HTMLElement>('.footer');
  if (!wrap || !panel) return;

  const m = motion();
  if (!m) return;
  const { gsap } = m;

  // Stage one: the wordmark is hidden at rest and rises in once you have
  // scrolled a little way into the footer, ahead of the frame. The hidden
  // state is set here, not in CSS, so with no JS / reduced motion it just
  // shows. It plays before the frame (which fires at the very end below).
  const mark = document.querySelector<HTMLElement>('.footer-mark');
  if (mark) {
    gsap.set(mark, { autoAlpha: 0, yPercent: 45 });
    gsap.to(mark, {
      autoAlpha: 1,
      yPercent: 0,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: wrap,
        start: 'top 30%',
        toggleActions: 'play none none reverse',
      },
    });
  }

  // Read the finished frame out of CSS before rewinding it.
  const cs = getComputedStyle(panel);
  const frame = {
    top: parseFloat(cs.borderTopWidth) || 0,
    side: parseFloat(cs.borderLeftWidth) || 0,
    bottom: parseFloat(cs.borderBottomWidth) || 0,
  };
  if (!frame.top && !frame.side) return;

  gsap.set(panel, {
    borderTopWidth: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderLeftWidth: 0,
  });

  gsap.to(panel, {
    borderTopWidth: frame.top,
    borderRightWidth: frame.side,
    borderBottomWidth: frame.bottom,
    borderLeftWidth: frame.side,
    duration: 0.75,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: wrap,
      // Fires just before the document end rather than exactly at it: a
      // trigger resolving to the precise maximum scroll is unreliable, and
      // the frame should already be arriving as the last pixels land.
      start: 'bottom bottom+=24',
      toggleActions: 'play none none reverse',
    },
  });
}

initFooter();
