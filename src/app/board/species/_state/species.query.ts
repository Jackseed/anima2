// Angular
import { Injectable } from '@angular/core';

// Akita
import { QueryEntity } from '@datorama/akita';

// Rxjs
import { Observable } from 'rxjs';
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
