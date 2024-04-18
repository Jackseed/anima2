import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { UserStore, UserState } from './user.store';
import { Router } from '@angular/router';
import { createUser } from './user.model';
import { AngularFirestore } from '@angular/fire/firestore';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'users' })
export class UserService extends CollectionService<UserState> {
  constructor(
    store: UserStore,
    private afAuth: AngularFireAuth,
    private afs: AngularFirestore,
    private router: Router
  ) {
    super(store);
  }

  async anonymousLogin(username: string) {
    const credential = await this.afAuth.signInAnonymously();
    this.setUser(credential.user.uid, username);
    return this.router.navigate(['/home']);
  }

  private setUser(id: string, name: string) {
    const user = createUser({ id, name });
    this.db.collection(this.currentPath).doc(id).set(user);
  }

  public logOut() {
    this.afAuth.signOut();
    this.router.navigate(['/welcome']);
  }
}
