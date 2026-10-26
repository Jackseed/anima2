// Read-only helpers shared by the rules and the UI: what the playing species can do from a tile.
import {
  assimilationRange,
  attackStrength,
  availableAbilityIds,
  defense,
  migrationPoints,
  migrationQuantity,
  proliferationNeeded,
} from './abilities';
import { distancesFrom, isPlayable, tilesWithin } from './board';
import {
  ADAPTATION_MIN_TOTAL,
  ADAPTATION_SACRIFICE,
  INTIMIDATE_RANGE,
  MAX_SPECIES_ABILITIES,
  RALLYING_RANGE,
  SPONTANEOUS_GENERATION_RANGE,
  TUNNEL_COST,
} from './rules';
import {
  findSpecies,
  hasAbility,
  occupiedTileIds,
  quantityOn,
  speciesOnTile,
  totalQuantity,
  type ErrorCode,
} from './state';
import type { GameState, SpeciesState } from './types';

export type PlayAction =
  | 'migration'
  | 'tunnel'
  | 'proliferation'
  | 'assimilation'
  | 'adaptation'
  | 'intimidation'
  | 'rallying';

export function isPlayersTurn(state: GameState, playerId: string): boolean {
  return state.phase === 'playing' && state.turn?.playerId === playerId;
}

export function playingSpecies(state: GameState): SpeciesState | undefined {
  return state.turn ? findSpecies(state, state.turn.speciesId) : undefined;
}

export function remainingMigrationPoints(state: GameState): number {
  const species = playingSpecies(state);
  if (!species || !state.turn) return 0;
  return Math.max(0, migrationPoints(species) - state.turn.migrationPointsUsed);
}

// A migration started on the last action must be finished before anything else.
export function isMigrationToFinish(state: GameState): boolean {
  return !!state.turn && state.turn.migrationPointsUsed > 0 && state.turn.remainingActions === 1;
}

// Reachable tiles with their migration cost.
export function migrationTargets(state: GameState, fromTileId: number): Map<number, number> {
  const species = playingSpecies(state);
  const targets = new Map<number, number>();
  if (!species || quantityOn(species, fromTileId) === 0) return targets;
  for (const [tileId, cost] of distancesFrom(fromTileId, remainingMigrationPoints(state))) {
    if (cost > 0) targets.set(tileId, cost);
  }
  return targets;
}

export function tunnelTargets(state: GameState, fromTileId: number): number[] {
  const species = playingSpecies(state);
  if (!species || !hasAbility(species, 'tunnel')) return [];
  if (quantityOn(species, fromTileId) === 0 || remainingMigrationPoints(state) < TUNNEL_COST) return [];
  return occupiedTileIds(species).filter((id) => id !== fromTileId);
}

export function proliferationTargets(state: GameState, tileId: number): number[] {
  const species = playingSpecies(state);
  if (!species || quantityOn(species, tileId) < proliferationNeeded(species)) return [];
  if (!hasAbility(species, 'spontaneousGeneration')) return [tileId];
  return [tileId, ...tilesWithin(tileId, SPONTANEOUS_GENERATION_RANGE)];
}

export interface AssimilationTarget {
  tileId: number;
  speciesId: string;
}

// Weaker species in range: on the same tile, or on nearby tiles with the range ability.
export function assimilationTargets(state: GameState, tileId: number): AssimilationTarget[] {
  const attacker = playingSpecies(state);
  if (!attacker || quantityOn(attacker, tileId) === 0) return [];
  const strength = attackStrength(attacker, tileId);
  const tiles = [tileId, ...tilesWithin(tileId, assimilationRange(attacker))];
  const targets: AssimilationTarget[] = [];
  for (const targetTileId of tiles) {
    for (const { speciesId } of speciesOnTile(state, targetTileId)) {
      if (speciesId === attacker.id) continue;
      const defender = findSpecies(state, speciesId)!;
      if (strength > defense(defender, targetTileId)) targets.push({ tileId: targetTileId, speciesId });
    }
  }
  return targets;
}

