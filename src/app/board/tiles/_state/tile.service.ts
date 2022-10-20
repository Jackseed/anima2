// Angular
import { Injectable } from '@angular/core';

// Akita
import { CollectionConfig, CollectionService } from 'akita-ng-fire';

// Firebase
import firebase from 'firebase/app';

// States
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
import { Species } from '../../species/_state';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'games/:gameId/tiles' })
export class TileService extends CollectionService<TileState> {
  constructor(store: TileStore, private query: TileQuery) {
    super(store);
  }

  // Gets a species and transform it to a tile species.
  public fromSpeciesToTileSpecies(species: Species) {
    // Gets intermediate object with species count per tileId.
    // {tileId: quantity}
    const tileSpecies = {};
    species.tileIds.forEach((tileId) => {
      tileSpecies.hasOwnProperty(tileId)
        ? tileSpecies[tileId]++
        : (tileSpecies[tileId] = 1);
    });

    return tileSpecies;
  }

  // Sets game tiles, including neutrals.
  public batchSetTiles(
    gameId: string,
    batch: firebase.firestore.WriteBatch,
    neutrals: Species[]
  ): firebase.firestore.WriteBatch {
    const tiles: Tile[] = [];
    const collection = this.db.firestore.collection(`games/${gameId}/tiles`);
    if (!gameId) return;

    // Sets tiles id and type.
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < cols; j++) {
        const tileId = j + cols * i;
        if (tileId < max) {
          let type: RegionType = 'blank';
          if (islandIds.includes(tileId)) type = 'islands';
          if (mountainsIds.includes(tileId)) type = 'mountains';
          if (rockiesIds.includes(tileId)) type = 'rockies';
          if (plainsIds.includes(tileId)) type = 'plains';
          if (swampsIds.includes(tileId)) type = 'swamps';
          if (forestIds.includes(tileId)) type = 'forests';
          const tile = createTile(tileId, j, i, type);
          tiles.push(tile);
        }
      }
    }

    // Updates tiles with neutral species.
    for (const neutral of neutrals) {
      const neutralTileSpecies = this.fromSpeciesToTileSpecies(neutral);
      // Extracts unique tile ids.
      const uniqueTileIds: string[] = Object.keys(neutralTileSpecies);
      // Updates tiles with speciesIds.
      for (const tileId of uniqueTileIds) {
        // Gets the pre-created tile.
        const tileIndex = tiles.findIndex(
          (tile) => tile.id === parseInt(tileId)
        );

        // Adds the species to the tile.
        tiles[tileIndex] = {
          ...tiles[tileIndex],
          species: [
            {
              id: neutral.id,
              quantity: neutralTileSpecies[tileId],
              color: neutral.color,
              mainAbilityId: neutral.abilities[0].id,
            },
          ],
        };
      }
    }

    // Saves tiles to Firestore.
    for (const tile of tiles) {
      const ref = collection.doc(tile.id.toString());
      batch.set(ref, tile);
    }
    return batch;
  }

  public selectTile(tileId: number) {
    this.removeReachable();
    this.setActive(tileId);
  }

  public setActive(tileId: number) {
    this.store.setActive(tileId.toString());
  }

  public removeActive() {
    this.store.setActive(null);
  }

  public markAdjacentReachableTiles(tileId: number, range: number) {
    let tileIds = [];
    let reachables = [];
    // Iterates on adjacent tiles to get their adjacent tiles.
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
      // get onlt this range tiles
      let rangeTiles = reachables.filter((id) => !tileIds.includes(id));
      // remove duplicates
      rangeTiles = [...new Set(rangeTiles)];
      this.updateRange(rangeTiles, i + 1);

      tileIds = [...tileIds, ...rangeTiles];
    }

    // remove the center tileId
    tileIds = tileIds.filter((id) => id !== tileId);
    this.markAsReachable(tileIds);
  }

  public markAllTilesReachable(): void {
    const tiles = this.query.getAll({
      filterBy: (tile) => tile.type !== 'blank',
    });
    const tileIds = tiles.map((tile) => tile.id);
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
  }

  public updateRange(tileIds: number[], range: number) {
    this.store.ui.update(
      tileIds.map((id) => id.toString()),
      { range }
    );
  }

  public resetRange() {
    this.store.ui.update(null, { range: null });
  }
}
