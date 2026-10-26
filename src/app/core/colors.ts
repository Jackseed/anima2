import { NEUTRAL_OWNER, type GameState, type PlayerColor, type SpeciesState } from '@anima/engine';

export interface Colors {
  primary: string;
  secondary: string;
}

export const PLAYER_COLORS: Record<PlayerColor, [Colors, Colors]> = {
  green: [
    { primary: '#3DAF9A', secondary: '#21937D' },
    { primary: '#4EAA78', secondary: '#3A8965' },
  ],
  red: [
    { primary: '#EA665C', secondary: '#CF5562' },
    { primary: '#DD6236', secondary: '#BC4D2F' },
  ],
};
export const NEUTRAL_COLORS: Colors = { primary: '#8A8C93', secondary: '#6A6E78' };

export function speciesColors(state: GameState, species: SpeciesState): Colors {
  if (species.ownerId === NEUTRAL_OWNER) return NEUTRAL_COLORS;
  const owner = state.players.find((player) => player.id === species.ownerId);
  return owner ? PLAYER_COLORS[owner.color][Math.min(species.slot, 1)] : NEUTRAL_COLORS;
}

export function playerColor(color: PlayerColor): string {
  return PLAYER_COLORS[color][0].primary;
}
