// Angular
import { Injectable } from '@angular/core';

// Rxjs
import { combineLatest, Subscription } from 'rxjs';
import { first, tap } from 'rxjs/operators';

// Material
import { MatDialog } from '@angular/material/dialog';

// States
import {
  DEFAULT_SPECIES_AMOUNT,
  GameQuery,
  GameService,
} from '../games/_state';
import {
  createAssimilationValues,
  Species,
  SpeciesListActions,
  SpeciesListData,
  SpeciesQuery,
  SpeciesService,
  TileSpecies,
} from './species/_state';
import { TileQuery, TileService } from './tiles/_state';
import { PlayerQuery, PlayerService } from './players/_state';
import { AbilityService } from './ability.service';

// Components
import { AssimilationMenuComponent } from './abilities/assimilation-menu/assimilation-menu.component';
import { ListComponent } from './species/list/list.component';
import { AdaptationMenuComponent } from './abilities/adaptation-menu/adaptation-menu.component';

@Injectable({
  providedIn: 'root',
})

// This service is used by components to interact with the game.
export class PlayService {
  constructor(
    private gameQuery: GameQuery,
    private gameService: GameService,
    private tileQuery: TileQuery,
    private tileService: TileService,
    private playerQuery: PlayerQuery,
    private playerService: PlayerService,
    private speciesQuery: SpeciesQuery,
    private speciesService: SpeciesService,
    private abilityService: AbilityService,
    public dialog: MatDialog
  ) {}

  private async switchToNextStartStage() {
    const playerIds = this.playerQuery.allPlayerIds;
    const game = this.gameQuery.getActive();

    // Switches players as not ready anymore.
    this.playerQuery.switchReadyState(playerIds);

    if (game.startStage === 'launching') {
      console.log('applying ability choice');
      this.gameService.switchStartStage('abilityChoice');
      return this.setupAdaptation();
    }
    if (game.startStage === 'abilityChoice') {
      this.setStartTileChoice();
      return this.gameService.switchStartStage('tileChoice');
    }
    if (game.startStage === 'tileChoice') {
      await this.playTileChoices();
      this.gameService.switchStartStage('tileValidated');
      return this.gameService.updateIsStarting(false);
    }
  }

  // When all players are ready, switches to the next start stage.
  public get switchToNextStartStageWhenPlayersReadySub(): Subscription {
    const nextStartStateSub =
      this.playerQuery.areAllPlayersReadyForNextStartStage$
        .pipe(
          tap((arePlayerReady) => {
            if (arePlayerReady) this.switchToNextStartStage();
          })
        )
        .subscribe();

    return nextStartStateSub;
  }

  // Applies tile selection if it's the current game stage (for reloads),
  // and the player hasn't select a tile yet.
  public reApplyTileChoiceStateSub(): Subscription {
    const gameStartStage$ = this.gameQuery.startStage$;
    const isPlayerReady$ =
      this.playerQuery.isActivePlayerWaitingForNextStartStage$;
    return combineLatest([gameStartStage$, isPlayerReady$])
      .pipe(
        tap(([startStage, isPlayerReady]) => {
          if (startStage === 'tileChoice' && !isPlayerReady)
            this.setStartTileChoice();
        }),
        first()
      )
      .subscribe();
  }

  public async playTileChoices() {
    const activePlayerId = this.playerQuery.getActiveId();
    const game = this.gameQuery.getActive();

    for (const tileChoice of game.tileChoices) {
      const species = this.speciesQuery.getEntity(tileChoice.speciesId);
      await this.speciesService.move({
        movingSpecies: species,
        quantity: DEFAULT_SPECIES_AMOUNT,
        destinationId: tileChoice.tileId,
      });
    }

    // Removes 1 action for the first player.
    if (
      this.playerQuery.isPlayerPlaying(activePlayerId) &&
      game.tileChoices.length > 0
    )
      this.gameService.updateRemainingActions();

    this.gameService.updateTileChoice();
  }

  // GAME STATE - Tile choice
  public setStartTileChoice() {
    this.tileService.removeActive();
    this.tileService.markAllTilesReachable();
  }

  // GAME STATE - Tile selection
  public selectStartTile(tileId: number) {
    this.tileService.selectTile(tileId);
  }

  // GAME STATE - Tile validation
  public validateStartTile() {
    const activeTileId = Number(this.tileQuery.getActiveId());
    const activeSpeciesId = this.speciesQuery.getActiveId();
    const activePlayerId = this.playerQuery.getActiveId();

    this.playerQuery.switchReadyState([activePlayerId]);

    this.gameService.updateTileChoice({
      speciesId: activeSpeciesId,
      tileId: activeTileId,
    });

    this.tileService.removeActive();
  }

