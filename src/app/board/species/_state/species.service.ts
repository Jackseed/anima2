import { Injectable } from '@angular/core';
import { AngularFirestoreDocument } from '@angular/fire/firestore';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { Tile } from '../../tiles/_state';
import { neutrals, Species } from './species.model';
import { SpeciesStore, SpeciesState } from './species.store';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'games/:gameId/species' })
export class SpeciesService extends CollectionService<SpeciesState> {
  constructor(store: SpeciesStore, private routerQuery: RouterQuery) {
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
    return this.db.firestore
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
        // update tiles with speciesIds
        for (const [i, tileId] of species.tileIds.entries()) {
          const tileDoc: AngularFirestoreDocument<Tile> = this.db.doc<Tile>(
            `games/${gId}/tiles/${tileId.toString()}`
          );
          let speciesIds = tiles[i].speciesIds;
          // add this species to the tile
          speciesIds.push(species.id);

          transaction.update(tileDoc.ref, { speciesIds });
          transaction.set(speciesRef, species);
        }
      })
      .then(() => {
        console.log('Transaction successfully committed!');
      })
      .catch((error) => {
        console.log('Transaction failed: ', error);
      });
  }

  public async proliferate(id: string, newTileIds: number[]) {
    const speciesDoc: AngularFirestoreDocument<Species> = this.db.doc<Species>(
      `games/${this.routerQuery.getParams().id}/species/${id}`
    );
    let tileIds = (await speciesDoc.get().toPromise()).data().tileIds;
    newTileIds.forEach((tileId) => tileIds.push(tileId));
    await speciesDoc.update({ tileIds });
  }

  public async moveUnits(
    id: string,
    previousTileIds: number[],
    newTileId: number
  ) {
    const speciesDoc: AngularFirestoreDocument<Species> = this.db.doc<Species>(
      `games/${this.routerQuery.getParams().id}/species/${id}`
    );
    let tileIds = (await speciesDoc.get().toPromise()).data().tileIds;
    previousTileIds.forEach((tileId) => {
      // First removes the old one
      const index = tileIds.indexOf(tileId);
      if (index > -1) {
        tileIds.splice(index, 1);
      }
      // then adds the new one
      tileIds.push(newTileId);
    });
    await speciesDoc.update({ tileIds });
  }
}
