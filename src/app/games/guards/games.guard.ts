import { Injectable } from '@angular/core';
import { GameService, GameState } from '../_state';
import { CollectionGuard } from 'akita-ng-fire';

@Injectable({ providedIn: 'root' })
// Sets all the games.
export class GameGuard extends CollectionGuard<GameState> {
  constructor(service: GameService) {
    super(service);
  }
}
