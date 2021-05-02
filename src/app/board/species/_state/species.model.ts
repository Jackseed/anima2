import { cols } from '../../tiles/_state';

export interface Species {
  id?: string;
  tileIds?: number[];
  playerId?: string;
  abilityIds?: Abilities[];
}

export const abilityIds = [
  'spontaneousGeneration',
  'hounds',
  'range',
  'survival',
  'tunnel',
  'nest',
  'flying',
  'giantism',
  'agility',
  'acceleration',
  'rallying',
  'intimidate',
  'hermaphrodite',
  'carnivore',
  'submersible',
] as const;
export type Abilities = typeof abilityIds[number];

export const abilities = [
  {
    id: 'spontaneousGeneration',
    en: 'Spontaneous Generation',
    fr: 'Génération spontanée',
    img: '/assets/spontaneousGeneration.png',
  },
  {
    id: 'hounds',
    en: 'Hounds',
    fr: 'Meute',
    img: '/assets/hounds.png',
  },
  {
    id: 'range',
    en: 'Range',
    fr: 'Portée',
    img: '/assets/range.png',
  },
  {
    id: 'survival',
    en: 'Survival Instinct',
    fr: 'Instinct de survie',
    img: '/assets/survival.png',
  },
  {
    id: 'tunnel',
    en: 'Tunnel',
    fr: 'Tunnel',
    img: '/assets/tunnel.png',
  },
  {
    id: 'nest',
    en: 'Nest',
    fr: 'Nid',
    img: '/assets/nest.png',
  },
  {
    id: 'flying',
    en: 'Flying',
    fr: 'Vol',
    img: '/assets/flying.png',
  },
  {
    id: 'giantism',
    en: 'Giantism',
    fr: 'Gigantisme',
    img: '/assets/giantism.png',
  },
  {
    id: 'agility',
    en: 'Agility',
    fr: 'Agilité',
    img: '/assets/agility.png',
  },
  {
    id: 'acceleration',
    en: 'Acceleration',
    fr: 'Accélération',
    img: '/assets/acceleration.png',
  },
  {
    id: 'rallying',
    en: 'Rallying Cry',
    fr: 'Cri de ralliement',
    img: '/assets/rallying.png',
  },
  {
    id: 'intimidate',
    en: 'Intimidate',
    fr: 'Intimidation',
    img: '/assets/intimidate.png',
  },
  {
    id: 'hermaphrodite',
    en: 'Hermaphrodite',
    fr: 'Hermaphrodite',
    img: '/assets/hermaphrodite.png',
  },
  {
    id: 'carnivore',
    en: 'Carnivore',
    fr: 'Carnassier',
    img: '/assets/carnivore.png',
  },
  {
    id: 'submersible',
    en: 'Submersible',
    fr: 'Submersible',
    img: '/assets/submersible.png',
  },
];

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
  abilityIds?: Abilities[],
  tileIds?: number[],
  params?: Partial<Species>
): Species {
  return {
    id,
    playerId,
    abilityIds,
    tileIds,
    ...params,
  };
}
