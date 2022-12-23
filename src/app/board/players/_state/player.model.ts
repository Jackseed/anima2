import { Ability } from '../../species/_state';

export const ABILITY_CHOICE_AMOUNT = 2;

export interface Player {
  id: string;
  speciesIds: string[];
  score: number;
  tileIds?: number[];
  primaryColor: string;
  secondaryColor: string;
  abilityChoice: {
    isChoosingAbility: boolean;
    abilityChoices: Ability[];
    activeTileId: number;
  };
  isReadyForNextStartState: boolean;
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
    abilityChoice: {
      isChoosingAbility: false,
      abilityChoices: [],
      activeTileId: null,
    },
    isReadyForNextStartState: true,
    ...params,
  };
}
