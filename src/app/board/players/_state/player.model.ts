import { guid } from '@datorama/akita';

export interface Player {
  id: string;
  speciesIds: string[];
  score: number;
  tileIds?: number[];
}

export function createPlayer(id: string, params: Partial<Player>): Player {
  return {
    id: params.id,
    speciesIds: [guid()],
    score: 0,
    ...params,
  };
}
