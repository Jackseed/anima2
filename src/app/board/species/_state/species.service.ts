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
import { Ability, AbilityId, Species, TileSpecies } from './species.model';
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

  // ASSIMILATION
  // Removes one species from a tile and adds one to the active species.
  public async assimilate(
    removedSpeciesId: string,
    removedQuantity: number,
    removedTileId: number,
    addingQuantity: number
  ) {
    const activeSpeciesId = this.query.getActiveId();
    const activeTileId = Number(this.tileQuery.getActiveId());
    // Removes the assimilated species.
    await this.move(removedSpeciesId, removedQuantity, removedTileId);
    // Adds quantity to the assimilating species.
    await this.move(activeSpeciesId, addingQuantity, activeTileId);
  }

  // Adds an ability to a species
  public async addAbilityToSpecies(ability: Ability, species: Species) {
    const gameId = this.gameQuery.getActiveId();
    const firestoreAbility = firebase.firestore.FieldValue.arrayUnion(ability);
    await this.db.firestore
      .doc(`games/${gameId}/species/${species.id}`)
      .update({
        abilities: firestoreAbility,
      })
      .catch((error) => {
        console.log('Adding ability failed: ', error);
      });
  }

  // Updates a tile with an updated species object.
  public getUpdatedSpeciesOnTile(
    tile: Tile,
    speciesId: string,
    quantity: number,
    color: string,
    mainAbilityId: AbilityId
  ): TileSpecies[] {
    let updatedSpecies = [];
    const isSpeciesOnTile = this.query.isSpeciesOnTile(speciesId, tile);

    // If the species isn't on the tile yet, adds it.
    if (!isSpeciesOnTile) {
      updatedSpecies = tile.species.concat({
        id: speciesId,
        quantity,
        color,
        mainAbilityId,
      });
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
      if (newQuantity === 0) {
        updatedSpecies.splice(speciesIndex, 1);
      } else {
        // Otherwise, updates quantity.
        updatedSpecies[speciesIndex].quantity = newQuantity;
      }
    }
    return updatedSpecies;
  }

  // Moves species (from a tile) to a tile.
  public async move(
    speciesId: string,
    quantity: number,
    destinationId: number,
    previousTileId?: number
  ) {
    const gameId = this.routerQuery.getParams().id;
    const gameDoc = `games/${gameId}`;
    const species = this.query.getEntity(speciesId);
    let batch = this.db.firestore.batch();

    // First, updates tileIds on the species doc.
    batch = this.batchUpdateMovingSpeciesTileIds(
      gameDoc,
      batch,
      species,
      quantity,
      destinationId,
      previousTileId
    );

    // Then, updates tile docs with new species quantity.
    batch = this.batchUpdateTileWithSpeciesQuantity(
      gameDoc,
      batch,
      destinationId,
      species,
      quantity
    );

    if (previousTileId) {
      batch = this.batchUpdateTileWithSpeciesQuantity(
        gameDoc,
        batch,
        previousTileId,
        species,
        -quantity
      );

      // Finally, updates migration count, if it's a move.
      batch = this.batchUpdateMigrationCount(
        gameDoc,
        batch,
        destinationId,
        quantity
      );
    }
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
      species.color,
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
    let tileIds = JSON.parse(JSON.stringify(species.tileIds));
    // Iterates as much as species to move.
    for (let i = 0; i < Math.abs(quantity); i++) {
      // Adds 1 species to the new tile.
      if (quantity > 0) tileIds.push(destinationTileId);
      // TODO: refactor this
      // Removes 1 species to previous tile id or if quantity is negative.
      if (quantity < 0 || previousTileId) {
        const tileId = previousTileId ? previousTileId : destinationTileId;
        const index = tileIds.indexOf(previousTileId);
        if (index > -1) {
          tileIds.splice(index, 1);
        }
      }
    }
    return batch.update(speciesDoc.ref, { tileIds });
  }

  private batchUpdateMigrationCount(
    gameDoc: string,
    batch: firebase.firestore.WriteBatch,
    destinationTileId: number,
    quantity: number
  ): firebase.firestore.WriteBatch {
    const gameRef = this.db.doc(gameDoc).ref;
    const UItile = this.tileQuery.ui.getEntity(destinationTileId.toString());
    const distance = UItile.range;

    const decrement = firebase.firestore.FieldValue.increment(
      -distance * quantity
    );

    return batch.update(gameRef, { migrationCount: decrement });
  }
}
