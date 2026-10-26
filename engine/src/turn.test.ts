import { describe, expect, it } from 'vitest';
import { REGIONS } from './board';
import { determineWinner } from './scoring';
import { seededRng } from './state';
import { buildState, GREEN, play, RED } from './testing';
import type { GameState } from './types';

const plains = REGIONS.find((region) => region.id === 'plains')!;
const islands = REGIONS.find((region) => region.id === 'islands')!;

function twoSpeciesEach(): GameState {
  return buildState({
    species: [
      { id: 'g-1', ownerId: GREEN, abilityIds: ['giantism'], positions: { 66: 3 } },
      { id: 'g-2', ownerId: GREEN, abilityIds: ['flying'], positions: { 67: 3 } },
      { id: 'r-1', ownerId: RED, abilityIds: ['predator'], positions: { 90: 3 } },
      { id: 'r-2', ownerId: RED, abilityIds: ['range'], positions: { 91: 3 } },
    ],
  });
}

function endTurns(state: GameState, count: number): GameState {
  for (let i = 0; i < count; i++) state = play(state, state.turn!.playerId, { type: 'endTurn' });
  return state;
}

describe('turn order', () => {
  it('plays each species of a player, then the other player, then starts a new round', () => {
    let state = twoSpeciesEach();
    const order: string[] = [];
    for (let i = 0; i < 4; i++) {
      order.push(state.turn!.speciesId);
      state = play(state, state.turn!.playerId, { type: 'endTurn' });
    }
    expect(order).toEqual(['g-1', 'g-2', 'r-1', 'r-2']);
    expect(state.round).toBe(2);
    expect(state.turn).toMatchObject({ speciesId: 'g-1', remainingActions: 2, migrationPointsUsed: 0 });
  });

  // 1.x bug: the round counter followed the order of arrival in the game, so a red creator lost a turn per era.
  it('ends the round after the last player in turn order, whoever created the game', () => {
    let state = buildState({
      species: [
        { id: 'g-1', ownerId: GREEN, positions: { 66: 3 } },
        { id: 'r-1', ownerId: RED, positions: { 90: 3 } },
      ],
    });
    state = endTurns(state, 1);
    expect(state.round).toBe(1);
    expect(state.turn!.playerId).toBe(RED);
    state = endTurns(state, 1);
    expect(state.round).toBe(2);
    expect(state.turn!.playerId).toBe(GREEN);
  });

  it('passes the turn when the last action is spent', () => {
    let state = buildState({
      species: [
        { id: 'g-1', ownerId: GREEN, positions: { 66: 4 } },
        { id: 'r-1', ownerId: RED, positions: { 90: 3 } },
      ],
    });
    state = play(state, GREEN, { type: 'proliferate', tileId: 66 });
    expect(state.turn).toMatchObject({ playerId: GREEN, remainingActions: 1 });
    state = play(state, GREEN, { type: 'proliferate', tileId: 66 });
    expect(state.turn).toMatchObject({ playerId: RED, remainingActions: 2 });
  });

  it('skips a species that has been wiped out', () => {
    let state = twoSpeciesEach();
    state.species = state.species.filter((s) => s.id !== 'g-2');
    state.players[0].speciesIds = ['g-1'];
    state = endTurns(state, 1);
    expect(state.turn!.speciesId).toBe('r-1');
  });

  it('refuses commands from the other player', () => {
    const state = twoSpeciesEach();
    expect(() => play(state, RED, { type: 'endTurn' })).toThrow('NOT_YOUR_TURN');
  });
});

