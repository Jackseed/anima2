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
  public async setRandomAbilityChoice(playerIds: string[]) {
    const activeTileId = Number(this.tileQuery.getActiveId());
    const gameId = this.gameQuery.getActiveId();
    const gameRef = this.db.doc(`games/${gameId}`).ref;
    const gameSnapshot = await gameRef.get();
    let usedAbilities: Ability[] = (gameSnapshot.data() as Game)
      .inGameAbilities;

    const batch = this.db.firestore.batch();

    for (const playerId of playerIds) {
      const randomAbilities = this.getRandomAbilities(usedAbilities);
      usedAbilities = [...usedAbilities, ...randomAbilities];

      const playerRef = this.db.doc(`games/${gameId}/players/${playerId}`).ref;
      batch.update(playerRef, {
        abilityChoice: {
          isChoosingAbility: true,
          abilityChoices: randomAbilities,
          activeTileId: activeTileId ? activeTileId : null,
        },
      });
    }

    batch.update(gameRef, {
      inGameAbilities: firebase.firestore.FieldValue.arrayUnion(
        ...usedAbilities
      ),
    });

    return batch.commit().catch((error) => {
      console.log('Updating ability choices failed: ', error);
    });
  }

  private getRandomAbilities(usedAbilities: Ability[]): Ability[] {
    const randomAbilities: Ability[] = [];
    for (let i = 0; i < ABILITY_CHOICE_AMOUNT; i++) {
      const randomAbility = this.gameService.getRandomAbility(usedAbilities);
      if (randomAbility) {
        randomAbilities.push(randomAbility);
        usedAbilities = [...usedAbilities, randomAbility];
      }
    }
    return randomAbilities;
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

  public updateisAnimationPlaying(isAnimationPlaying: boolean) {
    const gameId = this.gameQuery.getActiveId();
    const activePlayer = this.query.getActive();
    const activePlayerRef = this.db.doc(
      `games/${gameId}/players/${activePlayer.id}`
    ).ref;
    activePlayerRef.update({ isAnimationPlaying });
  }
}
