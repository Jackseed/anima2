import { REGIONS, type Region, type RegionId } from './board';
import { playerSpecies, quantityOn, randomItem, totalQuantity } from './state';
import type { EraResult, GameState, PlayerEraScore, Rng } from './types';

// A player controls a region when each of its tiles hosts at least one of their individuals.
export function controlsRegion(state: GameState, playerId: string, region: Region): boolean {
  const species = playerSpecies(state, playerId);
  return region.tileIds.every((tileId) => species.some((s) => quantityOn(s, tileId) > 0));
}

export function regionScores(state: GameState, playerId: string): Record<RegionId, number> {
  const scores = {} as Record<RegionId, number>;
  for (const region of REGIONS) {
    scores[region.id] = controlsRegion(state, playerId, region) ? region.points : 0;
  }
  return scores;
}

export function eraPoints(state: GameState, playerId: string): number {
  return Object.values(regionScores(state, playerId)).reduce((sum, points) => sum + points, 0);
}

// Adds the points of the era to each player and records the details.
export function scoreEra(state: GameState): EraResult {
  const scores: Record<string, PlayerEraScore> = {};
  for (const player of state.players) {
    const regions = regionScores(state, player.id);
    const points = Object.values(regions).reduce((sum, value) => sum + value, 0);
    player.score += points;
    scores[player.id] = { regions, eraPoints: points, total: player.score };
  }
  const result: EraResult = { era: state.era, scores };
  state.eraResults.push(result);
  return result;
}

// Highest score wins; ties go to the most abilities, then the most individuals, then chance.
export function determineWinner(state: GameState, rng: Rng): string {
  const criteria: ((playerId: string) => number)[] = [
    (id) => state.players.find((player) => player.id === id)!.score,
    (id) => playerSpecies(state, id).reduce((sum, species) => sum + species.abilityIds.length, 0),
    (id) => playerSpecies(state, id).reduce((sum, species) => sum + totalQuantity(species), 0),
  ];
  let candidates = state.players.map((player) => player.id);
  for (const criterion of criteria) {
    const best = Math.max(...candidates.map(criterion));
    candidates = candidates.filter((id) => criterion(id) === best);
    if (candidates.length === 1) return candidates[0];
  }
  return randomItem(rng, candidates);
}
