import { tilesWithin } from './board';
import type { AbilityId } from './rules';
import { NEUTRAL_OWNER, type GameState, type PlayerState, type Rng, type SpeciesState } from './types';

export const ERROR_CODES = [
  'GAME_NOT_WAITING',
  'GAME_FULL',
  'ALREADY_IN_GAME',
  'NOT_A_PLAYER',
  'NOT_IN_SETUP',
  'ABILITY_ALREADY_CHOSEN',
  'ABILITY_NOT_OFFERED',
  'ABILITY_NOT_CHOSEN',
  'TILE_ALREADY_CHOSEN',
  'INVALID_TILE',
  'NOT_PLAYING',
  'NOT_YOUR_TURN',
  'ADAPTATION_PENDING',
  'NO_ADAPTATION_PENDING',
  'MIGRATION_TO_FINISH',
  'NO_INDIVIDUAL',
  'NOT_ENOUGH_INDIVIDUALS',
  'NOT_ENOUGH_MIGRATION_POINTS',
  'MISSING_ABILITY',
  'INVALID_TARGET',
  'TOO_MANY_ABILITIES',
  'NO_ABILITY_AVAILABLE',
] as const;
export type ErrorCode = (typeof ERROR_CODES)[number];

export class RuleError extends Error {
  constructor(public readonly code: ErrorCode) {
    super(code);
    this.name = 'RuleError';
  }
}

export function fail(code: ErrorCode): never {
  throw new RuleError(code);
}

export function clone<T>(value: T): T {
  return structuredClone(value);
}

// Deterministic generator (mulberry32), for tests and replays.
export function seededRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomInt(rng: Rng, min: number, max: number): number {
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function randomItem<T>(rng: Rng, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)];
}

export function findPlayer(state: GameState, playerId: string): PlayerState | undefined {
  return state.players.find((player) => player.id === playerId);
}

export function getPlayer(state: GameState, playerId: string): PlayerState {
  return findPlayer(state, playerId) ?? fail('NOT_A_PLAYER');
}

export function findSpecies(state: GameState, speciesId: string): SpeciesState | undefined {
  return state.species.find((species) => species.id === speciesId);
}

export function getSpecies(state: GameState, speciesId: string): SpeciesState {
  return findSpecies(state, speciesId) ?? fail('INVALID_TARGET');
}

export function opponentOf(state: GameState, playerId: string): PlayerState | undefined {
  return state.players.find((player) => player.id !== playerId);
}

export function isNeutral(species: SpeciesState): boolean {
  return species.ownerId === NEUTRAL_OWNER;
}

export function quantityOn(species: SpeciesState, tileId: number): number {
  return species.positions[String(tileId)] ?? 0;
}

export function totalQuantity(species: SpeciesState): number {
  return Object.values(species.positions).reduce((sum, quantity) => sum + quantity, 0);
}

export function occupiedTileIds(species: SpeciesState): number[] {
  return Object.keys(species.positions).map(Number);
}

// Adds (or removes, with a negative quantity) individuals on a tile. Returns the applied change.
export function changeQuantity(species: SpeciesState, tileId: number, quantity: number): number {
  const key = String(tileId);
  const current = species.positions[key] ?? 0;
  const next = Math.max(0, current + quantity);
  if (next === 0) delete species.positions[key];
  else species.positions[key] = next;
  return next - current;
}

export function hasAbility(species: SpeciesState, abilityId: AbilityId): boolean {
  // Neutral species carry an ability (it can be taken from them) but never use it.
  return !isNeutral(species) && species.abilityIds.includes(abilityId);
}

export interface TileOccupant {
  speciesId: string;
  quantity: number;
}

export function speciesOnTile(state: GameState, tileId: number): TileOccupant[] {
  return state.species
    .map((species) => ({ speciesId: species.id, quantity: quantityOn(species, tileId) }))
    .filter((occupant) => occupant.quantity > 0);
}

export function playerSpecies(state: GameState, playerId: string): SpeciesState[] {
  const player = findPlayer(state, playerId);
  if (!player) return [];
  return player.speciesIds
    .map((speciesId) => findSpecies(state, speciesId))
    .filter((species): species is SpeciesState => !!species);
}

// True if no other individual of the species stands on an adjacent tile.
export function isIsolated(species: SpeciesState, tileId: number): boolean {
  return tilesWithin(tileId, 1).every((id) => quantityOn(species, id) === 0);
}
