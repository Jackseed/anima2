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
  MigrationValues,
  Species,
  SpeciesQuery,
  SpeciesService,
  ProliferationValues,
  AssimilationValues,
  createAssimilationValues,
  createProliferationValues,
  createMigrationValues,
  TileSpecies,
  TileSpeciesWithAssimilationValues,
} from './species/_state';
import { Tile, TileQuery, TileService } from './tiles/_state';

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

        // Updates remainingActions if that's the last remainingAction.
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
    let migrationValues = createMigrationValues({
      traveledDistance,
    });

    // Then apply migration abilities.
    migrationValues = this.applyMigrationAbilities(migrationValues);

    return migrationValues;
  }

  // MIGRATION - UTILS
  // Prepares migration by marking reachable tiles.
  public startMigration(): void {
    const activeTileId = Number(this.tileQuery.getActiveId());
    const remainingMigrations = this.remainingMigrations;
    this.tileService.markAdjacentTilesReachable(
      activeTileId,
      remainingMigrations
    );
  }

  // MIGRATION - UTILS - Checks if a migration is ongoing.
  public get isMigrationOngoing$(): Observable<boolean> {
    return this.tileQuery
      .selectCount(({ isReachable }) => isReachable)
      .pipe(
        map((reachableTileQuantity) =>
          reachableTileQuantity > 0 ? true : false
        )
      );
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
    const migrationValues = createMigrationValues({
      availableDistance: remainingMigrations,
    });

    remainingMigrations =
      this.applyMigrationAbilities(migrationValues).availableDistance;

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
  public async proliferate() {
    const activeSpeciesId = this.speciesQuery.getActiveId();
    const activeTileId = Number(this.tileQuery.getActiveId());
    const proliferationValues = this.applyProliferationAbilities();

    this.tileService.removeActive();
    this.tileService.removeReachable();
    this.speciesService
      .move(activeSpeciesId, proliferationValues.createdQuantity, activeTileId)
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

  // PROLIFERATION - UTILS -
  // Indicates weither active species can proliferate
  // by verifiying if there are more than the default needed individuals on the tile.
  public get canProliferate$(): Observable<boolean> {
    const activeSpecies$ = this.speciesQuery.selectActive();
    const activeTileId$ = this.tileQuery.selectActiveId();
    const proliferationValues = this.applyProliferationAbilities();

    return combineLatest([activeSpecies$, activeTileId$]).pipe(
      map(([species, tileId]) => {
        return this.isSpeciesQuantityGreatherThan(
          species,
          Number(tileId),
          proliferationValues.neededIndividuals
        );
      })
    );
  }

  // ASSIMILATION
  // Removes one species from a tile and adds one to the active species.
  public async assimilate(removedSpeciesId: string, removedTileId: number) {
    const activeSpeciesId = this.speciesQuery.getActiveId();
    const activeTileId = Number(this.tileQuery.getActiveId());
    const assimilationValues = this.applyAssimilationAbilitiesToSpecies(
      createAssimilationValues(),
      activeSpeciesId
    );

    // Removes the assimilated species.
    await this.speciesService.move(
      removedSpeciesId,
      assimilationValues.assimilatedQuantity,
      removedTileId
    );
    // Adds quantity to the assimilating species.
    await this.speciesService.move(
      activeSpeciesId,
      assimilationValues.createdQuantity,
      activeTileId
    );
  }

  // ASSIMILATION - UTILS
  // Indicates weither active specie can assimilate.
  // Verifies that the active species individuals
  // are stronger than another species on the tile.
  public get canAssimilate$(): Observable<boolean> {
    const activeTile$ = this.tileQuery.selectActive();
    const activeTileSpecies$ = this.speciesQuery.activeTileSpecies$;

    return combineLatest([activeTile$, activeTileSpecies$]).pipe(
      map(([tile, activeTileSpecies]) => {
        if (!!!tile || !!!activeTileSpecies) return false;
        return this.isSpeciesStrongerThanRangeSpecies(tile, activeTileSpecies);
      })
    );
  }

  // ASSIMILATION - UTILS
  // Compares strength and defense of a species versus range species.
  private isSpeciesStrongerThanRangeSpecies(
    originTile: Tile,
    attackingSpecies: TileSpecies
  ) {
    const attackingSpeciesWithAssimilationValues =
      this.superchargeTileSpeciesWithAssimilationValues([attackingSpecies])[0];
    const range = attackingSpeciesWithAssimilationValues.range;

    let otherReachableSpecies: TileSpecies[] = this.getOtherRangeSpecies(
      originTile,
      attackingSpecies,
      range
    );

    const otherReachablSpeciesWithAssimilationValues =
      this.superchargeTileSpeciesWithAssimilationValues(otherReachableSpecies);

    console.log('other species: ', otherReachablSpeciesWithAssimilationValues);

    // Then checks if at least one species is weaker than the attacking one.
    const weakerSpecies = otherReachablSpeciesWithAssimilationValues.filter(
      (abilitySpecies) =>
        abilitySpecies.defense <
        attackingSpeciesWithAssimilationValues?.strength
    );
    if (weakerSpecies.length === 0) return false;

    return true;
  }

  // ASSIMILATION - UTILS
  // Supercharges species with their assimilation ability values.
  private superchargeTileSpeciesWithAssimilationValues(
    species: TileSpecies[]
  ): TileSpeciesWithAssimilationValues[] {
    return species.map((species) => {
      return {
        ...species,
        ...this.applyAssimilationAbilitiesToSpecies(
          createAssimilationValues({
            strength: species.quantity,
            defense: species.quantity,
          }),
          species.id
        ),
      };
    });
  }

  private getOtherRangeSpecies(
    originTile: Tile,
    originSpecies: TileSpecies,
    range: number
  ): TileSpecies[] {
    // Adds by default other species from the origin tile.
    const defaultOtherRangeSpecies = originTile.species.filter(
      (species) => species.id !== originSpecies.id
    );
    let otherRangeSpecies: TileSpecies[] = defaultOtherRangeSpecies;

    if (range === 0) return otherRangeSpecies;

    const adjacentReacheableTileIds =
      this.tileService.getAdjacentTileIdsWithinRange(originTile.id, range);

    // Gets other species in the given range.
    adjacentReacheableTileIds.forEach((tileId) => {
      const tile = this.tileQuery.getEntity(tileId.toString());
      otherRangeSpecies.push(
        ...tile.species.filter((species) => species.id !== originSpecies.id)
      );
    });
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

  // ABILITY - UTILS
  // GETTERS
  private speciesHasAbility(speciesId: string, abilityId: AbilityId): boolean {
    const speciesAbilityIds = this.getSpeciesAbilityIds(speciesId);
    return speciesAbilityIds.includes(abilityId);
  }

  private getSpeciesAbilityIds(speciesId: string) {
    const species = this.speciesQuery.getEntity(speciesId);
    return species.abilities.map((ability) => ability.id);
  }

  private getAbilityValue(abilityId: AbilityId): number {
    const ability = this.getAbilityWithId(abilityId);
    return ability.value;
  }

  private getConstraintValue(abilityId: AbilityId): number {
    const ability = this.getAbilityWithId(abilityId);
    return ability.constraintValue;
  }

  private getAbilityWithId(abilityId: AbilityId): Ability {
    return ABILITIES.filter((ability) => ability.id === abilityId)[0];
  }

  // ASSIMILATION ABILITIES
  private applyAssimilationAbilitiesToSpecies(
    defaultValues: AssimilationValues,
    speciesId: string
  ): AssimilationValues {
    let updatedValues: AssimilationValues = defaultValues;

    // If giantism, updates defense.
    if (this.speciesHasAbility(speciesId, 'giantism'))
      updatedValues.defense += this.getAbilityValue('giantism');

    // If predator, updates strength.
    if (this.speciesHasAbility(speciesId, 'predator'))
      updatedValues.strength += this.getAbilityValue('predator');

    // If gluttony, updates assimilated quantities.
    if (this.speciesHasAbility(speciesId, 'gluttony'))
      updatedValues.assimilatedQuantity += this.getAbilityValue('gluttony');

    // If carnivore, updates created quantities.
    if (this.speciesHasAbility(speciesId, 'carnivore'))
      updatedValues.createdQuantity += this.getAbilityValue('carnivore');

    return updatedValues;
  }

  // PROLIFERATE ABILITIES
  private applyProliferationAbilities(
    defaultValues?: ProliferationValues
  ): ProliferationValues {
    const activeSpeciesId = this.speciesQuery.getActiveId();
    let updatedValues: ProliferationValues = defaultValues
      ? defaultValues
      : createProliferationValues();

    // If hermaphrodite, updates needed individuals.
    if (this.speciesHasAbility(activeSpeciesId, 'hermaphrodite'))
      updatedValues.neededIndividuals = this.getAbilityValue('hermaphrodite');

    // If nest and enough individuals, adds proliferation quantity.
    if (this.isAbilityValid('nest'))
      updatedValues.createdQuantity += this.getAbilityValue('nest');

    return updatedValues;
  }

  // MIGRATION ABILITIES
  private applyMigrationAbilities(
    defaultValues: MigrationValues
  ): MigrationValues {
    const activeSpeciesId = this.speciesQuery.getActiveId();
    let updatedValues: MigrationValues = defaultValues;
    // If active species is flying, adds available distance.
    if (this.speciesHasAbility(activeSpeciesId, 'flying'))
      updatedValues.availableDistance += this.getAbilityValue('flying');

    // If active species has hounds,
    // updates moving quantity, without modifying migration point used.
    if (this.isAbilityValid('hounds'))
      updatedValues = {
        ...defaultValues,
        movingQuantity: this.getAbilityValue('hounds'),
        migrationUsed: defaultValues.traveledDistance,
      };

    return updatedValues;
  }

  // ABILITY UTILS
  // Verifies that active species has the ability
  // and enough individuals to activate it on the active tile.
  private isAbilityValid(abilityId: AbilityId): boolean {
    const activeSpecies = this.speciesQuery.getActive();
    const activeTileId = Number(this.tileQuery.getActiveId());
    const activeSpeciesQuantity = this.tileQuery.getTileSpeciesCount(
      activeSpecies,
      activeTileId
    );

    const isAbilityValid =
      activeSpeciesQuantity >= this.getConstraintValue(abilityId) &&
      this.speciesHasAbility(activeSpecies.id, abilityId);
    return isAbilityValid;
  }
}
