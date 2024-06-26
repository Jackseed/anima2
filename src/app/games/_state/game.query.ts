// Angular
import { Injectable } from '@angular/core';

// Akita
import { EntityUIQuery, QueryEntity } from '@datorama/akita';

// Rxjs
import { Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';

// States
import { GameStore, GameState, GameUIState, GameUI } from './game.store';
import { StartStage, Action } from '.';

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

  public get isGameFull$(): Observable<boolean> {
    const game$ = this.selectActive();
    return game$.pipe(
      map((game) => (game ? game.playerIds.length === 2 : false))
    );
  }

  public get remainingMigrations(): number {
    return +this.getActive().remainingMigrations;
  }

  public get remainingMigrations$(): Observable<number> {
    return this.selectActive().pipe(
      map((game) => Number(game.remainingMigrations))
    );
  }

  public get isLastAction(): boolean {
    const game = this.getActive();
    return game.remainingActions === 1;
  }

  public get inGameAbilities() {
    return this.getActive().inGameAbilities;
  }

  public get isAdaptationMenuOpen(): boolean {
    const gameId = this.getActiveId();
    return this.ui.getEntity(gameId).isAdaptationMenuOpen;
  }

  public get actionMessage$(): Observable<string> {
    const gameId = this.getActiveId();
    return this.ui.selectEntity(gameId).pipe(
      map((ui) => ui.actionMessage),
      distinctUntilChanged()
    );
  }

  public get remainingActionsArray$(): Observable<number[]> {
    return this.selectActive().pipe(
      map((game) => new Array(game.remainingActions))
    );
  }

  public get isStarting(): boolean {
    return this.getActive().isStarting;
  }

  public get isStarting$(): Observable<boolean> {
    return this.selectActive().pipe(map((game) => game.isStarting));
  }

  public get startStage$(): Observable<StartStage> {
    return this.selectActive().pipe(map((game) => game.startStage));
  }

  public get playingPlayerId(): string {
    return this.getActive().playingPlayerId;
  }

  public get isGameFinished$(): Observable<boolean> {
    return this.selectActive().pipe(map((game) => game.isFinished));
  }

  public get winnerId$(): Observable<string> {
    return this.selectActive().pipe(map((game) => game?.winnerId));
  }

  public get lastAction$(): Observable<Action> {
    return this.selectActive().pipe(map((game) => game?.lastAction));
  }
}
