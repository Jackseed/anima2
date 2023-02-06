// Angular
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

// Rxjs
import { Observable, Subscription } from 'rxjs';

// States
import { Colors, GameQuery, StartStage } from 'src/app/games/_state';
import { AbilityService } from '../ability.service';
import { PlayService } from '../play.service';
import { PlayerQuery } from '../players/_state';
import { GameAction, Species, SpeciesQuery } from '../species/_state';
import { TileQuery, TileService } from '../tiles/_state';

export type animation = {
  duration?: number;
  delay?: number;
};

@Component({
  selector: 'app-text-overlay',
  templateUrl: './text-overlay.component.html',
  styleUrls: ['./text-overlay.component.scss'],
})
export class TextOverlayComponent implements OnInit, OnDestroy {
  public isGameStarting$: Observable<boolean>;
  public startStage$: Observable<StartStage>;
  public hasTileActive$: Observable<boolean>;
  public isPlayerWaiting$: Observable<boolean>;
  public isActivePlayerPlaying$: Observable<boolean>;
  public activeSpecies$: Observable<Species>;
  public isGameFinished$: Observable<boolean>;
  public winningPlayerSpecies$: Observable<Species[]>;
  public scoreToggle: boolean = true;
  public animationVariables: {
    isAnimationDone?: boolean;
    player1Score?: animation;
    player1TotalScore?: animation;
    player2Score?: animation;
    player2TotalScore?: animation;
    firstScreenTransition?: animation;
    scoresContainer?: animation;
    victoryTitle?: animation;
    winnerTitle?: animation;
    winnerStars?: animation;
    victoryDetails?: animation;
  } = {};
  private animationSub: Subscription;

  constructor(
    private router: Router,
    private gameQuery: GameQuery,
    private tileQuery: TileQuery,
    private tileService: TileService,
    private speciesQuery: SpeciesQuery,
    private playerQuery: PlayerQuery,
    private playService: PlayService,
    private abilityService: AbilityService
  ) {
    this.initAnimationVariables();
  }

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

    this.animationSub = this.isGameFinished$.subscribe(
      (isGameFinished: boolean) => {
        if (isGameFinished)
          setTimeout(
            () => this.toggleAnimationDone(),
            (this.animationVariables.victoryDetails.delay +
              this.animationVariables.victoryDetails.duration +
              2) *
              1000
          );
      }
    );
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

  public toggleAnimationDone(): void {
    this.animationVariables.isAnimationDone =
      !this.animationVariables.isAnimationDone;
  }

  public initAnimationVariables() {
    this.animationVariables = {
      isAnimationDone: false,
      // 1st victory screen.
      player1Score: {
        duration: 1,
        delay: 1,
      },
    };

    this.animationVariables = {
      ...this.animationVariables,
      player1TotalScore: {
        duration: 2,
        delay:
          this.animationVariables.player1Score.delay +
          this.animationVariables.player1Score.duration * 0.3,
      },
    };
    this.animationVariables = {
      ...this.animationVariables,
      player2Score: {
        duration: this.animationVariables.player1Score.duration,
        delay:
          this.animationVariables.player1TotalScore.delay +
          this.animationVariables.player1TotalScore.duration +
          0.2,
      },
    };
    this.animationVariables = {
      ...this.animationVariables,
      player2TotalScore: {
        duration: 2,
        delay:
          this.animationVariables.player2Score.delay +
          this.animationVariables.player2Score.duration * 0.3,
      },
    };
    this.animationVariables = {
      ...this.animationVariables,
      firstScreenTransition: {
        duration: 1,
        delay:
          this.animationVariables.player2TotalScore.delay +
          this.animationVariables.player2TotalScore.duration +
          0.2,
      },
    };
    // 2nd victory screen.
    this.animationVariables = {
      ...this.animationVariables,
      victoryTitle: {
        duration: 1,
        delay: 0,
      },
    };
    this.animationVariables = {
      ...this.animationVariables,
      winnerTitle: {
        duration: 0.9,
        delay:
          this.animationVariables.victoryTitle.delay +
          this.animationVariables.victoryTitle.duration +
          0.8,
      },
    };

    this.animationVariables = {
      ...this.animationVariables,
      winnerStars: {
        delay: this.animationVariables.winnerTitle.delay + 0.7,
      },
    };
    this.animationVariables = {
      ...this.animationVariables,
      victoryDetails: {
        duration: 1,
        delay: this.animationVariables.winnerTitle.delay + 1,
      },
    };
  }

  ngOnDestroy() {
    this.animationSub.unsubscribe();
  }
}
