import { AbilityId } from '../../species/_state';

export interface Tile {
  // TODO: transform it as a number everywhere
  id: number;
  x?: number;
  y?: number;
  type?: RegionType;
  species?: {
    id: string;
    quantity: number;
    color: string;
    mainAbilityId: AbilityId;
  }[];
  isReachable?: boolean;
}
export const regionIds = [
  'rockies',
  'mountains',
  'islands',
  'plains',
  'swamps',
  'forests',
  'blank',
] as const;
export type RegionType = typeof regionIds[number];

export const cols = 12;
export const lines = 13;
export const max = cols * lines;

export const islandCoordinates: [x: number, y: number][] = [
  [8, 2],
  [7, 3],
  [8, 3],
];
export const islandIds: number[] = islandCoordinates.map(
  (coordinates) => coordinates[0] + coordinates[1] * cols
);

export const mountainsCoordinates: [x: number, y: number][] = [
  [5, 5],
  [6, 5],
  [5, 6],
  [6, 6],
  [7, 6],
  [5, 7],
  [6, 7],
];
export const mountainsIds: number[] = mountainsCoordinates.map(
  (coordinates) => coordinates[0] + coordinates[1] * cols
);

export const rockiesCoordinates: [x: number, y: number][] = [
  [4, 3],
  [5, 3],
  [3, 4],
  [4, 4],
  [6, 4],
  [3, 5],
];
export const rockiesIds: number[] = rockiesCoordinates.map(
  (coordinates) => coordinates[0] + coordinates[1] * cols
);

export const plainsCoordinates: [x: number, y: number][] = [
  [5, 8],
  [6, 8],
  [7, 8],
  [5, 9],
  [6, 9],
  [7, 9],
  [5, 10],
  [6, 10],
  [7, 10],
];
export const plainsIds: number[] = plainsCoordinates.map(
  (coordinates) => coordinates[0] + coordinates[1] * cols
);

export const swampsCoordinates: [x: number, y: number][] = [
  [8, 6],
  [9, 6],
  [7, 7],
  [8, 7],
  [8, 8],
  [9, 8],
];
export const swampsIds: number[] = swampsCoordinates.map(
  (coordinates) => coordinates[0] + coordinates[1] * cols
);

export const forestCoordinates: [x: number, y: number][] = [
  [4, 6],
  [2, 7],
  [3, 7],
  [4, 7],
  [2, 8],
  [3, 8],
  [2, 9],
  [3, 9],
];
export const forestIds: number[] = forestCoordinates.map(
  (coordinates) => coordinates[0] + coordinates[1] * cols
);

export const islandBridgeCoordinates: [x: number, y: number][] = [
  [6, 5],
  [7, 3],
];
export const islandBridgeIds: number[] = islandBridgeCoordinates.map(
  (coordinates) => coordinates[0] + coordinates[1] * cols
);

export interface Region {
  name: RegionType;
  tileIds: number[];
  score: number;
}

export const Regions: Region[] = [
  { name: 'rockies', tileIds: rockiesIds, score: 6 },
  { name: 'mountains', tileIds: mountainsIds, score: 7 },
  { name: 'islands', tileIds: islandIds, score: 3 },
  { name: 'plains', tileIds: plainsIds, score: 9 },
  { name: 'swamps', tileIds: swampsIds, score: 6 },
  { name: 'forests', tileIds: forestIds, score: 8 },
];

export function generateRandomRegionTileIds(
  quantity: number,
  regionName: RegionType
): number[] {
  let tileIds = [];
  for (let i = 0; i < quantity; i++) {
    const regionTileIds = Regions.filter(
      (region) => region.name === regionName
    )[0].tileIds;
    const randomTileId =
      regionTileIds[Math.floor(Math.random() * regionTileIds.length)];
    tileIds.push(randomTileId);
  }
  return tileIds;
}

export function createTile(
  id: number,
  x: number,
  y: number,
  type: RegionType,
  params?: Partial<Tile>
): Tile {
  return {
    id,
    x,
    y,
    type,
    species: [],
    ...params,
  };
}
