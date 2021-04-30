export interface Game {
  id?: string;
  name?: string;
  playerIds?: string[];
  era?: {
    remainingActions: number;
    eraCounters: number;
    turnCount: number;
  };
}

export const actionPerTurn = 2;

export function createGame(params: Partial<Game> = {}): Game {
  return {
    id: params.id,
    name: params.name,
    playerIds: params.playerIds,
    era: {
      remainingActions: actionPerTurn,
      eraCounters: 1,
      turnCount: 1,
    },
    ...params,
  };
}
