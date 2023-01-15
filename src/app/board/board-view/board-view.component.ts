// Angular
import { Component, OnDestroy, OnInit } from '@angular/core';

// Material
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

// Rxjs
import { Observable, Subscription } from 'rxjs';
import { filter, map, pluck, tap } from 'rxjs/operators';

// States
import { UserQuery } from 'src/app/auth/_state';
import { GameQuery, GameService } from 'src/app/games/_state';
import { PlayService } from '../play.service';
import { PlayerQuery } from '../players/_state';
import { Species, SpeciesQuery, SpeciesService } from '../species/_state';
import { Tile, TileQuery, TileService } from '../tiles/_state';
import { AbilityService } from '../ability.service';

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

  // Subscriptions
  private activeSpeciesSub: Subscription;
  private startGameSub: Subscription;
  private isPlayerChoosingAbilitySub: Subscription;
  private switchToNextStartStateSub: Subscription;

  constructor(
    private gameQuery: GameQuery,
    private gameService: GameService,
    private userQuery: UserQuery,
    private playerQuery: PlayerQuery,
    private tileQuery: TileQuery,
    private tileService: TileService,
    private speciesQuery: SpeciesQuery,
    private speciesService: SpeciesService,
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

    // Subscriptions init
    this.switchToNextStartStateSub =
      this.playService.switchToNextStartStageWhenPlayersReadySub;
    this.activeSpeciesSub = this.getActiveSpeciesSub();
    this.startGameSub = this.playService.reApplyTileChoiceStateSub();
    this.isPlayerChoosingAbilitySub = this.getPlayerChoosingAbilitySub();
  }

  // TODO: rework subscriptions
  // set active first species from active player
  private getActiveSpeciesSub(): Subscription {
    return this.playerQuery
      .selectActive()
      .pipe(
        filter((player) => !!player),
        pluck('speciesIds'),
        tap((ids) => this.speciesService.setActive(ids[0]))
      )
      .subscribe();
  }

  // Checks whether active player is choosing an ability
  // If so, loads the adaptation menu (in case of reloading)
  private getPlayerChoosingAbilitySub(): Subscription {
    return this.playerQuery
      .selectActive()
      .pipe(
        map((player) => player.abilityChoice.isChoosingAbility),
        tap((isChoosingAbility) => {
          const isAdaptationMenuOpen = this.gameQuery.isAdaptationMenuOpen;
          // Opens adaptation menu if it's saved as open on Firebase
          // but closed on UI (means user reloaded).
          if (isChoosingAbility && !isAdaptationMenuOpen) {
            const activeTileId = this.playerQuery.abilityChoiceActiveTileId;
            if (activeTileId) this.tileService.setActive(activeTileId);
            this.playService.openAdaptationMenu();
            this.gameService.updateUiAdaptationMenuOpen(true);
          }
        })
      )
      .subscribe();
  }

  // PLAY - Master function
  // Chooses click action when clicking on a tile.
  public async play(tileId: number) {
    // Dismisses clicks on blank tiles.
    if (this.tileQuery.isBlank(tileId)) return;

    // Game start: selects the starting tile.
    if (this.playService.isSelectingStartingTile(tileId))
      return this.playService.selectStartTile(tileId);

    // Dismisses clicks during other player turn.
    if (!this.playerQuery.isActivePlayerPlaying(this.playingPlayerId))
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
