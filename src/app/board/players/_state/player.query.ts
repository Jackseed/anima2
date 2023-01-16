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
import { Ability, Species } from '../../species/_state/species.model';
import { Colors, NEUTRAL_COLORS } from 'src/app/games/_state/game.model';
import { SpeciesQuery } from '../../species/_state/species.query';

@Injectable({ providedIn: 'root' })
export class PlayerQuery extends QueryEntity<PlayerState> {
  constructor(
    protected store: PlayerStore,
    private gameQuery: GameQuery,
    private speciesQuery: SpeciesQuery
  ) {
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

  public get opponentId(): string {
    const playerIds = this.getAll().map((player) => player.id);
    const activePlayerId = this.getActiveId();
    return playerIds.filter((id) => id !== activePlayerId)[0];
  }

  public get opponentMainSpecies(): Species {
    return this.speciesQuery
      .getAll()
      .filter((species) => species.playerId === this.opponentId)[0];
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

  // Gets player's colors
  public getPlayerColors(playerId: string): Colors {
    if (playerId === 'neutral') return NEUTRAL_COLORS;

    const player = this.getEntity(playerId);
    return player.colors;
  }
}
