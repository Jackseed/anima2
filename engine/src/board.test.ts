import { describe, expect, it } from 'vitest';
import {
  BRIDGE_TILE_IDS,
  COLS,
  distance,
  distancesFrom,
  isPlayable,
  neighbors,
  PLAYABLE_TILE_IDS,
  REGIONS,
  tileId,
  tilesWithin,
  tileType,
  tileX,
  tileY,
} from './board';

// Port of the adjacency used by the 1.x app (TileQuery.getAdjacentTileIds with a range of 1).
function legacyAdjacentTileIds(id: number): number[] {
  const x0 = tileX(id);
  const y0 = tileY(id);
  const result: number[] = [];
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      const evenRowCorner = y0 % 2 === 0 && x === 1 && (y === -1 || y === 1);
      const oddRowCorner = y0 % 2 !== 0 && x === -1 && (y === -1 || y === 1);
      if (evenRowCorner || oddRowCorner) continue;
      const X = x0 + x;
      const Y = y0 + y;
      if (X < COLS && X >= 0 && Y < COLS && Y >= 0 && isPlayable(X + COLS * Y)) result.push(X + COLS * Y);
    }
  }
  if (BRIDGE_TILE_IDS.includes(id)) result.push(...BRIDGE_TILE_IDS);
  return [...new Set(result)].filter((n) => n !== id);
}

describe('board', () => {
  it('has 39 playable tiles split into six regions without overlap', () => {
    expect(PLAYABLE_TILE_IDS).toHaveLength(39);
    expect(new Set(PLAYABLE_TILE_IDS).size).toBe(39);
    expect(REGIONS.map((region) => region.points)).toEqual([6, 8, 9, 6, 7, 3]);
    for (const region of REGIONS) {
      for (const id of region.tileIds) expect(tileType(id)).toBe(region.id);
    }
  });

  it('matches the adjacency of the 1.x app on every tile', () => {
    for (const id of PLAYABLE_TILE_IDS) {
      expect([...neighbors(id)].sort((a, b) => a - b)).toEqual(legacyAdjacentTileIds(id).sort((a, b) => a - b));
    }
  });

  it('has a symmetric adjacency', () => {
    for (const id of PLAYABLE_TILE_IDS) {
      for (const neighbor of neighbors(id)) expect(neighbors(neighbor)).toContain(id);
    }
  });

  it('links the islands to the mountains through the bridge', () => {
    const [mountain, island] = BRIDGE_TILE_IDS;
    expect(tileType(mountain)).toBe('mountains');
    expect(tileType(island)).toBe('islands');
    expect(neighbors(mountain)).toContain(island);
    expect(distance(mountain, island)).toBe(1);
  });

  it('computes distances by moves over playable tiles', () => {
    const origin = tileId(6, 9);
    const distances = distancesFrom(origin, 1);
    expect(distances.get(origin)).toBe(0);
    expect([...distances.values()].filter((d) => d === 1)).toHaveLength(neighbors(origin).length);
    expect(tilesWithin(origin, 1)).not.toContain(origin);
    expect(distance(tileId(5, 8), tileId(6, 10))).toBe(2);
    expect(distance(tileId(5, 8), tileId(7, 10))).toBe(3);
  });

  it('ignores blank tiles', () => {
    expect(isPlayable(0)).toBe(false);
    expect(neighbors(0)).toEqual([]);
    expect(distancesFrom(0, 3).size).toBe(0);
  });
});
