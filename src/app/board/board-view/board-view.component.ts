// Angular
import { Component, OnDestroy, OnInit } from '@angular/core';
// Material
import { MatSnackBar } from '@angular/material/snack-bar';
// Rxjs
import { iif, Observable, of, Subscription } from 'rxjs';
import { map, mergeMap, tap } from 'rxjs/operators';
// States
import { UserQuery } from 'src/app/auth/_state';
import { Game, GameQuery, GameService } from 'src/app/games/_state';
import { PlayerQuery } from '../players/_state';
// Components
import { Species, SpeciesQuery, SpeciesService } from '../species/_state';
import { Tile, TileQuery, TileService } from '../tiles/_state';

@Component({
  selector: 'app-board-view',
  templateUrl: './board-view.component.html',
  styleUrls: ['./board-view.component.scss'],
})
export class BoardViewComponent implements OnInit, OnDestroy {
  public tiles$: Observable<Tile[]>;
  public species$: Observable<Species[]>;
  public playingPlayerId: string;
  public game$: Observable<Game>;
  public turnSub: Subscription;

  constructor(
    private gameQuery: GameQuery,
    private gameService: GameService,
    private userQuery: UserQuery,
    private playerQuery: PlayerQuery,
    private tileQuery: TileQuery,
    private tileService: TileService,
    private speciesQuery: SpeciesQuery,
    private speciesService: SpeciesService,
    private snackbar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.tiles$ = this.tileQuery
      .selectAll()
      .pipe(map((tiles) => tiles.sort((a, b) => a.id - b.id)));
    this.species$ = this.speciesQuery.selectAll();
    this.speciesService.setActive('mountains');
    this.playingPlayerId = this.userQuery.getActiveId();
    this.game$ = this.gameQuery.selectActive();
    this.turnSub = this.getTurnSub();
    this.game$.subscribe(console.log);
  }

  // If no more actions for the active player, skips turn
  public getTurnSub(): Subscription {
    return this.game$
      .pipe(
        map((game) => game.remainingActions),
        mergeMap((remainingActions) =>
          iif(
            () => this.playerQuery.getActiveId() === this.playingPlayerId,
            of(remainingActions),
            of(true)
          )
        ),
        tap((bool) =>
          !bool
            ? this.gameService.incrementTurnCount()
            : console.log('still actions')
        )
      )
      .subscribe();
  }

  public countSpeciesOnTile(speciesTileIds: number[], i: number): number {
    return speciesTileIds.filter((tileId) => tileId === i).length;
  }

  public async play(tileId: number) {
    const activeSpecies = this.speciesQuery.getActive();
    const tile = this.tileQuery.getEntity(tileId.toString());
    const game = this.gameQuery.getActive();
    const activePlayerId = this.playerQuery.getActiveId();

    if (activePlayerId === this.playingPlayerId) {
      if (game.actionType === 'newSpecies') {
        this.speciesService.proliferate(activeSpecies.id, tileId, 4);
        await this.gameService.switchActionType('');
      }
      // checks if a unit is active & tile reachable & colonization count > 1
      if (
        this.tileQuery.hasActive() &&
        tile.isReachable &&
        game.colonizationCount > 0
      ) {
        // COLONIZATION
        // if so, colonizes
        const activeTileId = this.tileQuery.getActiveId();
        await this.colonize(
          game,
          activeSpecies.id,
          Number(activeTileId),
          tileId,
          1
        );
      }
      // checks if the tile includes an active species
      if (activeSpecies.tileIds.includes(tileId)) {
        // then check if the tile was already selected
        if (this.isActive(tileId)) {
          // checks if enough species to proliferate
          if (activeSpecies.tileIds.filter((id) => id === tileId).length > 1) {
            // PROLIFERATE
            // if so, proliferates
            this.speciesService.proliferate(activeSpecies.id, tileId, 2);
            this.tileService.removeActive(tileId);
            this.tileService.removeReachable();
            this.snackbar.open('Prolifération !', null, {
              duration: 2000,
            });
          } else {
            this.snackbar.open("Manque d'unités pour proliférer.", null, {
              duration: 3000,
            });
          }

          // else selects the tile
        } else {
          this.tileService.removeReachable();
          this.tileService.select(tileId);
          this.tileService.markAdjacentReachableTiles(tileId);
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

  public async colonize(
    game: Game,
    speciesId: string,
    previousTileId: number,
    newTileId: number,
    quantity: number
  ) {
    this.tileService.removeActive(Number(previousTileId));
    this.tileService.removeReachable();

    this.speciesService
      .move(game, speciesId, previousTileId, newTileId, quantity)
      .then(async () => {
        console.log('move - Transaction successfully committed!');
        this.snackbar.open('Colonisation !', null, {
          duration: 2000,
        });
      })
      .catch((error) => {
        console.log('Transaction failed: ', error);
      });
  }

  getSpeciesImgUrl(speciesId: string): string {
    let url: string;
    const species = this.speciesQuery.getEntity(speciesId);

    if (species.playerId === 'neutral') url = `/assets/${species.id}.png`;

    return url;
  }

  ngOnDestroy() {
    this.turnSub.unsubscribe();
  }
}
