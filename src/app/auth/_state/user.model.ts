export interface User {
  id: string;
  name?: string;
  gamePlayed?: string[];
  matchesPlayed?: number;
  matchesWon?: number;
}

export function createUser(params: Partial<User>): User {
  return {
    id: params.id,
    name: params.name || '',
    gamePlayed: [],
    matchesPlayed: 0,
    matchesWon: 0,
  };
}
