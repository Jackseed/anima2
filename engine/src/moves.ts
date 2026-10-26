// Enumerates the commands a player can send, for bots and simulations.
import {
  assimilationTargets,
  canStartAction,
  intimidationTargets,
  migrationTargets,
  playingSpecies,
  proliferationTargets,
  rallyingSources,
  tunnelTargets,
} from './queries';
import { PLAYABLE_TILE_IDS } from './board';
import { occupiedTileIds } from './state';
import type { Command, GameState } from './types';

export function legalCommands(state: GameState, playerId: string): Command[] {
  if (state.phase === 'setup' && state.setup) {
    const choice = state.setup.choices[playerId];
    if (!choice) return [];
    if (choice.abilityId === null) {
      return choice.abilityChoices.map((abilityId) => ({ type: 'chooseAbility', abilityId }));
    }
    if (choice.tileId === null) {
      return PLAYABLE_TILE_IDS.map((tileId) => ({ type: 'chooseStartTile', tileId }));
    }
    return [];
  }
  if (state.phase !== 'playing' || !state.turn || state.turn.playerId !== playerId) return [];

  const pending = state.turn.pendingAdaptation;
  if (pending) return pending.abilityChoices.map((abilityId) => ({ type: 'adapt', abilityId }));

  const species = playingSpecies(state);
  const commands: Command[] = [{ type: 'endTurn' }];
  if (!species) return commands;
  for (const tileId of occupiedTileIds(species)) {
    if (canStartAction(state, playerId, 'migration', tileId)) {
      for (const toTileId of migrationTargets(state, tileId).keys()) {
        commands.push({ type: 'migrate', fromTileId: tileId, toTileId });
      }
    }
    if (canStartAction(state, playerId, 'tunnel', tileId)) {
      for (const toTileId of tunnelTargets(state, tileId)) commands.push({ type: 'tunnel', fromTileId: tileId, toTileId });
    }
    if (canStartAction(state, playerId, 'proliferation', tileId)) {
      for (const targetTileId of proliferationTargets(state, tileId)) {
        commands.push({ type: 'proliferate', tileId, targetTileId });
      }
    }
    if (canStartAction(state, playerId, 'assimilation', tileId)) {
      for (const target of assimilationTargets(state, tileId)) {
        commands.push({ type: 'assimilate', tileId, targetTileId: target.tileId, targetSpeciesId: target.speciesId });
      }
    }
    if (canStartAction(state, playerId, 'adaptation', tileId)) commands.push({ type: 'startAdaptation', tileId });
    if (canStartAction(state, playerId, 'intimidation', tileId)) {
      for (const targetSpeciesId of intimidationTargets(state, tileId)) {
        commands.push({ type: 'intimidate', tileId, targetSpeciesId });
      }
    }
    if (canStartAction(state, playerId, 'rallying', tileId)) {
      for (const fromTileId of rallyingSources(state, tileId)) commands.push({ type: 'rally', tileId, fromTileId });
    }
  }
  return commands;
}
