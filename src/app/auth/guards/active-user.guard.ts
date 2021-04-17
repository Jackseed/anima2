import { Injectable } from '@angular/core';
import { UserState, UserService, UserStore } from '../_state';
import { AngularFireAuth } from '@angular/fire/auth';
import { CollectionGuardConfig, CollectionGuard } from 'akita-ng-fire';
import { switchMap, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
@CollectionGuardConfig({ awaitSync: true })
export class ActiveUserGuard extends CollectionGuard<UserState> {
  constructor(
    service: UserService,
    private store: UserStore,
    private afAuth: AngularFireAuth
  ) {
    super(service);
  }

  sync() {
    return this.afAuth.user.pipe(
      tap((user) => this.store.setActive(user.uid)),
      switchMap((_) => this.service.syncCollection())
    );
  }
}
