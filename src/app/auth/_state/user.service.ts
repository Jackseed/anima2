import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { UserStore, UserState } from './user.store';
import { first } from 'rxjs/operators';
import { Router } from '@angular/router';
import { createUser } from './user.model';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'users' })
export class UserService extends CollectionService<UserState> {
  constructor(
    store: UserStore,
    private afAuth: AngularFireAuth,
    private router: Router
  ) {
    super(store);
  }

  async anonymousLogin() {
    await this.afAuth.signInAnonymously();
    const user = await this.afAuth.authState.pipe(first()).toPromise();
    if (user) {
      this.setUser(user.uid);
    }
    this.router.navigate(['/home']);
  }

  private setUser(id: string) {
    const user = createUser({ id });
    this.db.collection(this.currentPath).doc(id).set(user);
  }
}
