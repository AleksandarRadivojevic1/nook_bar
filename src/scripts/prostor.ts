import { motion, onSection } from './motion';

export function initProstor(root: HTMLElement): void {
  const m = motion();
  if (!m) return;
  const { gsap } = m;

  const p = root.querySelector<HTMLElement>('#manifest');
  if (!p) return;

  p.innerHTML = p
    .textContent!.trim()
    .split(/\s+/)
    .map((w) => `<span class="w">${w}</span>`)
    .join(' ');

  gsap.to(p.querySelectorAll('.w'), {
    opacity: 1,
    ease: 'none',
    stagger: 1,
    scrollTrigger: { trigger: p, start: 'top 80%', end: 'bottom 55%', scrub: 0.4 },
  });
}

onSection('prostor', initProstor);
