// Angular
import { Component, OnInit } from '@angular/core';
// Material
import { MatSnackBar } from '@angular/material/snack-bar';
// Rxjs
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
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

  constructor(
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
  }

  public countSpeciesOnTile(speciesTileIds: number[], i: number): number {
    return speciesTileIds.filter((tileId) => tileId === i).length;
  }

  public play(tileId: number) {
    const activeSpecies = this.speciesQuery.getActive();
    const tile = this.tileQuery.getEntity(tileId.toString());
    // checks if a unit is active & tile reachable
    if (this.tileQuery.hasActive() && tile.isReachable) {
      const activeTileId = this.tileQuery.getActiveId();
      // if so, colonizes
      this.colonize(activeSpecies.id, [Number(activeTileId)], tileId);
      this.tileService.removeActive(tileId);
      this.tileService.removeReachable();
      return;
    }
    if (activeSpecies.tileIds.includes(tileId)) {
      // checks if the tile includes an active species
      // then check if the tile was already selected
      if (this.isActive(tileId)) {
        // if so, proliferates
        this.proliferate(activeSpecies, tileId);
        this.tileService.removeActive(tileId);
        this.tileService.removeReachable();
        // else selects the tile
      } else {
        this.tileService.removeReachable();
        this.tileService.select(tileId);
        this.tileService.markAdjacentReachableTiles(tileId);
      }
    }
  }

  public isActive(tileId: number): boolean {
    return this.tileQuery.hasActive(tileId.toString());
  }

  public proliferate(species: Species, tileId: number) {
    if (species.tileIds.filter((id) => id === tileId).length > 1) {
      this.speciesService.proliferate(species.id, [tileId, tileId]);
      this.snackbar.open('Prolifération !');
    } else {
      this.snackbar.open("Manque d'unités pour proliférer.");
    }
  }

  public colonize(
    speciesId: string,
    previousTileIds: number[],
    newTileId: number
  ) {
    this.speciesService.moveUnits(speciesId, previousTileIds, newTileId);
    this.snackbar.open('Colonisation !');
  }
}
