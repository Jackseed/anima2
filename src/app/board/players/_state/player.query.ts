import { Injectable } from '@angular/core';
import { QueryEntity } from '@datorama/akita';
import { PlayerStore, PlayerState } from './player.store';

@Injectable({ providedIn: 'root' })
export class PlayerQuery extends QueryEntity<PlayerState> {

  constructor(protected store: PlayerStore) {
    super(store);
  }

}
