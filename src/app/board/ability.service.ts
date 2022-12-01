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

  // MIGRATION - UTILS
  // Checks if there is at least 1 tile reachable.
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

    this.tileService.removeAttackable();

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
  // Checks if there is at least 1 tile attackable
  public get isAssimilationOngoing$(): Observable<boolean> {
    return this.tileQuery
      .selectCount(({ isAttackable }) => isAttackable)
      .pipe(
        map((attackableTileQuantity) =>
          attackableTileQuantity > 0 ? true : false
        )
      );
  }

  // ASSIMILATION - UTILS - Checks if it's a valid assimilation.
  // Verifies a tile is active, the attacked tile is valid and the species can act.
  public isAssimilationValid(attackedTileId: number): boolean {
    const attackedTile = this.tileQuery.getEntity(attackedTileId.toString());
    const isAssimilationValid =
      this.tileQuery.hasActive() &&
      attackedTile.isAttackable &&
      !!this.remainingMigrations;

    return isAssimilationValid;
  }

  // ASSIMILATION - UTILS
  // Verifies that active species is stronger than another species on range.
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
  // Compares strength and defense of a species versus in range species.
  private isSpeciesStrongerThanRangeSpecies(
    originTile: Tile,
    attackingSpecies: TileSpecies
  ) {
    const attackingSpeciesWithAssimilationValues =
      this.superchargeTileSpeciesWithAssimilationValues([attackingSpecies])[0];
    const range = attackingSpeciesWithAssimilationValues.range;

    // Checks if at least one species is weaker than the attacking one.
    let weakerInRangeSpecies: TileSpecies[] = this.getWeakerInRangeSpecies(
      originTile,
      attackingSpecies,
      range
    );

    if (weakerInRangeSpecies.length === 0) return false;

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
          species.id,
          species
        ),
      };
    });
  }

  // ASSIMILATION - UTILS
  // Gets all the range species that are weaker than the attacking one.
  public getWeakerInRangeSpecies(
    originTile: Tile,
    attackingSpecies: TileSpecies,
    range: number
  ): TileSpecies[] {
    // Adds by default other species from the origin tile.
    const defaultOtherRangeSpecies =
      this.speciesQuery.otherTileSpecies(originTile);

    let otherWeakerSpecies: TileSpecies[] = defaultOtherRangeSpecies.filter(
      (defendingTileSpecies) =>
        this.isAttackingSpeciesStrongerThan(
          attackingSpecies,
          defendingTileSpecies
        )
    );

    if (range === 0) return otherWeakerSpecies;

    const adjacentReacheableTileIds =
      this.tileService.getAdjacentTileIdsWithinRange(originTile.id, range);

    // Gets other species in the given range.
    adjacentReacheableTileIds.forEach((tileId) => {
      const tile = this.tileQuery.getEntity(tileId.toString());
      const otherTileSpecies = this.speciesQuery.otherTileSpecies(tile);
      // Filters tile species with only weaker ones.
      const weakerSpecies = otherTileSpecies.filter((defendingTileSpecies) =>
        this.isAttackingSpeciesStrongerThan(
          attackingSpecies,
          defendingTileSpecies
        )
      );
      // Adds tile id to results.
      const weakerSpeciesWithTileId = weakerSpecies.map((species) => {
        return { ...species, tileId: tile.id };
      });

      // Pushes results and filters the attacking species.
      otherWeakerSpecies.push(
        ...weakerSpeciesWithTileId.filter(
          (species) => species.id !== attackingSpecies.id
        )
      );
    });
    return otherWeakerSpecies;
  }

  private isAttackingSpeciesStrongerThan(
    attackingSpecies: TileSpecies,
    defendingSpecies: TileSpecies
  ): boolean {
    const superAttackingSpecies =
      this.superchargeTileSpeciesWithAssimilationValues([attackingSpecies])[0];
    const superDefendingSpecies =
      this.superchargeTileSpeciesWithAssimilationValues([defendingSpecies])[0];

    return superAttackingSpecies.strength > superDefendingSpecies.defense;
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

  // ACTIVE ACTIONS
  public get canActiveAbility$(): Observable<boolean> {
    return this.speciesQuery.activeSpeciesActiveAbilities$.pipe(
      map((abilities) =>
        abilities.map((ability) => this.isSpeciesAbilityValid(ability.id))
      ),
      map((booleans) => this.speciesQuery.doesBooleansContainsTrue(booleans))
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
  public speciesHasAbility(speciesId: string, abilityId: AbilityId): boolean {
    const speciesAbilityIds = this.getSpeciesAbilityIds(speciesId);
    return speciesAbilityIds.includes(abilityId);
  }

  private getSpeciesAbilityIds(speciesId: string) {
    const species = this.speciesQuery.getEntity(speciesId);
    return species.abilities.map((ability) => ability.id);
  }

  public getAbilityValue(abilityId: AbilityId): number {
    const ability = this.getAbilityWithId(abilityId);
    return ability.value;
  }

  private getAbilityRequiredValue(abilityId: AbilityId): number {
    const ability = this.getAbilityWithId(abilityId);
    return ability.requiredValue;
  }

  private getAbilityWithId(abilityId: AbilityId): Ability {
    return ABILITIES.filter((ability) => ability.id === abilityId)[0];
  }

  // ASSIMILATION ABILITIES
  // Uses tile species for defensive values
  // (active species is always the attacker).
  public applyAssimilationAbilitiesToSpecies(
    defaultValues: AssimilationValues,
    speciesId: string,
    tileSpecies?: TileSpecies
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

    // If range, updates range.
    if (this.speciesHasAbility(speciesId, 'range'))
      updatedValues.range += this.getAbilityValue('range');

    // If survival and species as no co-species nearby, updates defense (to be invincible).
    if (
      this.speciesHasAbility(speciesId, 'survival') &&
      (this.isSpeciesAbilityValid('survival'), tileSpecies)
    )
      updatedValues.defense += this.getAbilityValue('survival');

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
    if (
      this.speciesHasAbility(activeSpeciesId, 'nest') &&
      this.isSpeciesAbilityValid('nest')
    )
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
    if (
      this.speciesHasAbility(activeSpeciesId, 'hounds') &&
      this.isSpeciesAbilityValid('hounds')
    )
      updatedValues = {
        ...defaultValues,
        movingQuantity: this.getAbilityValue('hounds'),
        migrationUsed: defaultValues.traveledDistance,
      };

    return updatedValues;
  }

  // ABILITY UTILS
  // Checks ability requirements.
  private isSpeciesAbilityValid(
    abilityId: AbilityId,
    checkedSpecies?: TileSpecies
  ): boolean {
    // If no species is specified, then takes active.
    checkedSpecies = checkedSpecies
      ? checkedSpecies
      : this.speciesQuery.getActive();
    const requiredValue = this.getAbilityRequiredValue(abilityId);

    let isAbilityValid: boolean;

    // Checks that species quantity is enough.
    if (abilityId === 'nest' || 'hounds') {
      const speciesQuantity = this.tileQuery.getTileSpeciesCount(
        checkedSpecies,
        checkedSpecies.tileId
      );

      isAbilityValid = speciesQuantity >= requiredValue;
    }

    // Checks that the species has no co-species around
    if (abilityId === 'survival' && !!checkedSpecies.tileId) {
      console.log(abilityId, checkedSpecies);
      let adjacentSpecies: Species[];
      const adjacentTileIds = this.tileService.getAdjacentTileIdsWithinRange(
        checkedSpecies.tileId,
        1
      );
      adjacentTileIds.forEach((tileId) =>
        adjacentSpecies.push(...this.speciesQuery.getTileSpecies(tileId))
      );
      const adjacentCoSpecies = adjacentSpecies.filter(
        (species) => species.id === checkedSpecies.id
      );

      isAbilityValid = adjacentCoSpecies.length === 0;
    }

    return isAbilityValid;
  }
}
