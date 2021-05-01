import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { actionPerTurn, colonizationCount, createGame } from './game.model';
import { GameQuery } from './game.query';
import { GameStore, GameState } from './game.store';
import firebase from 'firebase/app';
import { fullRegions, Region } from 'src/app/board/tiles/_state';
import { Player, PlayerQuery } from 'src/app/board/players/_state';
import { SpeciesQuery } from 'src/app/board/species/_state';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'games' })
export class GameService extends CollectionService<GameState> {
  constructor(
    store: GameStore,
    private query: GameQuery,
    private playerQuery: PlayerQuery,
    private speciesQuery: SpeciesQuery,
    private afAuth: AngularFireAuth
  ) {
    super(store);
  }

  public async createNewGame(name: string): Promise<string> {
    const id = this.db.createId();
    const playerIds = [(await this.afAuth.currentUser).uid];
    const game = createGame({ id, name, playerIds });

    // Create the game
    await this.collection
      .doc(id)
      .set(game)
      .then(() => {
        console.log('Transaction successfully committed!');
      })
      .catch((error) => {
        console.log('Transaction failed: ', error);
      });
    return id;
  }

  public async switchActionType(
    actionType: '' | 'newSpecies' | 'proliferate' | 'colonize' | 'newAbility'
  ) {
    const id = this.query.getActiveId();
    await this.collection
      .doc(id)
      .update({ actionType })
      .then(() => {
        console.log('Transaction successfully committed!');
      })
      .catch((error) => {
        console.log('Transaction failed: ', error);
      });
  }

  public async incrementTurnCount() {
    const game = this.query.getActive();
    const gameRef = this.db.collection('games').doc(game.id).ref;
    const batch = this.db.firestore.batch();
    const increment = firebase.firestore.FieldValue.increment(1);

    batch.update(gameRef, { turnCount: increment });
    batch.update(gameRef, { remainingActions: actionPerTurn });

    if ((game.turnCount + 1) % 3 === 0)
      batch.update(gameRef, { eraCount: increment });

    return batch
      .commit()
      .then(() => {
        console.log('incrementTurnCount - Transaction successfully committed!');
      })
      .catch((error) => {
        console.log('Transaction failed: ', error);
      });
  }

  public async decrementRemainingActions() {
    const game = this.query.getActive();
    const gameRef = this.db.collection('games').doc(game.id).ref;
    const batch = this.db.firestore.batch();
    const decrement = firebase.firestore.FieldValue.increment(-1);

    batch.update(gameRef, { remainingActions: decrement });
    batch.update(gameRef, { colonizationCount: colonizationCount });

    return batch
      .commit()
      .then(() => {
        console.log(
          'decrementRemainingActions - Transaction successfully committed!'
        );
      })
      .catch((error) => {
        console.log('Transaction failed: ', error);
      });
  }

  public countScore(region: Region) {
    const game = this.query.getActive();
    const regions = fullRegions;
    const players: Player[] = [];
    game.playerIds.forEach((id) =>
      players.push({ ...this.playerQuery.getEntity(id), tileIds: [] })
    );
    players.forEach((player) =>
      player.speciesIds.forEach((speciesId) => {
        const species = this.speciesQuery.getEntity(speciesId);
        player.tileIds = [...player.tileIds, ...species.tileIds];
      })
    );
    console.log(players);
    const isPlayerControling = new Array(players.length).fill(true);
    regions[region].forEach((id) => {
      players.forEach((player, index: number) => {
        if (isPlayerControling[index]) players[index].tileIds;
      });
    });
    console.log(isPlayerControling);
  }
}
