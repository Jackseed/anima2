import { Injectable } from '@angular/core';
import { CollectionGuard, CollectionGuardConfig } from 'akita-ng-fire';
import { SpeciesState, SpeciesService, SpeciesStore } from '../_state';
import { GameQuery } from 'src/app/games/_state';
import { tap, switchMap } from 'rxjs/operators';

@Injectable({providedIn: 'root'})
@CollectionGuardConfig({ awaitSync: true })
export class SpeciesGuard extends CollectionGuard<SpeciesState> {

  constructor(
    service: SpeciesService,
    private store: SpeciesStore,
    private gameQuery: GameQuery,
  ) {
    super(service);
  }

  sync() {
    return this.gameQuery.selectActiveId().pipe(
      tap(_ => this.store.reset()),
      switchMap(gameId => this.service.syncCollection({ params: { gameId }}))
    );
  }

}
