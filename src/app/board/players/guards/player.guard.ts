// Angular
import { Injectable } from '@angular/core';

// Akita
import { CollectionGuard, CollectionGuardConfig } from 'akita-ng-fire';

// States
import { PlayerService, PlayerState } from '../_state';
import { GameQuery } from 'src/app/games/_state';

// Rxjs
import { switchMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class PlayerGuard extends CollectionGuard<PlayerState> {
  constructor(service: PlayerService, private gameQuery: GameQuery) {
    super(service);
  }

  sync() {
    return this.gameQuery
      .selectActiveId()
      .pipe(
        switchMap((gameId) =>
          this.service.syncCollection({ params: { gameId } })
        )
      );
  }
}
