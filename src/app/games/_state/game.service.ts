import { Injectable } from '@angular/core';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { createGame } from './game.model';
import { GameStore, GameState } from './game.store';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'games' })
export class GameService extends CollectionService<GameState> {
  constructor(store: GameStore) {
    super(store);
  }

  public async createNewGame(name: string): Promise<string> {
    const id = this.db.createId();
    const game = createGame({ id, name });
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
}
