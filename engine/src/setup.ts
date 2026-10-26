// Game creation, joining and placement phases (start of the game and arrival of the second species).
import { drawAbilities } from './abilities';
import { isPlayable, PLAYABLE_TILE_IDS, tilesWithin } from './board';
import {
  ABILITY_CHOICE_COUNT,
  FIRST_TURN_ACTIONS,
  NEUTRAL_COUNT,
  NEUTRAL_MAX_QUANTITY,
  NEUTRAL_MIN_QUANTITY,
  STARTING_QUANTITY,
  type AbilityId,
} from './rules';
import { changeQuantity, fail, getPlayer, getSpecies, randomInt, randomItem } from './state';
import {
  NEUTRAL_OWNER,
  RULES_VERSION,
  type GameState,
  type NewPlayer,
  type PlayerColor,
  type Rng,
  type SpeciesState,
} from './types';

export function speciesIdFor(playerId: string, slot: number): string {
  return `${playerId}-${slot + 1}`;
}

function createPlayerSpecies(playerId: string, slot: number): SpeciesState {
  return { id: speciesIdFor(playerId, slot), ownerId: playerId, slot, abilityIds: [], positions: {} };
}

// Neutrals gather around a random tile: the more individuals, the tighter the group.
function createNeutral(state: GameState, index: number, rng: Rng): SpeciesState {
  const species: SpeciesState = {
    id: `neutral${index + 1}`,
    ownerId: NEUTRAL_OWNER,
    slot: index,
    abilityIds: drawAbilities(state, 1, rng, { allowDuplicates: true }),
    positions: {},
  };
  const quantity = randomInt(rng, NEUTRAL_MIN_QUANTITY, NEUTRAL_MAX_QUANTITY);
  const range = quantity === NEUTRAL_MIN_QUANTITY ? NEUTRAL_MAX_QUANTITY : NEUTRAL_MIN_QUANTITY;
  const origin = randomItem(rng, PLAYABLE_TILE_IDS);
  const area = [origin, ...tilesWithin(origin, range)];
  changeQuantity(species, origin, 1);
  for (let i = 0; i < quantity; i++) changeQuantity(species, randomItem(rng, area), 1);
  return species;
}

export function createGame(creator: NewPlayer, rng: Rng): GameState {
  const color: PlayerColor = rng() < 0.5 ? 'green' : 'red';
  const state: GameState = {
    rulesVersion: RULES_VERSION,
    phase: 'waiting',
    era: 1,
    round: 1,
    players: [{ id: creator.id, name: creator.name, color, speciesIds: [], score: 0 }],
    species: [],
    setup: null,
    turn: null,
    eraResults: [],
    winner: null,
    lastAction: null,
    actionCount: 0,
  };
  for (let i = 0; i < NEUTRAL_COUNT; i++) state.species.push(createNeutral(state, i, rng));
  return state;
}

export function joinGame(previous: GameState, joiner: NewPlayer, rng: Rng): GameState {
  if (previous.phase !== 'waiting') fail('GAME_NOT_WAITING');
  if (previous.players.length >= 2) fail('GAME_FULL');
  if (previous.players.some((player) => player.id === joiner.id)) fail('ALREADY_IN_GAME');
  const state = structuredClone(previous);
  const color: PlayerColor = state.players[0].color === 'green' ? 'red' : 'green';
  state.players.push({ id: joiner.id, name: joiner.name, color, speciesIds: [], score: 0 });
  // Green always plays first.
  state.players.sort((a, b) => (a.color === b.color ? 0 : a.color === 'green' ? -1 : 1));
  startSetup(state, rng);
  return state;
}

// Gives every player a new species, with abilities to choose from, then a tile to choose.
export function startSetup(state: GameState, rng: Rng): void {
  state.phase = 'setup';
  state.setup = { choices: {} };
  for (const player of state.players) {
    const species = createPlayerSpecies(player.id, player.speciesIds.length);
    state.species.push(species);
    player.speciesIds.push(species.id);
    state.setup.choices[player.id] = {
      speciesId: species.id,
      abilityChoices: drawAbilities(state, ABILITY_CHOICE_COUNT, rng, { allowDuplicates: true }),
      abilityId: null,
      tileId: null,
    };
  }
}

function getChoice(state: GameState, playerId: string) {
  if (state.phase !== 'setup' || !state.setup) fail('NOT_IN_SETUP');
  getPlayer(state, playerId);
  return state.setup.choices[playerId] ?? fail('NOT_A_PLAYER');
}

export function chooseAbility(state: GameState, playerId: string, abilityId: AbilityId): void {
  const choice = getChoice(state, playerId);
  if (choice.abilityId !== null) fail('ABILITY_ALREADY_CHOSEN');
  if (!choice.abilityChoices.includes(abilityId)) fail('ABILITY_NOT_OFFERED');
  choice.abilityId = abilityId;
  getSpecies(state, choice.speciesId).abilityIds.push(abilityId);
}

export function chooseStartTile(state: GameState, playerId: string, tileId: number): void {
  const choice = getChoice(state, playerId);
  if (choice.abilityId === null) fail('ABILITY_NOT_CHOSEN');
  if (choice.tileId !== null) fail('TILE_ALREADY_CHOSEN');
  if (!isPlayable(tileId)) fail('INVALID_TILE');
  choice.tileId = tileId;
  const choices = Object.values(state.setup!.choices);
  if (choices.every((c) => c.tileId !== null)) finishSetup(state);
}

// Places the new species and lets the first player act, with one action less.
function finishSetup(state: GameState): void {
  for (const choice of Object.values(state.setup!.choices)) {
    changeQuantity(getSpecies(state, choice.speciesId), choice.tileId!, STARTING_QUANTITY);
  }
  state.setup = null;
  state.phase = 'playing';
  const first = state.players[0];
  state.turn = {
    playerId: first.id,
    speciesId: first.speciesIds[0],
    remainingActions: FIRST_TURN_ACTIONS,
    migrationPointsUsed: 0,
    pendingAdaptation: null,
  };
}
