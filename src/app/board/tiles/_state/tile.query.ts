import { Injectable } from '@angular/core';
import { Order, QueryConfig, QueryEntity } from '@datorama/akita';
import { cols, islandBridgeIds, islandIds, Tile } from './tile.model';
import { TileStore, TileState } from './tile.store';

@Injectable({ providedIn: 'root' })
@QueryConfig({
  sortBy: 'id',
  sortByOrder: Order.ASC,
})
export class TileQuery extends QueryEntity<TileState> {
  constructor(protected store: TileStore) {
    super(store);
  }

  public getAdjacentTiles(tileId: number, range: number): number[] {
    const tile: Tile = this.getEntity(tileId.toString());
    let tileIds: number[] = [];
    for (let x = -range; x <= range; x++) {
      for (let y = -range; y <= range; y++) {
        // remove diagonal values for hexa grid
        // different values depending on odd or even lines
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
          // verifies that the tile is inside the board
          if (X < cols && X >= 0 && Y < cols && Y >= 0) {
            const id = X + cols * Y;
            // verifies that the tile is not blank
            if (!this.isBlank(id)) {
              tileIds.push(id);
            }
          }
        }
      }
    }

    // adds the island bridge
    if (islandBridgeIds.includes(tileId))
      islandBridgeIds.forEach((id) => tileIds.push(id));

    return tileIds;
  }

  public getDistance(tileIdA: number, tileIdB: number): number {
    const tileA = this.getEntity(tileIdA.toString());
    const tileB = this.getEntity(tileIdB.toString());

    // compute distance as we would on a normal grid
    let distance: { x: number; y: number } = { x: 0, y: 0 };
    distance.x = tileA.x - tileB.x;
    distance.y = tileA.y - tileB.y;

    // compensate for grid deformation
    // grid is stretched along (-n, n) line so points along that line have
    // a distance of 2 between them instead of 1

    // to calculate the shortest path, we decompose it into one diagonal movement(shortcut)
    // and one straight movement along an axis
    let diagonalMovement: { x: number; y: number } = { x: 0, y: 0 };
    const lesserCoord =
      Math.abs(distance.x) < Math.abs(distance.y)
        ? Math.abs(distance.x)
        : Math.abs(distance.y);
    diagonalMovement.x = distance.x < 0 ? -lesserCoord : lesserCoord; // keep the sign
    diagonalMovement.y = distance.y < 0 ? -lesserCoord : lesserCoord; // keep the sign

    let straightMovement: { x: number; y: number } = { x: 0, y: 0 };

    // one of x or y should always be 0 because we are calculating a straight
    // line along one of the axis
    straightMovement.x = distance.x - diagonalMovement.x;
    straightMovement.y = distance.y - diagonalMovement.y;

    // calculate distance
    const straightDistance =
      Math.abs(straightMovement.x) + Math.abs(straightMovement.y);
    let diagonalDistance = Math.abs(diagonalMovement.x);

    // if we are traveling diagonally along the stretch deformation we double
    // the diagonal distance
    if (
      (diagonalMovement.x < 0 && diagonalMovement.y > 0) ||
      (diagonalMovement.x > 0 && diagonalMovement.y < 0)
    ) {
      diagonalDistance *= 2;
    }

    return straightDistance + diagonalDistance;
  }

  public isBlank(id: number): boolean {
    const tile = this.getEntity(id.toString());
    return tile.type === 'blank';
  }
}
