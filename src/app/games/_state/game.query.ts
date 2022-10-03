// Angular
import { Injectable } from '@angular/core';

// Akita
import { QueryEntity } from '@datorama/akita';

// Rxjs
import { map } from 'rxjs/operators';

// States
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

  public get inGameAbilities() {
    return this.getActive().inGameAbilities;
  }
}
