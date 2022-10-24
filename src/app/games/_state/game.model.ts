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
  migrationCount: number | firebase.firestore.FieldValue;
  isStarting: boolean;
  startState: startState;
  // TODO: fix any
  // any is used to fix a type error when saving abilities
  inGameAbilities: Ability[] | any;
}

export const actionPerTurn = 2;
export const migrationCount = 4;
export type startState =
  | 'launching'
  | 'abilityChoice'
  | 'tileChoice'
  | 'tileSelected'
  | 'tileValidated';

export function createGame(params: Partial<Game>): Game {
  return {
    id: params.id,
    name: params.name,
    playerIds: params.playerIds,
    activePlayerId: params.activePlayerId,
    remainingActions: actionPerTurn,
    eraCount: 1,
    turnCount: 1,
    migrationCount,
    isStarting: true,
    startState: 'launching',
    inGameAbilities: [],
    ...params,
  };
}
