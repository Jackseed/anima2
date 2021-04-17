import { Injectable } from '@angular/core';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { UserStore, UserState } from './user.store';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'users' })
export class UserService extends CollectionService<UserState> {

  constructor(store: UserStore) {
    super(store);
  }

}
