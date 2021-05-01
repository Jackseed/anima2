// Angular
import { Component, OnInit } from '@angular/core';
// Material
import { MatSnackBar } from '@angular/material/snack-bar';
// Rxjs
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
// States
import { UserQuery } from 'src/app/auth/_state';
import { GameQuery, GameService } from 'src/app/games/_state';
import { PlayerQuery } from '../players/_state';
// Components
import { Species, SpeciesQuery, SpeciesService } from '../species/_state';
import { Tile, TileQuery, TileService } from '../tiles/_state';

@Component({
  selector: 'app-board-view',
  templateUrl: './board-view.component.html',
  styleUrls: ['./board-view.component.scss'],
})
export class BoardViewComponent implements OnInit {
  public tiles$: Observable<Tile[]>;
  public species$: Observable<Species[]>;
  public playingPlayerId: string;

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
      if (this.tileQuery.hasActive() && tile.isReachable) {
        // checks if a unit is active & tile reachable
        const activeTileId = this.tileQuery.getActiveId();
        // if so, colonizes
        this.colonize(activeSpecies.id, Number(activeTileId), tileId, 1);
        this.tileService.removeActive(Number(activeTileId));
        this.tileService.removeReachable();
        return;
      }
      if (activeSpecies.tileIds.includes(tileId)) {
        // checks if the tile includes an active species
        // then check if the tile was already selected
        if (this.isActive(tileId)) {
          // checks if enough species
          if (activeSpecies.tileIds.filter((id) => id === tileId).length > 1) {
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

  public colonize(
    speciesId: string,
    previousTileId: number,
    newTileId: number,
    quantity: number
  ) {
    this.speciesService.moveUnits(
      speciesId,
      previousTileId,
      newTileId,
      quantity
    );
    this.snackbar.open('Colonisation !', null, {
      duration: 2000,
    });
  }

  getSpeciesImgUrl(speciesId: string): string {
    let url: string;
    const species = this.speciesQuery.getEntity(speciesId);

    if (species.playerId === 'neutral') url = `/assets/${species.id}.png`;

    return url;
  }
}
