// Angular
import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';

// Rxjs
import { Observable } from 'rxjs';

// States
import { Colors, GameQuery, StartStage } from 'src/app/games/_state';
import { AbilityService } from '../ability.service';
import { PlayService } from '../play.service';
import { PlayerQuery } from '../players/_state';
import { GameAction, Species, SpeciesQuery } from '../species/_state';
import { TileQuery, TileService } from '../tiles/_state';

@Component({
  selector: 'app-text-overlay',
  templateUrl: './text-overlay.component.html',
  styleUrls: ['./text-overlay.component.scss'],
})
export class TextOverlayComponent implements OnInit {
  public isGameStarting$: Observable<boolean>;
  public startStage$: Observable<StartStage>;
  public hasTileActive$: Observable<boolean>;
  public isPlayerWaiting$: Observable<boolean>;
  public isActivePlayerPlaying$: Observable<boolean>;
  public activeSpecies$: Observable<Species>;
  public isGameFinished$: Observable<boolean>;
  public winningPlayerSpecies$: Observable<Species[]>;
  public scoreToggle: boolean = false;

  constructor(
    private router: Router,
    private gameQuery: GameQuery,
    private tileQuery: TileQuery,
    private tileService: TileService,
    private speciesQuery: SpeciesQuery,
    private playerQuery: PlayerQuery,
    private playService: PlayService,
    private abilityService: AbilityService
  ) {}

  ngOnInit(): void {
    this.isGameStarting$ = this.gameQuery.isStarting$;
    this.startStage$ = this.gameQuery.startStage$;
    this.hasTileActive$ = this.tileQuery.hasActive$;
    this.isPlayerWaiting$ =
      this.playerQuery.isActivePlayerWaitingForNextStartStage$;
    this.isActivePlayerPlaying$ = this.playerQuery.isActivePlayerPlaying$;
    this.activeSpecies$ = this.speciesQuery.selectActive();
    this.isGameFinished$ = this.gameQuery.isGameFinished$;
    this.winningPlayerSpecies$ = this.playerQuery.winningPlayerSpecies$;
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

  public getActivePlayerColors(): Colors {
    const activePlayerId = this.playerQuery.getActiveId();
    return this.playerQuery.getPlayerColors(activePlayerId);
  }

  public getOpponentColors(): Colors {
    const activePlayerId = this.playerQuery.getActiveId();
    const opponentId = this.playerQuery.getPlayerOpponentId(activePlayerId);
    return this.playerQuery.getPlayerColors(opponentId);
  }

  public getOpponentSpecies(): Species {
    return this.playerQuery.opponentMainSpecies;
  }

  public toggleScoreToggle() {
    this.scoreToggle = !this.scoreToggle;
  }

  public leave() {
    this.router.navigate(['/home']);
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
