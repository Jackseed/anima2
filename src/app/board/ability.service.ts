// Angular
import { Injectable } from '@angular/core';

// Rxjs
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Material
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

// States
import { GameQuery, GameService } from '../games/_state';
import { PlayerService } from './players/_state';
import {
  ABILITIES,
  Ability,
  AbilityId,
  DEFAULT_MOVING_QUANTITY,
  MigrationValues,
  Species,
  SpeciesQuery,
  SpeciesService,
} from './species/_state';
import { TileQuery, TileService } from './tiles/_state';

@Injectable({
  providedIn: 'root',
})
export class AbilityService {
  constructor(
    private gameQuery: GameQuery,
    private gameService: GameService,
    private playerService: PlayerService,
    private tileQuery: TileQuery,
    private tileService: TileService,
    private speciesQuery: SpeciesQuery,
    private speciesService: SpeciesService,
    private snackbar: MatSnackBar,
    public dialog: MatDialog
  ) {}

  // MIGRATION
  public async migrateTo(destinationId: number) {
    const activeSpeciesId = this.speciesQuery.getActiveId();
    const previousTileId = Number(this.tileQuery.getActiveId());
    const migrationValues = this.getMigrationValues(destinationId);
    const remainginMigrations = this.remainingMigrations;

    this.tileService.removeActive();
    this.tileService.removeReachable();

    this.speciesService
      .move(
        activeSpeciesId,
        migrationValues.movingQuantity,
        destinationId,
        previousTileId,
        migrationValues.migrationUsed
      )
      .then(async () => {
        this.tileService.selectTile(destinationId);
        this.snackbar.open('Migration effectuée !', null, {
          duration: 800,
          panelClass: 'orange-snackbar',
        });
        this.tileService.resetRange();

        // Updates remainingActions if that's the last migrationCount.
        if (migrationValues.migrationUsed === remainginMigrations) {
          this.gameService.decrementRemainingActions();
        }
      })
      .catch((error) => {
        console.log('Migration failed: ', error);
      });
  }

  // MIGRATION - UTILS
  // Get migration values, applying relevant abilities.
  private getMigrationValues(destinationTileId: number): MigrationValues {
    // Gets default migration values.
    const traveledDistance =
      this.tileQuery.getDistanceFromActiveTileToDestinationTileId(
        destinationTileId
      );
    const movingQuantity = DEFAULT_MOVING_QUANTITY;
    const migrationUsed = traveledDistance * DEFAULT_MOVING_QUANTITY;

    // Then apply migration abilities.
    const migrationValues = this.applyMigrationAbilities({
      traveledDistance,
      movingQuantity,
      migrationUsed,
    });

    return migrationValues;
  }

  // MIGRATION - UTILS
  // Prepares migration by marking reachable tiles.
  public startMigration(): void {
    const activeTileId = Number(this.tileQuery.getActiveId());
    const migrationCount = this.remainingMigrations;
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
    const isMigrationValid =
      this.tileQuery.hasActive() &&
      destinationTile.isReachable &&
      !!this.remainingMigrations;

    return isMigrationValid;
  }

  // MIGRATION - UTILS - Getter for current remaining migrations.
  public get remainingMigrations(): number {
    let remainingMigrations = +this.gameQuery.remainingMigrations;

    remainingMigrations = this.applyMigrationAbilities({
      availableDistance: remainingMigrations,
    }).availableDistance;

    return remainingMigrations;
  }