  // GAME START - UTILS - Verifies if it's a starting tile selection.
  public isSelectingStartingTile(selectedTileId: number): boolean {
    const activeGame = this.gameQuery.getActive();
    const selectedTile = this.tileQuery.getEntity(selectedTileId.toString());

    return (
      activeGame.isStarting &&
      selectedTile.isReachable &&
      activeGame.startStage === 'tileChoice'
    );
  }

  // UTILS - Tile selection
  // Verifies if a tile includes an active species and is not already selected.
  public isSelectionValid(selectedTileId: number): boolean {
    const activeSpecies = this.speciesQuery.getActive();

    return (
      activeSpecies.tileIds.includes(selectedTileId) &&
      !this.tileQuery.isActive(selectedTileId)
    );
  }

  public async setupAdaptation() {
    await this.playerService.setRandomAbilityChoice();
    this.openAdaptationMenu();
  }

  public async openAdaptationMenu(): Promise<void> {
    const isGameStarting = this.gameQuery.isStarting;
    const activePlayerId = this.playerQuery.getActiveId();
    const dialogRef = this.dialog.open(AdaptationMenuComponent, {
      backdropClass: 'transparent-backdrop',
      panelClass: 'transparent-menu',
      disableClose: true,
      autoFocus: false,
      height: '100%',
      width: '100%',
    });

    // If the game is starting, change the game state on dialog close.
    if (isGameStarting)
      dialogRef
        .afterClosed()
        .pipe(first())
        .subscribe(() => {
          this.playerQuery.switchReadyState([activePlayerId]);
        });
  }

  public setupAssimilation(attackedTileId?: number) {
    const activeTile = this.tileQuery.getActive();
    const activeSpeciesId = this.speciesQuery.getActiveId();
    const activeSpeciesWithAssimilationValues =
      this.abilityService.applyAssimilationAbilitiesToSpecies(
        createAssimilationValues(),
        activeSpeciesId
      );
    const activeSpeciesRange = activeSpeciesWithAssimilationValues.range;

    // If range is equal to 0, opens assimilation value on the active tile.
    if (activeSpeciesRange === 0)
      return this.openAssimilationMenu(activeTile.id);
    // If a tile is attacked, open assimilation menu on that tile.
    if (attackedTileId) return this.openAssimilationMenu(attackedTileId);

    // Else marks weaker species tiles attackable.
    const activeTileSpecies = this.speciesQuery.activeTileSpecies;

    const weakerInRangeSpecies = this.abilityService.getWeakerInRangeSpecies(
      activeTile,
      activeTileSpecies,
      activeSpeciesRange
    );
    const attackableTileIds = weakerInRangeSpecies.map(
      (species) => species.tileId
    );
    this.tileService.markAsAttackable(attackableTileIds);
  }

  public openAssimilationMenu(attackedTileId: number): void {
    this.tileService.removeAttackable();
    const attackedTile = this.tileQuery.getEntity(attackedTileId.toString());
    const attackingTileSpecies = this.speciesQuery.activeTileSpecies;
    const attackableSpecies = this.abilityService.getWeakerInRangeSpecies(
      attackedTile,
      attackingTileSpecies,
      0
    );
    this.openActiveSpeciesList(attackableSpecies, attackedTileId, 'assimiler');
  }

  public openIntimidateMenu() {
    const activeTileId = Number(this.tileQuery.getActiveId());
    const otherSpecies = this.speciesQuery.otherTileSpecies();
    const action = 'intimider';
    this.openActiveSpeciesList(otherSpecies, activeTileId, action);
  }

  // TODO: merge AssimilationMenuComponent with List Component
  private openActiveSpeciesList(
    speciesToList: TileSpecies[],
    tileId: number,
    action: SpeciesListActions
  ) {
    const speciesListData: SpeciesListData = {
      listType: 'active',
      speciesCount: 'tile',
      speciesToList,
      tileId,
      action,
    };
    this.dialog.open(AssimilationMenuComponent, {
      data: speciesListData,
      autoFocus: false,
      backdropClass: 'transparent-backdrop',
      panelClass: 'transparent-menu',
      height: '100%',
      width: '100%',
      restoreFocus: false,
    });
  }

  // Opens species list, either global or on a specific tile.
  public openSpeciesList(tileId?: number) {
    const species: Species[] = tileId
      ? this.speciesQuery.getTileSpecies(tileId)
      : this.speciesQuery.getAll();

    this.dialog.open(ListComponent, {
      data: {
        listType: 'passive',
        speciesToList: species,
        speciesCount: tileId ? 'tile' : 'global',
        tileId,
      },
      height: '90%',
      width: '80%',
      panelClass: ['custom-container', 'no-padding-bottom'],
      autoFocus: false,
      restoreFocus: false,
    });
  }
}
