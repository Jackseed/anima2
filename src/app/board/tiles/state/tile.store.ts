import { Injectable } from '@angular/core';
import { EntityState, EntityStore, StoreConfig, ActiveState } from '@datorama/akita';
import { Tile } from './tile.model';

export interface TileState extends EntityState<Tile, string>, ActiveState<string> {}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'tile' })
export class TileStore extends EntityStore<TileState> {

  constructor() {
    super();
  }

}
