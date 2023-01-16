import { Ability } from '../../species/_state';

export const ABILITY_CHOICE_AMOUNT = 2;
export const GREEN_PRIMARY_COLOR = '#4cab79';
export const GREEN_SECONDARY_COLOR = '#378965';
export const RED_PRIMARY_COLOR = '#d75b62';
export const RED_SECONDARY_COLOR = '#be4545';

export interface Player {
  id: string;
  speciesIds: string[];
  score: number;
  tileIds?: number[];
  colors: PlayerColors;
  abilityChoice: {
    isChoosingAbility: boolean;
    abilityChoices: Ability[];
    activeTileId: number;
  };
  isWaitingForNextStartStage: boolean;
}

export interface PlayerColors {
  primary: string;
  secondary: string;
}

export function createPlayer(
  id: string,
  speciesIds: string[],
  colors: PlayerColors,
  params?: Partial<Player>
): Player {
  return {
    id: id,
    speciesIds: speciesIds,
    score: 0,
    tileIds: [],
    colors,
    abilityChoice: {
      isChoosingAbility: false,
      abilityChoices: [],
      activeTileId: null,
    },
    isWaitingForNextStartStage: true,
    ...params,
  };
}
