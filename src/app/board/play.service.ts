import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { GameQuery, GameService } from '../games/_state';
import { Species, SpeciesQuery, SpeciesService } from './species/_state';
import { TileQuery, TileService } from './tiles/_state';

@Injectable({
  providedIn: 'root',
})
export class PlayService {
  constructor(
    private gameQuery: GameQuery,
    private gameService: GameService,
    private tileQuery: TileQuery,
    private tileService: TileService,
    private speciesQuery: SpeciesQuery,
    private speciesService: SpeciesService,
    private snackbar: MatSnackBar
  ) {}

  public startMigration(): void {
    const activeTileId = Number(this.tileQuery.getActiveId());
    const migrationCount = Number(this.gameQuery.migrationCount);
    this.tileService.markAdjacentReachableTiles(activeTileId, migrationCount);
  }

  public isSpecieQuantityGreatherThan(
    specie: Species,
    tileId: number,
    num: number
  ): boolean {
    return specie.tileIds.filter((id) => id === tileId).length > num
      ? true
      : false;
  }

  // Indicates weither active specie can proliferate.
  public get canProliferate$(): Observable<boolean> {
    const activeSpecies$ = this.speciesQuery.selectActive();
    const activeTileId$ = this.tileQuery.selectActiveId();

    // Checks if more than 1 specie on the active tile to proliferate.
    return combineLatest([activeSpecies$, activeTileId$]).pipe(
      map(([specie, tileId]) => {
        return this.isSpecieQuantityGreatherThan(specie, Number(tileId), 1);
      })
    );
  }

  public async proliferate(quantity: number) {
    const activeSpeciesId = this.speciesQuery.getActiveId();
    const activeTileId = Number(this.tileQuery.getActiveId());

    this.tileService.removeActive();
    this.tileService.removeReachable();
    this.speciesService
      .proliferate(activeSpeciesId, activeTileId, quantity)
      .then(() => {
        this.snackbar.open('Prolifération effectuée !', null, {
          duration: 800,
          panelClass: 'orange-snackbar',
        });
        this.gameService.decrementRemainingActions();
      })
      .catch((error) => {
        console.log('Proliferate failed: ', error);
      });
  }

  // Indicates weither active specie can assimilate.
  public get canAssimilate$(): Observable<boolean> {
    const activeTile$ = this.tileQuery.selectActive();
    const activeSpecieId$ = this.speciesQuery.selectActiveId();

    return combineLatest([activeTile$, activeSpecieId$]).pipe(
      map(([tile, activeSpecieId]) => {
        if (!!!tile) return false;
        const tileSpecies = tile.species;
        // 1st condition: needs at least 2 species on the same tile to assimilate.
        if (tileSpecies?.length < 2) return false;

        // 2nd condition: needs to be more than others.
        const activeSpecieQuantity = tileSpecies.filter(
          (specie) => specie.id === activeSpecieId
        )[0].quantity;
        const weakerSpecies = tileSpecies.filter(
          (specie) => specie.quantity < activeSpecieQuantity
        );
        if (weakerSpecies.length === 0) return false;

        return true;
      })
    );
  }

  // Indicates weither active specie can adapt.
  public get canAdapt$(): Observable<boolean> {
    const activeSpecies$ = this.speciesQuery.selectActive();
    const activeTileId$ = this.tileQuery.selectActiveId();

    // Checks if more than 1 specie on the active tile to proliferate.
    return combineLatest([activeSpecies$, activeTileId$]).pipe(
      map(([specie, tileId]) => {
        return this.isSpecieQuantityGreatherThan(specie, Number(tileId), 4);
      })
    );
  }
}
