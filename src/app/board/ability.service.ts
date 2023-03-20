// Angular
import { Injectable } from '@angular/core';

// Firebase
import firebase from 'firebase/app';

// AngularFire
import { AngularFirestore } from '@angular/fire/firestore';

// Rxjs
import { combineLatest, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

// Material
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

// States
import {
  ADAPATION_SPECIES_NEEDED,
  DEFAULT_REMAINING_MIGRATIONS,
  GameQuery,
  GameService,
  MAX_SPECIES_ABILITIES,
} from '../games/_state';
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
  GameAction,
  GAME_ACTIONS,
} from './species/_state';
import { Tile, TileQuery, TileService } from './tiles/_state';

@Injectable({
  providedIn: 'root',
})
export class AbilityService {
  constructor(
    private db: AngularFirestore,
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
    const activeSpecies = this.speciesQuery.getActive();
    const previousTileId = Number(this.tileQuery.getActiveId());
    const migrationValues = this.getMigrationValues(destinationId);
    const remainginMigrations = this.remainingMigrations;

    this.tileService.removeActive();
    this.tileService.removeReachable();
    (
      this.speciesService.move({
        movingSpecies: activeSpecies,
        quantity: migrationValues.movingQuantity,
        destinationId,
        previousTileId,
        migrationUsed: migrationValues.migrationUsed,
      }) as Promise<void>
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
          this.gameService.updateRemainingActions();
          this.gameService.updateRemainingMigrations(
            DEFAULT_REMAINING_MIGRATIONS
          );
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
    let traveledDistance =
      this.tileQuery.getDistanceFromActiveTileToDestinationTileId(
        destinationTileId
      );
    // Traveled distance can be null if classic migration is not used (tunnel), then set to 1.
    if (!traveledDistance) traveledDistance = 1;
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

  public get isThereMigrationToFinish(): boolean {
    const game = this.gameQuery.getActive();

    return (
      this.remainingMigrations < DEFAULT_REMAINING_MIGRATIONS &&
      this.remainingMigrations > 0 &&
      game.remainingActions === 1
    );
  }

  // PROLIFERATION
  // Proliferates on active tile or specific tileId if set.
  public async proliferate(tileId?: number) {
    const activeSpecies = this.speciesQuery.getActive();
    const proliferationTileId = tileId
      ? tileId
      : Number(this.tileQuery.getActiveId());
    const proliferationValues = this.applyProliferationAbilities(true);

    this.tileService.removeActive();
    this.tileService.removeProliferable();

    (
      this.speciesService.move({
        movingSpecies: activeSpecies,
        quantity: proliferationValues.createdQuantity,
        destinationId: proliferationTileId,
      }) as Promise<void>
    )
      .then(() => {
        this.gameService.updateRemainingActions();
        this.snackbar.open('Prolifération effectuée !', null, {
          duration: 800,
          panelClass: 'orange-snackbar',
        });
      })
      .catch((error) => {
        console.log('Proliferate failed: ', error);
      });
  }

  // PROLIFERATION - UTILS
  public setupProliferation() {
    const activeSpeciesId = this.speciesQuery.getActiveId();
    if (this.speciesHasAbility(activeSpeciesId, 'spontaneousGeneration'))
      return this.applyProliferationAbilities();
    this.proliferate();
  }

  // TODO: refactor & factorize abilities utils
  // PROLIFERATION - UTILS - Checks if it's a valid proliferation.
  // Verifies a tile is active, the attacked tile is valid and the species can act.
  public isProliferationValid(selectedTileId: number): boolean {
    const selectedTile = this.tileQuery.getEntity(selectedTileId.toString());
    const isProliferationValid =
      this.tileQuery.hasActive() && selectedTile.isProliferable;

    return isProliferationValid;
  }

  // ASSIMILATION
  // Removes one species from a tile and adds one to the active species.
  public async assimilate(removedSpeciesId: string, removedTileId: number) {
    const removedSpecies = this.speciesQuery.getEntity(removedSpeciesId);
    const activeSpecies = this.speciesQuery.getActive();
    const activeTileId = Number(this.tileQuery.getActiveId());
    const assimilationValues = this.applyAssimilationAbilitiesToSpecies(
      createAssimilationValues(),
      activeSpecies.id
    );

    this.tileService.removeAttackable();

    // Removes the assimilated species.
    const assimilatedPromise = this.speciesService.move({
      movingSpecies: removedSpecies,
      quantity: assimilationValues.assimilatedQuantity,
      destinationId: removedTileId,
      attackingSpecies: activeSpecies,
    }) as Promise<void>;
    // Adds quantity to the assimilating species.
    const assimilatingPromise = this.speciesService.move({
      movingSpecies: activeSpecies,
      quantity: assimilationValues.createdQuantity,
      destinationId: activeTileId,
    }) as Promise<void>;

    Promise.all([assimilatedPromise, assimilatingPromise]).then((_) =>
      this.gameService.updateRemainingActions()
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
    let otherWeakerSpeciesWithTileId = otherWeakerSpecies.map((species) => {
      return { ...species, tileId: Number(originTile.id) };
    });

    if (range === 0) return otherWeakerSpecies;

    const adjacentReacheableTileIds =
      this.tileService.getAdjacentTileIdsWithinRange(
        Number(originTile.id),
        range
      );

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
      otherWeakerSpeciesWithTileId.push(
        ...weakerSpeciesWithTileId.filter(
          (species) => species.id !== attackingSpecies.id
        )
      );
    });
    return otherWeakerSpeciesWithTileId;
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
  public async adapt(ability: Ability, speciesId: string) {
    let batch = this.db.firestore.batch();
    const adaptingSpecies = this.speciesQuery.getEntity(speciesId);
    const isGameStarting = this.gameQuery.isStarting;

    // Updates game abilities used.
    batch = this.gameService.saveAbilityUsedByBatch(ability, batch);

    // Resets ability choices.
    batch = this.playerService.resetAbilityChoicesByBatch(ability, batch);

    // Updates species doc with the new ability.
    batch = this.speciesService.addAbilityToSpeciesByBatch(
      ability,
      adaptingSpecies,
      batch
    );

    // If the game isn't started, count adaptation as an action.
    if (!isGameStarting) {
      const activeTileId = Number(this.tileQuery.getActiveId());
      // Removes the sacrified species.
      batch = this.speciesService.move(
        {
          movingSpecies: adaptingSpecies,
          quantity: -ADAPATION_SPECIES_NEEDED,
          destinationId: activeTileId,
        },
        batch
      ) as firebase.firestore.WriteBatch;

      // Decounts an action.
      batch = await this.gameService.updateRemainingActions(batch);
    }

    batch
      .commit()
      .then(() => {
        this.gameService.updateUiAdaptationMenuOpen(false);
        this.snackbar.open(`${ability.fr.name} obtenu !`, null, {
          duration: 800,
          panelClass: 'orange-snackbar',
        });
      })
      .catch((error) => console.log('Adapt failed: ', error));
  }

  // ACTIVE ABILITIES
  public canActiveAbility$(abilityId: AbilityId): Observable<boolean> {
    return this.tileQuery
      .selectActiveId()
      .pipe(map((_) => this.isSpeciesAbilityValid(abilityId)));
  }

  // Moves rallied species to the active tile species.
  public rallying(ralliedTileId: number) {
    const activeTileId = Number(this.tileQuery.getActiveId());
    const activeSpecies = this.speciesQuery.getActive();
    const movingQuantity = this.tileQuery.getTileSpeciesCount(
      activeSpecies.id,
      ralliedTileId
    );

    this.tileService.removeRallyable();

    (
      this.speciesService.move({
        movingSpecies: activeSpecies,
        quantity: movingQuantity,
        destinationId: activeTileId,
        previousTileId: ralliedTileId,
      }) as Promise<void>
    ).then((_) => {
      // TODO: factorize this
      this.gameService.updateRemainingActions();
      this.snackbar.open('Cri de ralliement effectué !', null, {
        duration: 800,
        panelClass: 'orange-snackbar',
      });
    });
  }

  // Marks adjacent active species rallyable.
  public setupRallying() {
    const range = this.getAbilityValue('rallying');
    const activeTileId = Number(this.tileQuery.getActiveId());
    const adjacentActiveSpeciesTileIds =
      this.speciesQuery.adjacentActiveSpeciesTileIds(activeTileId, range);
    this.tileService.markAsRallyable(adjacentActiveSpeciesTileIds);
  }

  public isRallyingValid(selectedTileId: number): boolean {
    const selectedTile = this.tileQuery.getEntity(selectedTileId.toString());
    const isRallyingValid =
      this.tileQuery.hasActive() && selectedTile.isRallyable;

    return isRallyingValid;
  }

  // TODO: factorize this
  public get isRallyingOngoing$(): Observable<boolean> {
    return this.tileQuery
      .selectCount(({ isRallyable }) => isRallyable)
      .pipe(
        map((rallyableTileQuantity) =>
          rallyableTileQuantity > 0 ? true : false
        )
      );
  }

  // Allows to move on any other active species individual.
  public tunnel() {
    const activeTileId = Number(this.tileQuery.getActiveId());
    const activeSpeciesTileIds = this.speciesQuery.getActive().tileIds;
    // Removes active & duplicates.
    const activeSpeciesPossibleTileIds = [
      ...new Set(
        activeSpeciesTileIds.filter((tileId) => tileId !== activeTileId)
      ),
    ];

    this.tileService.markAsReachable(activeSpeciesPossibleTileIds);
  }

  // Moves a species to a random adjacent tile.
  public async intimidate(intimidatedSpecies: TileSpecies, tileId: number) {
    const activeTileSpecies = this.speciesQuery.activeTileSpecies;
    const intimidateValue = this.getAbilityValue('intimidate');
    const adjacentTileIds = this.tileQuery.getAdjacentTileIds(
      tileId,
      intimidateValue
    );
    const randomAdjacentTileId =
      adjacentTileIds[Math.floor(Math.random() * adjacentTileIds.length)];
    // Moves the same quantity as the active species.
    const movingQuantity =
      activeTileSpecies.quantity > intimidatedSpecies.quantity
        ? intimidatedSpecies.quantity
        : activeTileSpecies.quantity;

    await this.speciesService.move({
      movingSpecies: intimidatedSpecies,
      quantity: movingQuantity,
      destinationId: randomAdjacentTileId,
      previousTileId: tileId,
    });
    this.gameService.updateRemainingActions();
  }

  // UTILS - Checks species quantity on a tile.
  // Indicates if a species is more than a specific amount on a tile.
  public isSpeciesQuantityGreatherThan(
    speciesId: string,
    tileId: number,
    num: number
  ): boolean {
    const tileSpeciesCount = this.tileQuery.getTileSpeciesCount(
      speciesId,
      tileId
    );
    return tileSpeciesCount >= num ? true : false;
  }

  // ABILITY - UTILS
  // GETTERS
  public speciesHasAbility(speciesId: string, abilityId: AbilityId): boolean {
    const speciesAbilityIds = this.getSpeciesAbilityIds(speciesId);
    return speciesAbilityIds?.includes(abilityId);
  }

  private getSpeciesAbilityIds(speciesId: string) {
    const species = this.speciesQuery.getEntity(speciesId);
    return species?.abilities.map((ability) => ability.id);
  }

  public getAbilityValue(abilityId: AbilityId): number {
    const ability = this.getAbilityWithId(abilityId);
    return ability.value;
  }

  private getAbilityRequiredValue(abilityId: AbilityId): number {
    const ability = this.getAbilityWithId(abilityId);
    return ability.requiredValue;
  }

  public getAbilityFrDefinition(abilityId: AbilityId): string {
    const ability = this.getAbilityWithId(abilityId);
    return ability.fr.definition;
  }

  private getAbilityWithId(abilityId: AbilityId): Ability {
    return ABILITIES.filter((ability) => ability.id === abilityId)[0];
  }

  public isActionOngoing$(action: GameAction): Observable<boolean> {
    const game = this.gameQuery.getActive();
    if (game.isStarting) return of(false);
    // Gets tile count concerned by the action
    let concernedTiles: Observable<number> = this.tileQuery.selectCount(
      (tile) => {
        if (action === 'assimilation') return tile.isAttackable;
        if (action === 'migration') return tile.isReachable;
        if (action === 'proliferation') return tile.isProliferable;
        if (action === 'rallying') return tile.isRallyable;
      }
    );

    return concernedTiles.pipe(
      map((tileQuantity) => (tileQuantity > 0 ? true : false))
    );
  }

  // If no action is given, tells if an action is ongoing.
  public isAnotherActionOngoing$(action?: GameAction): Observable<boolean> {
    const otherActions = GAME_ACTIONS.filter(
      (actionItem) => actionItem !== action
    );
    const areOtherActionsOngoing$: Observable<boolean>[] = otherActions.map(
      (action) => this.isActionOngoing$(action)
    );

    return combineLatest(areOtherActionsOngoing$).pipe(
      map((areOtherActionsOngoing: boolean[]) => {
        let finalResult: boolean = false;
        for (const result of areOtherActionsOngoing) {
          finalResult = result || finalResult;
        }
        return finalResult;
      })
    );
  }

  // Indicates weither active species can activate an action.
  public canActivateAction$(action: GameAction): Observable<boolean> {
    const activeTileSpecies$ = this.speciesQuery.activeTileSpecies$;
    const activeTile$ = this.tileQuery.selectActive();
    const proliferationValues = this.applyProliferationAbilities(true);

    return combineLatest([activeTileSpecies$, activeTile$]).pipe(
      map(([activeTileSpecies, tile]) => {
        if (!!!tile || !!!activeTileSpecies) return false;

        // Checks there is an active species in the active tile.
        if (action === 'migration')
          return this.isSpeciesQuantityGreatherThan(
            activeTileSpecies.id,
            Number(tile.id),
            1
          );

        // Disables new action if a migration is ongoing on the last action.
        if (this.isThereMigrationToFinish) return false;

        // Checks that active species is stronger than another species on range.
        if (action === 'assimilation') {
          return this.isSpeciesStrongerThanRangeSpecies(
            tile,
            activeTileSpecies
          );
        }

        // Checks if there are more than the needed individuals on the tile.
        if (action === 'proliferation')
          return this.isSpeciesQuantityGreatherThan(
            activeTileSpecies.id,
            Number(tile.id),
            proliferationValues.neededIndividuals
          );

        // Checks if there are more than the needed individuals on the tile
        // & that the species has less abilities than the max.
        if (action === 'adaptation') {
          const activeSpecies = this.speciesQuery.getActive();
          const game = this.gameQuery.getActive();
          if (activeSpecies.abilities.length === MAX_SPECIES_ABILITIES)
            return false;
          if (game.inGameAbilities.length === ABILITIES.length) return false;
          return this.isSpeciesQuantityGreatherThan(
            activeTileSpecies.id,
            Number(tile.id),
            ADAPATION_SPECIES_NEEDED
          );
        }
      })
    );
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
    const species = this.speciesQuery.getEntity(speciesId);
    // If it's a neutral species, doesn't apply ability.
    if (!!!species || species.playerId === 'neutral') return updatedValues;

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
    isOnlyUpdatingValues?: boolean
  ): ProliferationValues {
    const activeSpeciesId = this.speciesQuery.getActiveId();
    let updatedValues: ProliferationValues = createProliferationValues();

    // If hermaphrodite, updates needed individuals.
    if (this.speciesHasAbility(activeSpeciesId, 'hermaphrodite'))
      updatedValues.neededIndividuals = this.getAbilityValue('hermaphrodite');

    // If nest and enough individuals, adds proliferation quantity.
    if (
      this.speciesHasAbility(activeSpeciesId, 'nest') &&
      this.isSpeciesAbilityValid('nest')
    )
      updatedValues.createdQuantity += this.getAbilityValue('nest');

    // If spontaneous generation and no tile proliferable, marks in range tile proliferable.
    if (
      this.speciesHasAbility(activeSpeciesId, 'spontaneousGeneration') &&
      !this.tileQuery.hasProliferableTile() &&
      this.tileQuery.hasActive() &&
      !isOnlyUpdatingValues
    ) {
      const activeTileId = Number(this.tileQuery.getActiveId());
      const range = this.getAbilityValue('spontaneousGeneration');
      let inRangeTileIds = this.tileQuery.getAdjacentTileIds(
        activeTileId,
        range
      );
      inRangeTileIds.push(activeTileId);

      this.tileService.markAsProliferable(inRangeTileIds);
    }

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
        checkedSpecies.id,
        checkedSpecies.tileId
      );

      isAbilityValid = speciesQuantity >= requiredValue;
    }

    // Checks that the defending species has no co-species around.
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

    // Checks that there is at least one other species and the active species on the active tile.
    if (abilityId === 'intimidate') {
      const isActiveSpeciesOnActiveTile = !!this.speciesQuery.activeTileSpecies;
      const isThereOtherSpecies =
        this.speciesQuery.otherTileSpecies()?.length > 0;

      isAbilityValid = isActiveSpeciesOnActiveTile && isThereOtherSpecies;
    }

    // Checks that migration is possible,
    // meaning a species is in the active tile and it remains migration points.
    if (abilityId === 'tunnel') {
      const activeSpecies = this.speciesQuery.activeTileSpecies;
      isAbilityValid = this.remainingMigrations > 0 && !!activeSpecies;
    }

    // Checks if an active species is around active tile & species
    if (abilityId === 'rallying') {
      const activeTileSpecies = this.speciesQuery.activeTileSpecies;
      if (!activeTileSpecies) return false;
      const range = this.getAbilityValue('rallying');
      const adjacentTileIdsWithActiveSpecies =
        this.speciesQuery.adjacentActiveSpeciesTileIds(
          activeTileSpecies.tileId,
          range
        );
      isAbilityValid = adjacentTileIdsWithActiveSpecies.length > 0;
    }

    return isAbilityValid;
  }
}
