import { createGame, joinGame, seededRng, type ActionLogEntry } from '@anima/engine';
import { TEXTS } from '../core/texts';
import { actionMessage, playedTiles } from './action-message';

const state = joinGame(createGame({ id: 'a', name: 'A' }, seededRng(1)), { id: 'b', name: 'B' }, seededRng(2));

function entry(partial: Partial<ActionLogEntry>): ActionLogEntry {
  return {
    id: 1,
    playerId: 'a',
    speciesId: 'neutral1',
    type: 'migration',
    tileId: 66,
    targetTileId: null,
    targetSpeciesId: null,
    quantity: 0,
    createdQuantity: 0,
    migrationPoints: 0,
    abilityId: null,
    gainedAbilityIds: [],
    eliminatedSpeciesId: null,
    ...partial,
  };
}

describe('actionMessage', () => {
  it('describes migrations with plurals', () => {
    expect(actionMessage(entry({ migrationPoints: 1 }), state, TEXTS.fr)).toBe('1 déplacement effectué');
    expect(actionMessage(entry({ migrationPoints: 3 }), state, TEXTS.fr)).toBe('3 déplacements effectués');
    expect(actionMessage(entry({ migrationPoints: 3 }), state, TEXTS.en)).toBe('3 moves made');
  });

  it('names species after their first trait, with French agreement', () => {
    const neutral = state.species.find((species) => species.id === 'neutral1')!;
    const name = TEXTS.fr.abilities[neutral.abilityIds[0]].name;
    const message = actionMessage(
      entry({ type: 'assimilation', targetSpeciesId: 'neutral1', quantity: 2 }),
      state,
      TEXTS.fr,
    );
    expect(message.startsWith(`2 ${name}s assimilé`)).toBe(true);
  });

  it('names a species wiped out from the previous state', () => {
    const neutral = state.species.find((species) => species.id === 'neutral1')!;
    const name = TEXTS.fr.abilities[neutral.abilityIds[0]].name;
    const after = { ...state, species: state.species.filter((species) => species.id !== 'neutral1') };
    const message = actionMessage(
      entry({ type: 'assimilation', targetSpeciesId: 'neutral1', quantity: 1, eliminatedSpeciesId: 'neutral1' }),
      after,
      TEXTS.fr,
      state,
    );
    expect(message.split('\n')[0]).toContain(`1 ${name} assimilé`);
    expect(message.split('\n')[1]).toContain(`${name} éliminé`);
  });

  it('pluralizes English messages', () => {
    expect(actionMessage(entry({ type: 'proliferation', speciesId: 'neutral1', createdQuantity: 2 }), state, TEXTS.en)).toMatch(
      / individuals created\.$/,
    );
  });

  it('announces a species wiped out, named after the traits taken from it', () => {
    const message = actionMessage(
      entry({ type: 'assimilation', targetSpeciesId: 'gone', quantity: 1, gainedAbilityIds: ['flying'], eliminatedSpeciesId: 'gone' }),
      state,
      TEXTS.fr,
    );
    expect(message).toContain('Ailée éliminée !');
  });

  it('lists the tiles to highlight', () => {
    expect(playedTiles(entry({ tileId: 66, targetTileId: 43 }))).toEqual([66, 43]);
    expect(playedTiles(entry({ type: 'endTurn', tileId: null }))).toEqual([]);
  });
});
