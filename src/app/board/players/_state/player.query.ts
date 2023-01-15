// Angular
import { Injectable } from '@angular/core';

// Akita
import { QueryEntity } from '@datorama/akita';

// Rxjs
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

// States
import { PlayerStore, PlayerState } from './player.store';
import { GameQuery } from 'src/app/games/_state/game.query';
import {
  Ability,
  PRIMARY_NEUTRAL_COLOR,
  SECONDARY_NEUTRAL_COLOR,
} from '../../species/_state/species.model';

@Injectable({ providedIn: 'root' })
export class PlayerQuery extends QueryEntity<PlayerState> {
  constructor(protected store: PlayerStore, private gameQuery: GameQuery) {
    super(store);
  }

  public get allPlayerIds(): string[] {
    return this.getAll().map((player) => player.id);
  }

  public get areAllPlayersReadyForNextStartStage$(): Observable<boolean> {
    return this.selectAll().pipe(
      map((players) =>
        players.map((player) => player.isWaitingForNextStartStage)
      ),
      map((booleans) =>
        booleans.reduce(
          (accumulator, currentValue) => accumulator && currentValue
        )
      )
    );
  }

  public get isActivePlayerWaitingForNextStartStage(): boolean {
    return this.getActive().isWaitingForNextStartStage;
  }

  public get isActivePlayerWaitingForNextStartStage$(): Observable<boolean> {
    return this.selectActive().pipe(
      map((player) => player.isWaitingForNextStartStage)
    );
  }

  // Checks if active player is playing.
  public get isActivePlayerPlaying$(): Observable<boolean> {
    const activeGame$ = this.gameQuery.selectActive();
    const activePlayerId = this.getActiveId();

    return activeGame$.pipe(
      map((game) => game.playingPlayerId === activePlayerId)
    );
  }
  public isPlayerPlaying(playerId: string): boolean {
    const playingPlayerId = this.gameQuery.playingPlayerId;

    return playerId === playingPlayerId;
  }

  public get unplayingPlayerId(): string {
    const playerIds = this.getAll().map((player) => player.id);
    const playingPlayerId = this.gameQuery.playingPlayerId;
    return playerIds.filter((id) => id !== playingPlayerId)[0];
  }

  public get areAbilityChoicesSet$(): Observable<boolean> {
    return this.abilityChoices$.pipe(map((abilities) => abilities.length > 0));
  }

  public get abilityChoices$(): Observable<Ability[]> {
    return this.selectActive().pipe(
      map((player) => player.abilityChoice.abilityChoices)
    );
  }

  public get abilityChoices(): Ability[] {
    return this.getActive().abilityChoice.abilityChoices;
  }

  public get abilityChoiceActiveTileId(): number {
    return this.getActive().abilityChoice.activeTileId;
  }

  // Gets species' player colors
  public getPlayerSpeciesColors(
    playerId: string,
    color: 'primary' | 'secondary'
  ): string {
    if (playerId === 'neutral') return this.getNeutralSpeciesColors(color);

    const player = this.getEntity(playerId);

    if (color === 'primary') return player?.primaryColor;

    if (color === 'secondary') return player?.secondaryColor;
  }

  private getNeutralSpeciesColors(color: 'primary' | 'secondary'): string {
    if (color === 'primary') return PRIMARY_NEUTRAL_COLOR;
    if (color === 'secondary') return SECONDARY_NEUTRAL_COLOR;
  }
}
