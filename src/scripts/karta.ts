import { motion, onSection } from './motion';

export function initKarta(root: HTMLElement): void {
  const m = motion();
  if (!m) return;
  const { gsap } = m;

  // The crop is a fixed-position sibling of the section, not a child of it.
  const crop = document.getElementById('crop');
  if (!crop) return;
  const inner = crop.firstElementChild as HTMLElement | null;
  if (!inner) return;

  const qx = gsap.quickTo(crop, 'left', { duration: 0.5, ease: 'power3' });
  const qy = gsap.quickTo(crop, 'top', { duration: 0.5, ease: 'power3' });

  root.querySelectorAll<HTMLElement>('.row').forEach((row) => {
    row.addEventListener('mouseenter', () => {
      inner.style.background = row.dataset.crop ?? '';
      gsap.to(crop, { opacity: 1, duration: 0.35 });
    });
    row.addEventListener('mouseleave', () => {
      gsap.to(crop, { opacity: 0, duration: 0.3 });
    });
  });

  addEventListener(
    'mousemove',
    (e) => {
      qx(e.clientX + 130);
      qy(e.clientY);
    },
    { passive: true },
  );
}

onSection('karta', initKarta);
