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
import {
  Ability,
  PRIMARY_NEUTRAL_COLOR,
  SECONDARY_NEUTRAL_COLOR,
} from '../../species/_state/species.model';

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
    return this.abilityChoices$.pipe(map((abilities) => abilities.length > 0));
  }

  public get abilityChoices$(): Observable<Ability[]> {
    return this.selectActive().pipe(
      map((player) => player.abilityChoice.abilityChoices)
    );
  }

  public get abilityChoices(): Ability[] {
    return this.getActive().abilityChoice.abilityChoices;
  }

  public get abilityChoiceActiveTileId(): number {
    return this.getActive().abilityChoice.activeTileId;
  }

  // Gets species' player colors
  public getPlayerSpeciesColors(
    playerId: string,
    color: 'primary' | 'secondary'
  ): string {
    if (playerId === 'neutral') return this.getNeutralSpeciesColors(color);

    const player = this.getEntity(playerId);

    if (color === 'primary') return player.primaryColor;

    if (color === 'secondary') return player.secondaryColor;
  }

  private getNeutralSpeciesColors(color: 'primary' | 'secondary'): string {
    if (color === 'primary') return PRIMARY_NEUTRAL_COLOR;
    if (color === 'secondary') return SECONDARY_NEUTRAL_COLOR;
  }
}
