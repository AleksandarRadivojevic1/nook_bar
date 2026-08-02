import raw from '../assets/block.map.json';

/**
 * The block the bar sits on, from OSM. Regenerate with
 * `python3 scripts/generate-block-map.py`; provenance is in block.meta.json.
 */
export interface BlockStreet {
  d: string;
  /** 1 to 3, thickest to thinnest. */
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
