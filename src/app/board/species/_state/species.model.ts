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

export interface MigrationValues {
  availableDistance?: number;
  traveledDistance?: number;
  movingQuantity?: number;
  migrationUsed?: number;
}

export const DEFAULT_MOVING_QUANTITY = 1;

export const DEFAULT_PROLIFERATE_QUANTITY = 2;

export const ABILITY_IDS = [
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
export type AbilityId = typeof ABILITY_IDS[number];
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
  constraintValue?: number;
}

export const ABILITIES: Ability[] = [
  {
    id: 'spontaneousGeneration',
    en: {
      name: 'Spontaneous Generation',
      definition:
        "Si vous avez plus de trois boutons d'or, relancez de 4 et rejouez.",
    },
    fr: {
      name: 'Génération spontanée',
      definition:
        "Si vous avez plus de trois boutons d'or, relancez de 4 et rejouez.",
    },
    value: 2,
  },
  {
    id: 'hounds',
    en: {
      name: 'Hounds',
      definition:
        "Si vous avez plus de trois boutons d'or, relancez de 4 et rejouez.",
    },
    fr: {
      name: 'Meute',
      definition:
        "Si vous avez plus de trois boutons d'or, relancez de 4 et rejouez.",
    },
    constraintValue: 2,
    value: 2,
  },
  {
    id: 'range',
    en: {
      name: 'Range',
      definition:
        "Si vous avez plus de trois boutons d'or, relancez de 4 et rejouez.",
    },
    fr: {
      name: 'Portée',
      definition:
        "Si vous avez plus de trois boutons d'or, relancez de 4 et rejouez.",
    },
    value: 2,
  },
  {
    id: 'survival',
    en: {
      name: 'Survival Instinct',
      definition:
        "Si vous avez plus de trois boutons d'or, relancez de 4 et rejouez.",
    },
    fr: {
      name: 'Instinct de survie',
      definition:
        "Si vous avez plus de trois boutons d'or, relancez de 4 et rejouez.",
    },
    value: 2,
  },
  {
    id: 'tunnel',
    en: {
      name: 'Tunnel',
      definition:
        "Si vous avez plus de trois boutons d'or, relancez de 4 et rejouez.",
    },
    fr: {
      name: 'Tunnel',
      definition:
        "Si vous avez plus de trois boutons d'or, relancez de 4 et rejouez.",
    },
    value: 2,
  },
  {
    id: 'nest',
    en: {
      name: 'Nest',
      definition:
        "Si vous avez plus de trois boutons d'or, relancez de 4 et rejouez.",
    },
    fr: {
      name: 'Nid',
      definition:
        "Si vous avez plus de trois boutons d'or, relancez de 4 et rejouez.",
    },
    constraintValue: 4,
    value: 1,
  },
  {
    id: 'flying',
    en: {
      name: 'Flying',
      definition:
        "Si vous avez plus de trois boutons d'or, relancez de 4 et rejouez.",
    },
    fr: {
      name: 'Vol',
      definition:
        "Si vous avez plus de trois boutons d'or, relancez de 4 et rejouez.",
    },
    value: 2,
  },
  {
    id: 'giantism',
    en: {
      name: 'Giantism',
      definition:
        "Si vous avez plus de trois boutons d'or, relancez de 4 et rejouez.",
    },
    fr: {
      name: 'Gigantisme',
      definition:
        "Si vous avez plus de trois boutons d'or, relancez de 4 et rejouez.",
    },
    value: 2,
  },
  {
    id: 'agility',
    en: {
      name: 'Agility',
      definition:
        "Si vous avez plus de trois boutons d'or, relancez de 4 et rejouez.",
    },
    fr: {
      name: 'Agilité',
      definition:
        "Si vous avez plus de trois boutons d'or, relancez de 4 et rejouez.",
    },
    value: 2,
  },
  {
    id: 'acceleration',
    en: {
      name: 'Acceleration',
      definition:
        "Si vous avez plus de trois boutons d'or, relancez de 4 et rejouez.",
    },
    fr: {
      name: 'Acceleration',
      definition:
        "Si vous avez plus de trois boutons d'or, relancez de 4 et rejouez.",
    },
    value: 2,
  },
  {
    id: 'rallying',
    en: {
      name: 'Cry',
      definition:
        "Si vous avez plus de trois boutons d'or, relancez de 4 et rejouez.",
    },
    fr: {
      name: 'Cri de ralliement',
      definition:
        "Si vous avez plus de trois boutons d'or, relancez de 4 et rejouez.",
    },
    value: 2,
  },
  {
    id: 'intimidate',
    en: {
      name: 'Intimidate',
      definition:
        "Si vous avez plus de trois boutons d'or, relancez de 4 et rejouez.",
    },
    fr: {
      name: 'Intimidation',
      definition:
        "Si vous avez plus de trois boutons d'or, relancez de 4 et rejouez.",
    },
    value: 2,
  },
  {
    id: 'hermaphrodite',
    en: {
      name: 'Hermaphrodite',
      definition:
        "Si vous avez plus de trois boutons d'or, relancez de 4 et rejouez.",
    },
    fr: {
      name: 'Hermaphrodite',
      definition:
        "Si vous avez plus de trois boutons d'or, relancez de 4 et rejouez.",
    },
    value: 2,
  },
  {
    id: 'carnivore',
    en: {
      name: 'Carnivore',
      definition:
        "Si vous avez plus de trois boutons d'or, relancez de 4 et rejouez.",
    },
    fr: {
      name: 'Carnassier',
      definition:
        "Si vous avez plus de trois boutons d'or, relancez de 4 et rejouez.",
    },
    value: 2,
  },
  {
    id: 'submersible',
    en: {
      name: 'Submersible',
      definition:
        "Si vous avez plus de trois boutons d'or, relancez de 4 et rejouez.",
    },
    fr: {
      name: 'Submersible',
      definition:
        "Si vous avez plus de trois boutons d'or, relancez de 4 et rejouez.",
    },
    value: 2,
  },
];

const neutralColor = 'grey';
export const PRIMARY_NEUTRAL_COLOR = '#bfbfbf';
export const SECONDARY_NEUTRAL_COLOR = '#9b9b9b';

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
  id: string,
  playerId: string,
  color: string,
  params?: Partial<Species>
): Species {
  return {
    id,
    playerId,
    color,
    tileIds: [],
    abilities: [],
    ...params,
  };
}
