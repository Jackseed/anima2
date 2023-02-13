// Angular
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

// Rxjs
import { Observable, Subscription } from 'rxjs';

// States
import {
  Colors,
  GameQuery,
  GameService,
  StartStage,
} from 'src/app/games/_state';
import { AbilityService } from '../ability.service';
import { PlayService } from '../play.service';
import { Player, PlayerQuery } from '../players/_state';
import { GameAction, Species, SpeciesQuery } from '../species/_state';
import { Regions, TileQuery, TileService } from '../tiles/_state';

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
  public regions = Regions;
  // Static array with players' length to avoid calling multiple times the value.
  public fakePlayerArray = ['player1', 'player2'];
  public isGameStarting$: Observable<boolean>;
  public startStage$: Observable<StartStage>;
  public hasTileActive$: Observable<boolean>;
  public isPlayerWaiting$: Observable<boolean>;
  public isActivePlayerPlaying$: Observable<boolean>;
  public activeSpecies$: Observable<Species>;
  public isGameFinished$: Observable<boolean>;
  public winningPlayerSpecies$: Observable<Species[]>;
  public scoreToggle: boolean = true;
  public regionScoresAnimationVariables: {
    isAnimationDone?: boolean;
    rockies0?: animation;
    rockies1?: animation;
    swamps0?: animation;
    swamps1?: animation;
    plains0?: animation;
    plains1?: animation;
    forests0?: animation;
    forests1?: animation;
    mountains0?: animation;
    mountains1?: animation;
    islands0?: animation;
    islands1?: animation;
  } = {};
  public victoryAnimationVariables: {
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
    private gameService: GameService,
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

    // Avoids repeating the animation once is done.
    this.animationSub = this.isGameFinished$.subscribe(
      (isGameFinished: boolean) => {
        if (isGameFinished)
          setTimeout(
            () => this.toggleAnimationDone(),
            (this.victoryAnimationVariables.victoryDetails.delay +
              this.victoryAnimationVariables.victoryDetails.duration +
              2) *
              1000
          );
      }
    );
    this.countScores();
  }

  public get players(): Player[] {
    return this.playerQuery.getAll();
  }

  private async countScores() {
    await this.gameService.countScores();
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
    this.victoryAnimationVariables.isAnimationDone =
      !this.victoryAnimationVariables.isAnimationDone;
  }

  public initAnimationVariables() {
    this.victoryAnimationVariables = {
      isAnimationDone: false,
      // 1st victory screen.
      player1Score: {
        duration: 1,
        delay: 1,
      },
    };

    this.victoryAnimationVariables = {
      ...this.victoryAnimationVariables,
      player1TotalScore: {
        duration: 2,
        delay:
          this.victoryAnimationVariables.player1Score.delay +
          this.victoryAnimationVariables.player1Score.duration * 0.3,
      },
    };
    this.victoryAnimationVariables = {
      ...this.victoryAnimationVariables,
      player2Score: {
        duration: this.victoryAnimationVariables.player1Score.duration,
        delay:
          this.victoryAnimationVariables.player1TotalScore.delay +
          this.victoryAnimationVariables.player1TotalScore.duration +
          0.2,
      },
    };
    this.victoryAnimationVariables = {
      ...this.victoryAnimationVariables,
      player2TotalScore: {
        duration: 2,
        delay:
          this.victoryAnimationVariables.player2Score.delay +
          this.victoryAnimationVariables.player2Score.duration * 0.3,
      },
    };
    this.victoryAnimationVariables = {
      ...this.victoryAnimationVariables,
      firstScreenTransition: {
        duration: 1,
        delay:
          this.victoryAnimationVariables.player2TotalScore.delay +
          this.victoryAnimationVariables.player2TotalScore.duration +
          0.2,
      },
    };
    // 2nd victory screen.
    this.victoryAnimationVariables = {
      ...this.victoryAnimationVariables,
      victoryTitle: {
        duration: 1,
        delay: 0,
      },
    };
    this.victoryAnimationVariables = {
      ...this.victoryAnimationVariables,
      winnerTitle: {
        duration: 0.9,
        delay:
          this.victoryAnimationVariables.victoryTitle.delay +
          this.victoryAnimationVariables.victoryTitle.duration +
          0.8,
      },
    };

    this.victoryAnimationVariables = {
      ...this.victoryAnimationVariables,
      winnerStars: {
        delay: this.victoryAnimationVariables.winnerTitle.delay + 0.7,
      },
    };
    this.victoryAnimationVariables = {
      ...this.victoryAnimationVariables,
      victoryDetails: {
        duration: 1,
        delay: this.victoryAnimationVariables.winnerTitle.delay + 1,
      },
    };

    this.regionScoresAnimationVariables = {
      isAnimationDone: false,
      rockies0: {
        duration: 1,
        delay: 0,
      },
    };
    this.regionScoresAnimationVariables = {
      ...this.regionScoresAnimationVariables,
      rockies1: {
        duration: this.regionScoresAnimationVariables.rockies0.duration,
        delay:
          this.regionScoresAnimationVariables.rockies0.delay +
          this.regionScoresAnimationVariables.rockies0.duration,
      },
    };
    this.regionScoresAnimationVariables = {
      ...this.regionScoresAnimationVariables,
      forests0: {
        duration: this.regionScoresAnimationVariables.rockies0.duration,
        delay:
          this.regionScoresAnimationVariables.rockies1.delay +
          this.regionScoresAnimationVariables.rockies0.duration,
      },
    };
    this.regionScoresAnimationVariables = {
      ...this.regionScoresAnimationVariables,
      forests1: {
        duration: this.regionScoresAnimationVariables.rockies0.duration,
        delay:
          this.regionScoresAnimationVariables.forests0.delay +
          this.regionScoresAnimationVariables.rockies0.duration,
      },
    };
    this.regionScoresAnimationVariables = {
      ...this.regionScoresAnimationVariables,
      plains0: {
        duration: this.regionScoresAnimationVariables.rockies0.duration,
        delay:
          this.regionScoresAnimationVariables.forests1.delay +
          this.regionScoresAnimationVariables.rockies0.duration,
      },
    };
    this.regionScoresAnimationVariables = {
      ...this.regionScoresAnimationVariables,
      plains1: {
        duration: this.regionScoresAnimationVariables.rockies0.duration,
        delay:
          this.regionScoresAnimationVariables.plains0.delay +
          this.regionScoresAnimationVariables.rockies0.duration,
      },
    };
    this.regionScoresAnimationVariables = {
      ...this.regionScoresAnimationVariables,
      swamps0: {
        duration: this.regionScoresAnimationVariables.rockies0.duration,
        delay:
          this.regionScoresAnimationVariables.plains1.delay +
          this.regionScoresAnimationVariables.rockies0.duration,
      },
    };
    this.regionScoresAnimationVariables = {
      ...this.regionScoresAnimationVariables,
      swamps1: {
        duration: this.regionScoresAnimationVariables.rockies0.duration,
        delay:
          this.regionScoresAnimationVariables.swamps0.delay +
          this.regionScoresAnimationVariables.rockies0.duration,
      },
    };
    this.regionScoresAnimationVariables = {
      ...this.regionScoresAnimationVariables,
      mountains0: {
        duration: this.regionScoresAnimationVariables.rockies0.duration,
        delay:
          this.regionScoresAnimationVariables.swamps1.delay +
          this.regionScoresAnimationVariables.rockies0.duration,
      },
    };
    this.regionScoresAnimationVariables = {
      ...this.regionScoresAnimationVariables,
      mountains1: {
        duration: this.regionScoresAnimationVariables.rockies0.duration,
        delay:
          this.regionScoresAnimationVariables.mountains0.delay +
          this.regionScoresAnimationVariables.rockies0.duration,
      },
    };
    this.regionScoresAnimationVariables = {
      ...this.regionScoresAnimationVariables,
      islands0: {
        duration: this.regionScoresAnimationVariables.rockies0.duration,
        delay:
          this.regionScoresAnimationVariables.mountains1.delay +
          this.regionScoresAnimationVariables.rockies0.duration,
      },
    };
    this.regionScoresAnimationVariables = {
      ...this.regionScoresAnimationVariables,
      islands1: {
        duration: this.regionScoresAnimationVariables.rockies0.duration,
        delay:
          this.regionScoresAnimationVariables.islands0.delay +
          this.regionScoresAnimationVariables.rockies0.duration,
      },
    };
  }

  ngOnDestroy() {
    this.animationSub.unsubscribe();
  }
}
