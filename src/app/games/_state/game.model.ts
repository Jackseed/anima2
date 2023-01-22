import firebase from 'firebase/app';
import { Ability } from 'src/app/board/species/_state';

// GAME CONSTANTS
export const DEFAULT_MOVING_QUANTITY = 1;
export const DEFAULT_SPECIES_AMOUNT = 4;
export const ABILITY_CHOICE_AMOUNT = 2;
export const MAX_SPECIES_ABILITIES = 3;
export const DEFAULT_ACTION_PER_TURN = 2;
export type StartStage =
  | 'launching'
  | 'abilityChoice'
  | 'tileChoice'
  | 'tileValidated';

// ACTIONS
export const DEFAULT_REMAINING_MIGRATIONS = 4;
export const ADAPATION_SPECIES_NEEDED = 5;
export const DEFAULT_PROLIFERATION_NEEDED_INDIVIDUALS = 2;
export const DEFAULT_PROLIFERATION_CREATED_QUANTITY = 2;
export const DEFAULT_ASSIMILATED_QUANTITY = -2;
export const DEFAULT_ASSIMILATION_CREATED_QUANTITY = 1;
export const DEFAULT_ASSIMILATION_RANGE = 0;

// COLORS
export const GREEN_PRIMARY_COLOR = '#4cab79';
export const GREEN_SECONDARY_COLOR = '#378965';
export const RED_PRIMARY_COLOR = '#d75b62';
export const RED_SECONDARY_COLOR = '#be4545';
export const NEUTRAL_PRIMARY_COLOR = '#bfbfbf';
export const NEUTRAL_SECONDARY_COLOR = '#9b9b9b';
export const NEUTRAL_COLORS: Colors = {
  primary: NEUTRAL_PRIMARY_COLOR,
  secondary: NEUTRAL_SECONDARY_COLOR,
};

export interface Game {
  id?: string;
  name?: string;
  playerIds?: string[];
  playingPlayerId?: string;
  remainingActions: number;
  eraCount: number;
  turnCount: number;
  remainingMigrations: number | firebase.firestore.FieldValue;
  inGameAbilities: Ability[];
  isStarting: boolean;
  startStage: StartStage;
  tileChoices: TileChoice[];
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
    name: params.name,
    playerIds: params.playerIds,
    playingPlayerId: params.playingPlayerId,
    remainingActions: DEFAULT_ACTION_PER_TURN,
    eraCount: 1,
    turnCount: 1,
    remainingMigrations: DEFAULT_REMAINING_MIGRATIONS,
    inGameAbilities: [],
    isStarting: true,
    startStage: 'launching',
    tileChoices: [],
    ...params,
  };
}
