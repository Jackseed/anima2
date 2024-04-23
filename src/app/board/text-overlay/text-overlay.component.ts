// Angular
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

// Rxjs
import { combineLatest, Observable, Subscription } from 'rxjs';
import { filter, first, map, tap } from 'rxjs/operators';

// States
import {
  Colors,
  Game,
  GameQuery,
  GameService,
  StartStage,
  RED_FIRST_PRIMARY_COLOR,
  GREEN_FIRST_PRIMARY_COLOR,
} from 'src/app/games/_state';
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
  public players: Player[] = this.playerQuery.getAll();
  public scoreToggle: boolean = true;
  public red = RED_FIRST_PRIMARY_COLOR;
  public green = GREEN_FIRST_PRIMARY_COLOR;

  // Region score variables
  public regionAnimationDuration = 0.5;
  public subTotalDelay = this.regionAnimationDuration / 2;
  public firstTitlesDuration = 1.3;
  public regionScoresAnimationVariables: {
    endEraTitle: animation;
    playerNamesTitle: animation;
    subTotalDuration?: number;
    regionDuration?: number;
    totalDuration?: number;
    playerVariables?: PlayerRegionScoresAnimationVariables[];
  };
  public newEraDuration = 2;
  public newSpeciesDuration = 2;
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
  public isGameStarting$: Observable<boolean> = this.gameQuery.isStarting$;
  public isGameFinished$: Observable<boolean> = this.gameQuery.isGameFinished$;
  public startStage$: Observable<StartStage> = this.gameQuery.startStage$;
  public isAnimationPlaying$: Observable<boolean> =
    this.playerQuery.isAnimationPlaying$;
  public players$: Observable<Player[]> = this.playerQuery.selectAll();
  public playersWithSpecies$: Observable<Player[]> =
    this.playerQuery.allPlayersSuperchargedWithSpecies();
  public player1$: Observable<Player> = this.playersWithSpecies$.pipe(
    map((players) => players[0])
  );
  public player2$: Observable<Player> = this.playersWithSpecies$.pipe(
    map((players) => players[1])
  );
  public isPlayerWaiting$: Observable<boolean> =
    this.playerQuery.isActivePlayerWaitingForNextStartStage$;
  public isActivePlayerPlaying$: Observable<boolean> =
    this.playerQuery.isActivePlayerPlaying$;
  public activePlayer$: Observable<Player> =
    this.playerQuery.activePlayerSuperchargedWithSpecies$;
  public hasTileActive$: Observable<boolean> = this.tileQuery.hasActive$;
  public activeSpecies$: Observable<Species> = this.speciesQuery.selectActive();
  public winningPlayerSpecies$: Observable<Species[]> =
    this.playerQuery.winningPlayerSpecies$;
  public winner$: Observable<Player> = this.playerQuery.winner$;
  public loser$: Observable<Player> = this.playerQuery.loser$;
  public game$: Observable<Game> = this.gameQuery.selectActive();

  // Subscriptions
  private animationSwitchSub: Subscription = this.animSwitchSub;
  private newSpeciesSub: Subscription;

  constructor(
    private router: Router,
    private gameQuery: GameQuery,
    private gameService: GameService,
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

  ngOnInit(): void {}

  private get animSwitchSub(): Subscription {
    const game$ = this.gameQuery.selectActive();
    return combineLatest([this.activePlayer$, game$]).subscribe(
      ([player, game]) => {
        if (player.isAnimationPlaying) {
          this.handleAnimationState(player, game);
        }
      }
    );
  }

  private handleAnimationState(player: Player, game: Game) {
    const animationStateActions = {
      endEraTitle: {
        action: () => {
          this.playerService.updateActivePlayerAnimationState(
            'playerNamesTitle'
          );
          this.setRegionScoresAnimationVariables(
            this.firstTitlesDuration,
            this.regionAnimationDuration,
            this.subTotalDelay
          );
        },
        delay:
          (this.regionScoresAnimationVariables.endEraTitle.duration +
            this.regionScoresAnimationVariables.endEraTitle.delay) *
          1000,
      },
      playerNamesTitle: {
        action: () =>
          this.playerService.updateActivePlayerAnimationState('regionScore'),
        delay:
          (this.regionScoresAnimationVariables.playerNamesTitle.duration +
            this.regionScoresAnimationVariables.playerNamesTitle.delay) *
          1000,
      },
      regionScore: {
        action: () =>
          this.playerService.updateActivePlayerAnimationState('eraScore'),
        delay: this.regionScoresAnimationVariables.totalDuration * 1000,
      },
      eraScore: {
        action: () =>
          game.isFinished
            ? this.playerService.updateActivePlayerAnimationState('victory')
            : this.playerService.updateActivePlayerAnimationState('newEra'),
        delay: this.eraScoresAnimationVariables.totalDuration * 1000,
      },
      newEra: {
        action: () =>
          player.speciesIds.length == 1
            ? this.playerService.updateActivePlayerAnimationState('newSpecies')
            : this.playerService.updateisAnimationPlaying(false),
        delay: this.newEraDuration * 1000,
      },
      newSpecies: {
        action: () => {
          if (!this.newSpeciesSub) {
            this.newSpeciesSub = this.isActivePlayerPlaying$
              .pipe(
                filter((isActivePlayerPlaying) => isActivePlayerPlaying),
                tap(() => {
                  if (
                    this.playerQuery.activePlayerAnimationState === 'newSpecies'
                  )
                    this.gameService.prepareSecondSpecies();
                }),
                first()
              )
              .subscribe();
          }
          this.playerService.updateisAnimationPlaying(false);
          this.playerService.updateActivePlayerAnimationState('endEraTitle');
        },
        delay: this.newSpeciesDuration * 1000,
      },
      victory: {
        action: () => this.playerService.updateisAnimationPlaying(false),
        delay:
          (this.victoryAnimationVariables.victoryDetails.delay +
            this.victoryAnimationVariables.victoryDetails.duration +
            2) *
          1000,
      },
    };

    const animationState = animationStateActions[player.animationState];
    if (animationState) {
      setTimeout(animationState.action, animationState.delay);
    }
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
    this.setRegionScoresAnimationVariables(
      this.firstTitlesDuration,
      this.regionAnimationDuration,
      this.subTotalDelay
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

    // Base delay value
    const baseDelay = 0.8;

    // Victory variables
    const victoryTitleDuration = 1;
    const winnerTitleDuration = 0.9;
    const victoryDetailsDuration = 1;

    this.victoryAnimationVariables = {
      isAnimationDone: false,
      victoryTitle: {
        duration: victoryTitleDuration,
        delay: 0,
      },
      winnerTitle: {
        duration: winnerTitleDuration,
        delay: victoryTitleDuration + baseDelay,
      },
      winnerStars: {
        delay: victoryTitleDuration + winnerTitleDuration + baseDelay + 0.7,
      },
      victoryDetails: {
        duration: victoryDetailsDuration,
        delay: victoryTitleDuration + winnerTitleDuration + baseDelay + 1,
      },
    };
  }

  private setEraScoresAniamtionVariables(
    eraDuration: number,
    playerTotalDuration: number,
    firstDelay: number,
    endingAnimationDuration: number
  ) {
    const players = this.playerQuery.getAll();
    this.eraScoresAnimationVariables = {
      playerVariables: [],
      totalDuration: 100000,
    };
    let delayCount = firstDelay;

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
    if (this.newSpeciesSub) this.newSpeciesSub.unsubscribe();
  }
}
