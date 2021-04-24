import { Injectable } from '@angular/core';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { GameQuery } from 'src/app/games/_state';
import {
  cols,
  max,
  createTile,
  forestIds,
  islandIds,
  mountainsIds,
  plainsIds,
  rockiesIds,
  swampsIds,
  Tile,
} from './tile.model';
import { TileQuery } from './tile.query';
import { TileStore, TileState } from './tile.store';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'games/:gameId/tiles' })
export class TileService extends CollectionService<TileState> {
  constructor(
    store: TileStore,
    private query: TileQuery,
    private gameQuery: GameQuery
  ) {
    super(store);
  }

  public async setTiles(gameId: string): Promise<any> {
    const tiles: Tile[] = [];
    const game = this.gameQuery.getActive();
    const collection = this.db.firestore.collection(`games/${gameId}/tiles`);
    const batch = this.db.firestore.batch();

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
            if (mountainsIds.includes(tileId)) type = 'mountains';
            if (rockiesIds.includes(tileId)) type = 'rockies';
            if (plainsIds.includes(tileId)) type = 'plains';
            if (swampsIds.includes(tileId)) type = 'swamps';
            if (forestIds.includes(tileId)) type = 'forest';
            const tile = createTile(tileId, j, i, type);
            tiles.push(tile);
          }
        }
      }

      for (const tile of tiles) {
        const ref = collection.doc(tile.id.toString());
        batch.set(ref, tile);
      }

      return batch.commit().catch((error) => console.log(error));
    }
  }

  public select(tileId: number) {
    this.store.setActive(tileId.toString());
  }

  public removeActive(id: number) {
    this.store.removeActive(id.toString());
  }

  public markAdjacentReachableTiles(tileId: number) {
    const rechableTileIds = this.query.getAdjacentTiles(tileId, 1);
    this.markAsReachable(rechableTileIds);
  }

  public markAsReachable(tileIds: number[]) {
    this.store.update(
      tileIds.map((id) => id.toString()),
      { isReachable: true }
    );
  }

  public removeReachable() {
    this.store.update(null, { isReachable: false });
  }
}
