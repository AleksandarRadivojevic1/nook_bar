import raw from '../assets/block.map.json';

/**
 * The block the bar sits on, drawn from OSM.
 *
 * Committed rather than fetched at build time: a build that depends on
 * Overpass being up is a build that fails on someone else's schedule.
 * Regenerate with `python3 scripts/generate-block-map.py` and review the
 * diff like any other file. Provenance is in `block.meta.json`.
 */
export interface BlockStreet {
  d: string;
  /** 1 through 3, thickest to thinnest. Gives the drawing hierarchy. */
  rank: number;
  name?: string;
}

export interface BlockMap {
  viewBox: string;
  width: number;
  height: number;
  bar: { x: number; y: number };
  streets: BlockStreet[];
  buildings: string[];
}

export const blockMap: BlockMap = raw;
