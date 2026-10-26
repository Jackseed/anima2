import { describe, expect, it } from 'vitest';
import { isPlayable } from './board';
import { applyCommand } from './engine';
import { legalCommands } from './moves';
import { MAX_SPECIES_ABILITIES } from './rules';
import { createGame, joinGame } from './setup';
import { randomItem, seededRng } from './state';
import type { Command, GameState } from './types';

function checkInvariants(state: GameState): void {
  for (const species of state.species) {
    expect(species.abilityIds.length).toBeLessThanOrEqual(MAX_SPECIES_ABILITIES);
    expect(new Set(species.abilityIds).size).toBe(species.abilityIds.length);
    for (const [tile, quantity] of Object.entries(species.positions)) {
      expect(isPlayable(Number(tile))).toBe(true);
      expect(quantity).toBeGreaterThan(0);
    }
  }
  for (const player of state.players) {
    for (const speciesId of player.speciesIds) expect(state.species.some((s) => s.id === speciesId)).toBe(true);
  }
  if (state.phase === 'playing') {
    expect(state.turn).not.toBeNull();
    expect(state.turn!.remainingActions).toBeGreaterThan(0);
    const player = state.players.find((p) => p.id === state.turn!.playerId)!;
    expect(player.speciesIds).toContain(state.turn!.speciesId);
  }
  if (state.phase === 'finished') expect(state.winner).not.toBeNull();
}

// Plays random legal commands, preferring actions over ending the turn.
function simulate(seed: number): { state: GameState; steps: number } {
  const rng = seededRng(seed);
  let state = joinGame(createGame({ id: 'a', name: 'A' }, rng), { id: 'b', name: 'B' }, rng);
  let steps = 0;
  while (state.phase !== 'finished' && steps < 5000) {
    const playerId =
      state.phase === 'playing'
        ? state.turn!.playerId
        : state.players.find((p) => legalCommands(state, p.id).length > 0)!.id;
    const commands = legalCommands(state, playerId);
    const actions = commands.filter((command) => command.type !== 'endTurn');
    const command: Command = actions.length > 0 && rng() < 0.95 ? randomItem(rng, actions) : randomItem(rng, commands);
    const result = applyCommand(state, playerId, command, rng);
    if (!result.ok) throw new Error(`seed ${seed}: legal command ${JSON.stringify(command)} refused (${result.error})`);
    state = result.state;
    checkInvariants(state);
    steps++;
  }
  return { state, steps };
}

describe('random games', () => {
  it('always reach a winner with consistent states', () => {
    for (let seed = 1; seed <= 20; seed++) {
      const { state } = simulate(seed);
      expect(state.phase, `seed ${seed}`).toBe('finished');
      if (state.winner!.reason !== 'annihilation') expect(state.eraResults.length).toBe(state.era);
    }
  }, 60_000);

  it('survive a round trip through JSON, as stored in Firestore', () => {
    const { state } = simulate(3);
    expect(JSON.parse(JSON.stringify(state))).toEqual(state);
  });
});
