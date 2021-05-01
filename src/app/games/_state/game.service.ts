import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { createGame } from './game.model';
import { GameQuery } from './game.query';
import { GameStore, GameState } from './game.store';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'games' })
export class GameService extends CollectionService<GameState> {
  constructor(
    store: GameStore,
    private query: GameQuery,
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
}
