import firebase from 'firebase/app';
import { Ability } from 'src/app/board/species/_state';

// GAME CONSTANTS
export const ABILITY_CHOICE_AMOUNT = 2;
export const DEFAULT_ACTION_PER_TURN = 2;
export const DEFAULT_REMAINING_MIGRATIONS = 4;
export type StartStage =
  | 'launching'
  | 'abilityChoice'
  | 'tileChoice'
  | 'tileValidated';

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
    ...params,
  };
}
