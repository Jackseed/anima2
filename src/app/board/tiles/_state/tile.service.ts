// Angular
import { Injectable } from '@angular/core';

// Akita ng Fire
import { CollectionConfig, CollectionService } from 'akita-ng-fire';

// Akita
import { EntityUIStore } from '@datorama/akita';

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
  nonBlankTileIds,
} from './tile.model';
import { TileQuery } from './tile.query';
import { TileStore, TileState } from './tile.store';
import {
  NEUTRALS_MAX_QUANTITY,
  NEUTRALS_MIN_QUANTITY,
} from 'src/app/games/_state/game.model';
import { Species } from '../../species/_state/species.model';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'games/:gameId/tiles' })
export class TileService extends CollectionService<TileState> {
  constructor(store: TileStore, private query: TileQuery) {
    super(store);
  }

  public updateEntity(id: string, tile: Partial<Tile>) {
    this.store.update(id, tile);
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

  // Sets game tiles.
  public batchSetTiles(
    gameId: string,
    batch: firebase.firestore.WriteBatch
  ): { batch: firebase.firestore.WriteBatch; tiles: Tile[] } {
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

    // Saves tiles to Akita.
    this.store.set(tiles);

    // Saves tiles to Firestore.
    for (const tile of tiles) {
      const ref = collection.doc(tile.id.toString());
      batch.set(ref, tile);
    }
    return { batch, tiles };
  }

  public addNeutralsOnTheirTiles(
    gameId: string,
    batch: firebase.firestore.WriteBatch,
    neutrals: Species[],
    tiles: Tile[]
  ): firebase.firestore.WriteBatch {
    const collection = this.db.firestore.collection(`games/${gameId}/tiles`);
    const updatedTiles: Tile[] = [];

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
        const updatedTile = {
          ...tiles[tileIndex],
          species: [
            {
              ...neutral,
              quantity: neutralTileSpecies[tileId],
              mainAbilityId: neutral.abilities[0].id,
            },
          ],
        };

        updatedTiles.push(updatedTile);
      }
    }

    // Updates tiles on Firestore.
    for (const tile of updatedTiles) {
      const ref = collection.doc(tile.id.toString());
      batch.update(ref, tile);
    }

    return batch;
  }

  public generateNeutralTileIds(): number[] {
    const tileIds: number[] = [];
    // Neutrals have a random quantity between min & max (inclusive of both).
    const neutralQuantity = this.randomIntegerBetweenMinAndMaxInclusively(
      NEUTRALS_MIN_QUANTITY,
      NEUTRALS_MAX_QUANTITY
    );

    // The first tileId is randomized among all the tileIds.
    const originTileId = this.randomItemInsideArray(nonBlankTileIds);

    tileIds.push(originTileId);

    // Generates a random tileId for each individual.
    for (let i = 0; i < neutralQuantity; i++) {
      // The more individuals, smaller the range.
      const tileIdRangeFromOrigin =
        neutralQuantity === NEUTRALS_MIN_QUANTITY
          ? NEUTRALS_MAX_QUANTITY
          : NEUTRALS_MIN_QUANTITY;

      // Randomizes a tile id within the random range
      const potentialWithinnRangeTileIds = this.getAdjacentTileIdsWithinRange(
        originTileId,
        tileIdRangeFromOrigin
      );
      potentialWithinnRangeTileIds.push(originTileId);

      const neutralTileId = this.randomItemInsideArray(
        potentialWithinnRangeTileIds
      );
      tileIds.push(neutralTileId);
    }

    return tileIds;
  }

  private randomItemInsideArray(array: any[]) {
    const randomIndex = Math.floor(Math.random() * array.length);
    const item = array[randomIndex];

    return item;
  }

  // TODO: fix
  private randomIntegerBetweenMinAndMaxInclusively(
    min: number,
    max: number
  ): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

  public selectTile(tileId: number) {
    this.removeProperty('isReachable');
    this.removeProperty('isAttackable');
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
    this.markTiles(adjacentReacheableTileIds, 'isReachable');
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

  public markAllTilesReachable(): void {
    const tiles = this.query.getAll({
      filterBy: (tile) => tile.type !== 'blank',
    });
    const tileIds = tiles.map((tile) => tile.id);

    this.markTiles(tileIds, 'isReachable');
  }

  public markTiles(
    tileIds: number[],
    property:
      | 'isReachable'
      | 'isAttackable'
      | 'isProliferable'
      | 'isRallyable'
      | 'isPlayed'
  ) {
    this.store.update(
      tileIds.map((id) => id?.toString()),
      { [property]: true }
    );
  }

  public removeProperty(
    property:
      | 'isReachable'
      | 'isAttackable'
      | 'isProliferable'
      | 'isRallyable'
      | 'isPlayed'
  ) {
    this.store.update(null, { [property]: false });
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
