import firebase from 'firebase/app';
import { Ability, AbilityId, GameAction } from 'src/app/board/species/_state';

// TESTING
export const isTesting = false;
export const TESTING_ABILITY: AbilityId | '' = isTesting ? '' : '';

// GAME CONSTANTS
export const DEFAULT_MOVING_QUANTITY = 1;
export const DEFAULT_FIRST_PLAYER_SPECIES_AMOUNT = 4;
export const DEFAULT_SPECIES_AMOUNT = 4;
export const ABILITY_CHOICE_AMOUNT = 2;
export const MAX_SPECIES_ABILITIES = 3;
export const NEW_SPECIES_ERA = 2;
export const DEFAULT_ACTION_PER_TURN = isTesting ? 1 : 2;
export type StartStage =
  | 'launching'
  | 'abilityChoice'
  | 'tileChoice'
  | 'tileValidated';
export const NEUTRALS_MIN_QUANTITY = isTesting ? 1 : 3;
export const NEUTRALS_MAX_QUANTITY = isTesting ? 1 : 5;
export const WINNING_POINTS = 30;
export const LAST_ERA = 5;

// ACTIONS
export const DEFAULT_REMAINING_MIGRATIONS = 4;
export const ADAPATION_SPECIES_NEEDED = 5;
export const DEFAULT_PROLIFERATION_NEEDED_INDIVIDUALS = 2;
export const DEFAULT_PROLIFERATION_CREATED_QUANTITY = 2;
export const DEFAULT_ASSIMILATED_QUANTITY = -2;
export const DEFAULT_ASSIMILATION_CREATED_QUANTITY = 1;
export const DEFAULT_ASSIMILATION_RANGE = 0;

// COLORS
export const GREEN_FIRST_PRIMARY_COLOR = '#3DAF9A';
export const GREEN_FIRST_SECONDARY_COLOR = '#21937D';
export const GREEN_FIRST_COLORS: Colors = {
  primary: GREEN_FIRST_PRIMARY_COLOR,
  secondary: GREEN_FIRST_SECONDARY_COLOR,
};
export const GREEN_SECOND_PRIMARY_COLOR = '#4EAA78';
export const GREEN_SECOND_SECONDARY_COLOR = '#3A8965';
export const GREEN_SECOND_COLORS: Colors = {
  primary: GREEN_SECOND_PRIMARY_COLOR,
  secondary: GREEN_SECOND_SECONDARY_COLOR,
};
export const RED_FIRST_PRIMARY_COLOR = '#EA665C';
export const RED_FIRST_SECONDARY_COLOR = '#CF5562';
export const RED_FIRST_COLORS: Colors = {
  primary: RED_FIRST_PRIMARY_COLOR,
  secondary: RED_FIRST_SECONDARY_COLOR,
};
export const RED_SECOND_PRIMARY_COLOR = '#DD6236';
export const RED_SECOND_SECONDARY_COLOR = '#BC4D2F';
export const RED_SECOND_COLORS: Colors = {
  primary: RED_SECOND_PRIMARY_COLOR,
  secondary: RED_SECOND_SECONDARY_COLOR,
};
export const NEUTRAL_PRIMARY_COLOR = '#8A8C93';
export const NEUTRAL_SECONDARY_COLOR = '#6A6E78';
export const NEUTRAL_COLORS: Colors = {
  primary: NEUTRAL_PRIMARY_COLOR,
  secondary: NEUTRAL_SECONDARY_COLOR,
};

export interface Game {
  id?: string;
  createdAt: firebase.firestore.Timestamp;
  name?: string;
  playerIds?: string[];
  playingPlayerId?: string;
  playingSpeciesId?: string;
  remainingActions: number;
  eraCount: number;
  turnCount: number;
  remainingMigrations: number | firebase.firestore.FieldValue;
  inGameAbilities: Ability[];
  isStarting: boolean;
  startStage: StartStage;
  tileChoices: TileChoice[];
  isFinished: boolean;
  winnerId?: string;
  lastAction?: Action;
}

export interface Action {
  playerId: string;
  speciesId: string;
  action: GameAction;
  originTileId: number;
  data?: ActionData;
}

export interface ActionData {
  targetedTileId?: number;
  targetedSpeciesId?: string;
  targetedAbilityId?: AbilityId;
  createdQuantity?: number;
  sacrificedQuantity?: number;
  assimilatedQuantity?: number;
  movedQuantity?: number;
  migrationUsed?: number;
}

export interface TileChoice {
  speciesId: string;
  tileId: number;
}

export interface Colors {
  primary: string;
  secondary: string;
}

export function createGame(params: Partial<Game>): Game {
  return {
    id: params.id,
    createdAt: params.createdAt || firebase.firestore.Timestamp.now(),
    name: params.name,
    playerIds: params.playerIds,
    playingPlayerId: params.playingPlayerId || '',
    playingSpeciesId: params.playingSpeciesId || '',
    remainingActions: DEFAULT_ACTION_PER_TURN,
    eraCount: 1,
    turnCount: 1,
    remainingMigrations: DEFAULT_REMAINING_MIGRATIONS,
    inGameAbilities: [],
    isStarting: true,
    startStage: 'launching',
    tileChoices: [],
    isFinished: false,
    ...params,
  };
}
