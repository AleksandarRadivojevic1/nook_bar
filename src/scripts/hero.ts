import { motion, onSection } from './motion';

export function initHero(root: HTMLElement): void {
  const m = motion();
  if (!m) return;
  const { gsap } = m;

  const matte = root.querySelector<SVGElement>('#matte');
  const coast = root.querySelector<SVGUseElement>('#coast');
  const source = root.querySelector<SVGPathElement>('#syros');
  const survey = root.querySelector<HTMLElement>('#survey');
  const ro1 = root.querySelector<HTMLElement>('#ro1');
  const ro2 = root.querySelector<HTMLElement>('#ro2');
  const hb1 = root.querySelector<HTMLElement>('#hb1');
  const hb2 = root.querySelector<HTMLElement>('#hb2');
  if (!matte || !coast || !source || !survey || !ro1 || !ro2 || !hb1 || !hb2) return;

  const hero = root;

  // Scale the wall, not the picture. Syros is centred, so 14x clears the far
  // corner of a 1920x900 viewport — a narrow shape needs more than a wide one.
  gsap.fromTo(
    matte,
    { scale: 1 },
    {
      scale: 14,
      ease: 'power1.in',
      scrollTrigger: { trigger: hero, start: 'top top', end: '42% top', scrub: 0.6 },
    },
  );

  // The coastline draws itself on, then rides out with the wall.
  const len = source.getTotalLength();
  gsap.set(coast, { strokeDasharray: len, strokeDashoffset: len });
  gsap.to(coast, {
    strokeDashoffset: 0,
    ease: 'none',
    scrollTrigger: { trigger: hero, start: 'top top', end: '13% top', scrub: 0.7 },
  });
  gsap.to(coast, {
    opacity: 0,
    ease: 'none',
    scrollTrigger: { trigger: hero, start: '23% top', end: '36% top', scrub: 0.5 },
  });

  // The survey field fades as the wall opens past it.
  gsap.to(survey, {
    opacity: 0,
    ease: 'none',
    scrollTrigger: { trigger: hero, start: '12% top', end: '31% top', scrub: 0.5 },
  });

  // Readouts flip to light once there is more room than wall behind them.
  m.ScrollTrigger.create({
    trigger: hero,
    start: '21% top',
    end: '42% top',
    onToggle: (self) => {
      ro1.classList.toggle('on-dark', self.isActive);
      ro2.classList.toggle('on-dark', self.isActive);
    },
  });
  gsap.to([ro1, ro2], {
    opacity: 0,
    ease: 'none',
    scrollTrigger: { trigger: hero, start: '38% top', end: '48% top', scrub: 0.4 },
  });

  // Block 1 clears out well before the room is open.
  gsap.to(hb1, {
    y: -90,
    opacity: 0,
    ease: 'none',
    scrollTrigger: { trigger: hero, start: 'top top', end: '20% top', scrub: 0.5 },
  });

  // Block 2 arrives once there is a room to sit in.
  gsap.fromTo(
    hb2,
    { opacity: 0, y: 40 },
    {
      opacity: 1,
      y: 0,
      ease: 'none',
      scrollTrigger: { trigger: hero, start: '34% top', end: '48% top', scrub: 0.5 },
    },
  );
}

onSection('hero', initHero);
