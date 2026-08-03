import { motion, onSection } from './motion';

export function initProstor(root: HTMLElement): void {
  const m = motion();
  if (!m) return;
  const { gsap } = m;

  const lines = Array.from(root.querySelectorAll<HTMLElement>('.m-line'));
  if (lines.length === 0) return;

  for (const p of lines) {
    p.innerHTML = p
      .textContent!.trim()
      .split(/\s+/)
      .map((w) => `<span class="w">${w}</span>`)
      .join(' ');
  }

  gsap.to(root.querySelectorAll('.w'), {
    opacity: 1,
    ease: 'none',
    stagger: 1,
    scrollTrigger: { trigger: root, start: 'top 80%', end: 'bottom 55%', scrub: 0.4 },
  });
}

onSection('prostor', initProstor);
