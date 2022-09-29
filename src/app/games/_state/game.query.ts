import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { map } from 'rxjs/operators';
import { GameStore, GameState } from './game.store';

@Injectable({ providedIn: 'root' })
export class GameQuery extends QueryEntity<GameState> {
  constructor(protected store: GameStore) {
    super(store);
  }

  public get migrationCount() {
    return this.getActive().migrationCount;
  }

  public get migrationCount$() {
    return this.selectActive().pipe(map((game) => Number(game.migrationCount)));
  }
}
