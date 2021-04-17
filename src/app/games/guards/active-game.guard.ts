import { Injectable } from '@angular/core';
import { GameService, GameState } from '../_state';
import { CollectionGuard, CollectionGuardConfig } from 'akita-ng-fire';
import { ActivatedRouteSnapshot } from '@angular/router';

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class ActiveGameGuard extends CollectionGuard<GameState> {
  constructor(service: GameService) {
    super(service);
  }

  // Sync and set active
  sync(next: ActivatedRouteSnapshot) {
    return this.service.syncActive({ id: next.params.id });
  }
}
