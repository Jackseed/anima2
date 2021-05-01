import { Injectable } from '@angular/core';
import { AngularFirestoreDocument } from '@angular/fire/firestore';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { Tile, TileQuery } from '../../tiles/_state';
import { neutrals, Species } from './species.model';
import { SpeciesStore, SpeciesState } from './species.store';
import firebase from 'firebase/app';
import { Game, GameService } from 'src/app/games/_state';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'games/:gameId/species' })
export class SpeciesService extends CollectionService<SpeciesState> {
  constructor(
    store: SpeciesStore,
    private gameService: GameService,
    private tileQuery: TileQuery,
    private routerQuery: RouterQuery
  ) {
    super(store);
  }

  public setNeutrals(gameId: string) {
    neutrals.forEach((species) => this.addSpecies(species, gameId));
  }

  public setActive(id: string) {
    this.store.setActive(id);
  }

  public removeActive(id: string) {
    this.store.removeActive(id);
  }

  public async addSpecies(species: Species, gameId?: string): Promise<any> {
    const gId = gameId ? gameId : this.routerQuery.getParams().id;
    await this.db.firestore
      .runTransaction(async (transaction) => {
        // set species
        const speciesCollection = this.db.firestore.collection(
          `games/${gId}/species`
        );
        const speciesRef = speciesCollection.doc(species.id);

        const tiles = [];
        // get tiles from species
        for (const tileId of species.tileIds) {
          const tileDoc: AngularFirestoreDocument<Tile> = this.db.doc<Tile>(
            `games/${gId}/tiles/${tileId.toString()}`
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
            `games/${gId}/tiles/${tileId.toString()}`
          );

          const tileIndex = tiles.findIndex(
            (tile) => tile.id === parseInt(tileId)
          );
          const tile = tiles[tileIndex];

          let newSpecies = this.getUpdatedSpeciesOnTile(
            tile,
            species.id,
            tileSpecies[tileId]
          );

          transaction.update(tileDoc.ref, { species: newSpecies });
        }
        transaction.set(speciesRef, species);
      })
      .then(() => {
        console.log('Transaction successfully committed!');
      })
      .catch((error) => {
        console.log('Transaction failed: ', error);
      });
  }

  public getUpdatedSpeciesOnTile(
    tile: Tile,
    speciesId: string,
    quantity: number
  ): { id: string; quantity: number }[] {
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
        });
        // if so, increment quantity
      } else {
        // copy tile species to be able to change it
        updatedSpecies = [...tile.species].map((specie) => {
          return { ...specie };
        });
        updatedSpecies[speciesIndex].quantity =
          updatedSpecies[speciesIndex].quantity + quantity;
      }
      // if the tile hadn't species object, adds it
    } else {
      updatedSpecies = tile.species.concat({
        id: speciesId,
        quantity,
      });
    }
    return updatedSpecies;
  }

  // TODO: mb change tileIds for quantity on species?
  public async proliferate(id: string, tileId: number, quantity: number) {
    const batch = this.db.firestore.batch();
    // update species tileIds
    const speciesDoc: AngularFirestoreDocument<Species> = this.db.doc<Species>(
      `games/${this.routerQuery.getParams().id}/species/${id}`
    );
    let tileIds = (await speciesDoc.get().toPromise()).data().tileIds;
    for (let i = 0; i < quantity; i++) {
      tileIds.push(tileId);
    }
    batch.update(speciesDoc.ref, { tileIds });

    // update tile species
    const tileDoc: AngularFirestoreDocument<Tile> = this.db.doc<Tile>(
      `games/${this.routerQuery.getParams().id}/tiles/${tileId}`
    );
    const tile = this.tileQuery.getEntity(tileId.toString());
    const species = this.getUpdatedSpeciesOnTile(tile, id, quantity);
    batch.update(tileDoc.ref, { species });

    batch
      .commit()
      .then(() => {
        console.log('Transaction successfully committed!');
      })
      .catch((error) => {
        console.log('Transaction failed: ', error);
      });
  }

  public async move(
    game: Game,
    speciesId: string,
    previousTileId: number,
    newTileId: number,
    quantity: number
  ) {
    const batch = this.db.firestore.batch();
    // update species tileIds
    const speciesDoc: AngularFirestoreDocument<Species> = this.db.doc<Species>(
      `games/${game.id}/species/${speciesId}`
    );
    let tileIds = (await speciesDoc.get().toPromise()).data().tileIds;
    for (let i = 0; i < quantity; i++) {
      const index = tileIds.indexOf(previousTileId);
      if (index > -1) {
        tileIds.splice(index, 1);
      }
      // then adds the new one
      tileIds.push(newTileId);
    }

    batch.update(speciesDoc.ref, { tileIds });

    // update previous tile species
    const previousTileDoc: AngularFirestoreDocument<Tile> = this.db.doc<Tile>(
      `games/${game.id}/tiles/${previousTileId}`
    );
    const previousTile = this.tileQuery.getEntity(previousTileId.toString());
    const previousSpecies = this.getUpdatedSpeciesOnTile(
      previousTile,
      speciesId,
      -quantity
    );
    batch.update(previousTileDoc.ref, { species: previousSpecies });

    // update new tile species
    const newTileDoc: AngularFirestoreDocument<Tile> = this.db.doc<Tile>(
      `games/${game.id}/tiles/${newTileId}`
    );
    const tile = this.tileQuery.getEntity(newTileId.toString());
    const newSpecies = this.getUpdatedSpeciesOnTile(tile, speciesId, quantity);
    batch.update(newTileDoc.ref, { species: newSpecies });

    // update colonization count
    const gameRef = this.db.collection('games').doc(game.id).ref;
    const decrement = firebase.firestore.FieldValue.increment(-quantity);

    batch.update(gameRef, { colonizationCount: decrement });

    batch
      .commit()
      .then(() => {
        console.log('move - Transaction successfully committed!');
        // update remainingActions if that's the last colonizationCount
        if (game.colonizationCount === quantity) {
          this.gameService.decrementRemainingActions();
        }
      })
      .catch((error) => {
        console.log('Transaction failed: ', error);
      });

    return;
  }
}
