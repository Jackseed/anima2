// Angular
import { Injectable } from '@angular/core';

// Akita
import { QueryEntity } from '@datorama/akita';

// Rxjs
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

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

  public get areAbilityChoicesSet$(): Observable<boolean> {
    return this.selectActive().pipe(
      map((player) => player.abilityChoices),
      map((abilities) => abilities.length > 0)
    );
  }

  public get abilityChoices$() {
    return this.selectActive().pipe(map((player) => player.abilityChoices));
  }

  public get abilityChoices() {
    return this.getActive().abilityChoices;
  }
}
