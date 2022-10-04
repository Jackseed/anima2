import { Ability } from '../../species/_state';

export interface Player {
  id: string;
  speciesIds: string[];
  score: number;
  tileIds?: number[];
  primaryColor: string;
  secondaryColor: string;
  isChoosingAbility: boolean;
  // TODO: fix any
  // any is used to fix a type error when saving abilities
  abilityChoices: Ability[] | any;
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
    isChoosingAbility: false,
    abilityChoices: [],
    ...params,
  };
}
