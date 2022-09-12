import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { GameStore, GameState } from './game.store';

@Injectable({ providedIn: 'root' })
export class GameQuery extends QueryEntity<GameState> {
  constructor(protected store: GameStore) {
    super(store);
  }

  public get migrationCount() {
    return this.getActive().migrationCount;
  }
}
