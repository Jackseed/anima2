// Angular
import { Injectable } from '@angular/core';

// Angular Material
import { MatDialog } from '@angular/material/dialog';

// Angularfire
import { AngularFirestoreDocument } from '@angular/fire/firestore';

// Firebase
import firebase from 'firebase/app';

// Akita
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';

// States
import { Species } from './species.model';
import { SpeciesStore, SpeciesState } from './species.store';
import { SpeciesQuery } from './species.query';
import { Tile, TileQuery } from '../../tiles/_state';

// Components
import { ListComponent } from '../list/list.component';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'games/:gameId/species' })
export class SpeciesService extends CollectionService<SpeciesState> {
  constructor(
    store: SpeciesStore,
    private query: SpeciesQuery,
    private tileQuery: TileQuery,
    private routerQuery: RouterQuery,
    public dialog: MatDialog
  ) {
    super(store);
  }

  // Opens species list, either global or on a specific tile.
  public openSpeciesList(tileId?: number) {
    const species: Species[] = tileId
      ? this.query.getTileSpecies(tileId)
      : this.query.getAll();

    this.dialog.open(ListComponent, {
      data: {
        listType: 'passive',
        species,
        speciesCount: tileId ? 'tile' : 'global',
        tileId,
      },
      height: '90%',
      width: '80%',
      panelClass: ['custom-container', 'no-padding-bottom'],
      autoFocus: false,
    });
  }

  // TODO: clean this service

  public setActive(id: string) {
    this.store.setActive(id);
  }

  public removeActive(id: string) {
    this.store.removeActive(id);
  }

  public async addSpecies(species: Species, gameId: string): Promise<any> {
    await this.db.firestore
      .runTransaction(async (transaction) => {
        // set species
        const speciesCollection = this.db.firestore.collection(
          `games/${gameId}/species`
        );
        const speciesRef = speciesCollection.doc(species.id);

        const tiles = [];
        // get tiles from species
        for (const tileId of species.tileIds) {
          const tileDoc: AngularFirestoreDocument<Tile> = this.db.doc<Tile>(
            `games/${gameId}/tiles/${tileId.toString()}`
          );
          await transaction.get(tileDoc.ref).then((tileDoc) => {
            if (!tileDoc.exists) {
              throw 'Document does not exist!';
            }
            tiles.push(tileDoc.data());
          });
        }

        // get intermediate object with species count per tileId
        const tileSpecies = {};
        species.tileIds.forEach((tileId) => {
          tileSpecies.hasOwnProperty(tileId)
            ? tileSpecies[tileId]++
            : (tileSpecies[tileId] = 1);
        });
        // extract unique tile ids
        const uniqueTileIds: string[] = Object.keys(tileSpecies);

        // update tiles with speciesIds
        for (const tileId of uniqueTileIds) {
          const tileDoc: AngularFirestoreDocument<Tile> = this.db.doc<Tile>(
            `games/${gameId}/tiles/${tileId.toString()}`
          );

          const tileIndex = tiles.findIndex(
            (tile) => tile.id === parseInt(tileId)
          );
          const tile = tiles[tileIndex];

          let newSpecies = this.getUpdatedSpeciesOnTile(
            tile,
            species.id,
            tileSpecies[tileId],
            species.color,
            species.abilityIds[0]
          );

          transaction.update(tileDoc.ref, { species: newSpecies });
        }
        transaction.set(speciesRef, species);
      })
      .catch((error) => {
        console.log('Transaction failed: ', error);
      });
  }

  public getUpdatedSpeciesOnTile(
    tileId: number,
    speciesId: string,
    quantity: number,
    color: string,
    abilityId: string
  ): { id: string; quantity: number; color: string; abilityId: string }[] {
    const tile = this.tileQuery.getEntity(tileId.toString());
    let updatedSpecies = [];
    // check if the tile already have species
    if (tile.species) {
      const speciesIndex = tile.species.findIndex(
        (specie) => specie.id === speciesId
      );
      //then if it had that species, if not add it
      if (speciesIndex === -1) {
        updatedSpecies = tile.species.concat({
          id: speciesId,
          quantity,
          color,
          abilityId,
        });
        // if so, increment quantity
      } else {
        // copy tile species to be able to change it
        updatedSpecies = [...tile.species].map((specie) => {
          return { ...specie };
        });
        // check if there is no more species, if so delete it
        if (updatedSpecies[speciesIndex].quantity + quantity === 0) {
          updatedSpecies.splice(speciesIndex, 1);
          // else update quantity
        } else {
          updatedSpecies[speciesIndex].quantity =
            updatedSpecies[speciesIndex].quantity + quantity;
        }
      }
      // if the tile hadn't species object, adds it
    } else {
      updatedSpecies = tile.species.concat({
        id: speciesId,
        quantity,
        color,
        abilityId,
      });
    }
    return updatedSpecies;
  }

