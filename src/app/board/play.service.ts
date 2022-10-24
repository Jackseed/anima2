// Angular
import { Injectable } from '@angular/core';

// Angular Material
import { MatDialog } from '@angular/material/dialog';

// Rxjs
import { Subscription } from 'rxjs';
import { first, tap } from 'rxjs/operators';

// States
import { GameQuery, GameService } from '../games/_state';
import { Species, SpeciesQuery, SpeciesService } from './species/_state';
import { TileQuery, TileService } from './tiles/_state';

// Components
import { AssimilationMenuComponent } from './abilities/assimilation-menu/assimilation-menu.component';
import { ListComponent } from './species/list/list.component';
import { AdaptationMenuComponent } from './abilities/adaptation-menu/adaptation-menu.component';
import { ABILITY_CHOICE_AMOUNT, PlayerService } from './players/_state';

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
    private playerService: PlayerService,
    private speciesQuery: SpeciesQuery,
    private speciesService: SpeciesService,
    public dialog: MatDialog
  ) {}

  // GAME STATE - Organizes the first steps of the game.
  // GAME STATE - Launching
  public getStartGameSub(): Subscription {
    const game$ = this.gameQuery.selectActive();
    return game$
      .pipe(
        tap((game) => {
          // Acts only on starting game.
          if (!game.isStarting) return;

          if (game.startState === 'launching') this.setupAdaptation();

          // Applies tile selection if it's a new game,
          // if it's the current state (for reloads),
          // if a tile was selected but lost after a reload.
          if (
            //game.startState === 'launching' ||
            game.startState === 'tileChoice' ||
            (game.startState === 'tileSelected' && !this.tileQuery.hasActive())
          )
            this.setStartTileChoice();
        }),
        first()
      )
      .subscribe();
  }
  // GAME STATE - Ability choice
  public setStartAbilityChoice() {
    this.gameService.switchStartState('abilityChoice');
    this.setRandomAbilityChoice();
  }

  // GAME STATE - Tile choice
  public setStartTileChoice() {
    this.gameService.switchStartState('tileChoice');
    this.tileService.removeActive();
    this.tileService.markAllTilesReachable();
  }

  // GAME STATE - Tile selection
  public selectStartTile(tileId: number) {
    this.tileService.selectTile(tileId);
    this.gameService.switchStartState('tileSelected');
  }

  // GAME STATE - Tile validation
  public validateStartTile() {
    const activeTileId = Number(this.tileQuery.getActiveId());
    const activeSpecieId = this.speciesQuery.getActiveId();

    this.gameService.switchStartState('tileValidated');
    this.speciesService.move(activeSpecieId, 4, activeTileId);
  }

  // GAME START - UTILS - Verifies if it's a starting tile selection.
  public isSelectingStartingTile(selectedTileId: number): boolean {
    const activeGame = this.gameQuery.getActive();
    const selectedTile = this.tileQuery.getEntity(selectedTileId.toString());

    return (
      activeGame.isStarting &&
      selectedTile.isReachable &&
      activeGame.startState === 'tileChoice'
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
    await this.setRandomAbilityChoice();
    this.openAdaptationMenu();
  }

  // UTILS - Gets random abilities and saves it with the active tile id.
  public async setRandomAbilityChoice() {
    this.gameService.updateUiAdaptationMenuOpen(true);
    const activeTileId = Number(this.tileQuery.getActiveId());
    const randomAbilities = this.playerService.getAbilityChoices(
      ABILITY_CHOICE_AMOUNT
    );

    await this.playerService.saveAbilityChoices(randomAbilities, activeTileId);
  }

  public async openAdaptationMenu(): Promise<void> {
    const isGameStarting = this.gameQuery.isGameStarting;
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
          this.setStartTileChoice();
        });
  }

  public openAssimilationMenu(): void {
    const activeTileId = Number(this.tileQuery.getActiveId());
    const otherSpecies =
      this.speciesQuery.otherActiveTileSpeciesThanActivePlayerSpecies;

    this.dialog.open(AssimilationMenuComponent, {
      data: {
        listType: 'active',
        species: otherSpecies,
        speciesCount: 'tile',
        tileId: activeTileId,
      },
      autoFocus: false,
      backdropClass: 'transparent-backdrop',
      panelClass: 'transparent-menu',
      height: '100%',
      width: '100%',
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
        species,
        speciesCount: tileId ? 'tile' : 'global',
        tileId,
      },
      height: '90%',
      width: '80%',
      panelClass: ['custom-container', 'no-padding-bottom'],
      autoFocus: false,
    });
  }
}
