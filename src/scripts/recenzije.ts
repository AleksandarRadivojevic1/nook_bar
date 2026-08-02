import { motion, onSection } from './motion';

const OLIVE = (() => {
  const leaf = 'M0 0C13-9 33-9 46 0C33 9 13 9 0 0Z';
  const leaves = [
    [46, 126, -40],
    [63, 102, -150],
    [80, 79, -34],
    [97, 57, -144],
    [115, 38, -28],
  ]
    .map(([x, y, r]) => `<path d="${leaf}" transform="translate(${x} ${y}) rotate(${r})"/>`)
    .join('');
  return `<svg width="176" height="176" viewBox="0 0 176 176">
    <path d="M26 154C50 122 76 90 102 60c12-14 24-25 36-34"/>${leaves}
    <ellipse cx="74" cy="118" rx="7" ry="9" transform="rotate(-22 74 118)"/>
    <ellipse cx="104" cy="84" rx="6.5" ry="8.5" transform="rotate(-22 104 84)"/></svg>`;
})();

const CITRUS = `<svg width="150" height="150" viewBox="0 0 150 150">
  <circle cx="75" cy="75" r="66"/><circle cx="75" cy="75" r="55"/>
  ${Array.from({ length: 9 }, (_, i) => {
    const a = (i * 2 * Math.PI) / 9;
    return `<path d="M${(75 + 9 * Math.cos(a)).toFixed(1)} ${(75 + 9 * Math.sin(a)).toFixed(1)} L${(75 + 52 * Math.cos(a)).toFixed(1)} ${(75 + 52 * Math.sin(a)).toFixed(1)}"/>`;
  }).join('')}
  <circle cx="75" cy="75" r="9"/></svg>`;

/** Ornaments only. The auto-advancing carousel was deleted, not repaired. */
export function initRecenzije(root: HTMLElement): void {
  const m = motion();
  if (!m) return;

  const { gsap } = m;
  const ornaments = [...root.querySelectorAll<HTMLElement>('.rev-orn')];
  if (ornaments[0]) ornaments[0].innerHTML = OLIVE;
  if (ornaments[1]) ornaments[1].innerHTML = CITRUS;
  ornaments.forEach((el, i) => {
    gsap.set(el, { rotate: i ? 8 : -12 });
    gsap.to(el, {
      y: i ? -18 : 16,
      rotate: i ? 2 : -6,
      duration: 7 + i * 1.6,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });
    gsap.fromTo(
      el,
      { yPercent: 14 },
      {
        yPercent: -14,
        ease: 'none',
        scrollTrigger: { trigger: root, start: 'top bottom', end: 'bottom top', scrub: 1 },
      },
    );
  });
}

onSection('recenzije', initRecenzije);
