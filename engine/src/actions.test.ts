import { describe, expect, it } from 'vitest';
import { distance, neighbors, tileId } from './board';
import { actionBlocker, assimilationTargets, migrationTargets, remainingMigrationPoints } from './queries';
import { ENABLED_ABILITY_IDS, type AbilityId } from './rules';
import { findSpecies, quantityOn } from './state';
import { buildState, GREEN, play, RED, rejection, type SpeciesSpec } from './testing';
import type { GameState } from './types';

const A = tileId(6, 9);
const B = tileId(7, 9);
const C = tileId(7, 10);
const FAR = tileId(3, 4);

function game(green: Partial<SpeciesSpec>, others: SpeciesSpec[] = [], turn = {}): GameState {
  return buildState({
    species: [
      { id: 'g-1', ownerId: GREEN, positions: { [A]: 3 }, ...green },
      { id: 'r-1', ownerId: RED, positions: { [FAR]: 1 } },
      ...others,
    ],
    turn,
  });
}

const q = (state: GameState, speciesId: string, tile: number) => quantityOn(findSpecies(state, speciesId)!, tile);

describe('migration', () => {
  it('moves one individual for as many points as tiles traveled, within four points', () => {
    const state = game({});
    const targets = migrationTargets(state, A);
    expect(Math.max(...targets.values())).toBe(4);
    const next = play(state, GREEN, { type: 'migrate', fromTileId: A, toTileId: C });
    expect(q(next, 'g-1', A)).toBe(2);
    expect(q(next, 'g-1', C)).toBe(1);
    expect(next.turn).toMatchObject({ remainingActions: 2, migrationPointsUsed: distance(A, C) });
    expect(next.lastAction).toMatchObject({ type: 'migration', tileId: A, targetTileId: C, quantity: 1, migrationPoints: 1 });
  });

  it('counts as an action once all migration points are spent', () => {
    let state = game({});
    for (let i = 0; i < 3; i++) state = play(state, GREEN, { type: 'migrate', fromTileId: A, toTileId: B });
    expect(state.turn).toMatchObject({ remainingActions: 2, migrationPointsUsed: 3 });
    state = play(state, GREEN, { type: 'migrate', fromTileId: B, toTileId: C });
    expect(state.turn).toMatchObject({ remainingActions: 1, migrationPointsUsed: 0 });
  });

  it('refuses a destination beyond the remaining points', () => {
    const state = game({}, [], { migrationPointsUsed: 3 });
    const twoAway = [...migrationTargets(game({}), A)].find(([, cost]) => cost === 2)![0];
    expect(rejection(state, GREEN, { type: 'migrate', fromTileId: A, toTileId: twoAway })).toBe('INVALID_TARGET');
  });

  it('gives two more points with flying', () => {
    const state = game({ abilityIds: ['flying'] });
    expect(remainingMigrationPoints(state)).toBe(6);
    expect(Math.max(...migrationTargets(state, A).values())).toBe(6);
  });

  it('moves two individuals for the same cost with hounds', () => {
    const state = game({ abilityIds: ['hounds'] });
    const next = play(state, GREEN, { type: 'migrate', fromTileId: A, toTileId: B });
    expect(q(next, 'g-1', B)).toBe(2);
    expect(next.turn!.migrationPointsUsed).toBe(1);
    const alone = play(game({ abilityIds: ['hounds'], positions: { [A]: 1 } }), GREEN, {
      type: 'migrate',
      fromTileId: A,
      toTileId: B,
    });
    expect(q(alone, 'g-1', B)).toBe(1);
  });

  it('must be finished before the last action', () => {
    const state = game({ positions: { [A]: 4 } }, [], { remainingActions: 1, migrationPointsUsed: 2 });
    expect(rejection(state, GREEN, { type: 'proliferate', tileId: A })).toBe('MIGRATION_TO_FINISH');
    expect(rejection(state, GREEN, { type: 'migrate', fromTileId: A, toTileId: B })).toBeNull();
    const earlier = game({ positions: { [A]: 4 } }, [], { remainingActions: 2, migrationPointsUsed: 2 });
    expect(rejection(earlier, GREEN, { type: 'proliferate', tileId: A })).toBeNull();
  });

  it('is dropped when the turn ends', () => {
    const state = play(game({}, [], { migrationPointsUsed: 2 }), GREEN, { type: 'endTurn' });
    expect(state.turn).toMatchObject({ playerId: RED, migrationPointsUsed: 0, remainingActions: 2 });
  });
});

