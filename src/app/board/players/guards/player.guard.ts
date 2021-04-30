import { Injectable } from '@angular/core';
import { CollectionGuard, CollectionGuardConfig } from 'akita-ng-fire';
import { PlayerService, PlayerState, PlayerStore } from '../_state';
import { tap, switchMap } from 'rxjs/operators';
import { UserQuery } from 'src/app/auth/_state';
import { GameQuery } from 'src/app/games/_state';

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class PlayerGuard extends CollectionGuard<PlayerState> {
  constructor(
    service: PlayerService,
    private userQuery: UserQuery,
    private store: PlayerStore,
    private gameQuery: GameQuery
  ) {
    super(service);
  }

  sync() {
    return this.gameQuery.selectActiveId().pipe(
      tap((_) => this.store.reset()),
      tap((_) => this.store.setActive(this.userQuery.getActiveId())),
      switchMap((gameId) => this.service.syncCollection({ params: { gameId } }))
    );
  }
}
