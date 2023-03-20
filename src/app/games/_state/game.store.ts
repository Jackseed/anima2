import { Injectable } from '@angular/core';
import {
  EntityState,
  EntityStore,
  StoreConfig,
  ActiveState,
  EntityUIStore,
} from '@datorama/akita';
import { Game } from './game.model';

export type GameUI = {
  id: string;
  isAdaptationMenuOpen: boolean;
};

export interface GameState
  extends EntityState<Game, string>,
    ActiveState<string> {}
export interface GameUIState extends EntityState<GameUI> {}

@Injectable({ providedIn: 'root' })
@StoreConfig({ name: 'game' })
export class GameStore extends EntityStore<GameState> {
  ui: EntityUIStore<GameUIState>;
  constructor() {
    super();
    const defaults = (entity) => ({ isAdaptationMenuOpen: false });
    this.createUIStore().setInitialEntityState(defaults);
  }

  public setDefaultUIStoreAndActivate(storeId: string) {
    this.ui.set([
      {
        id: storeId,
        isAdaptationMenuOpen: false,
      },
    ]);
    this.ui.setActive(storeId);
  }
}
