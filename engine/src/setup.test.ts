import { describe, expect, it } from 'vitest';
import { applyCommand } from './engine';
import { isPlayable } from './board';
import { createGame, joinGame } from './setup';
import { quantityOn, RuleError, seededRng, totalQuantity } from './state';
import { play, rejection } from './testing';
import { ENABLED_ABILITY_IDS } from './rules';
import type { GameState } from './types';

const alice = { id: 'alice', name: 'Alice' };
const bob = { id: 'bob', name: 'Bob' };

function newGame(seed = 7): GameState {
  return joinGame(createGame(alice, seededRng(seed)), bob, seededRng(seed + 1));
}

function placed(seed = 7): GameState {
  let state = newGame(seed);
  for (const player of state.players) {
    const choice = state.setup!.choices[player.id];
    state = play(state, player.id, { type: 'chooseAbility', abilityId: choice.abilityChoices[0] });
  }
  state = play(state, 'alice', { type: 'chooseStartTile', tileId: 66 });
  return play(state, 'bob', { type: 'chooseStartTile', tileId: 91 });
}

describe('game creation', () => {
  it('waits for a second player with three neutral species on the board', () => {
    const state = createGame(alice, seededRng(1));
    expect(state.phase).toBe('waiting');
    expect(state.players).toHaveLength(1);
    expect(state.species).toHaveLength(3);
    const abilities = state.species.map((species) => species.abilityIds[0]);
    expect(new Set(abilities).size).toBe(3);
    for (const species of state.species) {
      expect(species.abilityIds).toHaveLength(1);
      expect(totalQuantity(species)).toBeGreaterThanOrEqual(4);
      expect(totalQuantity(species)).toBeLessThanOrEqual(6);
      for (const tileId of Object.keys(species.positions).map(Number)) expect(isPlayable(tileId)).toBe(true);
    }
  });

  it('is deterministic for a given random source', () => {
    expect(createGame(alice, seededRng(3))).toEqual(createGame(alice, seededRng(3)));
  });
});

describe('joining', () => {
  it('gives the opposite color and puts green first in the turn order', () => {
    for (let seed = 1; seed < 20; seed++) {
      const state = newGame(seed);
      expect(state.players.map((player) => player.color)).toEqual(['green', 'red']);
      expect(state.players.map((player) => player.id).sort()).toEqual(['alice', 'bob']);
    }
  });

  it('starts the placement with two distinct abilities per player, unused by neutrals', () => {
    const state = newGame();
    expect(state.phase).toBe('setup');
    const neutralAbilities = state.species.filter((s) => s.ownerId === 'neutral').flatMap((s) => s.abilityIds);
    const offered = Object.values(state.setup!.choices).flatMap((choice) => choice.abilityChoices);
    expect(offered).toHaveLength(4);
    expect(new Set(offered).size).toBe(4);
    for (const abilityId of offered) expect(neutralAbilities).not.toContain(abilityId);
  });

  it('refuses a third player or the same player twice', () => {
    const state = newGame();
    expect(() => joinGame(state, { id: 'carol', name: 'Carol' }, seededRng(1))).toThrow(RuleError);
    const waiting = createGame(alice, seededRng(1));
    expect(() => joinGame(waiting, alice, seededRng(1))).toThrow('ALREADY_IN_GAME');
  });
});

describe('placement', () => {
  it('only accepts an offered ability, once', () => {
    const state = newGame();
    const choice = state.setup!.choices.alice;
    const notOffered = ENABLED_ABILITY_IDS.find((id) => !choice.abilityChoices.includes(id))!;
    expect(rejection(state, 'alice', { type: 'chooseAbility', abilityId: notOffered })).toBe('ABILITY_NOT_OFFERED');
    const chosen = play(state, 'alice', { type: 'chooseAbility', abilityId: choice.abilityChoices[1] });
    expect(chosen.species.find((s) => s.id === choice.speciesId)!.abilityIds).toEqual([choice.abilityChoices[1]]);
    expect(rejection(chosen, 'alice', { type: 'chooseAbility', abilityId: choice.abilityChoices[0] })).toBe(
      'ABILITY_ALREADY_CHOSEN',
    );
  });

  it('requires the ability before the tile, and a playable tile', () => {
    let state = newGame();
    expect(rejection(state, 'alice', { type: 'chooseStartTile', tileId: 66 })).toBe('ABILITY_NOT_CHOSEN');
    state = play(state, 'alice', { type: 'chooseAbility', abilityId: state.setup!.choices.alice.abilityChoices[0] });
    expect(rejection(state, 'alice', { type: 'chooseStartTile', tileId: 0 })).toBe('INVALID_TILE');
    expect(rejection(state, 'carol', { type: 'chooseStartTile', tileId: 66 })).toBe('NOT_A_PLAYER');
  });

  it('lets each player progress at their own pace and waits for both tiles', () => {
    let state = newGame();
    state = play(state, 'alice', { type: 'chooseAbility', abilityId: state.setup!.choices.alice.abilityChoices[0] });
    state = play(state, 'alice', { type: 'chooseStartTile', tileId: 66 });
    expect(state.phase).toBe('setup');
    expect(rejection(state, 'alice', { type: 'chooseStartTile', tileId: 67 })).toBe('TILE_ALREADY_CHOSEN');
  });

  it('places four individuals per species, then green plays with one action', () => {
    const state = placed();
    expect(state.phase).toBe('playing');
    expect(state.setup).toBeNull();
    const [green] = state.players;
    expect(state.turn).toMatchObject({ playerId: green.id, speciesId: green.speciesIds[0], remainingActions: 1 });
    expect(quantityOn(state.species.find((s) => s.id === 'alice-1')!, 66)).toBe(4);
    expect(quantityOn(state.species.find((s) => s.id === 'bob-1')!, 91)).toBe(4);
  });

  it('never modifies the given state', () => {
    const state = newGame();
    const copy = structuredClone(state);
    applyCommand(state, 'alice', { type: 'chooseAbility', abilityId: state.setup!.choices.alice.abilityChoices[0] }, seededRng(1));
    expect(state).toEqual(copy);
  });
});
