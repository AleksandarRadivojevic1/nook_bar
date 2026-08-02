import { getImage } from 'astro:assets';

interface MediaEntry {
  id: string;
  data: {
    photo?: ImageMetadata;
    media?: string;
    crop?: string;
  };
}

/**
 * The CSS background value for each entry: an uploaded photograph if there is
 * one, otherwise the gradient stand-in.
 *
 * The gradients exist because the bar has no photography yet. They are real
 * CSS, which meant the owners' editor showed them a field expecting
 * `linear-gradient(160deg,#E8CFA4,#B07C3C 60%,#4A3218)`. The gradient stays in
 * the data as a fallback but is hidden from Keystatic; owners upload a photo
 * and it takes over.
 */
export async function backgrounds(
  entries: readonly MediaEntry[],
  width = 900,
): Promise<Map<string, string>> {
  const values = new Map<string, string>();

  for (const entry of entries) {
    const { photo, media, crop } = entry.data;
    if (photo) {
      const image = await getImage({ src: photo, width, format: 'webp' });
      values.set(entry.id, `url(${image.src}) center/cover no-repeat`);
    } else if (media ?? crop) {
      values.set(entry.id, (media ?? crop)!);
    }
  }

  return values;
}
