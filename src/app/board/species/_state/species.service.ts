// Angular
import { Injectable } from '@angular/core';

// Angularfire
import { AngularFirestoreDocument } from '@angular/fire/firestore';

// Firebase
import firebase from 'firebase/app';

// Akita
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';

// States
import {
  Ability,
  AbilityId,
  MoveParameters,
  Species,
  TileSpecies,
} from './species.model';
import { SpeciesStore, SpeciesState } from './species.store';
import { SpeciesQuery } from './species.query';
import { Tile, TileQuery } from '../../tiles/_state';
import { GameQuery } from 'src/app/games/_state';

// Material
import { MatDialog } from '@angular/material/dialog';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'games/:gameId/species' })
export class SpeciesService extends CollectionService<SpeciesState> {
  constructor(
    store: SpeciesStore,
    private query: SpeciesQuery,
    private gameQuery: GameQuery,
    private tileQuery: TileQuery,
    private routerQuery: RouterQuery,
    public dialog: MatDialog
  ) {
    super(store);
  }

  public setActive(id: string) {
    this.store.setActive(id);
  }

  public removeActive(id: string) {
    this.store.removeActive(id);
  }

  // Adds an ability to a species
  public addAbilityToSpeciesByBatch(
    ability: Ability,
    species: Species,
    batch: firebase.firestore.WriteBatch
  ): firebase.firestore.WriteBatch {
    const gameId = this.gameQuery.getActiveId();
    const firestoreAbility = firebase.firestore.FieldValue.arrayUnion(ability);
    const speciesRef = this.db.doc(`games/${gameId}/species/${species.id}`).ref;

    return batch.update(speciesRef, { abilities: firestoreAbility });
  }

  // Updates a tile with an updated species object.
  public getUpdatedSpeciesOnTile(
    tile: Tile,
    speciesId: string,
    quantity: number,
    mainAbilityId: AbilityId
  ): TileSpecies[] {
    let updatedSpecies = [];
    const isSpeciesOnTile = this.query.isSpeciesOnTile(speciesId, tile);
    const species = this.query.getEntity(speciesId);

    // If the species isn't on the tile yet, adds it.
    if (!isSpeciesOnTile) {
      const tileSpecies: TileSpecies = {
        ...species,
        tileId: Number(tile.id),
        quantity,
        mainAbilityId,
      };
      updatedSpecies = tile.species.concat(tileSpecies);
    }

    // If species is already there, updates quantity.
    else {
      const speciesIndex = tile.species.findIndex(
        (specie) => specie.id === speciesId
      );
      updatedSpecies = JSON.parse(JSON.stringify(tile.species));
      const existingQuantity = updatedSpecies[speciesIndex].quantity;
      const newQuantity = existingQuantity + quantity;
      // If there is no more species on this tile, removes it.
      if (newQuantity <= 0) {
        updatedSpecies.splice(speciesIndex, 1);
      } else {
        // Otherwise, updates quantity.
        updatedSpecies[speciesIndex].quantity = newQuantity;
      }
    }
    return updatedSpecies;
  }

  // TODO: batch ?
  // Moves species (from a tile) to a tile.
  public move(
    params: MoveParameters,
    existingBatch?: firebase.firestore.WriteBatch
  ): firebase.firestore.WriteBatch | Promise<void> {
    const gameId = this.routerQuery.getParams().id;
    const gameDoc = `games/${gameId}`;
    const species = this.query.getEntity(params.speciesId);
    let batch = existingBatch ? existingBatch : this.db.firestore.batch();

    // First, updates tileIds on the species doc.
    batch = this.batchUpdateMovingSpeciesTileIds(
      gameDoc,
      batch,
      species,
      params.quantity,
      params.destinationId,
      params.previousTileId
    );

    // Then, updates tile docs with new species quantity.
    batch = this.batchUpdateTileWithSpeciesQuantity(
      gameDoc,
      batch,
      params.destinationId,
      species,
      params.quantity
    );

    if (params.previousTileId) {
      batch = this.batchUpdateTileWithSpeciesQuantity(
        gameDoc,
        batch,
        params.previousTileId,
        species,
        -params.quantity
      );
    }
    if (params.migrationUsed) {
      // Finally, updates remaining migrations, if it's a move.
      batch = this.batchUpdateRemainingMigrations(
        gameDoc,
        batch,
        params.migrationUsed
      );
    }

    if (existingBatch) return batch;

    return batch.commit().catch((err) => console.log('Move failed ', err));
  }

  private batchUpdateTileWithSpeciesQuantity(
    gameDoc: string,
    batch: firebase.firestore.WriteBatch,
    tileId: number,
    species: Species,
    quantity: number
  ): firebase.firestore.WriteBatch {
    const tileDoc: AngularFirestoreDocument<Tile> = this.db.doc<Tile>(
      `${gameDoc}/tiles/${tileId}`
    );
    const tile = this.tileQuery.getEntity(tileId.toString());
    const updatedSpecies = this.getUpdatedSpeciesOnTile(
      tile,
      species.id,
      quantity,
      species.abilities[0].id
    );
    return batch.update(tileDoc.ref, { species: updatedSpecies });
  }

  private batchUpdateMovingSpeciesTileIds(
    gameDoc: string,
    batch: firebase.firestore.WriteBatch,
    species: Species,
    quantity: number,
    destinationTileId: number,
    previousTileId?: number
  ): firebase.firestore.WriteBatch {
    const speciesDoc: AngularFirestoreDocument<Species> = this.db.doc<Species>(
      `${gameDoc}/species/${species.id}`
    );
    let tileIds: number[] = JSON.parse(JSON.stringify(species.tileIds));
    // Iterates as much as species to move.
    for (let i = 0; i < Math.abs(quantity); i++) {
      // Adds 1 species to the new tile.
      if (quantity > 0) tileIds.push(destinationTileId);
      // Removes 1 species to previous tile id or if quantity is negative.
      if (quantity < 0 || previousTileId) {
        const tileId = previousTileId ? previousTileId : destinationTileId;
        const index = tileIds.indexOf(tileId);
        if (index !== -1) tileIds.splice(index, 1);
      }
    }
    return batch.update(speciesDoc.ref, { tileIds });
  }

  private batchUpdateRemainingMigrations(
    gameDoc: string,
    batch: firebase.firestore.WriteBatch,
    migrationUsed: number
  ): firebase.firestore.WriteBatch {
    const gameRef = this.db.doc(gameDoc).ref;
    const decrement = firebase.firestore.FieldValue.increment(-migrationUsed);

    return batch.update(gameRef, { remainingMigrations: decrement });
  }
}
