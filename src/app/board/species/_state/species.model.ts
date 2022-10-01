import { cols, generateRandomRegionTileIds } from '../../tiles/_state';

export interface Species {
  id?: string;
  tileIds?: number[];
  playerId?: string;
  abilityIds?: Abilities[];
  color?: string;
}

export interface TileSpecies {
  id: string;
  quantity: number;
  color: string;
  abilityId: string;
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

export const abilities = {
  spontaneousGeneration: {
    id: 'spontaneousGeneration',
    en: 'Spontaneous Generation',
    fr: 'Génération spontanée',
    value: 2,
  },
  hounds: {
    id: 'hounds',
    en: 'Hounds',
    fr: 'Meute',
    value: 2,
  },
  range: {
    id: 'range',
    en: 'Range',
    fr: 'Portée',
    value: 2,
  },
  survival: {
    id: 'survival',
    en: 'Survival Instinct',
    fr: 'Instinct de survie',
    value: 2,
  },
  tunnel: {
    id: 'tunnel',
    en: 'Tunnel',
    fr: 'Tunnel',
    value: 2,
  },
  nest: {
    id: 'nest',
    en: 'Nest',
    fr: 'Nid',
    value: 2,
  },
  flying: {
    id: 'flying',
    en: 'Flying',
    fr: 'Vol',
    value: 2,
  },
  giantism: {
    id: 'giantism',
    en: 'Giantism',
    fr: 'Gigantisme',
    value: 2,
  },
  agility: {
    id: 'agility',
    en: 'Agility',
    fr: 'Agilité',
    value: 2,
  },
  acceleration: {
    id: 'acceleration',
    en: 'Acceleration',
    fr: 'Accélération',
    value: 2,
  },
  rallying: {
    id: 'rallying',
    en: 'Rallying Cry',
    fr: 'Cri de ralliement',
    value: 2,
  },
  intimidate: {
    id: 'intimidate',
    en: 'Intimidate',
    fr: 'Intimidation',
    value: 2,
  },
  hermaphrodite: {
    id: 'hermaphrodite',
    en: 'Hermaphrodite',
    fr: 'Hermaphrodite',
    value: 2,
  },
  carnivore: {
    id: 'carnivore',
    en: 'Carnivore',
    fr: 'Carnassier',
    value: 2,
  },
  submersible: {
    id: 'submersible',
    en: 'Submersible',
    fr: 'Submersible',
    value: 2,
  },
};

const neutralColor = 'grey';
export const primaryNeutralColor = '#bfbfbf';
export const secondaryNeutralColor = '#9b9b9b';

export const neutrals: Species[] = [
  {
    id: 'rockies',
    playerId: 'neutral',
    color: neutralColor,
    tileIds: generateRandomRegionTileIds(7, 'rockies'),
  },
  {
    id: 'mountains',
    playerId: 'neutral',
    color: neutralColor,
    tileIds: generateRandomRegionTileIds(4, 'mountains'),
  },
  {
    id: 'islands',
    playerId: 'neutral',
    color: neutralColor,
    tileIds: generateRandomRegionTileIds(3, 'islands'),
  },
  {
    id: 'plains',
    playerId: 'neutral',
    color: neutralColor,
    tileIds: generateRandomRegionTileIds(9, 'plains'),
  },
  {
    id: 'swamps',
    playerId: 'neutral',
    color: neutralColor,
    tileIds: generateRandomRegionTileIds(6, 'swamps'),
  },

  {
    id: 'forests',
    playerId: 'neutral',
    color: neutralColor,
    tileIds: generateRandomRegionTileIds(5, 'forests'),
  },
];

export function createSpecies(
  id?: string,
  playerId?: string,
  abilityIds?: Abilities[],
  tileIds?: number[],
  color?: string,
  params?: Partial<Species>
): Species {
  return {
    id,
    playerId,
    abilityIds,
    tileIds,
    color,
    ...params,
  };
}
