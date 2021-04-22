import { cols } from '../../tiles/_state';

export interface Species {
  id?: string;
  tileIds?: number[];
  playerId?: string;
}

export const rockiesNeutralCoordinates: [x: number, y: number][] = [
  [4, 3],
  [4, 3],
  [4, 4],
];

export const mountainsNeutralCoordinates: [x: number, y: number][] = [
  [6, 6],
  [6, 6],
  [6, 6],
];

export const islandNeutralCoordinates: [x: number, y: number][] = [
  [8, 2],
  [8, 2],
  [7, 3],
  [8, 3],
  [8, 3],
];

export const plainsNeutralCoordinates: [x: number, y: number][] = [
  [7, 8],
  [5, 9],
  [5, 10],
  [7, 10],
];

export const swampsNeutralCoordinates: [x: number, y: number][] = [
  [9, 6],
  [8, 7],
  [9, 8],
];

export const forestNeutralCoordinates: [x: number, y: number][] = [
  [2, 7],
  [3, 7],
  [3, 7],
  [3, 7],
  [3, 8],
];

export const neutrals: Species[] = [
  {
    id: 'rockies',
    playerId: 'neutral',
    tileIds: rockiesNeutralCoordinates.map(
      (coordinates) => coordinates[0] + coordinates[1] * cols
    ),
  },
  {
    id: 'mountains',
    playerId: 'neutral',
    tileIds: mountainsNeutralCoordinates.map(
      (coordinates) => coordinates[0] + coordinates[1] * cols
    ),
  },
  {
    id: 'island',
    playerId: 'neutral',
    tileIds: islandNeutralCoordinates.map(
      (coordinates) => coordinates[0] + coordinates[1] * cols
    ),
  },
  {
    id: 'plains',
    playerId: 'neutral',
    tileIds: plainsNeutralCoordinates.map(
      (coordinates) => coordinates[0] + coordinates[1] * cols
    ),
  },
  {
    id: 'swamps',
    playerId: 'neutral',
    tileIds: swampsNeutralCoordinates.map(
      (coordinates) => coordinates[0] + coordinates[1] * cols
    ),
  },

  {
    id: 'forest',
    playerId: 'neutral',
    tileIds: forestNeutralCoordinates.map(
      (coordinates) => coordinates[0] + coordinates[1] * cols
    ),
  },
];

export function createSpecies(
  id?: string,
  playerId?: string,
  tileIds?: number[],
  params?: Partial<Species>
): Species {
  return {
    id,
    playerId,
    tileIds,
    ...params,
  };
}
