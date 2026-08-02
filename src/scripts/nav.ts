import { motion } from './motion';

/**
 * The nav reads each section's declared surface rather than hardcoding
 * selectors, so a future gallery or Instagram section only has to set
 * data-nav-surface to take part.
 */
/**
 * The mobile menu. Wired before the scroll work and independently of it: below
 * 720px this is the only way to reach the sections, so it has to survive a
 * missing motion layer.
 */
function initMenu(nav: HTMLElement): void {
  const toggle = nav.querySelector<HTMLButtonElement>('.nav-toggle');
  const menu = document.getElementById('navmenu');
  if (!toggle || !menu) return;

  const links = Array.from(menu.querySelectorAll<HTMLAnchorElement>('a'));

  const setOpen = (open: boolean, restoreFocus = true) => {
    if (open === (toggle.getAttribute('aria-expanded') === 'true')) return;
    toggle.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('nav-menu-open', open);

    if (open) {
      menu.hidden = false;
      // Next frame, so the transition has a start state to animate from.
      requestAnimationFrame(() => menu.classList.add('is-open'));
      links[0]?.focus();
    } else {
      menu.classList.remove('is-open');
      menu.hidden = true;
      if (restoreFocus) toggle.focus();
    }
  };

  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  // Anchors close it themselves: the panel covers the page it is scrolling to.
  links.forEach((a) => a.addEventListener('click', () => setOpen(false, false)));

  document.addEventListener('keydown', (e) => {
    if (menu.hidden) return;
    if (e.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (e.key !== 'Tab') return;
    // Keep Tab inside the panel: it covers the page, so anything behind it is
    // a focus stop the visitor cannot see.
    const focusables = [toggle, ...links];
    const i = focusables.indexOf(document.activeElement as HTMLAnchorElement);
    if (i === -1) return;
    const next = e.shiftKey ? i - 1 : i + 1;
    if (next < 0 || next >= focusables.length) {
      e.preventDefault();
      focusables[e.shiftKey ? focusables.length - 1 : 0].focus();
    }
  });

  // Crossing back above the breakpoint with the panel open would leave a
  // full-screen overlay with no visible way to dismiss it.
  const wide = window.matchMedia('(min-width: 721px)');
  wide.addEventListener('change', (e) => {
    if (e.matches) setOpen(false, false);
  });
}

/**
 * Marks the nav link for whichever section owns the middle of the viewport.
 *
 * Uses aria-current rather than a class alone so the state is announced, not
 * just drawn — on a page this long "where am I" is a real question, and it was
 * previously unanswerable.
 *
 * Runs regardless of reduced motion: this is orientation, not decoration.
 */
function trackActiveSection(): void {
  const links = new Map<string, HTMLAnchorElement>();
  document.querySelectorAll<HTMLAnchorElement>('[data-nav-link]').forEach((a) => {
    const id = a.dataset.navLink;
    if (id && !links.has(id)) links.set(id, a);
  });
  if (!links.size) return;

  const mark = (id: string | null) => {
    links.forEach((a, key) => {
      if (key === id) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const hit = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (hit) mark(hit.target.getAttribute('data-section'));
    },
    // A band across the middle of the viewport: the section under the reader's
    // eye, not whichever one merely touches the top edge.
    { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
  );

  document.querySelectorAll('[data-section]').forEach((el) => observer.observe(el));
}

export function initNav(): void {
  const nav = document.getElementById('nav');
  if (!nav) return;

  initMenu(nav);
  trackActiveSection();

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
