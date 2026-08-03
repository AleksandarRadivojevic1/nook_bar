/**
 * The hero wall as a bitmap, for phones.
 *
 * The SVG matte scales geometry INSIDE the svg, which means Chrome re-rasterises
 * the whole hero layer every scrub frame — measured at ~21ms/frame of raster on
 * a throttled phone profile, and 62% of the section's total. Neither the mask
 * nor the coastline stroke is the cost on its own; removing either alone changes
 * almost nothing, and removing both matches deleting the matte outright. It is
 * the per-frame re-raster of animated vector content.
 *
 * A canvas does not have that problem: the wall is painted once and the reveal
 * is a transform on a finished texture, which the compositor scales for free.
 * Same measurement, same scroll: 1969ms -> 121ms.
 *
 * Desktop keeps the SVG. It has the headroom, the coastline draws itself on
 * there, and the stroke stays hairline at any scale — neither survives baking.
 */

/** Bitmap scale over the island's own box, so the early reveal has resolution to magnify into. */
const OVERSAMPLE = 2;
/** Hard ceiling on the backing store, in megapixels — a phone pays for this in memory. */
const MAX_MEGAPIXELS = 4;

export interface BitmapMatte {
  /** 1 = at rest, 14 = fully open. */
  setScale(scale: number): void;
  destroy(): void;
}

/**
 * Replaces the SVG inside `matte` with an equivalent canvas. Returns null if
 * anything it needs is missing, in which case the caller keeps the SVG.
 */
export function createBitmapMatte(matte: HTMLElement): BitmapMatte | null {
  const svg = matte.querySelector<SVGSVGElement>('svg');
  const source = document.querySelector<SVGPathElement>('#syros');
  const d = source?.getAttribute('d');
  if (!svg || !d || typeof Path2D === 'undefined') return null;

  const canvas = document.createElement('canvas');
  canvas.className = 'matte-raster';
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const bone =
    getComputedStyle(document.documentElement).getPropertyValue('--bone').trim() || '#F2ECE1';
  const island = new Path2D(d);

  /**
   * The wall has to cover the viewport at rest, and the island's box does not —
   * it is 124vw wide but shorter than a phone screen. So the canvas is the
   * island's box grown until it covers the screen with margin, with the island
   * punched out at its original size, still centred on the box's centre. That
   * centre is also the svgOrigin the SVG version scaled from, so the reveal
   * pivots identically.
   */
  function draw(): void {
    const box = matte.getBoundingClientRect();
    if (!box.width || !box.height) return;

    const cover = Math.max(
      1,
      (window.innerWidth * 1.15) / box.width,
      (window.innerHeight * 1.15) / box.height,
    );
    const cssW = box.width * cover;
    const cssH = box.height * cover;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const wanted = dpr * OVERSAMPLE;
    // Only the coastline edge needs the resolution; the wall around it is flat
    // colour, so a canvas grown to cover the screen must not scale its pixel
    // budget with it.
    const capped = Math.min(wanted, Math.sqrt((MAX_MEGAPIXELS * 1e6) / (cssW * cssH)));

    canvas.width = Math.round(cssW * capped);
    canvas.height = Math.round(cssH * capped);
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;

    ctx!.setTransform(1, 0, 0, 1, 0, 0);
    ctx!.clearRect(0, 0, canvas.width, canvas.height);
    ctx!.fillStyle = bone;
    ctx!.fillRect(0, 0, canvas.width, canvas.height);

    // Punch the island, positioned and sized exactly as the SVG had it: the
    // viewBox is 1000 x 1614.2 mapped onto the matte's own box, centred.
    const unit = (box.width * capped) / 1000;
    const offsetX = (canvas.width - 1000 * unit) / 2;
    const offsetY = (canvas.height - 1614.2 * unit) / 2;
    ctx!.setTransform(unit, 0, 0, unit, offsetX, offsetY);
    ctx!.globalCompositeOperation = 'destination-out';
    ctx!.fill(island);
    ctx!.globalCompositeOperation = 'source-over';
  }

  draw();
  svg.style.display = 'none';
  matte.append(canvas);

  // Rotating a phone changes both the island's box and the area to cover.
  let redraw = 0;
  const onResize = () => {
    cancelAnimationFrame(redraw);
    redraw = requestAnimationFrame(draw);
  };
  window.addEventListener('resize', onResize);

  return {
    setScale(scale: number) {
      canvas.style.transform = `scale(${scale})`;
    },
    destroy() {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(redraw);
      canvas.remove();
      svg.style.display = '';
    },
  };
}
