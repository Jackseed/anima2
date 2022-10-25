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

  public getAdjacentTiles(tileId: number, range: number): number[] {
    const tile: Tile = this.getEntity(tileId.toString());
    let tileIds: number[] = [];
    for (let x = -range; x <= range; x++) {
      for (let y = -range; y <= range; y++) {
        // Removes diagonal values for hexa grid
        // different values depending on odd or even lines.
        if (
          !(
            tile.y % 2 === 0 &&
            ((x === range && y === -range) || (x === range && y === range))
          ) &&
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

  public getDistance(tileIdA: number, tileIdB: number): number {
    const tileA = this.getEntity(tileIdA.toString());
    const tileB = this.getEntity(tileIdB.toString());

    // Computes distance as we would on a normal grid.
    let distance: { x: number; y: number } = { x: 0, y: 0 };
    distance.x = tileA.x - tileB.x;
    distance.y = tileA.y - tileB.y;

    // Compensates for grid deformation.
    // Grid is stretched along (-n, n) line so points along that line have
    // a distance of 2 between them instead of 1.

    // To calculate the shortest path, we decompose it into one diagonal movement(shortcut)
    // and one straight movement along an axis.
    let diagonalMovement: { x: number; y: number } = { x: 0, y: 0 };
    const lesserCoord =
      Math.abs(distance.x) < Math.abs(distance.y)
        ? Math.abs(distance.x)
        : Math.abs(distance.y);
    diagonalMovement.x = distance.x < 0 ? -lesserCoord : lesserCoord; // Keeps the sign.
    diagonalMovement.y = distance.y < 0 ? -lesserCoord : lesserCoord; // Keeps the sign.

    let straightMovement: { x: number; y: number } = { x: 0, y: 0 };

    // One of x or y should always be 0 because we are calculating a straight
    // line along one of the axis.
    straightMovement.x = distance.x - diagonalMovement.x;
    straightMovement.y = distance.y - diagonalMovement.y;

    // Calculates distance.
    const straightDistance =
      Math.abs(straightMovement.x) + Math.abs(straightMovement.y);
    let diagonalDistance = Math.abs(diagonalMovement.x);

    // If we are traveling diagonally along the stretch deformation we double
    // the diagonal distance.
    if (
      (diagonalMovement.x < 0 && diagonalMovement.y > 0) ||
      (diagonalMovement.x > 0 && diagonalMovement.y < 0)
    ) {
      diagonalDistance *= 2;
    }

    return straightDistance + diagonalDistance;
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

  // Returns the quantity of a given species on the active tile.
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
