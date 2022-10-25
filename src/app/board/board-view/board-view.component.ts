// Angular
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';

// Material
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

// Rxjs
import { iif, Observable, of, Subscription } from 'rxjs';
import { filter, map, mergeMap, pluck, tap } from 'rxjs/operators';

// States
import { UserQuery } from 'src/app/auth/_state';
import { Game, GameQuery, GameService } from 'src/app/games/_state';
import { PlayService } from '../play.service';
import { PlayerQuery, PlayerService } from '../players/_state';
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
  public game$: Observable<Game>;

  // Subscriptions
  private turnSub: Subscription;
  private activePlayerSub: Subscription;
  private activeSpeciesSub: Subscription;
  private startGameSub: Subscription;
  private isPlayerChoosingAbility: Subscription;

  constructor(
    private gameQuery: GameQuery,
    private gameService: GameService,
    private userQuery: UserQuery,
    private playerQuery: PlayerQuery,
    private playerService: PlayerService,
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
    this.game$ = this.gameQuery.selectActive();
    this.activePlayerSub = this.getActivePlayerSub();
    this.activeSpeciesSub = this.getActiveSpeciesSub();
    this.tiles$ = this.tileQuery
      .selectAll()
      .pipe(map((tiles) => tiles.sort((a, b) => a.id - b.id)));

    this.playingPlayerId = this.userQuery.getActiveId();

    this.turnSub = this.getTurnSub();
    this.startGameSub = this.playService.getStartGameSub();
    this.isPlayerChoosingAbility = this.getPlayerChoosingAbilitySub();
  }

  // TODO: rework subscriptions
  // If no more actions for the active player, skips turn
  private getTurnSub(): Subscription {
    return this.game$
      .pipe(
        pluck('remainingActions'),
        mergeMap((remainingActions) =>
          iif(
            () => this.playerQuery.getActiveId() === this.playingPlayerId,
            of(remainingActions),
            of(true)
          )
        ),
        tap((bool) => {
          if (!bool) this.gameService.incrementTurnCount();
        })
      )
      .subscribe();
  }
  // base akita active player on game obj
  private getActivePlayerSub(): Subscription {
    return this.game$
      .pipe(
        pluck('activePlayerId'),
        tap((id) => this.playerService.setActive(id))
      )
      .subscribe();
  }
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

    // Dismisses clicks during other player turn.
    if (!this.playerQuery.isActive(this.playingPlayerId))
      return this.snackbar.open("Ce n'est pas à votre tour.", null, {
        duration: 3000,
      });

    // Game start: selects the starting tile.
    if (this.playService.isSelectingStartingTile(tileId))
      return this.playService.selectStartTile(tileId);

    // Migration
    if (this.abilityService.isMigrationValid(tileId))
      return await this.abilityService.migrate(tileId, 1);

    // Dismisses clicks on empty tiles.
    if (this.tileQuery.isEmpty(tileId)) return;

    // Tile selection
    if (this.playService.isSelectionValid(tileId))
      return this.tileService.selectTile(tileId);

    // Otherwise, opens species menu.
    this.playService.openSpeciesList(tileId);
  }

  // TODO: remove this
  public getSpeciesImgUrl(speciesId: string): string {
    const species = this.speciesQuery.getEntity(speciesId);
    const url = `/assets/abilities/${species.abilities[0].id}.svg`;

    return url;
  }

  public isActive(tileId: number) {
    return this.tileQuery.isActive(tileId);
  }

  public validateStartTile() {
    this.playService.validateStartTile();
  }

  public cancelStartTileChoice() {
    this.playService.setStartTileChoice();
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
    }
  }

  ngOnDestroy() {
    this.turnSub.unsubscribe();
    this.activePlayerSub.unsubscribe();
    this.activeSpeciesSub.unsubscribe();
    this.startGameSub.unsubscribe();
    this.isPlayerChoosingAbility.unsubscribe();
  }
}
