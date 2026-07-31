import { motion, onSection } from './motion';

export function initDan(root: HTMLElement): void {
  const m = motion();
  if (!m) return;
  const { gsap } = m;

  const route = root.querySelector<SVGPathElement>('#jroute');
  const stage = root.querySelector<HTMLElement>('#jstage');
  const tip = root.querySelector<SVGCircleElement>('#jtip');
  const halo = root.querySelector<SVGCircleElement>('#jtiphalo');
  const anchorsEl = root.querySelector<HTMLScriptElement>('#janchors');
  if (!route || !stage || !tip || !halo || !anchorsEl) return;

  const cardAnchors: Array<[number, number]> = JSON.parse(anchorsEl.textContent ?? '[]');
  // The pin's own coordinate closes the route — it is not a card.
  const ANCHORS: Array<[number, number]> = [...cardAnchors, [747.1, 1059.2]];

  const len = route.getTotalLength();
  gsap.set(route, { strokeDasharray: len, strokeDashoffset: len });

  // Find where each anchor falls along the path. The anchors are exact
  // waypoints of the curve, so scanning for the nearest sampled point is
  // accurate to well under a pixel.
  const SAMPLES = 3000;
  const atLen = ANCHORS.map(([ax, ay]) => {
    let best = 0;
    let bestD = Infinity;
    for (let i = 0; i <= SAMPLES; i++) {
      const l = (len * i) / SAMPLES;
      const p = route.getPointAtLength(l);
      const d = (p.x - ax) ** 2 + (p.y - ay) ** 2;
      if (d < bestD) {
        bestD = d;
        best = l;
      }
    }
    return best;
  });

  const prog = { v: 0 };
  const paint = () => {
    const drawn = len * prog.v;
    route.style.strokeDashoffset = (len - drawn).toFixed(1);
    const p = route.getPointAtLength(Math.min(drawn, len));
    tip.setAttribute('cx', p.x.toFixed(1));
    tip.setAttribute('cy', p.y.toFixed(1));
    halo.setAttribute('cx', p.x.toFixed(1));
    halo.setAttribute('cy', p.y.toFixed(1));
  };

  // One scrubbed timeline: travel to a picture, HOLD there while that card
  // comes up, then set off for the next. The holds are what make it read as a
  // journey between the pictures rather than one continuous sweep.
  const items = gsap.utils.toArray<HTMLElement>(root.querySelectorAll('.j-item'));
  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { trigger: stage, start: 'top 78%', end: 'bottom 48%', scrub: 0.55 },
    onUpdate: paint,
  });

  atLen.forEach((l, i) => {
    tl.to(prog, { v: l / len, duration: 1.15 }, 'leg' + i);
    const card = items[i];
    if (card) {
      // The picture develops in as the line touches it.
      tl.to(card.querySelector('.j-media-veil'), { opacity: 0, duration: 0.5 }, 'leg' + i + '+=1.12');
      tl.fromTo(
        card,
        { y: 34, opacity: 0.25 },
        { y: 0, opacity: 1, duration: 0.55 },
        'leg' + i + '+=1.05',
      );
      tl.fromTo(
        card.querySelector('.j-num'),
        { scale: 0.35, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(2.2)' },
        'leg' + i + '+=1.30',
      );
    }
    tl.to(prog, { v: l / len, duration: 0.5 }); // hold at the picture
  });

  // The pin lands only once the line has actually arrived.
  tl.fromTo(
    root.querySelector('.j-pin'),
    { scale: 0 },
    { scale: 1, duration: 0.4, ease: 'back.out(2.4)', transformOrigin: 'center' },
  )
    .fromTo(
      root.querySelector('.j-pin-ring'),
      { scale: 0.3, opacity: 0 },
      { scale: 1, opacity: 0.55, duration: 0.6, transformOrigin: 'center' },
      '<',
    )
    .fromTo(root.querySelector('#jarrive'), { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, '<0.1')
    .to([tip, halo], { opacity: 0, duration: 0.3 }, '<0.2');

  gsap.set([tip, halo], { opacity: 0 });
  m.ScrollTrigger.create({
    trigger: stage,
    start: 'top 78%',
    end: 'bottom 48%',
    onToggle: (self) => gsap.to([tip, halo], { opacity: self.isActive ? 1 : 0, duration: 0.3 }),
  });
}

onSection('dan', initDan);
