// Angular
import { Component, OnInit } from '@angular/core';
// Material
import { MatSnackBar } from '@angular/material/snack-bar';
// Rxjs
import { Observable } from 'rxjs';
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
    this.tileService.setTiles();
    this.tiles$ = this.tileQuery.selectAll();
    this.species$ = this.speciesQuery.selectAll();
    this.speciesService.setActive('3Dv7DnEp9Vmxsfgz2G0y');
  }

  public countSpeciesOnTile(speciesTileIds: number[], i: number): number {
    return speciesTileIds.filter((tileId) => tileId === i).length;
  }

  public play(tileId: number) {
    const activeSpecies = this.speciesQuery.getActive();
    // checks if the tile includes an active species
    if (activeSpecies.tileIds.includes(tileId)) {
      // then check if the tile was already selected
      if (this.isActive(tileId)) {
        this.proliferate(activeSpecies, tileId);
        this.tileService.removeActive(tileId);
        // else selects the tile
      } else {
        this.tileService.select(tileId);
      }
    }
  }

  public isActive(tileId: number): boolean {
    return this.tileQuery.hasActive(tileId.toString());
  }

  public proliferate(species: Species, tileId: number) {
    if (species.tileIds.filter((id) => id === tileId).length > 1) {
      this.speciesService.addUnits(species.id, [tileId, tileId]);
      this.snackbar.open('Prolifération !');
    } else {
      this.snackbar.open("Manque d'unités pour proliférer.");
    }
  }
}
