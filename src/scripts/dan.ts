import { motion, onSection } from './motion';

/**
 * The route is ONE continuous draw, matching the reference implementation:
 * a single strokeDashoffset tween with ease 'none' and scrub, spanning the
 * whole section.
 *
 * It is deliberately NOT a timeline of "travel to card, hold, travel to next".
 * That version drew in bursts — fast between cards, frozen at them — which is
 * what made it feel unnatural. The cards now come in on their own as they are
 * reached, and the line simply keeps going.
 */
export function initDan(root: HTMLElement): void {
  const m = motion();
  if (!m) return;
  const { gsap } = m;

  const route = root.querySelector<SVGPathElement>('#jroute');
  const stage = root.querySelector<HTMLElement>('#jstage');
  if (!route || !stage) return;

  // There is no travelling dot and no dashed preview of the route — the
  // reference has neither. The only dot is the pin already sitting on
  // Leskovac, which the line grows towards and meets at the end.
  const len = route.getTotalLength();
  gsap.set(route, { strokeDasharray: len, strokeDashoffset: len });

  gsap.to(route, {
    strokeDashoffset: 0,
    ease: 'none',
    scrollTrigger: {
      trigger: stage,
      start: 'top 40%',
      // Ends while the stage bottom is still BELOW the fold (>100%), which
      // puts the pin around the middle of the viewport at the moment the line
      // lands. At 'bottom 90%' the arrival happened with the pin ~150px from
      // the top of the screen — you were almost past it before it finished.
      end: 'bottom 125%',
      scrub: true,
    },
  });

  // Cards develop in as they are reached — their own trigger, played at their
  // own speed, not welded to the scroll position of the line.
  root.querySelectorAll<HTMLElement>('.j-item').forEach((card) => {
    const veil = card.querySelector('.j-media-veil');
    const num = card.querySelector('.j-num');
    const tl = gsap.timeline({
      defaults: { ease: 'power2.out' },
      scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play none none reverse' },
    });
    tl.fromTo(card, { y: 34, opacity: 0.25 }, { y: 0, opacity: 1, duration: 0.7 })
      .to(veil, { opacity: 0, duration: 0.9 }, 0.05)
      .fromTo(
        num,
        { scale: 0.35, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(2.2)' },
        0.25,
      );
  });

  // The pin is not animated in: it sits on Leskovac the whole time, and the
  // line arrives at it. Only the closing line of copy fades up.
  const arrive = root.querySelector('#jarrive');
  if (arrive) {
    gsap.fromTo(
      arrive,
      { y: 20, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        duration: 0.55,
        scrollTrigger: { trigger: stage, start: 'bottom 118%', toggleActions: 'play none none reverse' },
      },
    );
  }
}

onSection('dan', initDan);
