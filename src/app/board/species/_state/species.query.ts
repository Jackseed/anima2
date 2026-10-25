// Angular
import { Injectable } from '@angular/core';

// Akita
import { QueryEntity } from '@datorama/akita';

// Rxjs
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

// States
import { Tile, TileQuery } from '../../tiles/_state';
import { Ability, Species, TileSpecies } from './species.model';
import { SpeciesStore, SpeciesState } from './species.store';

@Injectable({ providedIn: 'root' })
export class SpeciesQuery extends QueryEntity<SpeciesState> {
  constructor(protected store: SpeciesStore, private tileQuery: TileQuery) {
    super(store);
  }

  // Add all species to all the tiles.
  public get getTileWithSpecies$(): Observable<Tile[]> {
    // Fetch all tiles as an Observable
    const tiles$ = this.tileQuery.selectAll();

    // Fetch all species as an Observable
    const species$ = this.selectAll();

    // Combine the tiles and species into a single Observable
    return combineLatest([tiles$, species$]).pipe(
      map(([tiles, species]) => {
        // Map each tile to a new object with the tile and its species
        return tiles.map((tile) => {
          // Get the species for this tile
          console.log(species);
          const tileSpecies = species
            .filter((s) => s.tileIds.includes(tile.id))
            .map((s) => ({
              ...s,
              quantity: s.tileIds.filter((id) => id === tile.id).length,
              tileId: tile.id,
            }));

          // Return a new object with the tile and its species
          return { ...tile, species: tileSpecies };
        });
      }),
      // Order tiles by id
      map((tiles) => tiles.sort((a, b) => a.id - b.id))
    );
  }
  // Gets all the species on a tile.
  public getTileSpecies(tileId: number): Species[] {
    const tile = this.tileQuery.getEntity(tileId.toString());
    const speciesIds = tile.species.map((species) => species.id);

    return this.getAll().filter((species) => speciesIds.includes(species.id));
  }

  // Gets observable active species on the active tile.
  public get activeTileSpecies$(): Observable<TileSpecies> {
    const activeTile$ = this.tileQuery.selectActive();
    const activeSpeciesId = this.getActiveId();

    return activeTile$.pipe(
      map(
        (tile) =>
          tile?.species.filter((species) => species?.id === activeSpeciesId)[0]
      )
    );
  }

  // Gets active species on the active tile.
  public get activeTileSpecies(): TileSpecies {
    const activeTile = this.tileQuery.getActive();
    const activeSpeciesId = this.getActiveId();

    return activeTile?.species.filter(
      (species) => species?.id === activeSpeciesId
    )[0];
  }

  // TODO: transform in other than player's species
  // Gets other species than the active one.
  // If no tile is specified, takes the active tile.
  public otherTileSpecies(checkedTile?: Tile): TileSpecies[] {
    const tile = checkedTile ? checkedTile : this.tileQuery.getActive();
    const activeSpeciesId = this.getActiveId();

    return tile?.species.filter((species) => species.id !== activeSpeciesId);
  }

  public get activeSpeciesAbilities$(): Observable<Ability[]> {
    return this.selectActive().pipe(map((species) => species.abilities));
  }

  public adjacentActiveSpeciesTileIds(
    centerTileId: number,
    range: number
  ): number[] {
    const activeSpeciesTileIds = this.getActive().tileIds;
    const adjacentTileIds = this.tileQuery.getAdjacentTileIds(
      centerTileId,
      range
    );
    const adjacentTileIdsWithActiveSpecies = adjacentTileIds.filter(
      (tileId) =>
        activeSpeciesTileIds.includes(tileId) && tileId !== centerTileId
    );

    return adjacentTileIdsWithActiveSpecies;
  }

  // Checks if a species is already on a tile.
  public isSpeciesOnTile(speciesId: string, tile: Tile): boolean {
    const species = tile.species.filter((species) => species.id === speciesId);
    return species.length > 0;
  }

  public get hasActiveSpeciesActiveAbility$(): Observable<boolean> {
    return this.selectActive().pipe(
      map((species) =>
        species?.abilities.map((ability) => ability.type === 'active')
      ),
      map((booleans) => this.doesBooleansContainsTrue(booleans))
    );
  }

  public get activeSpeciesActiveAbilities$(): Observable<Ability[]> {
    return this.selectActive().pipe(
      map((species) =>
        species?.abilities.filter((ability) => ability.type === 'active')
      )
    );
  }

  public get activeSpeciesActiveAbilitiesNumber$(): Observable<number> {
    return this.selectActive().pipe(
      map(
        (species) =>
          species?.abilities.filter((ability) => ability.type === 'active')
            .length
      )
    );
  }

  public doesBooleansContainsTrue(booleans: boolean[]): boolean {
    const trueValues = booleans?.filter((boolean) => boolean);

    return trueValues?.length > 0;
  }
}