describe('eras', () => {
  it('scores controlled regions after three rounds', () => {
    let state = buildState({
      species: [
        { id: 'g-1', ownerId: GREEN, positions: Object.fromEntries(plains.tileIds.map((id) => [id, 1])) },
        { id: 'r-1', ownerId: RED, positions: { [islands.tileIds[0]]: 1, [islands.tileIds[1]]: 1 } },
      ],
      era: 3,
    });
    state = endTurns(state, 6);
    expect(state.era).toBe(4);
    expect(state.round).toBe(1);
    expect(state.players.map((player) => player.score)).toEqual([9, 0]);
    expect(state.eraResults).toEqual([
      {
        era: 3,
        scores: {
          [GREEN]: { regions: expect.objectContaining({ plains: 9, islands: 0 }), eraPoints: 9, total: 9 },
          [RED]: { regions: expect.objectContaining({ plains: 0, islands: 0 }), eraPoints: 0, total: 0 },
        },
      },
    ]);
  });

  it('counts a region for every player who covers it', () => {
    let state = buildState({
      species: [
        { id: 'g-1', ownerId: GREEN, positions: Object.fromEntries(islands.tileIds.map((id) => [id, 1])) },
        { id: 'r-1', ownerId: RED, positions: Object.fromEntries(islands.tileIds.map((id) => [id, 2])) },
      ],
      era: 3,
      round: 3,
    });
    state = endTurns(state, 2);
    expect(state.players.map((player) => player.score)).toEqual([3, 3]);
  });

  it('gives every player a second species at the start of era 2', () => {
    let state = buildState({
      species: [
        { id: 'g-1', ownerId: GREEN, abilityIds: ['giantism'], positions: { 66: 3 } },
        { id: 'r-1', ownerId: RED, abilityIds: ['predator'], positions: { 90: 3 } },
      ],
      round: 3,
    });
    state = endTurns(state, 2);
    expect(state.era).toBe(2);
    expect(state.phase).toBe('setup');
    expect(state.players.map((player) => player.speciesIds)).toEqual([
      ['g-1', `${GREEN}-2`],
      ['r-1', `${RED}-2`],
    ]);
    for (const [index, playerId] of [GREEN, RED].entries()) {
      const choice = state.setup!.choices[playerId];
      state = play(state, playerId, { type: 'chooseAbility', abilityId: choice.abilityChoices[0] });
      state = play(state, playerId, { type: 'chooseStartTile', tileId: [66, 91][index] });
    }
    expect(state.phase).toBe('playing');
    expect(state.turn).toMatchObject({ playerId: GREEN, speciesId: 'g-1', remainingActions: 1 });
  });

  it('does not create species again in later eras', () => {
    let state = buildState({
      species: [
        { id: 'g-1', ownerId: GREEN, positions: { 66: 3 } },
        { id: 'r-1', ownerId: RED, positions: { 90: 3 } },
      ],
      era: 2,
      round: 3,
    });
    state = endTurns(state, 2);
    expect(state.era).toBe(3);
    expect(state.phase).toBe('playing');
    expect(state.species).toHaveLength(2);
  });
});

describe('victory', () => {
  it('ends the game when a player reaches 30 points at the end of an era', () => {
    let state = buildState({
      species: [
        { id: 'g-1', ownerId: GREEN, positions: Object.fromEntries(plains.tileIds.map((id) => [id, 1])) },
        { id: 'r-1', ownerId: RED, positions: { 90: 3 } },
      ],
      players: [{ score: 21 }, { score: 25 }],
      era: 3,
      round: 3,
    });
    state = endTurns(state, 2);
    expect(state.phase).toBe('finished');
    expect(state.winner).toEqual({ playerId: GREEN, reason: 'score' });
    expect(state.turn).toBeNull();
  });

  it('ends the game after the fifth era', () => {
    let state = buildState({
      species: [
        { id: 'g-1', ownerId: GREEN, positions: { 66: 3 } },
        { id: 'r-1', ownerId: RED, positions: { 90: 3 } },
      ],
      players: [{ score: 10 }, { score: 12 }],
      era: 5,
      round: 3,
    });
    state = endTurns(state, 2);
    expect(state.winner).toEqual({ playerId: RED, reason: 'lastEra' });
  });

  it('breaks ties with abilities, then individuals, then chance', () => {
    const base = {
      players: [{ score: 10 }, { score: 10 }],
    };
    const byAbilities = buildState({
      ...base,
      species: [
        { id: 'g-1', ownerId: GREEN, abilityIds: ['giantism'], positions: { 66: 9 } },
        { id: 'r-1', ownerId: RED, abilityIds: ['predator', 'range'], positions: { 90: 1 } },
      ],
    });
    expect(determineWinner(byAbilities, seededRng(1))).toBe(RED);
    const byIndividuals = buildState({
      ...base,
      species: [
        { id: 'g-1', ownerId: GREEN, abilityIds: ['giantism'], positions: { 66: 9 } },
        { id: 'r-1', ownerId: RED, abilityIds: ['predator'], positions: { 90: 1 } },
      ],
    });
    expect(determineWinner(byIndividuals, seededRng(1))).toBe(GREEN);
    const draw = buildState({
      ...base,
      species: [
        { id: 'g-1', ownerId: GREEN, positions: { 66: 2 } },
        { id: 'r-1', ownerId: RED, positions: { 90: 2 } },
      ],
    });
    const winners = new Set(Array.from({ length: 30 }, (_, seed) => seed).map((seed) => determineWinner(draw, seededRng(seed))));
    expect(winners).toEqual(new Set([GREEN, RED]));
  });
});
