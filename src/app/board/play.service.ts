// Angular
import { Injectable } from '@angular/core';

// Angular Material
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

// Firebase
import firebase from 'firebase/app';

// Rxjs
import { combineLatest, Observable, Subscription } from 'rxjs';
import { first, map, tap } from 'rxjs/operators';

// States
import { GameQuery, GameService } from '../games/_state';
import {
  abilities,
  Species,
  SpeciesQuery,
  SpeciesService,
} from './species/_state';
import { TileQuery, TileService } from './tiles/_state';
import { PlayerQuery } from './players/_state';

// Components
import { AdaptationMenuComponent } from './abilities/adaptation-menu/adaptation-menu.component';
import { AssimilationMenuComponent } from './abilities/assimilation-menu/assimilation-menu.component';
import { ListComponent } from './species/list/list.component';

@Injectable({
  providedIn: 'root',
})
export class PlayService {
  constructor(
    private gameQuery: GameQuery,
    private gameService: GameService,
    private playerQuery: PlayerQuery,
    private tileQuery: TileQuery,
    private tileService: TileService,
    private speciesQuery: SpeciesQuery,
    private speciesService: SpeciesService,
    private snackbar: MatSnackBar,
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

          // Applies tile selection if it's a new game,
          // if it's the current state (for reloads),
          // if a tile was selected but lost after a reload.
          if (
            game.startState === 'launching' ||
            game.startState === 'tileChoice' ||
            (game.startState === 'tileSelected' && !this.tileQuery.hasActive())
          )
            this.setStartTileChoice();
        }),
        first()
      )
      .subscribe();
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

  // UTILS - Checks species quantity on a tile.
  // Indicates if a species is more than a specific amount on a tile.
  public isSpeciesQuantityGreatherThan(
    specie: Species,
    tileId: number,
    num: number
  ): boolean {
    return specie.tileIds.filter((id) => id === tileId).length >= num
      ? true
      : false;
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

  // MIGRATION
  public async migrate(destinationId: number, quantity: number) {
    const activeSpeciesId = this.speciesQuery.getActiveId();
    const previousTileId = Number(this.tileQuery.getActiveId());

    this.tileService.removeActive();
    this.tileService.removeReachable();

    this.speciesService
      .move(activeSpeciesId, quantity, destinationId, previousTileId)
      .then(async () => {
        this.snackbar.open('Migration effectuée !', null, {
          duration: 800,
          panelClass: 'orange-snackbar',
        });
        this.tileService.resetRange();
        // Updates remainingActions if that's the last migrationCount.
        if (+this.migrationCount + 1 === quantity) {
          this.gameService.decrementRemainingActions();
        }
        this.tileService.selectTile(destinationId);
      })
      .catch((error) => {
        console.log('Migration failed: ', error);
      });
  }

  // MIGRATION - UTILS - Prepares migration by marking reachable tiles.
  public startMigration(): void {
    const activeTileId = Number(this.tileQuery.getActiveId());
    const migrationCount = Number(this.gameQuery.migrationCount);
    this.tileService.markAdjacentReachableTiles(activeTileId, migrationCount);
  }

  // MIGRATION - UTILS - Checks if a migration is ongoing.
  public get isMigrationOngoing$(): Observable<boolean> {
    return this.tileQuery
      .selectCount(({ isReachable }) => isReachable)
      .pipe(map((num) => (num > 0 ? true : false)));
  }

  // MIGRATION - UTILS - Indicates weither active species can migrate.
  // Verifies if there is at least one active species on the active tile.
  public get canMigrate$(): Observable<boolean> {
    const activeSpecies$ = this.speciesQuery.selectActive();
    const activeTileId$ = this.tileQuery.selectActiveId();

    // Checks there is a specie in the active tile.
    return combineLatest([activeSpecies$, activeTileId$]).pipe(
      map(([specie, tileId]) => {
        return this.isSpeciesQuantityGreatherThan(specie, Number(tileId), 1);
      })
    );
  }

  // MIGRATION - UTILS - Checks if it's a valid migration move.
  // Verifies a tile is active, the destination is valid and the species can move.
  public isMigrationValid(destinationTileId: number): boolean {
    const destinationTile = this.tileQuery.getEntity(
      destinationTileId.toString()
    );

    return (
      this.tileQuery.hasActive() &&
      destinationTile.isReachable &&
      !!this.migrationCount
    );
  }

  // MIGRATION - UTILS - Getter for current migration count.
  // Includes AGILITY count.
  public get migrationCount(): number | firebase.firestore.FieldValue {
    const activeSpeciesAbilityIds = this.speciesQuery.activeSpeciesAbilityIds;
    const game = this.gameQuery.getActive();

    return activeSpeciesAbilityIds.includes('agility')
      ? +game.migrationCount + abilities['agility'].value
      : game.migrationCount;
  }

  // PROLIFERATION
  public async proliferate(quantity: number) {
    const activeSpeciesId = this.speciesQuery.getActiveId();
    const activeTileId = Number(this.tileQuery.getActiveId());

    this.tileService.removeActive();
    this.tileService.removeReachable();
    this.speciesService
      .move(activeSpeciesId, quantity, activeTileId)
      .then(() => {
        this.snackbar.open('Prolifération effectuée !', null, {
          duration: 800,
          panelClass: 'orange-snackbar',
        });
        this.gameService.decrementRemainingActions();
      })
      .catch((error) => {
        console.log('Proliferate failed: ', error);
      });
  }

  // PROLIFERATION - UTILS - Indicates weither active species can proliferate
  // by verifiying if there is more than 2 active species on the tile.
  public get canProliferate$(): Observable<boolean> {
    const activeSpecies$ = this.speciesQuery.selectActive();
    const activeTileId$ = this.tileQuery.selectActiveId();

    // Checks if more than 1 species on the active tile to proliferate.
    return combineLatest([activeSpecies$, activeTileId$]).pipe(
      map(([specie, tileId]) => {
        return this.isSpeciesQuantityGreatherThan(specie, Number(tileId), 2);
      })
    );
  }

  // ASSIMILATION - UTILS - Indicates weither active specie can assimilate.
  // Verifies that there are at least 2 species on the active tile
  // and that they are more than another species on the tile.
  public get canAssimilate$(): Observable<boolean> {
    const activeTile$ = this.tileQuery.selectActive();
    const activeSpecieId$ = this.speciesQuery.selectActiveId();

    return combineLatest([activeTile$, activeSpecieId$]).pipe(
      map(([tile, activeSpecieId]) => {
        if (!!!tile) return false;
        const tileSpecies = tile.species;
        // 1st condition: needs at least 2 species on the same tile to assimilate.
        if (tileSpecies?.length < 2) return false;

        // 2nd condition: needs to be more than others.
        const activeSpecieQuantity = tileSpecies.filter(
          (specie) => specie.id === activeSpecieId
        )[0]?.quantity;
        const weakerSpecies = tileSpecies.filter(
          (specie) => specie.quantity < activeSpecieQuantity
        );
        if (weakerSpecies.length === 0) return false;

        return true;
      })
    );
  }

  public openAssimilationMenu(): void {
    const activeTileId = Number(this.tileQuery.getActiveId());
    const species = this.speciesQuery.getTileSpecies(activeTileId);
    // Filters active species since you can't assimilate yourself.
    const activePlayerId = this.playerQuery.getActiveId();
    const otherSpecies = species.filter(
      (species) => species.playerId !== activePlayerId
    );

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

  // ADAPTATION - UTILS - Indicates weither active specie can adapt.
  // Verifies if there are at least 4 species individuals in the active tile.
  public get canAdapt$(): Observable<boolean> {
    const activeSpecies$ = this.speciesQuery.selectActive();
    const activeTileId$ = this.tileQuery.selectActiveId();

    // Checks if more than 1 specie on the active tile to proliferate.
    return combineLatest([activeSpecies$, activeTileId$]).pipe(
      map(([specie, tileId]) => {
        return this.isSpeciesQuantityGreatherThan(specie, Number(tileId), 4);
      })
    );
  }


  public openAdaptationMenu(): void {
    this.dialog.open(AdaptationMenuComponent, {
      backdropClass: 'transparent-backdrop',
      panelClass: 'transparent-menu',
      disableClose: true,
      autoFocus: false,
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
