export interface Tile {
  id?: number;
  x?: number;
  y?: number;
  type?:
    | 'rockies'
    | 'mountains'
    | 'island'
    | 'plains'
    | 'swamps'
    | 'forest'
    | 'blank';
}
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
  [3, 4],
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

export function createTile(
  id: number,
  x: number,
  y: number,
  type:
    | 'rockies'
    | 'mountains'
    | 'island'
    | 'plains'
    | 'swamps'
    | 'forest'
    | 'blank',
  params?: Partial<Tile>
): Tile {
  return {
    id,
    x,
    y,
    type,
    ...params,
  };
}
