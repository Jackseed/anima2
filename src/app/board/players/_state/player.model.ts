import { Colors } from 'src/app/games/_state';
import { Ability } from '../../species/_state';

export interface Player {
  id: string;
  speciesIds: string[];
  score: number;
  regionScores: RegionScores;
  tileIds?: number[];
  colors: Colors;
  abilityChoice: {
    isChoosingAbility: boolean;
    abilityChoices: Ability[];
    activeTileId: number;
  };
  isWaitingForNextStartStage: boolean;
  isAnimationPlaying: boolean;
  animationState?: AnimationState;
}

export type AnimationState =
  | 'endEraTitle'
  | 'playerNamesTitle'
  | 'regionScore'
  | 'eraScore'
  | 'victory';

export interface RegionScores {
  rockies?: number;
  mountains?: number;
  islands?: number;
  plains?: number;
  swamps?: number;
  forests?: number;
  totalEra?: number;
}

export function createPlayer(
  id: string,
  speciesIds: string[],
  colors: Colors,
  params?: Partial<Player>
): Player {
  return {
    id: id,
    speciesIds,
    score: 0,
    regionScores: {
      rockies: 0,
      mountains: 0,
      islands: 0,
      plains: 0,
      swamps: 0,
      forests: 0,
    },
    tileIds: [],
    colors,
    abilityChoice: {
      isChoosingAbility: false,
      abilityChoices: [],
      activeTileId: null,
    },
    isWaitingForNextStartStage: true,
    isAnimationPlaying: false,
    ...params,
  };
}
