// Angular
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
// Material
import { MatSnackBar } from '@angular/material/snack-bar';
// Firebase
import firebase from 'firebase/app';
// Rxjs
import { iif, Observable, of, Subscription } from 'rxjs';
import { filter, map, mergeMap, pluck, tap } from 'rxjs/operators';
// States
import { UserQuery } from 'src/app/auth/_state';
import { Game, GameQuery, GameService } from 'src/app/games/_state';
import { Player, PlayerQuery, PlayerService } from '../players/_state';
import {
  Abilities,
  abilities,
  Species,
  SpeciesQuery,
  SpeciesService,
} from '../species/_state';
import { Tile, TileQuery, TileService } from '../tiles/_state';

@Component({
  selector: 'app-board-view',
  templateUrl: './board-view.component.html',
  styleUrls: ['./board-view.component.scss'],
})
export class BoardViewComponent implements OnInit, OnDestroy {
  // variables
  public playingPlayerId: string;
  // observables
  public tiles$: Observable<Tile[]>;
  public species$: Observable<Species[]>;
  public game$: Observable<Game>;
  public players$: Observable<Player[]>;
  public activeSpecies$: Observable<Species>;
  // subscriptions
  private turnSub: Subscription;
  private activePlayerSub: Subscription;
  private activeSpeciesSub: Subscription;

  constructor(
    private gameQuery: GameQuery,
    private gameService: GameService,
    private userQuery: UserQuery,
    private playerQuery: PlayerQuery,
    private playerService: PlayerService,
    private tileQuery: TileQuery,
    private tileService: TileService,
    private speciesQuery: SpeciesQuery,
    private speciesService: SpeciesService,
    private snackbar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.game$ = this.gameQuery.selectActive();
    this.players$ = this.playerQuery.selectAll();
    this.activeSpecies$ = this.speciesQuery.selectActive();
    this.activePlayerSub = this.getActivePlayerSub();
    this.activeSpeciesSub = this.getActiveSpeciesSub();
    this.tiles$ = this.tileQuery
      .selectAll()
      .pipe(map((tiles) => tiles.sort((a, b) => a.id - b.id)));
    this.species$ = this.speciesQuery.selectAll();

    this.playingPlayerId = this.userQuery.getActiveId();

    this.turnSub = this.getTurnSub();
  }

  // If no more actions for the active player, skips turn
  private getTurnSub(): Subscription {
    return this.game$
      .pipe(
        pluck('remainingActions'),
        mergeMap((remainingActions) =>
          iif(
            () => this.playerQuery.getActiveId() === this.playingPlayerId,
            of(remainingActions),
            of(true)
          )
        ),
        tap((bool) => {
          if (!bool) this.gameService.incrementTurnCount();
        })
      )
      .subscribe();
  }
  // base akita active player on game obj
  private getActivePlayerSub(): Subscription {
    return this.game$
      .pipe(
        pluck('activePlayerId'),
        tap((id) => this.playerService.setActive(id))
      )
      .subscribe();
  }
  // set active first species from active player
  private getActiveSpeciesSub(): Subscription {
    return this.playerQuery
      .selectActive()
      .pipe(
        filter((player) => !!player),
        pluck('speciesIds'),
        tap((ids) => this.speciesService.setActive(ids[0]))
      )
      .subscribe();
  }

