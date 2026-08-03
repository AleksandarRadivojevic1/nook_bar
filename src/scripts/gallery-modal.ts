import type gsapType from 'gsap';

export interface ModalItem {
  full: string;
  caption: string;
  /** Optional, filled only when the modal markup has the slots for them. */
  title?: string;
  meta?: string;
}

export interface GalleryModal {
  open(index: number): void;
  close(): void;
  isOpen(): boolean;
}

/**
 * The lightbox behind the gallery. It is plain DOM on purpose: the WebGL layer
 * raycasts into it, but so does the fallback grid, so a visitor without WebGL
 * or with reduced motion gets the same lightbox from the same markup.
 *
 * The caption animates a word at a time. GSAP's SplitText is a paid plugin, so
 * the split is done here — it is only ever a short caption.
 */
export function createGalleryModal(
  modal: HTMLElement,
  items: ModalItem[],
  gsap: typeof gsapType,
  opts: { onOpen?: () => void; onClose?: () => void; reducedMotion?: boolean } = {},
): GalleryModal {
  const img = modal.querySelector<HTMLImageElement>('.g-modal-img');
  const caption = modal.querySelector<HTMLElement>('.g-modal-caption');
  // Optional: present in the karta lightbox, absent in the gallery's own.
  const titleEl = modal.querySelector<HTMLElement>('.g-modal-title');
  const metaEl = modal.querySelector<HTMLElement>('.g-modal-meta');
  const closeBtn = modal.querySelector<HTMLButtonElement>('.g-modal-close');
  const prevBtn = modal.querySelector<HTMLButtonElement>('.g-modal-prev');
  const nextBtn = modal.querySelector<HTMLButtonElement>('.g-modal-next');
  if (!img || !caption || !closeBtn || !prevBtn || !nextBtn) {
    throw new Error('gallery modal is missing its parts');
  }

  const still = opts.reducedMotion === true;
  let index = 0;
  let open = false;
  let lastFocused: HTMLElement | null = null;

  /** Rebuilds the caption as word spans so they can be staggered. */
  function setCaption(text: string): HTMLElement[] {
    caption!.textContent = '';
    const words = text.split(/\s+/).filter(Boolean);
    return words.map((word, i) => {
      const outer = document.createElement('span');
      outer.className = 'g-word';
      const inner = document.createElement('span');
      inner.textContent = i === words.length - 1 ? word : `${word} `;
      outer.appendChild(inner);
      caption!.appendChild(outer);
      return inner;
    });
  }

  function show(i: number, firstOpen: boolean): void {
    index = (i + items.length) % items.length;
    const item = items[index];
    img!.src = item.full;
    img!.alt = item.caption;
    if (titleEl) titleEl.textContent = item.title ?? '';
    if (metaEl) metaEl.textContent = item.meta ?? '';

    const words = setCaption(item.caption);
    if (still) return;

    gsap.fromTo(
      img!,
      { scale: firstOpen ? 0.92 : 0.96, opacity: firstOpen ? 0 : 0.8 },
      { scale: 1, opacity: 1, duration: firstOpen ? 0.5 : 0.4, ease: 'power3.out' },
    );
    gsap.fromTo(
      words,
      { yPercent: 110 },
      { yPercent: 0, duration: 0.5, stagger: 0.03, ease: 'power3.out', delay: 0.05 },
    );
  }

  function openAt(i: number): void {
    if (open) {
      show(i, false);
      return;
    }
    lastFocused = document.activeElement as HTMLElement | null;
    open = true;
    modal.hidden = false;
    modal.classList.add('is-open');
    document.body.classList.add('g-modal-open');
    opts.onOpen?.();
    show(i, true);
    closeBtn!.focus();
  }

  function closeModal(): void {
    if (!open) return;
    open = false;
    const finish = () => {
      modal.classList.remove('is-open');
      modal.hidden = true;
      document.body.classList.remove('g-modal-open');
      opts.onClose?.();
      lastFocused?.focus();
    };
    if (still) {
      finish();
      return;
    }
    gsap.to(modal, { opacity: 0, duration: 0.25, ease: 'power2.in', onComplete: () => {
      gsap.set(modal, { opacity: 1 });
      finish();
    } });
  }

  closeBtn.addEventListener('click', closeModal);
  prevBtn.addEventListener('click', () => show(index - 1, false));
  nextBtn.addEventListener('click', () => show(index + 1, false));

  // Clicking the backdrop (but not the image or the controls) closes.
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (!open) return;
    if (e.key === 'Escape') closeModal();
    else if (e.key === 'ArrowRight') show(index + 1, false);
    else if (e.key === 'ArrowLeft') show(index - 1, false);
    else if (e.key === 'Tab') {
      // Keep focus inside the dialog while it is up.
      const focusables = [closeBtn!, prevBtn!, nextBtn!];
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  return {
    open: openAt,
    close: closeModal,
    isOpen: () => open,
  };
}