  public get remainingMigrations$(): Observable<number> {
    return this.gameQuery.remainingMigrations$.pipe(
      map(
        (remainingMigrations) =>
          this.applyMigrationAbilities({
            availableDistance: remainingMigrations,
          }).availableDistance
      )
    );
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
        this.gameService.decrementRemainingActions();
        this.snackbar.open('Prolifération effectuée !', null, {
          duration: 800,
          panelClass: 'orange-snackbar',
        });
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

  // ASSIMILATION
  // Removes one species from a tile and adds one to the active species.
  public async assimilate(
    removedSpeciesId: string,
    removedQuantity: number,
    removedTileId: number,
    addingQuantity: number
  ) {
    const activeSpeciesId = this.speciesQuery.getActiveId();
    const activeTileId = Number(this.tileQuery.getActiveId());
    // Removes the assimilated species.
    await this.speciesService.move(
      removedSpeciesId,
      removedQuantity,
      removedTileId
    );
    // Adds quantity to the assimilating species.
    await this.speciesService.move(
      activeSpeciesId,
      addingQuantity,
      activeTileId
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

  // ADAPTATION
  public adapt(ability: Ability) {
    const activeSpecies = this.speciesQuery.getActive();
    const isGameStarting = this.gameQuery.isStarting;
    const adaptPromises = [];

    const resetAbilityPromise = this.playerService.resetAbilityChoices();
    const addAbilityPromise = this.speciesService.addAbilityToSpecies(
      ability,
      activeSpecies
    );

    adaptPromises.push(resetAbilityPromise, addAbilityPromise);

    // If the game is started, count adaptation as the action otherwise do it for free.
    if (!isGameStarting) {
      const activeTileId = Number(this.tileQuery.getActiveId());
      const movePromise = isGameStarting
        ? Promise.resolve()
        : this.speciesService.move(activeSpecies.id, -4, activeTileId);

      const decrementActionPromise =
        this.gameService.decrementRemainingActions();

      adaptPromises.push(movePromise, decrementActionPromise);
    }

    Promise.all(adaptPromises)
      .then(() => {
        this.snackbar.open(`${ability.fr.name} obtenu !`, null, {
          duration: 800,
          panelClass: 'orange-snackbar',
        });
      })
      .catch((error) => console.log('Adapt failed: ', error));
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

  // UTILS - Checks species quantity on a tile.
  // Indicates if a species is more than a specific amount on a tile.
  public isSpeciesQuantityGreatherThan(
    species: Species,
    tileId: number,
    num: number
  ): boolean {
    const tileSpeciesCount = this.tileQuery.getTileSpeciesCount(
      species,
      tileId
    );
    return tileSpeciesCount >= num ? true : false;
  }

  // ABILITIES

  // UTILS

  get activeSpeciesAbilityIds() {
    return this.speciesQuery.getActive().abilities.map((ability) => ability.id);
  }

  get activeSpeciesAbilityIds$() {
    return this.speciesQuery
      .selectActive()
      .pipe(map((species) => species.abilities.map((ability) => ability.id)));
  }

  getAbilityWithId(abilityId: AbilityId): Ability {
    return ABILITIES.filter((ability) => ability.id === abilityId)[0];
  }

  activeSpeciesHasAbility(abilityId: AbilityId): boolean {
    const activeSpeciesAbilityIds = this.activeSpeciesAbilityIds;
    return activeSpeciesAbilityIds.includes(abilityId);
  }

  getAbilityValue(abilityId: AbilityId): number {
    const ability = this.getAbilityWithId(abilityId);
    return ability.value;
  }

  // MIGRATION ABILITIES
  applyMigrationAbilities(defaultValues: MigrationValues): MigrationValues {
    let updatedValue: MigrationValues = defaultValues;
    // If active species is flying, adds available distance.
    if (this.activeSpeciesHasAbility('flying'))
      updatedValue.availableDistance += this.getAbilityValue('flying');

    // If active species has hounds,
    // updates moving quantity, without modifying migration point used.
    if (this.isActiveSpeciesAHound())
      updatedValue = {
        ...defaultValues,
        movingQuantity: this.getAbilityValue('hounds'),
        migrationUsed: defaultValues.traveledDistance,
      };

    return updatedValue;
  }

  // HOUNDS
  // Checks if active species has Hounds ability
  // and if individuals are enough to create a hound.
  private isActiveSpeciesAHound(): boolean {
    const activeSpecies = this.speciesQuery.getActive();
    const activeTileId = Number(this.tileQuery.getActiveId());
    const activeSpeciesQuantity = this.tileQuery.getTileSpeciesCount(
      activeSpecies,
      activeTileId
    );

    const isActiveSpeciesAHound =
      activeSpeciesQuantity >= this.getAbilityValue('nest') &&
      this.activeSpeciesHasAbility('nest');
    return isActiveSpeciesAHound;
  }
}
