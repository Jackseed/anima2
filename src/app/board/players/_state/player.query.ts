// Angular
import { Injectable } from '@angular/core';

// Akita
import { QueryEntity } from '@datorama/akita';

// States
import { PlayerStore, PlayerState } from './player.store';
import { GameQuery } from 'src/app/games/_state/game.query';

@Injectable({ providedIn: 'root' })
export class PlayerQuery extends QueryEntity<PlayerState> {
  constructor(protected store: PlayerStore, private gameQuery: GameQuery) {
    super(store);
  }

  // Checks if a player is active.
  public isActive(playerId: string): boolean {
    const activeGame = this.gameQuery.getActive();
    const activePlayerId = activeGame.activePlayerId;

    return playerId === activePlayerId;
  }
}
