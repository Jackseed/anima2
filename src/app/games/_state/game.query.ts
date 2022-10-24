// Angular
import { Injectable } from '@angular/core';

// Akita
import { EntityUIQuery, QueryEntity } from '@datorama/akita';

// Rxjs
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// States
import { GameStore, GameState, GameUIState, GameUI } from './game.store';

@Injectable({ providedIn: 'root' })
export class GameQuery extends QueryEntity<GameState> {
  ui: EntityUIQuery<GameUIState, GameUI>;
  constructor(protected store: GameStore) {
    super(store);
    this.createUIQuery();
  }

  public get migrationCount() {
    return this.getActive().migrationCount;
  }

  public get migrationCount$(): Observable<number> {
    return this.selectActive().pipe(map((game) => Number(game.migrationCount)));
  }

  public get inGameAbilities() {
    return this.getActive().inGameAbilities;
  }

  public get isAdaptationMenuOpen(): boolean {
    return this.ui.getAll()[0].isAdaptationMenuOpen;
  }

  public get remainingActionsArray$(): Observable<number[]> {
    return this.selectActive().pipe(
      map((game) => new Array(game.remainingActions))
    );
  }

  public get isGameStarting(): boolean {
    return this.getActive().isStarting;
  }
}
