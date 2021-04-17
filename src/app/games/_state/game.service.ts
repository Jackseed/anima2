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

  createNewGame(name: string) {
    const id = this.db.createId();
    const game = createGame({ id, name });
    // Create the game
    this.collection.doc(id).set(game);
    return id;
  }
}
