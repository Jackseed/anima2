export interface Game {
  id?: string;
  name?: string;
}

export const cols = 12;
export const lines = 13;
export const max = cols * lines;

export function createGame(params: Partial<Game> = {}): Game {
  return {
    id: params.id,
    name: params.name,
    ...params,
  };
}
