import { createHeroFrames } from './hero-frames';
import { motion, onSection } from './motion';

export function initHero(root: HTMLElement): void {
  const m = motion();
  if (!m) return;
  const { gsap } = m;

  const matte = root.querySelector<HTMLElement>('#matte');
  const coast = root.querySelector<SVGUseElement>('#coast');
  // Document-level, not hero-level: the coastline is defined once per page by
  // SyrosPath.astro because the Siros section draws it too. Only its LENGTH is
  // read here, to set up the stroke that draws the shape on.
  const source = document.querySelector<SVGPathElement>('#syros');
  // The hole in the mask and the coastline drawn over it are two references to
  // the same shape, so they have to be scaled as one.
  const isle = root.querySelectorAll<SVGGElement>('.isle');
  const survey = root.querySelector<HTMLElement>('#survey');
  const ro1 = root.querySelector<HTMLElement>('#ro1');
  const ro2 = root.querySelector<HTMLElement>('#ro2');
  const hb1 = root.querySelector<HTMLElement>('#hb1');
  const hb2 = root.querySelector<HTMLElement>('#hb2');
  if (!matte || !coast || !source || !survey || !ro1 || !ro2 || !hb1 || !hb2) return;
  if (isle.length !== 2) return;

  const hero = root;

  // Grow the hole, not the picture. Syros is centred, so 14x clears the far
  // corner of a 1920x900 viewport — a narrow shape needs more than a wide one.
  //
  // This scales the island inside the SVG rather than the .matte element:
  // scaling the element scales the masked wall with it, and at 14x that is a
  // raster surface the compositor will not allocate — which is what left the
  // wall in fragments after a scroll to the bottom and back. svgOrigin is the
  // viewBox centre, which is where the element used to scale from.
  gsap.fromTo(
    isle,
    { scale: 1 },
    {
      scale: 14,
      svgOrigin: '500 807.1',
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

  // Two windows: glasses in→clink (frames 0…enter-1), then out→empty
  // (frames enter…count-1). They join on the same clinked frame.
  const canvas = root.querySelector<HTMLCanvasElement>('.scene-canvas');
  const count = Number(canvas?.dataset.count ?? 0);
  const enter = Number(canvas?.dataset.enter ?? 0);
  if (canvas && count > 0 && enter > 0 && enter < count) {
    const frames = createHeroFrames(canvas, count);
    void frames.load().then(() => frames.drawIndex(0));
    gsap.to(
      {},
      {
        ease: 'none',
        scrollTrigger: {
          trigger: hero,
          start: '42% top',
          end: '70% top',
          scrub: 1.1,
          onUpdate: (self) => frames.drawIndex(Math.round(self.progress * (enter - 1))),
        },
      },
    );
    gsap.to(
      {},
      {
        ease: 'none',
        scrollTrigger: {
          trigger: hero,
          start: '70% top',
          end: '98% top',
          scrub: 1.1,
          onUpdate: (self) => frames.drawIndex(enter + Math.round(self.progress * (count - enter - 1))),
        },
      },
    );
    let raf = 0;
    window.addEventListener('resize', () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => frames.resize());
    });
  }
}

onSection('hero', initHero);
