import { Injectable } from '@angular/core';
import { CollectionGuard, CollectionGuardConfig } from 'akita-ng-fire';
import { PlayerService, PlayerState, PlayerStore } from '../_state';
import { tap, switchMap } from 'rxjs/operators';
import { GameQuery } from 'src/app/games/_state';

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class PlayerGuard extends CollectionGuard<PlayerState> {
  constructor(
    service: PlayerService,
    private store: PlayerStore,
    private gameQuery: GameQuery
  ) {
    super(service);
  }

  sync() {
    return this.gameQuery.selectActiveId().pipe(
      tap((_) => this.store.reset()),
      switchMap((gameId) => this.service.syncCollection({ params: { gameId } }))
    );
  }
}