describe('tunnel', () => {
  it('joins another tile of the species for one point', () => {
    const state = game({ abilityIds: ['tunnel'], positions: { [A]: 2, [FAR]: 1 } });
    expect(rejection(state, GREEN, { type: 'tunnel', fromTileId: A, toTileId: B })).toBe('INVALID_TARGET');
    const next = play(state, GREEN, { type: 'tunnel', fromTileId: A, toTileId: FAR });
    expect(q(next, 'g-1', FAR)).toBe(2);
    expect(next.turn!.migrationPointsUsed).toBe(1);
  });

  it('requires the ability', () => {
    const state = game({ positions: { [A]: 2, [FAR]: 1 } });
    expect(rejection(state, GREEN, { type: 'tunnel', fromTileId: A, toTileId: FAR })).toBe('MISSING_ABILITY');
  });
});

describe('proliferation', () => {
  it('needs two individuals and creates two on the same tile', () => {
    expect(rejection(game({ positions: { [A]: 1 } }), GREEN, { type: 'proliferate', tileId: A })).toBe(
      'NOT_ENOUGH_INDIVIDUALS',
    );
    const next = play(game({ positions: { [A]: 2 } }), GREEN, { type: 'proliferate', tileId: A });
    expect(q(next, 'g-1', A)).toBe(4);
    expect(next.turn!.remainingActions).toBe(1);
  });

  it('needs a single individual with hermaphrodite', () => {
    const next = play(game({ abilityIds: ['hermaphrodite'], positions: { [A]: 1 } }), GREEN, {
      type: 'proliferate',
      tileId: A,
    });
    expect(q(next, 'g-1', A)).toBe(3);
  });

  it('creates one more individual with nest from four individuals', () => {
    expect(q(play(game({ abilityIds: ['nest'], positions: { [A]: 3 } }), GREEN, { type: 'proliferate', tileId: A }), 'g-1', A)).toBe(5);
    expect(q(play(game({ abilityIds: ['nest'], positions: { [A]: 4 } }), GREEN, { type: 'proliferate', tileId: A }), 'g-1', A)).toBe(7);
  });

  it('can create on an adjacent tile with spontaneous generation only', () => {
    expect(rejection(game({}), GREEN, { type: 'proliferate', tileId: A, targetTileId: B })).toBe('INVALID_TARGET');
    const next = play(game({ abilityIds: ['spontaneousGeneration'] }), GREEN, {
      type: 'proliferate',
      tileId: A,
      targetTileId: B,
    });
    expect(q(next, 'g-1', B)).toBe(2);
    expect(q(next, 'g-1', A)).toBe(3);
  });
});

