import firebase from 'firebase/app';

export interface Game {
  id?: string;
  name?: string;
  playerIds?: string[];
  activePlayerId?: string;
  remainingActions: number;
  eraCount: number;
  turnCount: number;
  actionType: 'newSpecies' | 'proliferate' | 'migrate' | 'newAbility' | '';
  migrationCount: number | firebase.firestore.FieldValue;
  isGameStarting: boolean;
}

export const actionPerTurn = 2;
export const migrationCount = 4;

export function createGame(params: Partial<Game>): Game {
  return {
    id: params.id,
    name: params.name,
    playerIds: params.playerIds,
    activePlayerId: params.activePlayerId,
    remainingActions: actionPerTurn,
    eraCount: 1,
    turnCount: 1,
    actionType: 'newSpecies',
    migrationCount,
    isGameStarting: true,
    ...params,
  };
}
