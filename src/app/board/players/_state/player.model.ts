import { Colors } from 'src/app/games/_state';
import { Ability } from '../../species/_state';

export interface Player {
  id: string;
  speciesIds: string[];
  score: number;
  tileIds?: number[];
  colors: Colors;
  abilityChoice: {
    isChoosingAbility: boolean;
    abilityChoices: Ability[];
    activeTileId: number;
  };
  isWaitingForNextStartStage: boolean;
}

export function createPlayer(
  id: string,
  speciesIds: string[],
  colors: Colors,
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
