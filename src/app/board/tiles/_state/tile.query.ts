import { Injectable } from '@angular/core';
import { Order, QueryConfig, QueryEntity } from '@datorama/akita';
import { cols, islandBridgeIds, Tile } from './tile.model';
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
    const tileIds: number[] = [];
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
    // remove the center tileId
    return tileIds.filter((id) => id !== tileId);
  }

  public isBlank(id: number): boolean {
    const tile = this.getEntity(id.toString());
    return tile.type === 'blank';
  }
}
