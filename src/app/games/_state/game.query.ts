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

  public get playerCount$(): Observable<number> {
    const game$ = this.selectActive();

    return game$.pipe(map((game) => (game ? game.playerIds.length : 0)));
  }

  public isGameFull(gameId: string): boolean {
    const game = this.getEntity(gameId);
    return game.playerIds.length === 2;
  }

  public get remainingMigrations(): number {
    return +this.getActive().remainingMigrations;
  }

  public get remainingMigrations$(): Observable<number> {
    return this.selectActive().pipe(
      map((game) => Number(game.remainingMigrations))
    );
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

  public get isStarting(): boolean {
    return this.getActive().isStarting;
  }
}
