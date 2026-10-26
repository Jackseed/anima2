// Builders for tests: a game already in the playing phase, with species placed by hand.
import { applyCommand } from './engine';
import type { AbilityId } from './rules';
import { seededRng } from './state';
import {
  NEUTRAL_OWNER,
  RULES_VERSION,
  type Command,
  type GameState,
  type PlayerState,
  type SpeciesState,
  type TurnState,
} from './types';

export const GREEN = 'green-player';
export const RED = 'red-player';

export interface SpeciesSpec {
  id: string;
  ownerId?: string;
  abilityIds?: AbilityId[];
  positions?: Record<number, number>;
}

export function buildState(options: {
  species: SpeciesSpec[];
  turn?: Partial<TurnState>;
  players?: Partial<PlayerState>[];
  era?: number;
  round?: number;
}): GameState {
  const species: SpeciesState[] = options.species.map((spec, index) => ({
    id: spec.id,
    ownerId: spec.ownerId ?? NEUTRAL_OWNER,
    slot: index,
    abilityIds: spec.abilityIds ?? [],
    positions: Object.fromEntries(Object.entries(spec.positions ?? {}).map(([k, v]) => [String(k), v])),
  }));
  const defaults: PlayerState[] = [
    { id: GREEN, name: 'Green', color: 'green', speciesIds: [], score: 0 },
    { id: RED, name: 'Red', color: 'red', speciesIds: [], score: 0 },
  ];
  const players: PlayerState[] = defaults.map((player, index) => ({ ...player, ...options.players?.[index] }));
  for (const player of players) {
    if (options.players?.some((p) => p.id === player.id && p.speciesIds)) continue;
    player.speciesIds = species.filter((s) => s.ownerId === player.id).map((s) => s.id);
  }
  const first = players[0];
  return {
    rulesVersion: RULES_VERSION,
    phase: 'playing',
    era: options.era ?? 1,
    round: options.round ?? 1,
    players,
    species,
    setup: null,
    turn: {
      playerId: first.id,
      speciesId: first.speciesIds[0],
      remainingActions: 2,
      migrationPointsUsed: 0,
      pendingAdaptation: null,
      ...options.turn,
    },
    eraResults: [],
    winner: null,
    lastAction: null,
    actionCount: 0,
  };
}

// Applies a command and fails the test with the rule error if it is rejected.
export function play(state: GameState, playerId: string, command: Command, seed = 1): GameState {
  const result = applyCommand(state, playerId, command, seededRng(seed));
  if (!result.ok) throw new Error(`${command.type} rejected: ${result.error}`);
  return result.state;
}

export function rejection(state: GameState, playerId: string, command: Command, seed = 1): string | null {
  const result = applyCommand(state, playerId, command, seededRng(seed));
  return result.ok ? null : result.error;
}
