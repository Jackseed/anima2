import { Injectable } from '@angular/core';
import {
  AngularFirestore,
  AngularFirestoreDocument,
} from '@angular/fire/firestore';
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { Species } from './species.model';
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

  public setActive(id: string) {
    this.store.setActive(id);
  }

  public removeActive(id: string) {
    this.store.removeActive(id);
  }

  public async addUnits(id: string, newTileIds: number[]) {
    const speciesDoc: AngularFirestoreDocument<Species> = this.afs.doc<Species>(
      `games/${this.routerQuery.getParams().id}/species/${id}`
    );
    let tileIds = (await speciesDoc.get().toPromise()).data().tileIds;
    newTileIds.forEach((tileId) => tileIds.push(tileId));
    await speciesDoc.update({ tileIds });
  }
}
