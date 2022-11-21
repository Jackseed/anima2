// Angular
import { Injectable } from '@angular/core';

// Akita
import { QueryEntity } from '@datorama/akita';

// States
import { Tile, TileQuery } from '../../tiles/_state';
import { Species, TileSpecies } from './species.model';
import { SpeciesStore, SpeciesState } from './species.store';
import { PlayerQuery } from '../../players/_state/player.query';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class SpeciesQuery extends QueryEntity<SpeciesState> {
  constructor(
    protected store: SpeciesStore,
    private tileQuery: TileQuery,
    private playerQuery: PlayerQuery
  ) {
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

  public get otherActiveTileSpeciesThanActivePlayerSpecies(): Species[] {
    const activeTileId = Number(this.tileQuery.getActiveId());
    const species = this.getTileSpecies(activeTileId);
    const activePlayerId = this.playerQuery.getActiveId();

    return species.filter((species) => species.playerId !== activePlayerId);
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
}
