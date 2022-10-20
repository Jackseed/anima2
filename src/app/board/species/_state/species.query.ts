// Angular
import { Injectable } from '@angular/core';

// Akita
import { QueryEntity } from '@datorama/akita';

// Rxjs
import { map } from 'rxjs/operators';

// States
import { Tile, TileQuery } from '../../tiles/_state';
import { Species } from './species.model';
import { SpeciesStore, SpeciesState } from './species.store';
import { PlayerQuery } from '../../players/_state/player.query';

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

  get activeSpeciesAbilityIds() {
    return this.getActive().abilities.map((ability) => ability.id);
  }

  get activeSpeciesAbilityIds$() {
    return this.selectActive().pipe(
      map((species) => species.abilities.map((ability) => ability.id))
    );
  }

  get otherActiveTileSpeciesThanActivePlayerSpecies(): Species[] {
    const activeTileId = Number(this.tileQuery.getActiveId());
    const species = this.getTileSpecies(activeTileId);
    const activePlayerId = this.playerQuery.getActiveId();

    return species.filter((species) => species.playerId !== activePlayerId);
  }
}
