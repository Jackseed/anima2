import { Injectable } from '@angular/core';
import { GameService, GameState, GameStore } from '../_state';
import { CollectionGuard, CollectionGuardConfig } from 'akita-ng-fire';
import { ActivatedRouteSnapshot } from '@angular/router';

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class ActiveGameGuard extends CollectionGuard<GameState> {
  constructor(service: GameService, private store: GameStore) {
    super(service);
  }

  // Syncs and sets active both stores.
  sync(next: ActivatedRouteSnapshot) {
    const id = next.params.id;
    this.store.setDefaultUIStoreAndActivate(id);
    return this.service.syncActive({ id });
  }
}
