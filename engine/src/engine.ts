import { adapt, assimilate, endTurn, intimidate, migrate, proliferate, rally, startAdaptation, tunnel } from './actions';
import { chooseAbility, chooseStartTile } from './setup';
import { RuleError, type ErrorCode } from './state';
import type { Command, GameState, Rng } from './types';

export type CommandResult = { ok: true; state: GameState } | { ok: false; error: ErrorCode };

// Applies a player's command to a copy of the state. The given state is never modified.
export function applyCommand(previous: GameState, playerId: string, command: Command, rng: Rng): CommandResult {
  const state = structuredClone(previous);
  try {
    switch (command.type) {
      case 'chooseAbility':
        chooseAbility(state, playerId, command.abilityId);
        break;
      case 'chooseStartTile':
        chooseStartTile(state, playerId, command.tileId);
        break;
      case 'migrate':
        migrate(state, playerId, command.fromTileId, command.toTileId, rng);
        break;
      case 'tunnel':
        tunnel(state, playerId, command.fromTileId, command.toTileId, rng);
        break;
      case 'proliferate':
        proliferate(state, playerId, command.tileId, command.targetTileId, rng);
        break;
      case 'assimilate':
        assimilate(state, playerId, command.tileId, command.targetTileId, command.targetSpeciesId, rng);
        break;
      case 'startAdaptation':
        startAdaptation(state, playerId, command.tileId, rng);
        break;
      case 'adapt':
        adapt(state, playerId, command.abilityId, rng);
        break;
      case 'intimidate':
        intimidate(state, playerId, command.tileId, command.targetSpeciesId, rng);
        break;
      case 'rally':
        rally(state, playerId, command.tileId, command.fromTileId, rng);
        break;
      case 'endTurn':
        endTurn(state, playerId, rng);
        break;
    }
  } catch (error) {
    if (error instanceof RuleError) return { ok: false, error: error.code };
    throw error;
  }
  return { ok: true, state };
}
