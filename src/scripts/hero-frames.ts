import { frameIndex } from './frame-index';

export interface HeroFrames {
  load(): Promise<void>;
  draw(progress: number): void;
  drawIndex(i: number): void;
  resize(): void;
}

/**
 * A scroll-scrubbed image-sequence player. Preloads `count` webp frames (the
 * desktop or mobile set by viewport) and draws the frame for a given progress
 * to `canvas`, cover-fit and centre-anchored so the centre-stage clink survives
 * a portrait crop. Never plays on its own — `draw` is called from scroll.
 */
export function createHeroFrames(canvas: HTMLCanvasElement, count: number): HeroFrames {
  const ctx = canvas.getContext('2d');
  const isMobile = window.matchMedia('(max-width: 760px)').matches;
  const set = isMobile ? 'mob' : 'desk';
  const urls = Array.from(
    { length: count },
    (_, i) => `/hero/frames/${set}/f_${String(i + 1).padStart(3, '0')}.webp`,
  );
  const imgs: Array<HTMLImageElement | undefined> = new Array(count);
  const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1 : 2);
  // Decoded, every mobile frame is ~1.6 MB — 132 of them (~215 MB) blow past
  // what the phone will cache, so it re-decodes on every scrub and stutters.
  // Load every 2nd frame there; nearestLoaded paints the gaps.
  const stride = isMobile ? 2 : 1;
  let current = -1;
  let pending = -1;
  let rafId = 0;

  // The nearest loaded frame to `i`, so scrolling ahead of the preload still
  // paints something rather than a blank canvas.
  const nearestLoaded = (i: number): HTMLImageElement | undefined => {
    if (imgs[i]) return imgs[i];
    for (let d = 1; d < count; d++) {
      if (imgs[i - d]) return imgs[i - d];
      if (imgs[i + d]) return imgs[i + d];
    }
    return undefined;
  };

  const paint = (i: number) => {
    if (!ctx) return;
    const img = nearestLoaded(i);
    if (!img) return;
    const cw = canvas.width;
    const ch = canvas.height;
    const ir = img.width / img.height;
    const cr = cw / ch;
    let dw: number;
    let dh: number;
    if (ir > cr) {
      dh = ch;
      dw = ch * ir;
    } else {
      dw = cw;
      dh = cw / ir;
    }
    ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    canvas.dataset.frame = String(i);
    canvas.style.opacity = '1';
  };

  const resize = () => {
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
    if (current >= 0) paint(current);
  };

  // Coalesce paint requests to one per display frame and drop repeats: scroll
  // fires far more often than the screen refreshes, and the cover-fit drawImage
  // is the mobile cost.
  const schedule = (i: number) => {
    pending = i;
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      rafId = 0;
      if (pending !== current) paint(pending);
    });
  };

  const draw = (progress: number) => schedule(frameIndex(progress, count));

  // Paint an absolute frame index, clamped. Used to drive two scroll windows
  // (the glasses in, then out) from different frame ranges of one sequence.
  const drawIndex = (i: number) => schedule(i < 0 ? 0 : i > count - 1 ? count - 1 : i);

  const load = () =>
    new Promise<void>((resolve) => {
      let started = false;
      if (urls.length === 0) {
        resolve();
        return;
      }
      urls.forEach((url, i) => {
        // Keep frame 0 and the last frame regardless, so both ends stay crisp.
        if (stride > 1 && i % stride !== 0 && i !== count - 1) return;
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => {
          imgs[i] = img;
          if (!started) {
            started = true;
            resolve(); // start as soon as any frame is ready; the rest fill in
          }
          if (i === pending || i === current) paint(i);
        };
        img.src = url;
      });
    });

  resize();
  return { load, draw, drawIndex, resize };
}
