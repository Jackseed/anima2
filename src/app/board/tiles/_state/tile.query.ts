import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { TileStore, TileState } from './tile.store';

@Injectable({ providedIn: 'root' })
export class TileQuery extends QueryEntity<TileState> {

  constructor(protected store: TileStore) {
    super(store);
  }

}
