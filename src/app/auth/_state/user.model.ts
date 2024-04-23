export interface User {
  id: string;
  name?: string;
  gamePlayed?: string[];
  matchPlayed?: number;
  matchWon?: number;
}

export function createUser(params: Partial<User>): User {
  return {
    id: params.id,
    name: params.name || '',
    gamePlayed: [],
    matchPlayed: 0,
    matchWon: 0,
  };
}
