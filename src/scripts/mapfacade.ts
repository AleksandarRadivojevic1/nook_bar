/**
 * Swaps the drawing for the real embed, on click only. The iframe is built
 * here rather than sitting in the markup, so nothing can reach Google first.
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
