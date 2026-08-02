import { getImage } from 'astro:assets';

interface MediaEntry {
  id: string;
  data: {
    photo?: ImageMetadata;
    media?: string;
    crop?: string;
  };
}

/** An uploaded photograph if there is one, otherwise the gradient stand-in. */
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
