/**
 * Swaps the drawn block for the real Google embed, on click and only on click.
 *
 * The iframe is constructed here rather than living in the markup with a
 * data-src, so that before a click there is nothing on the page capable of
 * contacting Google. `tests/e2e/map.spec.ts` asserts that by watching every
 * request the page makes.
 *
 * No motion() involvement: this is navigation, not decoration, so it works
 * identically with reduced motion.
 */
function initMapFacade(figure: HTMLElement): void {
  const button = figure.querySelector<HTMLButtonElement>('.mapf-open');
  const drawing = figure.querySelector<SVGElement>('.mapf-draw');
  const src = figure.dataset.embed;
  if (!button || !drawing || !src) return;

  let loaded = false;

  button.addEventListener('click', () => {
    if (loaded) return;
    loaded = true;

    const frame = document.createElement('iframe');
    frame.className = 'mapf-frame';
    frame.src = src;
    frame.title = figure.dataset.title ?? 'Map';
    frame.loading = 'lazy';
    frame.referrerPolicy = 'no-referrer-when-downgrade';
    frame.setAttribute('allowfullscreen', '');

    drawing.replaceWith(frame);
    // The caption's job is done: the button would now sit over a live map it
    // can no longer load.
    figure.querySelector('.mapf-cap')?.remove();
  });
}

document.querySelectorAll<HTMLElement>('.mapf').forEach(initMapFacade);