  public async play(tileId: number) {
    const activeSpecies = this.speciesQuery.getActive();
    const tile = this.tileQuery.getEntity(tileId.toString());
    const game = this.gameQuery.getActive();
    const activePlayerId = game.activePlayerId;

    if (tile.type !== 'blank')
      if (activePlayerId === this.playingPlayerId) {
        if (game.actionType === 'newSpecies') {
          this.speciesService.proliferate(activeSpecies.id, tileId, 4);
          await this.gameService.switchActionType('');
        }
        // checks if a unit is active & tile reachable & colonization count > 1
        if (this.tileQuery.hasActive() && tile.isReachable) {
          // COLONIZATION
          // check move limit then colonizes
          if (this.colonizationCount) {
            const activeTileId = this.tileQuery.getActiveId();
            await this.colonize(
              game,
              activeSpecies.id,
              Number(activeTileId),
              tileId,
              1
            );
          }
        }
        // checks if the tile includes an active species
        if (activeSpecies.tileIds.includes(tileId)) {
          // then check if the tile was already selected
          if (this.isActive(tileId)) {
            // checks if enough species to proliferate
            if (
              activeSpecies.tileIds.filter((id) => id === tileId).length > 1
            ) {
              // PROLIFERATE
              // if so, proliferates
              await this.proliferate(activeSpecies.id, tileId, 2);
            } else {
              this.snackbar.open("Manque d'unités pour proliférer.", null, {
                duration: 3000,
              });
            }

            // else selects the tile
          } else {
            this.tileService.removeReachable();
            this.tileService.select(tileId);
            this.tileService.markAdjacentReachableTiles(
              tileId,
              Number(game.colonizationCount)
            );
          }
        }
      } else {
        this.snackbar.open('Not your turn', null, {
          duration: 3000,
        });
      }
  }

  public isActive(tileId: number): boolean {
    return this.tileQuery.hasActive(tileId.toString());
  }

  private async proliferate(
    speciesId: string,
    tileId: number,
    quantity: number
  ) {
    this.tileService.removeActive();
    this.tileService.removeReachable();
    this.speciesService
      .proliferate(speciesId, tileId, quantity)
      .then(() => {
        this.snackbar.open('Prolifération !', null, {
          duration: 2000,
        });
        this.gameService.decrementRemainingActions();
      })
      .catch((error) => {
        console.log('Transaction failed: ', error);
      });
  }

  private async colonize(
    game: Game,
    speciesId: string,
    previousTileId: number,
    newTileId: number,
    quantity: number
  ) {
    this.tileService.removeActive();
    this.tileService.removeReachable();

    this.speciesService
      .move(game, speciesId, previousTileId, newTileId, quantity)
      .then(async () => {
        this.snackbar.open('Colonisation !', null, {
          duration: 2000,
        });
        this.tileService.resetRange();
        // update remainingActions if that's the last colonizationCount
        if (+this.colonizationCount + 1 === quantity) {
          this.gameService.decrementRemainingActions();
        }
      })
      .catch((error) => {
        console.log('Transaction failed: ', error);
      });
  }

  public getSpeciesImgUrl(speciesId: string): string {
    let url: string;
    const species = this.speciesQuery.getEntity(speciesId);

    if (species.playerId === 'neutral') {
      url = `/assets/neutrals/${species.id}.png`;
    } else {
      url = `/assets/abilities/${species.abilityIds[0]}.png`;
    }

    return url;
  }

  public getAbilityFrName(abilityId: Abilities) {
    return abilities[abilityId].fr;
  }
  public getAbilityValue(abilityId: Abilities) {
    return abilities[abilityId].value;
  }

  public get colonizationCount(): number | firebase.firestore.FieldValue {
    const activeSpecies = this.speciesQuery.getActive();
    const activeAbilities = activeSpecies.abilityIds;
    const game = this.gameQuery.getActive();

    return activeAbilities.includes('agility')
      ? +game.colonizationCount + abilities['agility'].value
      : game.colonizationCount;
  }

  // Cancel tile focus when using "esc" on keyboard
  @HostListener('document:keydown', ['$event']) onKeydownHandler(
    event: KeyboardEvent
  ) {
    if (event.key === 'Escape') {
      this.tileService.removeActive();
      this.tileService.removeReachable();
    }
  }

  ngOnDestroy() {
    this.turnSub.unsubscribe();
    this.activePlayerSub.unsubscribe();
    this.activeSpeciesSub.unsubscribe();
  }
}
