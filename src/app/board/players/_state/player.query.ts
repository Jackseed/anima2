// Angular
import { Injectable } from '@angular/core';

// AngularFire
import { AngularFirestore } from '@angular/fire/firestore';

// Akita
import { QueryEntity } from '@datorama/akita';

// Rxjs
import { filter, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

// States
import { PlayerStore, PlayerState } from './player.store';
import { GameQuery } from 'src/app/games/_state/game.query';
import { Ability } from '../../species/_state/species.model';
import { SpeciesQuery } from '../../species/_state/species.query';
import { AnimationState, Player } from './player.model';

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

  public get opponentId(): string {
    return this.getPlayerOpponentId(this.getActiveId());
  }

  public get activePlayerSuperchargedWithSpecies$(): Observable<Player> {
    return this.selectActive().pipe(
      map((player) => {
        let species = [];
        for (const speciesId of player.speciesIds) {
          const specie = this.speciesQuery.getEntity(speciesId);
          species.push(specie);
        }
        return {
          ...player,
          species,
        };
      })
    );
  }

  public get opponent$(): Observable<Player> {
    return this.allPlayersSuperchargedWithSpecies$().pipe(
      map(
        (players) =>
          players.filter((player) => player.id === this.opponentId)[0]
      )
    );
  }

  public allPlayersSuperchargedWithSpecies$(): Observable<Player[]> {
    return this.selectAll().pipe(
      map((players) =>
        players.map((player) => {
          let species = [];
          for (const speciesId of player.speciesIds) {
            const specie = this.speciesQuery.getEntity(speciesId);
            species.push(specie);
          }
          return {
            ...player,
            species,
          };
        })
      )
    );
  }

  public get allPlayersSuperchargedWithSpecies(): Player[] {
    return this.getAll().map((player) => {
      let species = [];
      for (const speciesId of player.speciesIds) {
        const specie = this.speciesQuery.getEntity(speciesId);
        species.push(specie);
      }
      return {
        ...player,
        species,
      };
    });
  }

  public get green$(): Observable<Player> {
    return this.allPlayersSuperchargedWithSpecies$().pipe(
      map((players) => players.filter((player) => player.color === 'green')),
      map((greenPlayers) => greenPlayers[0])
    );
  }

  public get green(): Player {
    return this.getAll().find((player) => player.color === 'green');
  }

  public get red(): Player {
    return this.getAll().find((player) => player.color === 'red');
  }

  public get red$(): Observable<Player> {
    return this.allPlayersSuperchargedWithSpecies$().pipe(
      map((players) => players.filter((player) => player.color === 'red')),
      map((redPlayers) => redPlayers[0])
    );
  }

  public get winner$(): Observable<Player> {
    return this.gameQuery.winnerId$.pipe(
      map((winnerId) => this.getEntity(winnerId)),
      filter((winner) => !!winner),
      map((player) => {
        let species = [];
        if (player.speciesIds)
          for (const speciesId of player.speciesIds) {
            const specie = this.speciesQuery.getEntity(speciesId);
            species.push(specie);
          }
        return {
          ...player,
          species,
        };
      })
    );
  }

  public get loser$(): Observable<Player> {
    return this.gameQuery.selectActive().pipe(
      map(
        (game) =>
          game.playerIds.filter((playerId) => playerId !== game.winnerId)[0]
      ),
      map((loserId) => this.getEntity(loserId)),
      filter((loser) => !!loser),
      map((player) => {
        let species = [];
        if (player.speciesIds)
          for (const speciesId of player.speciesIds) {
            const specie = this.speciesQuery.getEntity(speciesId);
            species.push(specie);
          }
        return {
          ...player,
          species,
        };
      })
    );
  }

  public getPlayerSpeciesTileIds(player: Player): number[] {
    const playerSpeciesTileIds: number[] = [];
    player.speciesIds.forEach((speciesId) => {
      const species = this.speciesQuery.getEntity(speciesId);
      playerSpeciesTileIds.push(...species.tileIds);
    });
    return playerSpeciesTileIds;
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

  public get isAnimationPlaying$(): Observable<boolean> {
    return this.selectActive().pipe(map((player) => player.isAnimationPlaying));
  }

  public get activePlayerAnimationState(): AnimationState {
    return this.getActive().animationState;
  }

  // TODO: Should be in player service but here to avoid circular dependency.
  public async switchReadyState(
    playerIds: string[],
    readiness?: boolean
  ): Promise<void> {
    const batch = this.db.firestore.batch();
    const gameId = this.gameQuery.getActiveId();
    for (const playerId of playerIds) {
      const player = this.getEntity(playerId);
      const playerReadiness = readiness
        ? readiness
        : !player.isWaitingForNextStartStage;
      const playerRef = this.db.doc(`games/${gameId}/players/${playerId}`).ref;
      batch.update(playerRef, {
        isWaitingForNextStartStage: playerReadiness,
      });
    }

    return batch
      .commit()
      .catch((error) =>
        console.log('Switching players ready state failed: ', error)
      );
  }
}