describe('assimilation', () => {
  const neutral = (positions: Record<number, number>, abilityIds: AbilityId[] = ['flying']): SpeciesSpec => ({
    id: 'neutral1',
    abilityIds,
    positions,
  });

  it('removes two weaker individuals and creates one', () => {
    const next = play(game({}, [neutral({ [A]: 2 })]), GREEN, {
      type: 'assimilate',
      tileId: A,
      targetTileId: A,
      targetSpeciesId: 'neutral1',
    });
    expect(q(next, 'g-1', A)).toBe(4);
    expect(next.lastAction).toMatchObject({ type: 'assimilation', quantity: 2, createdQuantity: 1 });
  });

  it('requires more individuals than the defender', () => {
    const state = game({ positions: { [A]: 2 } }, [neutral({ [A]: 2 })]);
    expect(assimilationTargets(state, A)).toEqual([]);
    expect(rejection(state, GREEN, { type: 'assimilate', tileId: A, targetTileId: A, targetSpeciesId: 'neutral1' })).toBe(
      'INVALID_TARGET',
    );
  });

  it('applies predator, giantism, gluttony and carnivore', () => {
    expect(assimilationTargets(game({ abilityIds: ['predator'], positions: { [A]: 2 } }, [neutral({ [A]: 2 })]), A)).toHaveLength(1);
    const giant: SpeciesSpec = { id: 'r-2', ownerId: RED, abilityIds: ['giantism'], positions: { [A]: 2 } };
    expect(assimilationTargets(game({}, [giant]), A)).toEqual([]);
    const glutton = play(game({ abilityIds: ['gluttony', 'carnivore'], positions: { [A]: 5 } }, [neutral({ [A]: 4 })]), GREEN, {
      type: 'assimilate',
      tileId: A,
      targetTileId: A,
      targetSpeciesId: 'neutral1',
    });
    expect(q(glutton, 'neutral1', A)).toBe(1);
    expect(q(glutton, 'g-1', A)).toBe(7);
  });

  it('never uses the abilities of neutral species', () => {
    const state = game({ positions: { [A]: 3 } }, [neutral({ [A]: 2 }, ['giantism'])]);
    expect(assimilationTargets(state, A)).toEqual([{ tileId: A, speciesId: 'neutral1' }]);
  });

  it('reaches adjacent tiles with range, creating on the attacking tile', () => {
    const others = [neutral({ [B]: 1 })];
    expect(assimilationTargets(game({}, others), A)).toEqual([]);
    const next = play(game({ abilityIds: ['range'] }, others), GREEN, {
      type: 'assimilate',
      tileId: A,
      targetTileId: B,
      targetSpeciesId: 'neutral1',
    });
    expect(q(next, 'g-1', A)).toBe(4);
    expect(q(next, 'g-1', B)).toBe(0);
  });

  // 1.x bug: the survival condition used a comma instead of a check, and crashed on an uninitialized array.
  it('protects isolated individuals with survival', () => {
    const isolated: SpeciesSpec = { id: 'r-2', ownerId: RED, abilityIds: ['survival'], positions: { [A]: 1 } };
    expect(assimilationTargets(game({}, [isolated]), A)).toEqual([]);
    const grouped: SpeciesSpec = { ...isolated, positions: { [A]: 1, [B]: 1 } };
    expect(assimilationTargets(game({}, [grouped]), A)).toEqual([{ tileId: A, speciesId: 'r-2' }]);
  });

  it('can target the other species of the same player', () => {
    const own: SpeciesSpec = { id: 'g-2', ownerId: GREEN, positions: { [A]: 1 } };
    expect(assimilationTargets(game({}, [own]), A)).toEqual([{ tileId: A, speciesId: 'g-2' }]);
  });

  it('takes the abilities of a wiped out species, up to three', () => {
    const next = play(game({ abilityIds: ['predator', 'range'] }, [neutral({ [A]: 1 }, ['flying'])]), GREEN, {
      type: 'assimilate',
      tileId: A,
      targetTileId: A,
      targetSpeciesId: 'neutral1',
    });
    expect(findSpecies(next, 'neutral1')).toBeUndefined();
    expect(findSpecies(next, 'g-1')!.abilityIds).toEqual(['predator', 'range', 'flying']);
    expect(next.lastAction).toMatchObject({ gainedAbilityIds: ['flying'], eliminatedSpeciesId: 'neutral1' });

    const full = play(game({ abilityIds: ['predator', 'range', 'nest'] }, [neutral({ [A]: 1 }, ['flying'])]), GREEN, {
      type: 'assimilate',
      tileId: A,
      targetTileId: A,
      targetSpeciesId: 'neutral1',
    });
    expect(findSpecies(full, 'g-1')!.abilityIds).toEqual(['predator', 'range', 'nest']);
  });

  it('wins the game when the last species of the opponent is wiped out', () => {
    const state = buildState({
      species: [
        { id: 'g-1', ownerId: GREEN, positions: { [A]: 3 } },
        { id: 'r-1', ownerId: RED, abilityIds: ['giantism'], positions: { [A]: 1 } },
      ],
    });
    const next = play(state, GREEN, { type: 'assimilate', tileId: A, targetTileId: A, targetSpeciesId: 'r-1' });
    expect(next.phase).toBe('finished');
    expect(next.winner).toEqual({ playerId: GREEN, reason: 'annihilation' });
    expect(next.players[1].speciesIds).toEqual([]);
  });

  it('only removes a species from its owner when another one is left', () => {
    const state = buildState({
      species: [
        { id: 'g-1', ownerId: GREEN, positions: { [A]: 3 } },
        { id: 'r-1', ownerId: RED, positions: { [A]: 1 } },
        { id: 'r-2', ownerId: RED, positions: { [FAR]: 1 } },
      ],
    });
    const next = play(state, GREEN, { type: 'assimilate', tileId: A, targetTileId: A, targetSpeciesId: 'r-1' });
    expect(next.phase).toBe('playing');
    expect(next.players[1].speciesIds).toEqual(['r-2']);
  });
});