export function intimidationTargets(state: GameState, tileId: number): string[] {
  const species = playingSpecies(state);
  if (!species || !hasAbility(species, 'intimidate') || quantityOn(species, tileId) === 0) return [];
  if (tilesWithin(tileId, INTIMIDATE_RANGE).length === 0) return [];
  return speciesOnTile(state, tileId)
    .map((occupant) => occupant.speciesId)
    .filter((speciesId) => speciesId !== species.id);
}

export function rallyingSources(state: GameState, tileId: number): number[] {
  const species = playingSpecies(state);
  if (!species || !hasAbility(species, 'rallying') || quantityOn(species, tileId) === 0) return [];
  return tilesWithin(tileId, RALLYING_RANGE).filter((id) => quantityOn(species, id) > 0);
}

export function adaptationBlocker(state: GameState, tileId: number): ErrorCode | null {
  const species = playingSpecies(state);
  if (!species) return 'NOT_PLAYING';
  if (species.abilityIds.length >= MAX_SPECIES_ABILITIES) return 'TOO_MANY_ABILITIES';
  if (totalQuantity(species) < ADAPTATION_MIN_TOTAL) return 'NOT_ENOUGH_INDIVIDUALS';
  if (quantityOn(species, tileId) < ADAPTATION_SACRIFICE) return 'NOT_ENOUGH_INDIVIDUALS';
  if (availableAbilityIds(state).length === 0) return 'NO_ABILITY_AVAILABLE';
  return null;
}

// Why the playing player cannot start an action from a tile, or null if they can.
export function actionBlocker(state: GameState, playerId: string, action: PlayAction, tileId: number): ErrorCode | null {
  if (state.phase !== 'playing' || !state.turn) return 'NOT_PLAYING';
  if (state.turn.playerId !== playerId) return 'NOT_YOUR_TURN';
  if (state.turn.pendingAdaptation) return 'ADAPTATION_PENDING';
  if (!isPlayable(tileId)) return 'INVALID_TILE';
  const species = playingSpecies(state);
  if (!species || quantityOn(species, tileId) === 0) return 'NO_INDIVIDUAL';
  const isMigration = action === 'migration' || action === 'tunnel';
  if (!isMigration && isMigrationToFinish(state)) return 'MIGRATION_TO_FINISH';
  switch (action) {
    case 'migration':
      return migrationTargets(state, tileId).size > 0 ? null : 'NOT_ENOUGH_MIGRATION_POINTS';
    case 'tunnel':
      if (!hasAbility(species, 'tunnel')) return 'MISSING_ABILITY';
      return tunnelTargets(state, tileId).length > 0 ? null : 'INVALID_TARGET';
    case 'proliferation':
      return proliferationTargets(state, tileId).length > 0 ? null : 'NOT_ENOUGH_INDIVIDUALS';
    case 'assimilation':
      return assimilationTargets(state, tileId).length > 0 ? null : 'INVALID_TARGET';
    case 'adaptation':
      return adaptationBlocker(state, tileId);
    case 'intimidation':
      if (!hasAbility(species, 'intimidate')) return 'MISSING_ABILITY';
      return intimidationTargets(state, tileId).length > 0 ? null : 'INVALID_TARGET';
    case 'rallying':
      if (!hasAbility(species, 'rallying')) return 'MISSING_ABILITY';
      return rallyingSources(state, tileId).length > 0 ? null : 'INVALID_TARGET';
  }
}

export function canStartAction(state: GameState, playerId: string, action: PlayAction, tileId: number): boolean {
  return actionBlocker(state, playerId, action, tileId) === null;
}

export function migrationQuantityFrom(state: GameState, fromTileId: number): number {
  const species = playingSpecies(state);
  return species ? migrationQuantity(species, fromTileId) : 0;
}
