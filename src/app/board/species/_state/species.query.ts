// Angular
import { Injectable } from '@angular/core';

// Akita
import { QueryEntity } from '@datorama/akita';

// States
import { Tile, TileQuery } from '../../tiles/_state';
import { Species } from './species.model';
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
}
