import { Ability } from '../../species/_state';

export interface Player {
  id: string;
  speciesIds: string[];
  score: number;
  tileIds?: number[];
  primaryColor: string;
  secondaryColor: string;
  abilityChoices: Ability[];
}

export function createPlayer(
  id: string,
  speciesIds: string[],
  primaryColor: string,
  secondaryColor: string,
  params?: Partial<Player>
): Player {
  return {
    id: id,
    speciesIds: speciesIds,
    score: 0,
    tileIds: [],
    primaryColor,
    secondaryColor,
    abilityChoices: [],
    ...params,
  };
}
