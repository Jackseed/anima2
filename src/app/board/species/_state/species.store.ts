import { Injectable } from '@angular/core';
import { EntityState, EntityStore, StoreConfig, ActiveState } from '@datorama/akita';
import { Species } from './species.model';

export interface SpeciesState extends EntityState<Species, string>, ActiveState<string> {}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'species' })
export class SpeciesStore extends EntityStore<SpeciesState> {

  constructor() {
    super();
  }

}
