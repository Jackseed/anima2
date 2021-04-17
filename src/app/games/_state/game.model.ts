export interface Game {
  id?: string;
  name?: string;
}

export function createGame(params: Partial<Game> = {}): Game {
  return {
    id: params.id,
    name: params.name,
    ...params,
  };
}
