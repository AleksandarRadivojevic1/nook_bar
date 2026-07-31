import { motion } from './motion';

/**
 * The nav reads each section's declared surface rather than hardcoding
 * selectors, so a future gallery or Instagram section only has to set
 * data-nav-surface to take part.
 */
export function initNav(): void {
  const nav = document.getElementById('nav');
  if (!nav) return;

  const m = motion();
  if (!m) {
    // Without scroll triggers the nav must still be legible: pin it to the
    // body surface, which is what it sits on for most of the page.
    nav.classList.add('is-solid');
    return;
  }

  const mark = nav.querySelector<HTMLElement>('.nav-mark');
  const hero = document.querySelector<HTMLElement>('[data-nav-surface="dark"]');
  const ink = document.querySelector<HTMLElement>('[data-nav-surface="ink"]');

  if (hero && ink) {
    m.ScrollTrigger.create({
      trigger: hero,
      start: 'bottom 60px',
      endTrigger: ink,
      end: 'top 60px',
      onToggle: (self) => nav.classList.toggle('is-solid', self.isActive),
    });
    // NOT end:'max'. ScrollTrigger's end is exclusive, so a trigger ending at
    // max scroll goes inactive at the exact moment the visitor reaches the
    // bottom of the page — which is where the footer surface matters most.
    // Ending past the document end keeps it active all the way down.
    m.ScrollTrigger.create({
      trigger: ink,
      start: 'top 60px',
      end: () => '+=' + (ink.offsetHeight + window.innerHeight),
      onToggle: (self) => nav.classList.toggle('is-solid-dark', self.isActive),
    });
  }

  if (hero) {
    // The centred mark is over the island for the whole hero, unlike the links.
    m.ScrollTrigger.create({
      trigger: hero,
      start: 'top top',
      end: 'bottom top',
      onToggle: (self) => mark?.classList.toggle('on-dark', self.isActive),
    });
    // Nav flips light over the open room.
    m.ScrollTrigger.create({
      trigger: hero,
      start: '24% top',
      end: 'bottom top',
      onToggle: (self) => nav.classList.toggle('is-dark', self.isActive),
    });
  }

  // The footer is the last thing on the page, so 'bottom bottom' resolves
  // BEFORE the document end and the nav flips back early — and 'max' is
  // exclusive, so it drops out exactly at the bottom. Overshoot instead.
  const footer = document.getElementById('footer');
  if (footer) {
    m.ScrollTrigger.create({
      trigger: footer,
      start: 'top 70%',
      end: () => '+=' + (footer.offsetHeight + window.innerHeight),
      onToggle: (self) => nav.classList.toggle('is-dark', self.isActive),
    });
  }
}

initNav();
