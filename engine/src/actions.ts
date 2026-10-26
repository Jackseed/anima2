// Actions of the playing species. Each function validates with the shared queries, then mutates the state.
import {
  assimilationCreated,
  assimilationRemoved,
  drawAbilities,
  migrationPoints,
  migrationQuantity,
  proliferationCreated,
} from './abilities';
import { tilesWithin } from './board';
import {
  actionBlocker,
  assimilationTargets,
  intimidationTargets,
  migrationTargets,
  playingSpecies,
  proliferationTargets,
  rallyingSources,
  tunnelTargets,
  type PlayAction,
} from './queries';
import {
  ABILITY_CHOICE_COUNT,
  ADAPTATION_SACRIFICE,
  INTIMIDATE_RANGE,
  MAX_SPECIES_ABILITIES,
  TUNNEL_COST,
  type AbilityId,
} from './rules';
import {
  changeQuantity,
  fail,
  findPlayer,
  getSpecies,
  isNeutral,
  opponentOf,
  quantityOn,
  randomItem,
  totalQuantity,
} from './state';
import { advanceTurn, consumeAction, finishGame } from './turn';
import type { ActionLogEntry, ActionType, GameState, Rng, SpeciesState } from './types';

function assertCanStart(state: GameState, playerId: string, action: PlayAction, tileId: number): SpeciesState {
  const blocker = actionBlocker(state, playerId, action, tileId);
  if (blocker) fail(blocker);
  return playingSpecies(state)!;
}

function log(state: GameState, entry: Partial<ActionLogEntry> & { type: ActionType }): void {
  state.actionCount += 1;
  state.lastAction = {
    id: state.actionCount,
    playerId: state.turn!.playerId,
    speciesId: state.turn!.speciesId,
    tileId: null,
    targetTileId: null,
    targetSpeciesId: null,
    quantity: 0,
    createdQuantity: 0,
    migrationPoints: 0,
    abilityId: null,
    gainedAbilityIds: [],
    eliminatedSpeciesId: null,
    ...entry,
  };
}

function move(species: SpeciesState, fromTileId: number, toTileId: number, quantity: number): number {
  const moved = -changeQuantity(species, fromTileId, -quantity);
  changeQuantity(species, toTileId, moved);
  return moved;
}

// Spends migration points; the migration counts as an action once all points are spent.
function spendMigrationPoints(state: GameState, species: SpeciesState, points: number, rng: Rng): void {
  const turn = state.turn!;
  turn.migrationPointsUsed += points;
  if (turn.migrationPointsUsed >= migrationPoints(species)) {
    turn.migrationPointsUsed = 0;
    consumeAction(state, rng);
  }
}

export function migrate(state: GameState, playerId: string, fromTileId: number, toTileId: number, rng: Rng): void {
  const species = assertCanStart(state, playerId, 'migration', fromTileId);
  const cost = migrationTargets(state, fromTileId).get(toTileId) ?? fail('INVALID_TARGET');
  const moved = move(species, fromTileId, toTileId, migrationQuantity(species, fromTileId));
  log(state, { type: 'migration', tileId: fromTileId, targetTileId: toTileId, quantity: moved, migrationPoints: cost });
  spendMigrationPoints(state, species, cost, rng);
}

export function tunnel(state: GameState, playerId: string, fromTileId: number, toTileId: number, rng: Rng): void {
  const species = assertCanStart(state, playerId, 'tunnel', fromTileId);
  if (!tunnelTargets(state, fromTileId).includes(toTileId)) fail('INVALID_TARGET');
  const moved = move(species, fromTileId, toTileId, migrationQuantity(species, fromTileId));
  log(state, { type: 'tunnel', tileId: fromTileId, targetTileId: toTileId, quantity: moved, migrationPoints: TUNNEL_COST });
  spendMigrationPoints(state, species, TUNNEL_COST, rng);
}

export function proliferate(state: GameState, playerId: string, tileId: number, targetTileId: number | undefined, rng: Rng): void {
  const species = assertCanStart(state, playerId, 'proliferation', tileId);
  const target = targetTileId ?? tileId;
  if (!proliferationTargets(state, tileId).includes(target)) fail('INVALID_TARGET');
  const created = changeQuantity(species, target, proliferationCreated(species, tileId));
  log(state, { type: 'proliferation', tileId, targetTileId: target, createdQuantity: created });
  consumeAction(state, rng);
}

