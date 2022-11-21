// Angular
import { Injectable } from '@angular/core';

// Akita
import {
  EntityUIQuery,
  Order,
  QueryConfig,
  QueryEntity,
} from '@datorama/akita';

// States
import { cols, islandBridgeIds, Tile } from './tile.model';
import { TileStore, TileState, TileUI, TileUIState } from './tile.store';
import { Species } from '../../species/_state/species.model';

@Injectable({ providedIn: 'root' })
@QueryConfig({
  sortBy: 'id',
  sortByOrder: Order.ASC,
})
export class TileQuery extends QueryEntity<TileState> {
  ui: EntityUIQuery<TileUIState, TileUI>;
  constructor(protected store: TileStore) {
    super(store);
    this.createUIQuery();
  }

  public getAdjacentTileIds(tileId: number, range: number): number[] {
    const tile: Tile = this.getEntity(tileId.toString());
    let tileIds: number[] = [];
    // Reads the whole x coordinates.
    for (let x = -range; x <= range; x++) {
      // Reads the whole y coordinates.
      for (let y = -range; y <= range; y++) {
        // Removes diagonal values for hexa grid.
        // Values are different depending on odd or even lines.
        if (
          // Removes diagonal values for odd lines.
          !(
            tile.y % 2 === 0 &&
            ((x === range && y === -range) || (x === range && y === range))
          ) &&
          // Removes diagonal values for even lines.
          !(
            tile.y % 2 !== 0 &&
            ((x === -range && y === -range) || (x === -range && y === range))
          )
        ) {
          const X = tile.x + x;
          const Y = tile.y + y;
          // Verifies that the tile is inside the board.
          if (X < cols && X >= 0 && Y < cols && Y >= 0) {
            const id = X + cols * Y;
            // Verifies that the tile is not blank.
            if (!this.isBlank(id)) {
              tileIds.push(id);
            }
          }
        }
      }
    }

    // Adds the island bridge.
    if (islandBridgeIds.includes(tileId))
      islandBridgeIds.forEach((id) => tileIds.push(id));
    return tileIds;
  }

  public getDistanceFromActiveTileToDestinationTileId(
    destinationTileId: number
  ): number {
    const UItile = this.ui.getEntity(destinationTileId.toString());
    const distance = UItile.range;

    return distance;
  }

  // Checks if a tile is blank.
  public isBlank(id: number): boolean {
    const tile = this.getEntity(id.toString());
    return tile.type === 'blank';
  }

  // Checks if a tile is empty.
  public isEmpty(id: number): boolean {
    const tile = this.getEntity(id.toString());
    return tile.species.length === 0;
  }

  // Checks if a tile is active.
  public isActive(tileId: number): boolean {
    return this.hasActive(tileId.toString());
  }

  // Returns the quantity of a given species on a tile.
  public getTileSpeciesCount(species: Species, tileId: number): number {
    if (!!!tileId) return;
    const tile = this.getEntity(tileId.toString());
    if (!!!tile) return;
    const tileSpecies = tile.species;

    const filteredSpecies = tileSpecies.filter(
      (tileSpecies) => tileSpecies.id === species.id
    )[0];

    return filteredSpecies?.quantity;
  }
}
