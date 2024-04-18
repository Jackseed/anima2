export interface User {
  id: string;
  name?: string;
  gamePlayed?: string[];
  matchPlayed?: number;
  matchWon?: number;
}

export function createUser(params: Partial<User>) {
  return {
    id: params.id,
    username: params.name || '',
    gamePlayed: [],
    matchPlayed: 0,
    matchWon: 0,
  };
}
