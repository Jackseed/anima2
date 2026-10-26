// Turn order, end of rounds and eras, victory.
import { ACTIONS_PER_TURN, LAST_ERA, NEW_SPECIES_ERA, ROUNDS_PER_ERA, WINNING_POINTS } from './rules';
import { determineWinner, scoreEra } from './scoring';
import { startSetup } from './setup';
import type { GameState, Rng, WinReason } from './types';

export function finishGame(state: GameState, playerId: string, reason: WinReason): void {
  state.phase = 'finished';
  state.winner = { playerId, reason };
  state.turn = null;
  state.setup = null;
}

// Counts one action for the playing species and passes the turn when none is left.
export function consumeAction(state: GameState, rng: Rng): void {
  if (state.phase !== 'playing' || !state.turn) return;
  state.turn.remainingActions -= 1;
  if (state.turn.remainingActions <= 0) advanceTurn(state, rng);
}

// Each species of a player plays in turn, then the next player. A round ends after the last
// player; an era ends after ROUNDS_PER_ERA rounds.
export function advanceTurn(state: GameState, rng: Rng): void {
  if (state.phase !== 'playing' || !state.turn) return;
  const playerIndex = state.players.findIndex((player) => player.id === state.turn!.playerId);
  const player = state.players[playerIndex];
  const speciesIndex = player.speciesIds.indexOf(state.turn.speciesId);
  const nextSpeciesId = speciesIndex >= 0 ? player.speciesIds[speciesIndex + 1] : player.speciesIds[0];

  if (nextSpeciesId !== undefined && speciesIndex >= 0) {
    startTurn(state, player.id, nextSpeciesId);
    return;
  }

  const nextIndex = (playerIndex + 1) % state.players.length;
  const nextPlayer = state.players[nextIndex];
  startTurn(state, nextPlayer.id, nextPlayer.speciesIds[0]);
  if (nextIndex === 0) endRound(state, rng);
}

function startTurn(state: GameState, playerId: string, speciesId: string): void {
  state.turn = {
    playerId,
    speciesId,
    remainingActions: ACTIONS_PER_TURN,
    migrationPointsUsed: 0,
    pendingAdaptation: null,
  };
}

function endRound(state: GameState, rng: Rng): void {
  if (state.round < ROUNDS_PER_ERA) {
    state.round += 1;
    return;
  }
  scoreEra(state);
  const reachedScore = state.players.some((player) => player.score >= WINNING_POINTS);
  if (reachedScore || state.era >= LAST_ERA) {
    finishGame(state, determineWinner(state, rng), reachedScore ? 'score' : 'lastEra');
    return;
  }
  state.era += 1;
  state.round = 1;
  if (state.era === NEW_SPECIES_ERA) startSetup(state, rng);
}
