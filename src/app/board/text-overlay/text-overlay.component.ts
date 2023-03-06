// Angular
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

// Rxjs
import { Observable, Subscription } from 'rxjs';

// States
import { Colors, GameQuery, StartStage } from 'src/app/games/_state';
import { AbilityService } from '../ability.service';
import { PlayService } from '../play.service';
import { Player, PlayerQuery, PlayerService } from '../players/_state';
import { GameAction, Species, SpeciesQuery } from '../species/_state';
import { Regions, TileQuery, TileService } from '../tiles/_state';

export type animation = {
  duration?: number;
  delay?: number;
  fadeInDelay?: number;
  fadeOutDelay?: number;
  from?: number;
  to?: number;
};

export type regionsAnimation = {
  rockies?: animation;
  forests?: animation;
  plains?: animation;
  swamps?: animation;
  mountains?: animation;
  islands?: animation;
};

interface PlayerRegionScoresAnimationVariables {
  [playerId: string]: regionsAnimation;
}

export type eraAnimation = {
  eraScore: animation;
  playerTotal: animation;
};

interface PlayerEraScoresAnimationVariables {
  [playerId: string]: eraAnimation;
}

@Component({
  selector: 'app-text-overlay',
  templateUrl: './text-overlay.component.html',
  styleUrls: ['./text-overlay.component.scss'],
})
export class TextOverlayComponent implements OnInit, OnDestroy {
  // Constants
  public regions = Regions;
  public players: Player[];
  public scoreToggle: boolean = true;
  public regionScoresAnimationVariables: {
    endEraTitle: animation;
    playerNamesTitle: animation;
    subTotalDuration?: number;
    regionDuration?: number;
    totalDuration?: number;
    playerVariables?: PlayerRegionScoresAnimationVariables[];
  };
  public eraScoresAnimationVariables: {
    firstScreenTransition?: animation;
    totalDuration?: number;
    playerVariables: PlayerEraScoresAnimationVariables[];
  };
  public victoryAnimationVariables: {
    isAnimationDone?: boolean;
    scoresContainer?: animation;
    victoryTitle?: animation;
    winnerTitle?: animation;
    winnerStars?: animation;
    victoryDetails?: animation;
  } = {};
  // Observables
  public isGameStarting$: Observable<boolean>;
  public isGameFinished$: Observable<boolean>;
  public startStage$: Observable<StartStage>;
  public isAnimationPlaying$: Observable<boolean>;
  public isPlayerWaiting$: Observable<boolean>;
  public isActivePlayerPlaying$: Observable<boolean>;
  public activePlayer$: Observable<Player>;
  public hasTileActive$: Observable<boolean>;
  public activeSpecies$: Observable<Species>;
  public winningPlayerSpecies$: Observable<Species[]>;
  // Subscriptions
  private animationSwitchSub: Subscription;

  constructor(
    private router: Router,
    private gameQuery: GameQuery,
    private tileQuery: TileQuery,
    private tileService: TileService,
    private speciesQuery: SpeciesQuery,
    private playerQuery: PlayerQuery,
    private playerService: PlayerService,
    private playService: PlayService,
    private abilityService: AbilityService
  ) {
    this.initAnimationVariables();
  }

  ngOnInit(): void {
    this.isGameStarting$ = this.gameQuery.isStarting$;
    this.isGameFinished$ = this.gameQuery.isGameFinished$;
    this.startStage$ = this.gameQuery.startStage$;
    this.hasTileActive$ = this.tileQuery.hasActive$;
    this.isPlayerWaiting$ =
      this.playerQuery.isActivePlayerWaitingForNextStartStage$;
    this.isActivePlayerPlaying$ = this.playerQuery.isActivePlayerPlaying$;
    this.activeSpecies$ = this.speciesQuery.selectActive();
    this.winningPlayerSpecies$ = this.playerQuery.winningPlayerSpecies$;
    this.isAnimationPlaying$ = this.playerQuery.isAnimationPlaying$;

    this.players = this.playerQuery.getAll();
    this.activePlayer$ = this.playerQuery.selectActive();

    this.animationSwitchSub = this.animSwitchSub;
  }

