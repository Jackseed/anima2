import {
  ASSIMILATION_CREATED,
  ASSIMILATION_RANGE,
  ASSIMILATION_REMOVED,
  CARNIVORE_BONUS,
  ENABLED_ABILITY_IDS,
  FLYING_BONUS_POINTS,
  GIANTISM_BONUS,
  GLUTTONY_BONUS,
  HERMAPHRODITE_NEEDED,
  HOUNDS_QUANTITY,
  HOUNDS_REQUIRED,
  MIGRATION_POINTS,
  MIGRATION_QUANTITY,
  NEST_BONUS,
  NEST_REQUIRED,
  PREDATOR_BONUS,
  PROLIFERATION_CREATED,
  PROLIFERATION_NEEDED,
  RANGE_BONUS,
  SURVIVAL_BONUS,
  type AbilityId,
} from './rules';
import { hasAbility, isIsolated, quantityOn, randomItem } from './state';
import type { GameState, Rng, SpeciesState } from './types';

// Migration points a species can spend during one migration action.
export function migrationPoints(species: SpeciesState): number {
  return MIGRATION_POINTS + (hasAbility(species, 'flying') ? FLYING_BONUS_POINTS : 0);
}

// Individuals moved per migration move from a tile.
export function migrationQuantity(species: SpeciesState, fromTileId: number): number {
  const available = quantityOn(species, fromTileId);
  if (hasAbility(species, 'hounds') && available >= HOUNDS_REQUIRED) return HOUNDS_QUANTITY;
  return Math.min(MIGRATION_QUANTITY, available);
}

export function proliferationNeeded(species: SpeciesState): number {
  return hasAbility(species, 'hermaphrodite') ? HERMAPHRODITE_NEEDED : PROLIFERATION_NEEDED;
}

export function proliferationCreated(species: SpeciesState, tileId: number): number {
  const nest = hasAbility(species, 'nest') && quantityOn(species, tileId) >= NEST_REQUIRED;
  return PROLIFERATION_CREATED + (nest ? NEST_BONUS : 0);
}

export function assimilationRange(species: SpeciesState): number {
  return ASSIMILATION_RANGE + (hasAbility(species, 'range') ? RANGE_BONUS : 0);
}

export function attackStrength(species: SpeciesState, tileId: number): number {
  return quantityOn(species, tileId) + (hasAbility(species, 'predator') ? PREDATOR_BONUS : 0);
}

export function defense(species: SpeciesState, tileId: number): number {
  let value = quantityOn(species, tileId);
  if (hasAbility(species, 'giantism')) value += GIANTISM_BONUS;
  if (hasAbility(species, 'survival') && isIsolated(species, tileId)) value += SURVIVAL_BONUS;
  return value;
}

export function assimilationRemoved(attacker: SpeciesState): number {
  return ASSIMILATION_REMOVED + (hasAbility(attacker, 'gluttony') ? GLUTTONY_BONUS : 0);
}

export function assimilationCreated(attacker: SpeciesState): number {
  return ASSIMILATION_CREATED + (hasAbility(attacker, 'carnivore') ? CARNIVORE_BONUS : 0);
}

// Abilities held by a species or offered to a player are out of the draw.
export function unavailableAbilityIds(state: GameState): Set<AbilityId> {
  const ids = new Set<AbilityId>();
  for (const species of state.species) species.abilityIds.forEach((id) => ids.add(id));
  if (state.setup) {
    for (const choice of Object.values(state.setup.choices)) {
      if (choice.abilityId === null) choice.abilityChoices.forEach((id) => ids.add(id));
    }
  }
  state.turn?.pendingAdaptation?.abilityChoices.forEach((id) => ids.add(id));
  return ids;
}

export function availableAbilityIds(state: GameState): AbilityId[] {
  const unavailable = unavailableAbilityIds(state);
  return ENABLED_ABILITY_IDS.filter((id) => !unavailable.has(id));
}

// Draws distinct abilities among the available ones. With allowDuplicates, falls back to
// abilities already in the game when the pool runs dry, so a new species always gets a choice.
export function drawAbilities(
  state: GameState,
  count: number,
  rng: Rng,
  options: { excluded?: readonly AbilityId[]; allowDuplicates?: boolean } = {},
): AbilityId[] {
  const excluded = options.excluded ?? [];
  const drawn: AbilityId[] = [];
  const pick = (pool: readonly AbilityId[]) => {
    while (drawn.length < count) {
      const candidates = pool.filter((id) => !drawn.includes(id) && !excluded.includes(id));
      if (candidates.length === 0) return;
      drawn.push(randomItem(rng, candidates));
    }
  };
  pick(availableAbilityIds(state));
  if (options.allowDuplicates) pick(ENABLED_ABILITY_IDS);
  return drawn;
}
