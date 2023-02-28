// Angular
import { Injectable } from '@angular/core';

// Firebase
import firebase from 'firebase/app';

// Akita
import { CollectionConfig, CollectionService } from 'akita-ng-fire';

// States
import {
  ABILITY_CHOICE_AMOUNT,
  Game,
  GameQuery,
  GameService,
} from 'src/app/games/_state';
import { Ability } from '../../species/_state';
import { PlayerQuery } from './player.query';
import { PlayerStore, PlayerState } from './player.store';
import { TileQuery } from '../../tiles/_state';
import { AnimationState } from './player.model';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'games/:gameId/players' })
export class PlayerService extends CollectionService<PlayerState> {
  constructor(
    store: PlayerStore,
    private query: PlayerQuery,
    private gameQuery: GameQuery,
    private gameService: GameService,
    private tileQuery: TileQuery
  ) {
    super(store);
  }

  public setActive(id: string) {
    this.store.setActive(id);
  }

  // UTILS - Gets random abilities and saves it with the active tile id.
  public async setRandomAbilityChoice() {
    this.gameService.updateUiAdaptationMenuOpen(true);
    const activeTileId = Number(this.tileQuery.getActiveId());
    const gameId = this.gameQuery.getActiveId();
    const activePlayerId = this.query.getActiveId();

    this.db.firestore
      .runTransaction(async (transaction) => {
        const gameRef = this.db.doc(`games/${gameId}`).ref;
        let usedAbilities: Ability[] = (
          (await transaction.get(gameRef)).data() as Game
        ).inGameAbilities;
        let randomAbilities: Ability[] = [];

        // Gets random abilities and save it as used, to avoid duplicates.
        for (let i = 0; i < ABILITY_CHOICE_AMOUNT; i++) {
          randomAbilities.push(
            this.gameService.getRandomAbility(usedAbilities)
          );
          usedAbilities.push(randomAbilities[i]);
        }
        // Updates player's ability choice
        const playerRef = this.db.doc(
          `games/${gameId}/players/${activePlayerId}`
        ).ref;
        transaction.update(playerRef, {
          abilityChoice: {
            isChoosingAbility: true,
            abilityChoices: randomAbilities,
            activeTileId: activeTileId ? activeTileId : null,
          },
        });

        // Updates used abilities
        const inGameAbilities = firebase.firestore.FieldValue.arrayUnion(
          ...usedAbilities
        );
        transaction.update(gameRef, { inGameAbilities });
      })
      .catch((error) => {
        console.log('Updating ability choices failed: ', error);
      });
  }

  public resetAbilityChoicesByBatch(
    chosenAbility: Ability,
    batch: firebase.firestore.WriteBatch
  ): firebase.firestore.WriteBatch {
    const gameId = this.gameQuery.getActiveId();
    const gameRef = this.db.doc(`games/${gameId}`).ref;
    const activePlayer = this.query.getActive();
    const activePlayerRef = this.db.doc(
      `games/${gameId}/players/${activePlayer.id}`
    ).ref;

    // Removes non chosen ability.
    const nonChosenAbilities: Ability[] =
      activePlayer.abilityChoice.abilityChoices.filter(
        (ability: Ability) => ability !== chosenAbility
      );
    const inGameAbilitiesUpdate = firebase.firestore.FieldValue.arrayRemove(
      ...nonChosenAbilities
    );
    batch.update(gameRef, { inGameAbilities: inGameAbilitiesUpdate });

    // Resets player's ability choices.
    batch.update(activePlayerRef, {
      abilityChoice: {
        isChoosingAbility: false,
        abilityChoices: [],
        activeTileId: null,
      },
    });
    return batch;
  }

  public updateActivePlayerAnimationState(animationState: AnimationState) {
    const gameId = this.gameQuery.getActiveId();
    const activePlayer = this.query.getActive();
    const activePlayerRef = this.db.doc(
      `games/${gameId}/players/${activePlayer.id}`
    ).ref;
    activePlayerRef.update({ animationState });
  }
}
