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
  const set = window.matchMedia('(max-width: 760px)').matches ? 'mob' : 'desk';
  const urls = Array.from(
    { length: count },
    (_, i) => `/hero/frames/${set}/f_${String(i + 1).padStart(3, '0')}.webp`,
  );
  const imgs: Array<HTMLImageElement | undefined> = new Array(count);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let current = -1;

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

  const draw = (progress: number) => {
    current = frameIndex(progress, count);
    paint(current);
  };

  // Paint an absolute frame index, clamped. Used to drive two scroll windows
  // (the glasses in, then out) from different frame ranges of one sequence.
  const drawIndex = (i: number) => {
    current = i < 0 ? 0 : i > count - 1 ? count - 1 : i;
    paint(current);
  };

  const load = () =>
    new Promise<void>((resolve) => {
      let started = false;
      if (urls.length === 0) {
        resolve();
        return;
      }
      urls.forEach((url, i) => {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => {
          imgs[i] = img;
          if (!started) {
            started = true;
            resolve(); // start as soon as any frame is ready; the rest fill in
          }
          if (i === current) paint(i);
        };
        img.src = url;
      });
    });

  resize();
  return { load, draw, drawIndex, resize };
}
