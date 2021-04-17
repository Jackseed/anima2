import { Injectable } from '@angular/core';
import { EntityState, EntityStore, StoreConfig, ActiveState } from '@datorama/akita';
import { Game } from './game.model';

export interface GameState extends EntityState<Game, string>, ActiveState<string> {}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'game' })
export class GameStore extends EntityStore<GameState> {

  constructor() {
    super();
  }

}
