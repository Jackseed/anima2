import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { SpeciesStore, SpeciesState } from './species.store';

@Injectable({ providedIn: 'root' })
export class SpeciesQuery extends QueryEntity<SpeciesState> {

  constructor(protected store: SpeciesStore) {
    super(store);
  }

}