  private get animSwitchSub(): Subscription {
    const game = this.gameQuery.getActive();
    return this.activePlayer$.subscribe((player: Player) => {
      if (player.isAnimationPlaying) {
        if (player.animationState === 'endEraTitle') {
          setTimeout(
            () =>
              this.playerService.updateActivePlayerAnimationState(
                'playerNamesTitle'
              ),
            (this.regionScoresAnimationVariables.endEraTitle.duration +
              this.regionScoresAnimationVariables.endEraTitle.delay) *
              1000
          );
        }
        if (player.animationState === 'playerNamesTitle') {
          setTimeout(
            () =>
              this.playerService.updateActivePlayerAnimationState(
                'regionScore'
              ),
            (this.regionScoresAnimationVariables.playerNamesTitle.duration +
              this.regionScoresAnimationVariables.playerNamesTitle.delay) *
              1000
          );
        }
        if (player.animationState === 'regionScore') {
          setTimeout(
            () =>
              this.playerService.updateActivePlayerAnimationState('eraScore'),
            this.regionScoresAnimationVariables.totalDuration * 1000
          );
        }
        if (player.animationState === 'eraScore') {
          setTimeout(
            () =>
              game.isFinished
                ? this.playerService.updateActivePlayerAnimationState('victory')
                : this.playerService.updateisAnimationPlaying(false),
            this.eraScoresAnimationVariables.totalDuration * 1000
          );
        }
        if (player.animationState === 'victory') {
          setTimeout(
            () => this.playerService.updateisAnimationPlaying(false),
            (this.victoryAnimationVariables.victoryDetails.delay +
              this.victoryAnimationVariables.victoryDetails.duration +
              2) *
              1000
          );
        }
      }
    });
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

  public openSpeciesList(): void {
    this.playService.openSpeciesList();
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
    // Region score variables
    const regionAnimationDuration = 0.7;
    const subTotalDelay = regionAnimationDuration / 2;
    const firstTitlesDuration = 1.3;
    this.setRegionScoresAnimationVariables(
      firstTitlesDuration,
      regionAnimationDuration,
      subTotalDelay
    );

    // Era score variables
    const eraDuration = 1;
    const playerTotalDuration = 2;
    const fistDelay = 0.3;
    const endingAnimationDuration = 1;
    this.setEraScoresAniamtionVariables(
      eraDuration,
      playerTotalDuration,
      fistDelay,
      endingAnimationDuration
    );

    // Victory variables
    this.victoryAnimationVariables = {
      isAnimationDone: false,
    };

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
  }

  private setEraScoresAniamtionVariables(
    eraDuration: number,
    playerTotalDuration: number,
    fistDelay: number,
    endingAnimationDuration: number
  ) {
    const players = this.playerQuery.getAll();
    this.eraScoresAnimationVariables = {
      playerVariables: [],
      totalDuration: 100000,
    };
    let delayCount = fistDelay;

    for (const player of players) {
      // Initializes the variable.
      if (!this.eraScoresAnimationVariables.playerVariables[player.id])
        this.eraScoresAnimationVariables.playerVariables[player.id] = {};
      const playerTotalDelay = delayCount + eraDuration * 0.3;
      this.eraScoresAnimationVariables.playerVariables[player.id] = {
        eraScore: {
          duration: eraDuration,
          delay: delayCount,
        },
        playerTotal: {
          duration: playerTotalDuration,
          delay: playerTotalDelay,
          from: player.score - player.regionScores.totalEra,
          to: player.score,
        },
      };
      delayCount = playerTotalDelay + playerTotalDuration + 0.2;
    }

    this.eraScoresAnimationVariables.firstScreenTransition = {
      duration: endingAnimationDuration,
      delay: delayCount,
    };
    this.eraScoresAnimationVariables.totalDuration =
      delayCount + endingAnimationDuration;
  }

  private setRegionScoresAnimationVariables(
    firstTitlesDuration: number,
    regionDuration: number,
    regionSubTotalDelay: number
  ) {
    this.regionScoresAnimationVariables = {
      endEraTitle: {
        duration: firstTitlesDuration,
        delay: 0,
      },
      playerNamesTitle: {
        duration: firstTitlesDuration,
        delay: firstTitlesDuration,
      },
      subTotalDuration: regionDuration,
      regionDuration: regionDuration,
      playerVariables: [],
      totalDuration: 100000,
    };

    let delayCount = 0.2;
    const players = this.playerQuery.getAll();
    for (const player of players) {
      let regionScore = {
        from: 0,
        to: 0,
      };
      for (let region of Regions) {
        if (region.name !== 'blank') {
          regionScore.from = regionScore.to;
          regionScore.to = regionScore.to + player.regionScores[region.name];
          // Initializes the variable.
          if (!this.regionScoresAnimationVariables.playerVariables[player.id])
            this.regionScoresAnimationVariables.playerVariables[player.id] = {};
          // Adds a small delay between the region score poping in and its count into subtotal.
          this.regionScoresAnimationVariables.playerVariables[player.id][
            `${region.name}`
          ] = {
            delay: delayCount,
            from: regionScore.from,
            to: regionScore.to,
          };
          delayCount +=
            this.regionScoresAnimationVariables.regionDuration +
            regionSubTotalDelay;
        }
      }
    }
    this.regionScoresAnimationVariables.totalDuration =
      delayCount + this.regionScoresAnimationVariables.regionDuration;
  }

  ngOnDestroy() {
    this.animationSwitchSub.unsubscribe();
  }
}