  // TODO: mb change tileIds for quantity on species?
  // TODO: rename func
  public async proliferate(
    speciesId: string,
    tileId: number,
    quantity: number
  ) {
    const species = this.query.getEntity(speciesId);
    const gameId = this.routerQuery.getParams().id;
    const gameDoc = `games/${gameId}`;

    const batch = this.db.firestore.batch();
    // update species tileIds
    const speciesDoc: AngularFirestoreDocument<Species> = this.db.doc<Species>(
      `${gameDoc}/species/${speciesId}`
    );
    let tileIds = (await speciesDoc.get().toPromise()).data().tileIds;
    for (let i = 0; i < quantity; i++) {
      tileIds.push(tileId);
    }
    batch.update(speciesDoc.ref, { tileIds });

    // update tile species
    const tileDoc: AngularFirestoreDocument<Tile> = this.db.doc<Tile>(
      `${gameDoc}/tiles/${tileId}`
    );
    const updatedSpecies = this.getUpdatedSpeciesOnTile(
      tileId,
      speciesId,
      quantity,
      species.color,
      species.abilityIds[0]
    );

    batch.update(tileDoc.ref, { species: updatedSpecies });

    return batch
      .commit()
      .catch((err) => console.log('Proliferate failed ', err));
  }

  // Moves species from a tile to another.
  public async move(
    speciesId: string,
    previousTileId: number,
    newTileId: number,
    quantity: number
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
      previousTileId,
      newTileId
    );

    // Then, updates tile docs with new species quantity.
    batch = this.batchUpdateTileWithSpeciesQuantity(
      gameDoc,
      batch,
      previousTileId,
      species,
      -quantity
    );

    batch = this.batchUpdateTileWithSpeciesQuantity(
      gameDoc,
      batch,
      newTileId,
      species,
      quantity
    );

    // Finally, updates migration count.
    batch = this.batchUpdateMigrationCount(gameDoc, batch, newTileId, quantity);

    return batch.commit();
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
    const updatedSpecies = this.getUpdatedSpeciesOnTile(
      tileId,
      species.id,
      -quantity,
      species.color,
      species.abilityIds[0]
    );
    return batch.update(tileDoc.ref, { species: updatedSpecies });
  }

  private batchUpdateMovingSpeciesTileIds(
    gameDoc: string,
    batch: firebase.firestore.WriteBatch,
    species: Species,
    quantity: number,
    previousTileId: number,
    newTileId: number
  ): firebase.firestore.WriteBatch {
    const speciesDoc: AngularFirestoreDocument<Species> = this.db.doc<Species>(
      `${gameDoc}/species/${species.id}`
    );
    let tileIds = species.tileIds;

    // Iterates as much as species to move.
    for (let i = 0; i < quantity; i++) {
      const index = tileIds.indexOf(previousTileId);
      // Removes 1 species to previous tile id.
      if (index > -1) {
        tileIds.splice(index, 1);
      }
      // Then adds 1 to the new tile.
      tileIds.push(newTileId);
    }

    return batch.update(speciesDoc.ref, { tileIds });
  }

  private batchUpdateMigrationCount(
    gameDoc: string,
    batch: firebase.firestore.WriteBatch,
    newTileId: number,
    quantity: number
  ): firebase.firestore.WriteBatch {
    const gameRef = this.db.doc(gameDoc).ref;
    const UItile = this.tileQuery.ui.getEntity(newTileId.toString());
    const distance = UItile.range;

    const decrement = firebase.firestore.FieldValue.increment(
      -distance * quantity
    );

    return batch.update(gameRef, { migrationCount: decrement });
  }
}
