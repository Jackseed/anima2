// Angular
import { Component, OnDestroy, OnInit } from '@angular/core';

// Material
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

// Rxjs
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

// States
import { UserQuery } from 'src/app/auth/_state';
import { PlayService } from '../play.service';
import { PlayerQuery } from '../players/_state';
import { Species, SpeciesQuery } from '../species/_state';
import { Tile, TileQuery, TileService } from '../tiles/_state';
import { AbilityService } from '../ability.service';
import { GameQuery } from 'src/app/games/_state';

@Component({
  selector: 'app-board-view',
  templateUrl: './board-view.component.html',
  styleUrls: ['./board-view.component.scss'],
})
export class BoardViewComponent implements OnInit, OnDestroy {
  // Variables
  public playingPlayerId: string;

  // Observables
  public tiles$: Observable<Tile[]>;
  public species$: Observable<Species[]>;
  public hasActiveAbility$: Observable<boolean>;
  public activeAbilityNumber$: Observable<number>;
  public isAnimationPlaying$: Observable<boolean>;

  // Subscriptions
  private activeSpeciesSub: Subscription;
  private startGameSub: Subscription;
  private isPlayerChoosingAbilitySub: Subscription;
  private switchToNextStartStateSub: Subscription;

  constructor(
    private userQuery: UserQuery,
    private gameQuery: GameQuery,
    private tileQuery: TileQuery,
    private tileService: TileService,
    private speciesQuery: SpeciesQuery,
    private playerQuery: PlayerQuery,
    private playService: PlayService,
    private abilityService: AbilityService,
    private snackbar: MatSnackBar,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.playingPlayerId = this.userQuery.getActiveId();

    // Observables init
    this.tiles$ = this.tileQuery
      .selectAll()
      .pipe(map((tiles) => tiles.sort((a, b) => a.id - b.id)));
    this.hasActiveAbility$ = this.speciesQuery.hasActiveSpeciesActiveAbility$;
    this.activeAbilityNumber$ =
      this.speciesQuery.activeSpeciesActiveAbilitiesNumber$;
    this.isAnimationPlaying$ = this.playerQuery.isAnimationPlaying$;

    // Subscriptions init
    this.switchToNextStartStateSub =
      this.playService.switchToNextStartStageWhenPlayersReadySub;
    this.activeSpeciesSub = this.playService.setActiveSpeciesSub;
    this.startGameSub = this.playService.reApplyTileChoiceStateSub;
    this.isPlayerChoosingAbilitySub =
      this.playService.getPlayerChoosingAbilitySub;
  }

  // PLAY - Master function
  // Chooses click action when clicking on a tile.
  public async play(tileId: number) {
    // Dismisses clicks on finished games.
    if (this.gameQuery.getActive().isFinished) return;

    // Dismisses clicks on blank tiles.
    if (this.tileQuery.isBlank(tileId)) return;

    // Game start: selects the starting tile.
    if (this.playService.isSelectingStartingTile(tileId))
      return this.playService.selectStartTile(tileId);

    // Dismisses clicks during other player turn.
    if (!this.playerQuery.isPlayerPlaying(this.playingPlayerId))
      return this.snackbar.open("Ce n'est pas votre tour.", null, {
        duration: 3000,
      });

    // Migration
    if (this.abilityService.isMigrationValid(tileId))
      return await this.abilityService.migrateTo(tileId);

    // Assimilation
    if (this.abilityService.isAssimilationValid(tileId))
      return this.playService.setupAssimilation(tileId);

    // Proliferation
    if (this.abilityService.isProliferationValid(tileId))
      return this.abilityService.proliferate(tileId);

    // Rallying
    if (this.abilityService.isRallyingValid(tileId))
      return this.abilityService.rallying(tileId);

    // Dismisses clicks on empty tiles.
    if (this.tileQuery.isEmpty(tileId)) return;

    // Tile selection
    if (
      this.playService.isSelectionValid(tileId) &&
      !this.playerQuery.isActivePlayerWaitingForNextStartStage
    )
      return this.tileService.selectTile(tileId);

    // Otherwise, opens species menu.
    this.playService.openSpeciesList(tileId);
  }

  public isActive(tileId: number) {
    return this.tileQuery.isActive(tileId);
  }

  ngOnDestroy() {
    this.switchToNextStartStateSub.unsubscribe();
    this.activeSpeciesSub.unsubscribe();
    this.startGameSub.unsubscribe();
    this.isPlayerChoosingAbilitySub.unsubscribe();
  }
}
