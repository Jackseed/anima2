import { cols } from 'src/app/games/_state';

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

export const islandCoordinates: [x: number, y: number][] = [
  [9, 3],
  [8, 4],
  [9, 4],
];
export const islandIds: number[] = islandCoordinates.map(
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
