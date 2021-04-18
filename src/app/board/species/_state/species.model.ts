export interface Species {
  id?: string;
  tileIds?: number[];
  playerId?: string;
  isDead?: boolean;
}

export function createSpecies(
  id?: string,
  playerId?: string,
  tileIds?: number[],
  params?: Partial<Species>
): Species {
  return {
    id,
    playerId,
    tileIds,
    ...params,
  };
}
