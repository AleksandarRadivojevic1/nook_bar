import { motion } from './motion';

/**
 * In-page links (nav, footer, hero CTA) glide through Lenis with an offset for
 * the fixed nav, instead of the browser's hard jump — a native anchor jump
 * bypasses the smooth scroller entirely and read as abrupt against everything
 * else. With reduced motion there is no Lenis, so it falls back to an instant
 * jump that still clears the nav.
 */
export function initAnchors(): void {
  motion(); // ensure the scroller is booted; sets window.__lenis when motion is on
  const lenis = (window as unknown as { __lenis?: { scrollTo: (t: Element, o?: object) => void } })
    .__lenis;

  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((link) => {
    const id = link.getAttribute('href')!.slice(1);
    if (!id) return; // bare "#" placeholders (social links) are left alone

    link.addEventListener('click', (event) => {
      const target = document.getElementById(id);
      if (!target) return;
      event.preventDefault();
      const offset = -((document.getElementById('nav')?.offsetHeight ?? 0) + 8);

      if (lenis) {
        lenis.scrollTo(target, { offset, duration: 1.1 });
      } else {
        const y = target.getBoundingClientRect().top + window.scrollY + offset;
        window.scrollTo({ top: y, behavior: 'auto' });
      }
    });
  });
}

initAnchors();
