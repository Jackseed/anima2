import { Injectable } from '@angular/core';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { TileStore, TileState } from './tile.store';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'tiles' })
export class TileService extends CollectionService<TileState> {

  constructor(store: TileStore) {
    super(store);
  }

}
