// Angular
import { Component, HostListener, OnInit } from '@angular/core';

// Rxjs
import { Observable } from 'rxjs';

// States
import { GameQuery, StartStage } from 'src/app/games/_state';
import { AbilityService } from '../ability.service';
import { PlayService } from '../play.service';
import { PlayerQuery } from '../players/_state';
import { GameAction } from '../species/_state';
import { TileQuery, TileService } from '../tiles/_state';

@Component({
  selector: 'app-text-overlay',
  templateUrl: './text-overlay.component.html',
  styleUrls: ['./text-overlay.component.scss'],
})
export class TextOverlayComponent implements OnInit {
  public startStage$: Observable<StartStage>;
  public hasTileActive$: Observable<boolean>;
  public isPlayerWaiting$: Observable<boolean>;
  constructor(
    private gameQuery: GameQuery,
    private tileQuery: TileQuery,
    private tileService: TileService,
    private playerQuery: PlayerQuery,
    private playService: PlayService,
    private abilityService: AbilityService
  ) {}

  ngOnInit(): void {
    this.startStage$ = this.gameQuery.startStage$;
    this.hasTileActive$ = this.tileQuery.hasActive$;
    this.isPlayerWaiting$ =
      this.playerQuery.isActivePlayerWaitingForNextStartStage$;
  }

  public validateStartTile() {
    this.playService.validateStartTile();
  }

  public cancelStartTileChoice() {
    this.playService.setStartTileChoice();
  }

  public isActionActive$(action: GameAction): Observable<boolean> {
    return this.abilityService.isActionOngoing$(action);
  }

  // Cancels tile focus when using "esc" on keyboard.
  @HostListener('document:keydown', ['$event']) onKeydownHandler(
    event: KeyboardEvent
  ) {
    if (event.key === 'Escape') {
      const game = this.gameQuery.getActive();
      if (game.startStage === 'tileChoice') return;
      this.tileService.removeActive();
      this.tileService.removeReachable();
      this.tileService.removeAttackable();
    }
  }
}