describe('adaptation', () => {
  const ready = (extra: Partial<SpeciesSpec> = {}) => game({ abilityIds: ['predator'], positions: { [A]: 5, [B]: 2 }, ...extra });

  it('draws two abilities nobody has, then sacrifices five individuals for the chosen one', () => {
    let state = play(ready(), GREEN, { type: 'startAdaptation', tileId: A });
    const pending = state.turn!.pendingAdaptation!;
    expect(pending.abilityChoices).toHaveLength(2);
    expect(pending.abilityChoices).not.toContain('predator');
    expect(rejection(state, GREEN, { type: 'endTurn' })).toBe('ADAPTATION_PENDING');
    expect(rejection(state, GREEN, { type: 'proliferate', tileId: B })).toBe('ADAPTATION_PENDING');
    state = play(state, GREEN, { type: 'adapt', abilityId: pending.abilityChoices[1] });
    expect(findSpecies(state, 'g-1')!.abilityIds).toEqual(['predator', pending.abilityChoices[1]]);
    expect(q(state, 'g-1', A)).toBe(0);
    expect(state.turn).toMatchObject({ remainingActions: 1, pendingAdaptation: null });
  });

  it('keeps the drawn abilities when the state is reloaded', () => {
    const state = play(ready(), GREEN, { type: 'startAdaptation', tileId: A });
    const again = structuredClone(state);
    expect(again.turn!.pendingAdaptation).toEqual(state.turn!.pendingAdaptation);
    expect(rejection(again, GREEN, { type: 'startAdaptation', tileId: A })).toBe('ADAPTATION_PENDING');
  });

  it('needs five individuals on the tile and seven in total', () => {
    expect(actionBlocker(game({ positions: { [A]: 4, [B]: 3 } }), GREEN, 'adaptation', A)).toBe('NOT_ENOUGH_INDIVIDUALS');
    expect(actionBlocker(game({ positions: { [A]: 6 } }), GREEN, 'adaptation', A)).toBe('NOT_ENOUGH_INDIVIDUALS');
    expect(actionBlocker(ready(), GREEN, 'adaptation', A)).toBeNull();
  });

  it('is limited to three abilities per species', () => {
    expect(actionBlocker(ready({ abilityIds: ['predator', 'range', 'nest'] }), GREEN, 'adaptation', A)).toBe(
      'TOO_MANY_ABILITIES',
    );
  });

  // 1.x bug: a hole in the ability list made the "all abilities taken" check fail, opening an empty menu.
  it('is blocked when every ability is already taken', () => {
    const held = ENABLED_ABILITY_IDS.filter((id) => id !== 'predator');
    const holders = held.map((abilityId, index) => ({ id: `neutral${index}`, abilityIds: [abilityId], positions: { [FAR]: 1 } }));
    expect(actionBlocker(game({ abilityIds: ['predator'], positions: { [A]: 7 } }, holders), GREEN, 'adaptation', A)).toBe(
      'NO_ABILITY_AVAILABLE',
    );
    const oneLeft = holders.slice(1);
    const state = play(game({ abilityIds: ['predator'], positions: { [A]: 7 } }, oneLeft), GREEN, {
      type: 'startAdaptation',
      tileId: A,
    });
    expect(state.turn!.pendingAdaptation!.abilityChoices).toEqual([held[0]]);
  });

  it('refuses an ability that was not offered', () => {
    const state = play(ready(), GREEN, { type: 'startAdaptation', tileId: A });
    const other = ENABLED_ABILITY_IDS.find((id) => !state.turn!.pendingAdaptation!.abilityChoices.includes(id))!;
    expect(rejection(state, GREEN, { type: 'adapt', abilityId: other })).toBe('ABILITY_NOT_OFFERED');
    expect(rejection(ready(), GREEN, { type: 'adapt', abilityId: other })).toBe('NO_ADAPTATION_PENDING');
  });
});

