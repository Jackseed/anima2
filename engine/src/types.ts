import type { RegionId } from './board';
import type { AbilityId } from './rules';

export const RULES_VERSION = 1;
export const NEUTRAL_OWNER = 'neutral';

export type PlayerColor = 'green' | 'red';
export type GamePhase = 'waiting' | 'setup' | 'playing' | 'finished';

export interface PlayerState {
  id: string;
  name: string;
  color: PlayerColor;
  // Living species, in play order.
  speciesIds: string[];
  score: number;
}

export interface SpeciesState {
  id: string;
  // A player id, or NEUTRAL_OWNER.
  ownerId: string;
  // 0 for a player's first species, 1 for the second one; neutrals use their index.
  slot: number;
  abilityIds: AbilityId[];
  // Quantity of individuals per tile id. Tiles without individuals are absent.
  positions: Record<string, number>;
}

export interface SetupChoice {
  speciesId: string;
  abilityChoices: AbilityId[];
  abilityId: AbilityId | null;
  tileId: number | null;
}

export interface SetupState {
  // Keyed by player id.
  choices: Record<string, SetupChoice>;
}

export interface PendingAdaptation {
  tileId: number;
  abilityChoices: AbilityId[];
}

export interface TurnState {
  playerId: string;
  speciesId: string;
  remainingActions: number;
  // Migration points spent by the migration in progress.
  migrationPointsUsed: number;
  pendingAdaptation: PendingAdaptation | null;
}

export interface PlayerEraScore {
  regions: Record<RegionId, number>;
  eraPoints: number;
  total: number;
}

export interface EraResult {
  era: number;
  // Keyed by player id.
  scores: Record<string, PlayerEraScore>;
}

export type WinReason = 'score' | 'lastEra' | 'annihilation' | 'resignation';

export interface Winner {
  playerId: string;
  reason: WinReason;
}

export type ActionType =
  | 'migration'
  | 'tunnel'
  | 'proliferation'
  | 'assimilation'
  | 'adaptation'
  | 'intimidation'
  | 'rallying'
  | 'endTurn';

export interface ActionLogEntry {
  // Sequence number of the action within the game.
  id: number;
  playerId: string;
  speciesId: string;
  type: ActionType;
  tileId: number | null;
  targetTileId: number | null;
  targetSpeciesId: string | null;
  quantity: number;
  createdQuantity: number;
  migrationPoints: number;
  abilityId: AbilityId | null;
  // Abilities taken from a species that was wiped out.
  gainedAbilityIds: AbilityId[];
  eliminatedSpeciesId: string | null;
}

export interface GameState {
  rulesVersion: number;
  phase: GamePhase;
  era: number;
  round: number;
  // Turn order: green plays first.
  players: PlayerState[];
  species: SpeciesState[];
  setup: SetupState | null;
  turn: TurnState | null;
  eraResults: EraResult[];
  winner: Winner | null;
  lastAction: ActionLogEntry | null;
  actionCount: number;
}

export type Command =
  | { type: 'chooseAbility'; abilityId: AbilityId }
  | { type: 'chooseStartTile'; tileId: number }
  | { type: 'migrate'; fromTileId: number; toTileId: number }
  | { type: 'tunnel'; fromTileId: number; toTileId: number }
  | { type: 'proliferate'; tileId: number; targetTileId?: number }
  | { type: 'assimilate'; tileId: number; targetTileId: number; targetSpeciesId: string }
  | { type: 'startAdaptation'; tileId: number }
  | { type: 'adapt'; abilityId: AbilityId }
  | { type: 'intimidate'; tileId: number; targetSpeciesId: string }
  | { type: 'rally'; tileId: number; fromTileId: number }
  | { type: 'endTurn' }
  | { type: 'resign' };

export type CommandType = Command['type'];

// Returns a float in [0, 1).
export type Rng = () => number;

export interface NewPlayer {
  id: string;
  name: string;
}
