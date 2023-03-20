import {
  Colors,
  DEFAULT_ASSIMILATED_QUANTITY,
  DEFAULT_ASSIMILATION_CREATED_QUANTITY,
  DEFAULT_ASSIMILATION_RANGE,
  DEFAULT_MOVING_QUANTITY,
  DEFAULT_PROLIFERATION_CREATED_QUANTITY,
  DEFAULT_PROLIFERATION_NEEDED_INDIVIDUALS,
  NEUTRAL_COLORS,
} from 'src/app/games/_state/game.model';

export interface Species {
  id?: string;
  tileIds?: number[];
  playerId?: string;
  abilities?: Ability[];
  colors?: Colors;
}

export interface TileSpecies extends Species {
  quantity?: number;
  mainAbilityId?: AbilityId;
  tileId?: number;
}

export interface SpeciesListData {
  listType: 'active' | 'passive';
  speciesToList: Species[];
  speciesCount: 'global' | 'tile';
  tileId?: number;
  action: SpeciesListActions;
}

export interface MoveParameters {
  movingSpecies: Species;
  quantity: number;
  destinationId: number;
  previousTileId?: number;
  migrationUsed?: number;
  attackingSpecies?: Species;
}

export const BASIC_ACTIONS = [
  'migration',
  'assimilation',
  'proliferation',
  'adaptation',
];
export const ACTIVE_ACTIONS = ['rallying'];

export const GAME_ACTIONS = BASIC_ACTIONS.concat(ACTIVE_ACTIONS);
export type BasicAction = typeof BASIC_ACTIONS[number];
export type GameAction = typeof GAME_ACTIONS[number];

export const SPECIES_LIST_ACTIONS = ['assimiler', 'intimider'];

export type SpeciesListActions = typeof SPECIES_LIST_ACTIONS[number];

export interface TileSpeciesWithAssimilationValues
  extends TileSpecies,
    AssimilationValues {}

// TODO: create an ability model & query
// MIGRATION
export interface MigrationValues {
  availableDistance?: number;
  traveledDistance?: number;
  movingQuantity?: number;
  migrationUsed?: number;
}

export function createMigrationValues(
  values?: Partial<MigrationValues>
): MigrationValues {
  return {
    availableDistance: values?.availableDistance,
    traveledDistance: values?.traveledDistance,
    movingQuantity: values?.movingQuantity || DEFAULT_MOVING_QUANTITY,
    migrationUsed:
      values?.migrationUsed ||
      values?.traveledDistance * DEFAULT_MOVING_QUANTITY,
  };
}

// PROLIFERATION
export interface ProliferationValues {
  neededIndividuals: number;
  createdQuantity: number;
}

export function createProliferationValues(
  values?: Partial<ProliferationValues>
): ProliferationValues {
  return {
    neededIndividuals:
      values?.neededIndividuals || DEFAULT_PROLIFERATION_NEEDED_INDIVIDUALS,
    createdQuantity:
      values?.createdQuantity || DEFAULT_PROLIFERATION_CREATED_QUANTITY,
  };
}

// ASSIMILATION
export interface AssimilationValues {
  strength?: number;
  defense?: number;
  assimilatedQuantity?: number;
  createdQuantity?: number;
  range?: number;
}

export function createAssimilationValues(
  values?: Partial<AssimilationValues>
): AssimilationValues {
  return {
    strength: values?.strength,
    defense: values?.defense,
    assimilatedQuantity:
      values?.assimilatedQuantity || DEFAULT_ASSIMILATED_QUANTITY,
    createdQuantity:
      values?.createdQuantity || DEFAULT_ASSIMILATION_CREATED_QUANTITY,
    range: values?.range || DEFAULT_ASSIMILATION_RANGE,
  };
}

