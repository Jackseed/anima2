import { Injectable } from '@angular/core';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
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
  RegionType,
} from './tile.model';
import { TileQuery } from './tile.query';
import { TileStore, TileState } from './tile.store';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'games/:gameId/tiles' })
export class TileService extends CollectionService<TileState> {
  constructor(store: TileStore, private query: TileQuery) {
    super(store);
  }

  public async setTiles(gameId: string): Promise<any> {
    const tiles: Tile[] = [];
    const collection = this.db.firestore.collection(`games/${gameId}/tiles`);
    const batch = this.db.firestore.batch();

    if (gameId) {
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < cols; j++) {
          const tileId = j + cols * i;
          if (tileId < max) {
            let type: RegionType = 'blank';
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
      return batch.commit();
    }
  }

  public select(tileId: number) {
    this.store.setActive(tileId.toString());
  }

  public removeActive() {
    this.store.setActive(null);
  }

  public markAdjacentReachableTiles(tileId: number, range: number) {
    const rechableTileIds = this.query.getAdjacentTiles(tileId, 1);
    let tileIds = [];
    let reachables = [];
    // iterates on adjacent tiles to get their adjacent tiles
    for (let i = 0; i < range; i++) {
      i === 0
        ? (reachables = this.query.getAdjacentTiles(tileId, 1))
        : reachables.forEach(
            (id) =>
              (reachables = [
                ...reachables,
                ...this.query.getAdjacentTiles(id, 1),
              ])
          );
      tileIds = [...tileIds, ...reachables];
      // remove duplicates
      tileIds = [...new Set(tileIds)];
    }

    // remove the center tileId
    tileIds = tileIds.filter((id) => id !== tileId);
    this.markAsReachable(tileIds);
  }

  public markAsReachable(tileIds: number[]) {
    this.store.update(
      tileIds.map((id) => id.toString()),
      { isReachable: true }
    );
  }

  public removeReachable() {
    this.store.update(null, { isReachable: false });
    this.updateRange(null);
  }

  public updateRange(range: number) {
    this.store.update({
      ui: {
        range,
      },
    });
  }
}
