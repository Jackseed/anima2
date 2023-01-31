// Angular
import { Injectable } from '@angular/core';

// AngularFire
import { AngularFirestore } from '@angular/fire/firestore';

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
import { Player } from './player.model';

@Injectable({ providedIn: 'root' })
export class PlayerQuery extends QueryEntity<PlayerState> {
  constructor(
    protected store: PlayerStore,
    private db: AngularFirestore,
    private gameQuery: GameQuery,
    private speciesQuery: SpeciesQuery
  ) {
    super(store);
  }

  public get activePlayerLastSpeciesId(): string {
    const activePlayer = this.getActive();
    return activePlayer.speciesIds[activePlayer.speciesIds.length - 1];
  }

  public get isLastActivePlayerSpeciesActive(): boolean {
    const activeSpeciesId = this.speciesQuery.getActiveId();
    return activeSpeciesId === this.activePlayerLastSpeciesId;
  }

  public get isLastPlayerPlaying(): boolean {
    const activeGame = this.gameQuery.getActive();
    return (
      activeGame.playingPlayerId ===
      activeGame.playerIds[activeGame.playerIds.length - 1]
    );
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
  public isPlayerPlaying(playerId?: string): boolean {
    const checkedPlayerId = playerId ? playerId : this.getActiveId();
    const playingPlayerId = this.gameQuery.playingPlayerId;

    return checkedPlayerId === playingPlayerId;
  }

  public get unplayingPlayerId(): string {
    const playerIds = this.getAll().map((player) => player.id);
    const playingPlayerId = this.gameQuery.playingPlayerId;
    return playerIds.filter((id) => id !== playingPlayerId)[0];
  }

  public get unplayingPlayer(): Player {
    return this.getEntity(this.unplayingPlayerId);
  }

  public getPlayerOpponentId(playerId: string): string {
    const playerIds = this.allPlayerIds;
    return playerIds.filter((id) => id !== playerId)[0];
  }

  public get opponentMainSpecies(): Species {
    const activePlayerId = this.getActiveId();
    return this.speciesQuery
      .getAll()
      .filter(
        (species) =>
          species.playerId === this.getPlayerOpponentId(activePlayerId)
      )[0];
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

  // TODO: Should be in player service but here to avoid circular dependency...
  public switchReadyState(playerIds: string[]) {
    const batch = this.db.firestore.batch();
    const gameId = this.gameQuery.getActiveId();
    for (const playerId of playerIds) {
      const player = this.getEntity(playerId);
      const playerRef = this.db.doc(`games/${gameId}/players/${playerId}`).ref;
      batch.update(playerRef, {
        isWaitingForNextStartStage: !player.isWaitingForNextStartStage,
      });
    }

    batch
      .commit()
      .catch((error) =>
        console.log('Switching players ready state failed: ', error)
      );
  }
}
