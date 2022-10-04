// Angular
import { Injectable } from '@angular/core';

// Firebase
import firebase from 'firebase/app';

// Akita
import { CollectionConfig, CollectionService } from 'akita-ng-fire';

// States
import { GameQuery, GameService } from 'src/app/games/_state';
import { Ability } from '../../species/_state';
import { PlayerQuery } from './player.query';
import { PlayerStore, PlayerState } from './player.store';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'games/:gameId/players' })
export class PlayerService extends CollectionService<PlayerState> {
  constructor(
    store: PlayerStore,
    private query: PlayerQuery,
    private gameQuery: GameQuery,
    private gameService: GameService
  ) {
    super(store);
  }

  public setActive(id: string) {
    this.store.setActive(id);
  }

  // ADAPTATION - UTILS - Selects random available abilities.
  public setAbilityChoices(choiceQuantity: number) {
    let usedAbilities = [];
    usedAbilities.push(this.gameQuery.inGameAbilities);
    let abilities: Ability[] = [];

    for (let i = 0; i < choiceQuantity; i++) {
      // Gets a random ability
      abilities.push(this.gameService.getRandomAbility(usedAbilities));
      // Updates usedAbilities to avoid duplicates
      usedAbilities.push(abilities[i]);
    }

    this.saveAbilityChoices(abilities);
    
    return abilities;
  }

  public async saveAbilityChoices(abilities: Ability[]) {
    const gameId = this.gameQuery.getActiveId();
    const activePlayerId = this.query.getActiveId();
    const abilityChoices = firebase.firestore.FieldValue.arrayUnion(
      ...abilities
    );
    await this.db.firestore
      .collection(`games/${gameId}/players`)
      .doc(activePlayerId)
      .update({
        isChoosingAbility: true,
        abilityChoices,
      })
      .catch((error) => {
        console.log('Updating ability choices failed: ', error);
      });
  }
}
