import { generateRandomRegionTileIds } from '../../tiles/_state';

export interface Species {
  id?: string;
  tileIds?: number[];
  playerId?: string;
  abilities?: Ability[];
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
export type AbilityId = typeof abilityIds[number];
export interface Ability {
  id: AbilityId;
  en: {
    name: string;
    definition: string;
  };
  fr: {
    name: string;
    definition: string;
  };
  value: number;
}

export const abilities: Ability[] = [
  {
    id: 'spontaneousGeneration',
    en: {
      name: 'Spontaneous Generation',
      definition: '',
    },
    fr: {
      name: 'Génération spontanée',
      definition: '',
    },
    value: 2,
  },
  {
    id: 'hounds',
    en: {
      name: 'Hounds',
      definition: '',
    },
    fr: {
      name: 'Meute',
      definition: '',
    },
    value: 2,
  },
  {
    id: 'range',
    en: {
      name: 'Range',
      definition: '',
    },
    fr: {
      name: 'Portée',
      definition: '',
    },
    value: 2,
  },
  {
    id: 'survival',
    en: {
      name: 'Survival Instinct',
      definition: '',
    },
    fr: {
      name: 'Instinct de survie',
      definition: '',
    },
    value: 2,
  },
  {
    id: 'tunnel',
    en: {
      name: 'Tunnel',
      definition: '',
    },
    fr: {
      name: 'Tunnel',
      definition: '',
    },
    value: 2,
  },
  {
    id: 'nest',
    en: {
      name: 'Nest',
      definition: '',
    },
    fr: {
      name: 'Nid',
      definition: '',
    },
    value: 2,
  },
  {
    id: 'flying',
    en: {
      name: 'Flying',
      definition: '',
    },
    fr: {
      name: 'Vol',
      definition: '',
    },
    value: 2,
  },
  {
    id: 'giantism',
    en: {
      name: 'Giantism',
      definition: '',
    },
    fr: {
      name: 'Gigantisme',
      definition: '',
    },
    value: 2,
  },
  {
    id: 'agility',
    en: {
      name: 'Agility',
      definition: '',
    },
    fr: {
      name: 'Agilité',
      definition: '',
    },
    value: 2,
  },
  {
    id: 'acceleration',
    en: {
      name: 'Acceleration',
      definition: '',
    },
    fr: {
      name: 'Acceleration',
      definition: '',
    },
    value: 2,
  },
  {
    id: 'rallying',
    en: {
      name: 'Cry',
      definition: '',
    },
    fr: {
      name: 'Cri de ralliement',
      definition: '',
    },
    value: 2,
  },
  {
    id: 'intimidate',
    en: {
      name: 'Intimidate',
      definition: '',
    },
    fr: {
      name: 'Intimidation',
      definition: '',
    },
    value: 2,
  },
  {
    id: 'hermaphrodite',
    en: {
      name: 'Hermaphrodite',
      definition: '',
    },
    fr: {
      name: 'Hermaphrodite',
      definition: '',
    },
    value: 2,
  },
  {
    id: 'carnivore',
    en: {
      name: 'Carnivore',
      definition: '',
    },
    fr: {
      name: 'Carnassier',
      definition: '',
    },
    value: 2,
  },
  {
    id: 'submersible',
    en: {
      name: 'Submersible',
      definition: '',
    },
    fr: {
      name: 'Submersible',
      definition: '',
    },
    value: 2,
  },
];

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
  abilities?: Ability[],
  tileIds?: number[],
  color?: string,
  params?: Partial<Species>
): Species {
  return {
    id,
    playerId,
    abilities,
    tileIds,
    color,
    ...params,
  };
}