describe('active abilities', () => {
  it('intimidate pushes as many individuals as the playing species has to an adjacent tile', () => {
    const state = game({ abilityIds: ['intimidate'], positions: { [A]: 2 } }, [{ id: 'neutral1', abilityIds: ['flying'], positions: { [A]: 5 } }]);
    const next = play(state, GREEN, { type: 'intimidate', tileId: A, targetSpeciesId: 'neutral1' });
    const destination = next.lastAction!.targetTileId!;
    expect(neighbors(A)).toContain(destination);
    expect(q(next, 'neutral1', A)).toBe(3);
    expect(q(next, 'neutral1', destination)).toBe(2);
    expect(next.turn!.remainingActions).toBe(1);
  });

  it('intimidate requires the ability and another species on the tile', () => {
    expect(rejection(game({}, [{ id: 'neutral1', positions: { [A]: 1 } }]), GREEN, { type: 'intimidate', tileId: A, targetSpeciesId: 'neutral1' })).toBe(
      'MISSING_ABILITY',
    );
    expect(actionBlocker(game({ abilityIds: ['intimidate'] }), GREEN, 'intimidation', A)).toBe('INVALID_TARGET');
  });

  it('rallying gathers the individuals of an adjacent tile', () => {
    const state = game({ abilityIds: ['rallying'], positions: { [A]: 1, [B]: 3, [FAR]: 2 } });
    expect(rejection(state, GREEN, { type: 'rally', tileId: A, fromTileId: FAR })).toBe('INVALID_TARGET');
    const next = play(state, GREEN, { type: 'rally', tileId: A, fromTileId: B });
    expect(q(next, 'g-1', A)).toBe(4);
    expect(q(next, 'g-1', B)).toBe(0);
    expect(next.turn!.remainingActions).toBe(1);
  });
});

describe('resignation', () => {
  it('gives the victory to the opponent, even outside the turn of the player', () => {
    const next = play(game({}), RED, { type: 'resign' });
    expect(next.phase).toBe('finished');
    expect(next.winner).toEqual({ playerId: GREEN, reason: 'resignation' });
    expect(rejection(next, GREEN, { type: 'resign' })).toBe('NOT_PLAYING');
    expect(rejection(game({}), 'stranger', { type: 'resign' })).toBe('NOT_A_PLAYER');
  });
});

describe('commands', () => {
  it('are refused outside the turn of the player', () => {
    expect(rejection(game({}), RED, { type: 'proliferate', tileId: A })).toBe('NOT_YOUR_TURN');
    expect(rejection(game({}), GREEN, { type: 'proliferate', tileId: FAR })).toBe('NO_INDIVIDUAL');
    expect(rejection(game({}), GREEN, { type: 'migrate', fromTileId: 0, toTileId: A })).toBe('INVALID_TILE');
  });

  it('number the logged actions', () => {
    let state = game({ positions: { [A]: 4 } });
    state = play(state, GREEN, { type: 'proliferate', tileId: A });
    expect(state.lastAction!.id).toBe(1);
    state = play(state, GREEN, { type: 'proliferate', tileId: A });
    expect(state.lastAction).toMatchObject({ id: 2, playerId: GREEN, speciesId: 'g-1' });
  });
});
