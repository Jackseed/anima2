// Angular
import { Injectable } from '@angular/core';
// AngularFire
import { AngularFireAuth } from '@angular/fire/auth';
// Akita
import { CollectionGuard, CollectionGuardConfig } from 'akita-ng-fire';
// Rxjs
import { switchMap, tap } from 'rxjs/operators';
// States
import { PlayerService, PlayerState } from '../_state';

@Injectable({
  providedIn: 'root',
})
@CollectionGuardConfig({ awaitSync: true })
export class ActivePlayerGuard extends CollectionGuard<PlayerState> {
  constructor(
    service: PlayerService,
    private afAuth: AngularFireAuth,
    private playerService: PlayerService
  ) {
    super(service);
  }

  // Sync and set active
  sync() {
    return this.afAuth.user.pipe(
      tap((user) => this.playerService.setActive(user.uid)),
      switchMap((_) => this.service.syncCollection())
    );
  }
}
