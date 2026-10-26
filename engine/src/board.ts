// Hexagonal board ("odd-r" offset layout: odd rows are shifted half a tile to the right).

export const COLS = 12;
export const ROWS = 12;
export const TILE_COUNT = COLS * ROWS;

export const REGION_IDS = [
  'rockies',
  'forests',
  'plains',
  'swamps',
  'mountains',
  'islands',
] as const;
export type RegionId = (typeof REGION_IDS)[number];
export type TileType = RegionId | 'blank';

export interface Region {
  id: RegionId;
  tileIds: readonly number[];
  points: number;
}

export function tileId(x: number, y: number): number {
  return x + y * COLS;
}

export function tileX(id: number): number {
  return id % COLS;
}

export function tileY(id: number): number {
  return Math.floor(id / COLS);
}

const ids = (coordinates: [x: number, y: number][]) =>
  coordinates.map(([x, y]) => tileId(x, y));

// Display order is the order used for scoring animations.
export const REGIONS: readonly Region[] = [
  {
    id: 'rockies',
    points: 6,
    tileIds: ids([[4, 3], [5, 3], [3, 4], [4, 4], [6, 4], [3, 5]]),
  },
  {
    id: 'forests',
    points: 8,
    tileIds: ids([[4, 6], [2, 7], [3, 7], [4, 7], [2, 8], [3, 8], [2, 9], [3, 9]]),
  },
  {
    id: 'plains',
    points: 9,
    tileIds: ids([[5, 8], [6, 8], [7, 8], [5, 9], [6, 9], [7, 9], [5, 10], [6, 10], [7, 10]]),
  },
  {
    id: 'swamps',
    points: 6,
    tileIds: ids([[8, 6], [9, 6], [7, 7], [8, 7], [8, 8], [9, 8]]),
  },
  {
    id: 'mountains',
    points: 7,
    tileIds: ids([[5, 5], [6, 5], [5, 6], [6, 6], [7, 6], [5, 7], [6, 7]]),
  },
  {
    id: 'islands',
    points: 3,
    tileIds: ids([[8, 2], [7, 3], [8, 3]]),
  },
];

// The islands are linked to the mountains by a bridge between these two tiles.
export const BRIDGE_TILE_IDS: readonly number[] = ids([[6, 5], [7, 3]]);

const TILE_TYPES: TileType[] = Array.from({ length: TILE_COUNT }, () => 'blank');
for (const region of REGIONS) {
  for (const id of region.tileIds) TILE_TYPES[id] = region.id;
}

export function tileType(id: number): TileType {
  return TILE_TYPES[id] ?? 'blank';
}

export function isPlayable(id: number): boolean {
  return Number.isInteger(id) && id >= 0 && id < TILE_COUNT && TILE_TYPES[id] !== 'blank';
}

export const PLAYABLE_TILE_IDS: readonly number[] = REGIONS.flatMap((region) => region.tileIds);

const EVEN_ROW_DELTAS = [[-1, -1], [0, -1], [-1, 0], [1, 0], [-1, 1], [0, 1]];
const ODD_ROW_DELTAS = [[0, -1], [1, -1], [-1, 0], [1, 0], [0, 1], [1, 1]];

const NEIGHBORS: number[][] = Array.from({ length: TILE_COUNT }, (_, id) => {
  if (!isPlayable(id)) return [];
  const x = tileX(id);
  const y = tileY(id);
  const deltas = y % 2 === 0 ? EVEN_ROW_DELTAS : ODD_ROW_DELTAS;
  const result: number[] = [];
  for (const [dx, dy] of deltas) {
    const nx = x + dx;
    const ny = y + dy;
    if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) continue;
    const neighbor = tileId(nx, ny);
    if (isPlayable(neighbor)) result.push(neighbor);
  }
  if (BRIDGE_TILE_IDS.includes(id)) {
    for (const other of BRIDGE_TILE_IDS) {
      if (other !== id && !result.includes(other)) result.push(other);
    }
  }
  return result;
});

// Playable tiles adjacent to a tile (bridge included).
export function neighbors(id: number): readonly number[] {
  return NEIGHBORS[id] ?? [];
}

// Distance (in moves) from a tile to every tile reachable within maxDistance.
// The origin tile is included with a distance of 0.
export function distancesFrom(origin: number, maxDistance: number): Map<number, number> {
  const distances = new Map<number, number>();
  if (!isPlayable(origin)) return distances;
  distances.set(origin, 0);
  let frontier = [origin];
  for (let distance = 1; distance <= maxDistance && frontier.length > 0; distance++) {
    const next: number[] = [];
    for (const id of frontier) {
      for (const neighbor of neighbors(id)) {
        if (distances.has(neighbor)) continue;
        distances.set(neighbor, distance);
        next.push(neighbor);
      }
    }
    frontier = next;
  }
  return distances;
}

export function distance(from: number, to: number): number {
  return distancesFrom(from, TILE_COUNT).get(to) ?? Infinity;
}

// Tiles within a range of a tile, the tile itself excluded.
export function tilesWithin(origin: number, range: number): number[] {
  return [...distancesFrom(origin, range).keys()].filter((id) => id !== origin);
}
