/** One row, not a second gallery. */
export const INSTAGRAM_TILES = 4;

export interface PostLike {
  postedAt: Date;
}

/** Newest first, capped at a row. Below the cap the row narrows. */
export function recentPosts<T extends PostLike>(
  items: readonly T[],
  limit: number = INSTAGRAM_TILES,
): T[] {
  return [...items]
    .sort((a, b) => b.postedAt.getTime() - a.postedAt.getTime())
    .slice(0, limit);
}
