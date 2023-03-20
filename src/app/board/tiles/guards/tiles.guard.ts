import { Injectable } from '@angular/core';
import { CollectionGuard, CollectionGuardConfig } from 'akita-ng-fire';
import { TileState, TileService } from '../_state';
import { GameQuery } from 'src/app/games/_state';
import { switchMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class TilesGuard extends CollectionGuard<TileState> {
  constructor(service: TileService, private gameQuery: GameQuery) {
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
