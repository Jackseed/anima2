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
import { EntityUIStore } from '@datorama/akita';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'games/:gameId/tiles' })
export class TileService extends CollectionService<TileState> {
  constructor(store: TileStore, private query: TileQuery) {
    super(store);
  }

  // Gets a species and transforms it to get quantity per tile id.
  // Returns {tileId: quantity}[]
  public fromSpeciesToSpeciesQuantityPerTileId(species: Species) {
    // Gets intermediate object with species count per tileId.

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
      const neutralTileSpecies =
        this.fromSpeciesToSpeciesQuantityPerTileId(neutral);
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
              ...neutral,
              quantity: neutralTileSpecies[tileId],
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
    this.removeAttackable();
    this.setActive(tileId);
  }

  public setActive(tileId: number) {
    this.store.setActive(tileId.toString());
  }

  public removeActive() {
    this.store.setActive(null);
  }

  public markAdjacentTilesReachable(tileId: number, range: number) {
    const adjacentReacheableTileIds = this.getAdjacentTileIdsWithinRange(
      tileId,
      range,
      // Updates tiles UI with their range.
      this.updateRange
    );
    this.markAsReachable(adjacentReacheableTileIds);
  }

  // Gets adjacent tile ids within a given range.
  // Also accepts callback function to work with each tile ids per range.
  public getAdjacentTileIdsWithinRange(
    tileId: number,
    range: number,
    rangeCallback?: (
      currentRangeTileIds: number[],
      currentRange: number,
      store: EntityUIStore<any, Tile>
    ) => void
  ): number[] {
    let resultTileIds = [tileId];
    let previousRangeTileIds = [tileId];
    let currentRangeTileIds = [];
    // Iterates on each tiles per range to get their adjacent tiles.
    for (let i = 0; i < range; i++) {
      // Gets adjacent tiles for each previous range tile.
      previousRangeTileIds.forEach((id) => {
        currentRangeTileIds.push(...this.query.getAdjacentTileIds(id, 1));
      });

      // Filters to keep only the new one.
      currentRangeTileIds = currentRangeTileIds.filter(
        (id) => !resultTileIds.includes(id)
      );
      // Removes duplicates.
      currentRangeTileIds = [...new Set(currentRangeTileIds)];
      // Applies a callback to the current range tile ids and range.
      if (rangeCallback)
        rangeCallback(currentRangeTileIds, i + 1, this.store.ui);
      // Updates value to prepare next iteration.
      previousRangeTileIds = currentRangeTileIds;
      // Saves the result.
      resultTileIds = [...resultTileIds, ...currentRangeTileIds];
    }

    // Removes the starting tileId
    resultTileIds = resultTileIds.filter((id) => id !== tileId);

    return resultTileIds;
  }

  // TODO: factorize these functions ?
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

  public markAsAttackable(tileIds: number[]) {
    this.store.update(
      tileIds.map((id) => id?.toString()),
      { isAttackable: true }
    );
  }

  public markAsProliferable(tileIds: number[]) {
    this.store.update(
      tileIds.map((id) => id?.toString()),
      { isProliferable: true }
    );
  }

  public markAsRallyable(tileIds: number[]) {
    this.store.update(
      tileIds.map((id) => id?.toString()),
      { isRallyable: true }
    );
  }

  public removeReachable() {
    this.store.update(null, { isReachable: false });
  }

  public removeAttackable() {
    this.store.update(null, { isAttackable: false });
  }

  public removeProliferable() {
    this.store.update(null, { isProliferable: false });
  }

  public removeRallyable() {
    this.store.update(null, { isRallyable: false });
  }

  public updateRange(
    tileIds: number[],
    range: number,
    store: EntityUIStore<any, Tile>
  ) {
    store.update(
      tileIds.map((id) => id.toString()),
      { range }
    );
  }

  public resetRange() {
    this.store.ui.update(null, { range: null });
  }
}
