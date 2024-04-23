import { Ability, Species } from '../../species/_state/species.model';

export interface Player {
  id: string;
  name: string;
  speciesIds: string[];
  species?: Species[];
  score: number;
  regionScores: RegionScores;
  color: 'red' | 'green' | 'neutral';
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
  | 'newEra'
  | 'newSpecies'
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
  name: string,
  speciesIds: string[],
  color: 'red' | 'green' | 'neutral',
  params?: Partial<Player>
): Player {
  return {
    id,
    name,
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
    color,
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
