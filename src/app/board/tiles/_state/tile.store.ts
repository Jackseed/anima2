import { Injectable } from '@angular/core';
import {
  EntityState,
  EntityStore,
  StoreConfig,
  ActiveState,
  EntityUIStore,
} from '@datorama/akita';
import { Tile } from './tile.model';

export type TileUI = {
  range: number;
};

export interface TileState
  extends EntityState<Tile, string>,
    ActiveState<string> {}
export interface TileUIState extends EntityState<TileUI> {}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'tile' })
export class TileStore extends EntityStore<TileState> {
  ui: EntityUIStore<TileUIState>;
  constructor() {
    super();
    const defaults = { range: null };
    this.createUIStore().setInitialEntityState(defaults);
  }
}
