import { Injectable } from '@angular/core';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { GameStore, GameState } from './game.store';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'games' })
export class GameService extends CollectionService<GameState> {

  constructor(store: GameStore) {
    super(store);
  }

}
