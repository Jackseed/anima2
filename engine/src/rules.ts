// Game constants and ability catalog. Texts live in the app; the engine only knows ids and values.

export const ACTIONS_PER_TURN = 2;
// After each placement phase, the first player to act gets one action less.
export const FIRST_TURN_ACTIONS = ACTIONS_PER_TURN - 1;
export const ROUNDS_PER_ERA = 3;
export const LAST_ERA = 5;
export const WINNING_POINTS = 30;
export const NEW_SPECIES_ERA = 2;
export const MAX_SPECIES_ABILITIES = 3;
export const ABILITY_CHOICE_COUNT = 2;
export const STARTING_QUANTITY = 4;

export const MIGRATION_POINTS = 4;
export const MIGRATION_QUANTITY = 1;
export const PROLIFERATION_NEEDED = 2;
export const PROLIFERATION_CREATED = 2;
export const ASSIMILATION_REMOVED = 2;
export const ASSIMILATION_CREATED = 1;
export const ASSIMILATION_RANGE = 0;
export const ADAPTATION_SACRIFICE = 5;
// A species can only adapt if it keeps enough individuals to proliferate afterwards.
export const ADAPTATION_MIN_TOTAL = ADAPTATION_SACRIFICE + PROLIFERATION_NEEDED;

export const NEUTRAL_COUNT = 3;
export const NEUTRAL_MIN_QUANTITY = 3;
export const NEUTRAL_MAX_QUANTITY = 5;

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
export type AbilityId = (typeof ABILITY_IDS)[number];

export const ACTIVE_ABILITY_IDS: readonly AbilityId[] = ['intimidate', 'tunnel', 'rallying'];

export function isActiveAbility(id: AbilityId): boolean {
  return ACTIVE_ABILITY_IDS.includes(id);
}

// Ability effects.
export const FLYING_BONUS_POINTS = 2;
export const HOUNDS_REQUIRED = 2;
export const HOUNDS_QUANTITY = 2;
export const NEST_REQUIRED = 4;
export const NEST_BONUS = 1;
export const HERMAPHRODITE_NEEDED = 1;
export const GIANTISM_BONUS = 1;
export const PREDATOR_BONUS = 1;
export const GLUTTONY_BONUS = 1;
export const CARNIVORE_BONUS = 1;
export const RANGE_BONUS = 1;
// Isolated individuals of a species with survival cannot be assimilated.
export const SURVIVAL_BONUS = 1000;
export const SPONTANEOUS_GENERATION_RANGE = 1;
export const INTIMIDATE_RANGE = 1;
export const RALLYING_RANGE = 1;
export const TUNNEL_COST = 1;

// Abilities that can be drawn in a game.
export const ENABLED_ABILITY_IDS: readonly AbilityId[] = ABILITY_IDS;
