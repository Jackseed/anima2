// Angular
import { Injectable } from '@angular/core';

// Akita
import { QueryEntity } from '@datorama/akita';

// Rxjs
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// States
import { Tile, TileQuery } from '../../tiles/_state';
import { Species, TileSpecies } from './species.model';
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

  // Checks if a species is already on a tile.
  public isSpeciesOnTile(speciesId: string, tile: Tile): boolean {
    const species = tile.species.filter((species) => species.id === speciesId);
    return species.length > 0;
  }

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

  public get activeTileSpecies(): TileSpecies {
    const activeTile = this.tileQuery.getActive();
    const activeSpeciesId = this.getActiveId();

    return activeTile?.species.filter(
      (species) => species?.id === activeSpeciesId
    )[0];
  }

  public otherTileSpecies(tile: Tile): TileSpecies[] {
    const activeSpeciesId = this.getActiveId();

    return tile.species.filter((species) => species.id !== activeSpeciesId);
  }

  public get hasActiveSpeciesActiveAbility$(): Observable<boolean> {
    const hasActiveSpeciesActiveAbility = this.selectActive().pipe(
      map((species) =>
        species?.abilities.map((ability) => ability.type === 'active')
      ),
      map((booleans) => booleans?.filter((boolean) => boolean)),
      map((trueValues) => trueValues?.length > 0)
    );
    return hasActiveSpeciesActiveAbility;
  }
}
