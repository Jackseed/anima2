import firebase from 'firebase/app';
import { Ability } from 'src/app/board/species/_state';

export interface Game {
  id?: string;
  name?: string;
  playerIds?: string[];
  activePlayerId?: string;
  remainingActions: number;
  eraCount: number;
  turnCount: number;
  remainingMigrations: number | firebase.firestore.FieldValue;
  inGameAbilities: Ability[];
  isStarting: boolean;
  startStage: StartStage;
}

export const DEFAULT_ACTION_PER_TURN = 2;
export const DEFAULT_REMAINING_MIGRATIONS = 4;
export type StartStage =
  | 'launching'
  | 'abilityChoice'
  | 'tileChoice'
  | 'tileValidated';

export function createGame(params: Partial<Game>): Game {
  return {
    id: params.id,
    name: params.name,
    playerIds: params.playerIds,
    activePlayerId: params.activePlayerId,
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
