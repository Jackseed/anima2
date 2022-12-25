// Angular
import { Component, HostListener, OnInit } from '@angular/core';

// Rxjs
import { Observable } from 'rxjs';

// States
import { Game, GameQuery } from 'src/app/games/_state';
import { AbilityService } from '../ability.service';
import { PlayService } from '../play.service';
import { GameAction } from '../species/_state';
import { TileService } from '../tiles/_state';

@Component({
  selector: 'app-text-overlay',
  templateUrl: './text-overlay.component.html',
  styleUrls: ['./text-overlay.component.scss'],
})
export class TextOverlayComponent implements OnInit {
  public game$: Observable<Game>;
  constructor(
    private gameQuery: GameQuery,
    private tileService: TileService,
    private playService: PlayService,
    private abilityService: AbilityService
  ) {}

  ngOnInit(): void {
    this.game$ = this.gameQuery.selectActive();
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
      if (game.startState === 'tileChoice') return;
      if (game.startState === 'tileSelected')
        return this.cancelStartTileChoice();
      this.tileService.removeActive();
      this.tileService.removeReachable();
      this.tileService.removeAttackable();
    }
  }
}
