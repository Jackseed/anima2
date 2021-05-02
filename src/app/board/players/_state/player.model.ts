export interface Player {
  id: string;
  speciesIds: string[];
  score: number;
  tileIds?: number[];
}

export function createPlayer(
  id: string,
  speciesIds: string[],
  params?: Partial<Player>
): Player {
  return {
    id: id,
    speciesIds: speciesIds,
    score: 0,
    ...params,
  };
}
