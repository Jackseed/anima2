import { findSpecies, type ActionLogEntry, type GameState } from '@anima/engine';
import type { Texts } from '../core/texts';

// Message shown to the opponent after an action, as in the 1.x app. A species wiped out by the
// action is only in the previous state.
export function actionMessage(entry: ActionLogEntry, state: GameState, texts: Texts, previous?: GameState | null): string {
  const nameOf = (speciesId: string | null) => {
    const species = speciesId
      ? (findSpecies(state, speciesId) ?? (previous ? findSpecies(previous, speciesId) : undefined))
      : undefined;
    const ability = species?.abilityIds[0];
    return ability ? texts.abilities[ability] : { name: '?', genre: 'm' as const };
  };
  const messages = texts.messages;
  const actor = nameOf(entry.speciesId);
  const target = nameOf(entry.targetSpeciesId);
  let message: string;
  switch (entry.type) {
    case 'migration':
      message = messages.migration(entry.migrationPoints);
      break;
    case 'tunnel':
      message = messages.tunnel(entry.quantity, actor.name, actor.genre);
      break;
    case 'assimilation':
      message = messages.assimilation(entry.quantity, target.name, target.genre);
      break;
    case 'proliferation':
      message = messages.proliferation(entry.createdQuantity, actor.name, actor.genre);
      break;
    case 'adaptation': {
      const ability = entry.abilityId ? texts.abilities[entry.abilityId] : { name: '?', genre: 'm' as const };
      message = messages.adaptation(ability.name, ability.genre);
      break;
    }
    case 'rallying':
      message = messages.rallying(entry.quantity, actor.name, actor.genre);
      break;
    case 'intimidation':
      message = messages.intimidation(entry.quantity, target.name, target.genre);
      break;
    case 'endTurn':
      message = messages.endTurn;
      break;
  }
  if (entry.eliminatedSpeciesId) {
    // Without the previous state, the name comes from the traits the attacker took.
    const ability = entry.gainedAbilityIds[0];
    const eliminated = target.name !== '?' || !ability ? target : texts.abilities[ability];
    message += `\n${messages.eliminated(eliminated.name, eliminated.genre)}`;
  }
  return message;
}

export function playedTiles(entry: ActionLogEntry): number[] {
  return [entry.tileId, entry.targetTileId].filter((id): id is number => id !== null);
}
