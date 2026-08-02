/** The row is a row. More than this and it becomes a second gallery. */
export const INSTAGRAM_TILES = 4;

export interface PostLike {
  postedAt: Date;
}

/**
 * The posts that show: newest first, capped at a row.
 *
 * Capped rather than paged so the owners can keep adding entries without the
 * section growing into a second photo grid four sections after the first one.
 * Below the cap the row narrows rather than leaving gaps.
 */
export function recentPosts<T extends PostLike>(
  items: readonly T[],
  limit: number = INSTAGRAM_TILES,
): T[] {
  return [...items]
    .sort((a, b) => b.postedAt.getTime() - a.postedAt.getTime())
    .slice(0, limit);
}
