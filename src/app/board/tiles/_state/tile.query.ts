import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { cols, Tile } from './tile.model';
import { TileStore, TileState } from './tile.store';

@Injectable({ providedIn: 'root' })
export class TileQuery extends QueryEntity<TileState> {
  constructor(protected store: TileStore) {
    super(store);
  }

  public getAdjacentTiles(tileId: number, paramValue: number): number[] {
    const tile: Tile = this.getEntity(tileId.toString());
    const tileIds: number[] = [];
    for (let x = -paramValue; x <= paramValue; x++) {
      for (let y = -paramValue; y <= paramValue; y++) {
        // remove values for hexa grid, not needed for squares, different values depending on odd or even lines
        if (
          !(
            tile.y % 2 === 0 &&
            ((x === 1 && y === -1) || (x === 1 && y === 1))
          ) &&
          !(
            tile.y % 2 !== 0 &&
            ((x === -1 && y === -1) || (x === -1 && y === 1))
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
    // remove the center tileId
    return tileIds.filter((id) => id !== tileId);
  }

  public isBlank(id: number): boolean {
    const tile = this.getEntity(id.toString());
    return tile.type === 'blank';
  }
}
