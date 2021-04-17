import { Injectable } from '@angular/core';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { cols, GameQuery, max } from 'src/app/games/_state';
import { createTile, islandIds, Tile } from './tile.model';
import { TileStore, TileState } from './tile.store';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'tiles' })
export class TileService extends CollectionService<TileState> {
  constructor(store: TileStore, private gameQuery: GameQuery) {
    super(store);
  }

  public setTiles() {
    const tiles: Tile[] = [];
    const game = this.gameQuery.getActive();

    if (game) {
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < cols; j++) {
          const tileId = j + cols * i;
          if (tileId < max) {
            let type:
              | 'rockies'
              | 'mountains'
              | 'island'
              | 'plains'
              | 'swamps'
              | 'forest'
              | 'blank' = 'blank';
            if (islandIds.includes(tileId)) type = 'island';
            const tile = createTile(tileId, j, i, type);
            tiles.push(tile);
          }
        }
      }

      this.store.set(tiles);
    }
  }
}
