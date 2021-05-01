import firebase from 'firebase/app';

export interface Game {
  id?: string;
  name?: string;
  playerIds?: string[];
  remainingActions: number;
  eraCount: number;
  turnCount: number;
  actionType: 'newSpecies' | 'proliferate' | 'colonize' | 'newAbility' | '';
  colonizationCount: number | firebase.firestore.FieldValue;
}

export const actionPerTurn = 2;

export function createGame(params: Partial<Game>): Game {
  return {
    id: params.id,
    name: params.name,
    playerIds: params.playerIds,
    remainingActions: actionPerTurn,
    eraCount: 1,
    turnCount: 1,
    actionType: 'newSpecies',
    colonizationCount: 4,
    ...params,
  };
}