export const ABILITY_IDS = [
  'flying',
  'hounds',
  'nest',
  'hermaphrodite',
  'giantism',
  'predator',
  'gluttony',
  'carnivore',
  'range',
  'survival',
  'intimidate',
  'spontaneousGeneration',
  'tunnel',
  'rallying',
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
  requiredValue?: number;
  type: 'active' | 'passive';
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
      name: 'Sporifère',
      definition:
        "Si vous avez plus de trois boutons d'or, relancez de 4 et rejouez.",
    },
    value: 1,
    type: 'passive',
  },
  {
    id: 'hounds',
    en: {
      name: 'Hounds',
      definition:
        "Si vous avez plus de trois boutons d'or, relancez de 4 et rejouez.",
    },
    fr: {
      name: 'Sociale',
      definition:
        "Si vous avez plus de trois boutons d'or, relancez de 4 et rejouez.",
    },
    requiredValue: 2,
    value: 2,
    type: 'passive',
  },
  {
    id: 'range',
    en: {
      name: 'Range',
      definition:
        "Si vous avez plus de trois boutons d'or, relancez de 4 et rejouez.",
    },
    fr: {
      name: 'Bombardière',
      definition:
        "Si vous avez plus de trois boutons d'or, relancez de 4 et rejouez.",
    },
    value: 1,
    type: 'passive',
  } /*
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
    value: 1000,
    type: 'passive',
  }, */,
  {
    id: 'tunnel',
    en: {
      name: 'Tunnel',
      definition:
        "Si vous avez plus de trois boutons d'or, relancez de 4 et rejouez.",
    },
    fr: {
      name: 'Fouisseuse',
      definition:
        "Si vous avez plus de trois boutons d'or, relancez de 4 et rejouez.",
    },
    value: 2,
    type: 'active',
  } /*
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
    requiredValue: 4,
    value: 1,
    type: 'passive',
  }, */,
  {
    id: 'flying',
    en: {
      name: 'Flying',
      definition:
        "Si vous avez plus de trois boutons d'or, relancez de 4 et rejouez.",
    },
    fr: {
      name: 'Ailée',
      definition:
        "Si vous avez plus de trois boutons d'or, relancez de 4 et rejouez.",
    },
    value: 2,
    type: 'passive',
  },
  {
    id: 'giantism',
    en: {
      name: 'Giantism',
      definition:
        "Si vous avez plus de trois boutons d'or, relancez de 4 et rejouez.",
    },
    fr: {
      name: 'Gigantesque',
      definition:
        "Si vous avez plus de trois boutons d'or, relancez de 4 et rejouez.",
    },
    value: 1,
    type: 'passive',
  },
  {
    id: 'gluttony',
    en: {
      name: 'gluttony',
      definition:
        "Si vous avez plus de trois boutons d'or, relancez de 4 et rejouez.",
    },
    fr: {
      name: 'Vorace',
      definition:
        "Si vous avez plus de trois boutons d'or, relancez de 4 et rejouez.",
    },
    value: -1,
    type: 'passive',
  } /*
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
    value: 1,
    type: 'active',
  }, */,
  {
    id: 'intimidate',
    en: {
      name: 'Intimidate',
      definition:
        "Si vous avez plus de trois boutons d'or, relancez de 4 et rejouez.",
    },
    fr: {
      name: 'Stridulante',
      definition:
        "Si vous avez plus de trois boutons d'or, relancez de 4 et rejouez.",
    },
    value: 1,
    type: 'active',
  } /*
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
    value: 1,
    type: 'passive',
  }, */,
  {
    id: 'carnivore',
    en: {
      name: 'Carnivore',
      definition:
        "Si vous avez plus de trois boutons d'or, relancez de 4 et rejouez.",
    },
    fr: {
      name: 'Carnassière',
      definition:
        "Si vous avez plus de trois boutons d'or, relancez de 4 et rejouez.",
    },
    value: 1,
    type: 'passive',
  },
  {
    id: 'predator',
    en: {
      name: 'Predator',
      definition:
        "Si vous avez plus de trois boutons d'or, relancez de 4 et rejouez.",
    },
    fr: {
      name: 'Venimeuse',
      definition:
        "Si vous avez plus de trois boutons d'or, relancez de 4 et rejouez.",
    },
    value: 1,
    type: 'passive',
  },
];

export const neutrals: Species[] = [
  {
    id: 'neutral1',
    playerId: 'neutral',
    colors: NEUTRAL_COLORS,
  },
  {
    id: 'neutral2',
    playerId: 'neutral',
    colors: NEUTRAL_COLORS,
  },
  {
    id: 'neutral3',
    playerId: 'neutral',
    colors: NEUTRAL_COLORS,
  },
];

export function createSpecies(
  id: string,
  playerId: string,
  colors: Colors,
  params?: Partial<Species>
): Species {
  return {
    id,
    playerId,
    colors,
    tileIds: [],
    abilities: [],
    ...params,
  };
}
