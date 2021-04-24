import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreDocument,
} from '@angular/fire/firestore';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { neutrals, Species } from './species.model';
import { SpeciesStore, SpeciesState } from './species.store';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'games/:gameId/species' })
export class SpeciesService extends CollectionService<SpeciesState> {
  constructor(
    store: SpeciesStore,
    private routerQuery: RouterQuery,
    private afs: AngularFirestore
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

  public async addSpecies(species: Species, gameId?: string) {
    const gId = gameId ? gameId : this.routerQuery.getParams().id;
    const speciesDoc: AngularFirestoreDocument<Species> = this.afs.doc<Species>(
      `games/${gId}/species/${species.id}`
    );
    await speciesDoc.set(species);
  }

  public async proliferate(id: string, newTileIds: number[]) {
    const speciesDoc: AngularFirestoreDocument<Species> = this.afs.doc<Species>(
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
    const speciesDoc: AngularFirestoreDocument<Species> = this.afs.doc<Species>(
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