export function assimilate(
  state: GameState,
  playerId: string,
  tileId: number,
  targetTileId: number,
  targetSpeciesId: string,
  rng: Rng,
): void {
  const attacker = assertCanStart(state, playerId, 'assimilation', tileId);
  const isTarget = assimilationTargets(state, tileId).some(
    (target) => target.tileId === targetTileId && target.speciesId === targetSpeciesId,
  );
  if (!isTarget) fail('INVALID_TARGET');
  const defender = getSpecies(state, targetSpeciesId);
  const removed = -changeQuantity(defender, targetTileId, -assimilationRemoved(attacker));
  const created = changeQuantity(attacker, tileId, assimilationCreated(attacker));
  let gainedAbilityIds: AbilityId[] = [];
  let eliminatedSpeciesId: string | null = null;
  if (totalQuantity(defender) === 0) {
    gainedAbilityIds = takeAbilities(attacker, defender);
    eliminatedSpeciesId = defender.id;
  }
  log(state, {
    type: 'assimilation',
    tileId,
    targetTileId,
    targetSpeciesId,
    quantity: removed,
    createdQuantity: created,
    gainedAbilityIds,
    eliminatedSpeciesId,
  });
  if (eliminatedSpeciesId) {
    removeSpecies(state, defender);
    if (state.phase === 'finished') return;
  }
  consumeAction(state, rng);
}

// The species that wipes out another one takes its abilities, up to the maximum.
function takeAbilities(attacker: SpeciesState, defender: SpeciesState): AbilityId[] {
  const gained: AbilityId[] = [];
  for (const abilityId of defender.abilityIds) {
    if (attacker.abilityIds.length >= MAX_SPECIES_ABILITIES) break;
    if (attacker.abilityIds.includes(abilityId)) continue;
    attacker.abilityIds.push(abilityId);
    gained.push(abilityId);
  }
  return gained;
}

// Abilities that were not taken go back to the draw, since the pool is derived from living species.
function removeSpecies(state: GameState, species: SpeciesState): void {
  state.species = state.species.filter((s) => s.id !== species.id);
  if (isNeutral(species)) return;
  const owner = findPlayer(state, species.ownerId);
  if (!owner) return;
  owner.speciesIds = owner.speciesIds.filter((id) => id !== species.id);
  if (owner.speciesIds.length === 0) {
    const opponent = opponentOf(state, owner.id);
    if (opponent) finishGame(state, opponent.id, 'annihilation');
  }
}

// Adaptation is drawn first, then chosen, so a reload cannot draw new abilities.
export function startAdaptation(state: GameState, playerId: string, tileId: number, rng: Rng): void {
  const species = assertCanStart(state, playerId, 'adaptation', tileId);
  state.turn!.pendingAdaptation = {
    tileId,
    abilityChoices: drawAbilities(state, ABILITY_CHOICE_COUNT, rng, { excluded: species.abilityIds }),
  };
}

export function adapt(state: GameState, playerId: string, abilityId: AbilityId, rng: Rng): void {
  if (state.phase !== 'playing' || !state.turn) fail('NOT_PLAYING');
  if (state.turn.playerId !== playerId) fail('NOT_YOUR_TURN');
  const pending = state.turn.pendingAdaptation ?? fail('NO_ADAPTATION_PENDING');
  if (!pending.abilityChoices.includes(abilityId)) fail('ABILITY_NOT_OFFERED');
  const species = playingSpecies(state)!;
  const sacrificed = -changeQuantity(species, pending.tileId, -ADAPTATION_SACRIFICE);
  species.abilityIds.push(abilityId);
  state.turn.pendingAdaptation = null;
  log(state, { type: 'adaptation', tileId: pending.tileId, quantity: sacrificed, abilityId });
  consumeAction(state, rng);
}

// Pushes as many individuals of another species as there are of the playing one to a random nearby tile.
export function intimidate(state: GameState, playerId: string, tileId: number, targetSpeciesId: string, rng: Rng): void {
  const species = assertCanStart(state, playerId, 'intimidation', tileId);
  if (!intimidationTargets(state, tileId).includes(targetSpeciesId)) fail('INVALID_TARGET');
  const target = getSpecies(state, targetSpeciesId);
  const destination = randomItem(rng, tilesWithin(tileId, INTIMIDATE_RANGE));
  const quantity = Math.min(quantityOn(species, tileId), quantityOn(target, tileId));
  const moved = move(target, tileId, destination, quantity);
  log(state, { type: 'intimidation', tileId, targetTileId: destination, targetSpeciesId, quantity: moved });
  consumeAction(state, rng);
}

// Gathers all the individuals of a nearby tile on the selected tile.
export function rally(state: GameState, playerId: string, tileId: number, fromTileId: number, rng: Rng): void {
  const species = assertCanStart(state, playerId, 'rallying', tileId);
  if (!rallyingSources(state, tileId).includes(fromTileId)) fail('INVALID_TARGET');
  const moved = move(species, fromTileId, tileId, quantityOn(species, fromTileId));
  log(state, { type: 'rallying', tileId: fromTileId, targetTileId: tileId, quantity: moved });
  consumeAction(state, rng);
}

export function endTurn(state: GameState, playerId: string, rng: Rng): void {
  if (state.phase !== 'playing' || !state.turn) fail('NOT_PLAYING');
  if (state.turn.playerId !== playerId) fail('NOT_YOUR_TURN');
  if (state.turn.pendingAdaptation) fail('ADAPTATION_PENDING');
  log(state, { type: 'endTurn' });
  advanceTurn(state, rng);
}
