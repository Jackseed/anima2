// Angular
import { Injectable } from '@angular/core';

// Material
import { MatSnackBar } from '@angular/material/snack-bar';

// AngularFire
import { AngularFireAuth } from '@angular/fire/auth';
import { DocumentReference } from '@angular/fire/firestore';

// Firebase
import firebase from 'firebase/app';

// Akita
import { CollectionConfig, CollectionService } from 'akita-ng-fire';

// States
import {
  DEFAULT_ACTION_PER_TURN,
  createGame,
  StartStage,
  TileChoice,
  WINNING_POINTS,
  LAST_ERA,
  TESTING_ABILITY,
  RED_FIRST_COLORS,
  GREEN_FIRST_COLORS,
  RED_SECOND_COLORS,
  GREEN_SECOND_COLORS,
  Game,
  ActionData,
} from './game.model';
import { GameQuery } from './game.query';
import { GameStore, GameState } from './game.store';
import { Regions, Region, TileService, Tile } from 'src/app/board/tiles/_state';
import { PlayerQuery } from 'src/app/board/players/_state/player.query';
import {
  createPlayer,
  Player,
  RegionScores,
} from 'src/app/board/players/_state/player.model';
import {
  ABILITIES,
  Ability,
  createSpecies,
  GameAction,
  neutrals,
  Species,
} from 'src/app/board/species/_state/species.model';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'games' })
export class GameService extends CollectionService<GameState> {
  constructor(
    store: GameStore,
    private query: GameQuery,
    private afAuth: AngularFireAuth,
    private tileService: TileService,
    private playerQuery: PlayerQuery,
    private snackbar: MatSnackBar
  ) {
    super(store);
  }

  public async createNewGame(name: string): Promise<string> {
    const gameId = this.db.createId();
    let batch = this.db.firestore.batch();

    // Creates tiles.
    const tileBatchCreation = this.tileService.batchSetTiles(gameId, batch);
    batch = tileBatchCreation.batch;

    // Creates 1st player.
    const isGreen = Math.random() < 0.5;
    const color = isGreen ? 'green' : 'red';
    const isFirstPlayer = isGreen ? true : false;
    const playerBatchCreation = await this.createPlayerUsingBatch(
      gameId,
      color,
      batch
    );

    // Creates game object.
    batch = this.createGameUsingBatch(
      gameId,
      name,
      playerBatchCreation.playerId,
      playerBatchCreation.speciesId,
      isFirstPlayer,
      playerBatchCreation.batch
    );

    await batch
      .commit()
      .then((_) => {
        this.store.setActive(gameId);
        this.createNeutrals(gameId, tileBatchCreation.tiles);
      })
      .catch((error) => {
        console.log('Game creation failed: ', error);
      });
    return gameId;
  }

  // TODO: no need to update batch after each func?
  private createNeutrals(gameId: string, tiles: Tile[]) {
    let batch = this.db.firestore.batch();
    const gameRef = this.db.collection('games').doc(gameId).ref;
    const neutralBatchCreation = this.createNeutralSpeciesUsingBatch(
      gameId,
      batch
    );
    batch = this.tileService.addNeutralsOnTheirTiles(
      gameId,
      neutralBatchCreation.batch,
      neutralBatchCreation.allNeutrals,
      tiles
    );

    batch.update(gameRef, {
      inGameAbilities: neutralBatchCreation.usedAbilities,
    });

    batch.commit().catch((error) => {
      console.log('Neutrals creation failed: ', error);
    });
  }

  // Adds random ability to neutrals, creates them and saves their abilities.
  private createNeutralSpeciesUsingBatch(
    gameId: string,
    batch: firebase.firestore.WriteBatch
  ): {
    batch: firebase.firestore.WriteBatch;
    usedAbilities: Ability[];
    allNeutrals: Species[];
  } {
    const allNeutrals: Species[] = [];
    let usedAbilities: Ability[] = [];
    neutrals.forEach((species) => {
      const speciesRef = this.db
        .collection(`games/${gameId}/species`)
        .doc(species.id).ref;
      const ability = this.getRandomAbility(usedAbilities);
      const tileIds = this.tileService.generateNeutralTileIds();
      const neutralSpecies: Species = {
        ...species,
        tileIds,
        abilities: [ability],
      };
      allNeutrals.push(neutralSpecies);
      usedAbilities.push(ability);
      batch.set(speciesRef, neutralSpecies);
    });
    return { batch, usedAbilities, allNeutrals };
  }

  // Creates player & player's species docs.
  private async createPlayerUsingBatch(
    gameId: string,
    color: 'red' | 'green',
    existingBatch?: firebase.firestore.WriteBatch
  ): Promise<{
    playerId: string;
    speciesId: string;
    batch: firebase.firestore.WriteBatch;
  }> {
    const batch = existingBatch ? existingBatch : this.db.firestore.batch();
    const user = await this.afAuth.currentUser;
    const playerId = user.uid;
    const playerRef = this.db
      .collection(`games/${gameId}/players`)
      .doc(playerId).ref;
    const speciesId = this.db.createId();

    // Creates player doc.
    const player = createPlayer(playerId, user.displayName, [speciesId], color);
    batch.set(playerRef, player);

    // Creates player's species doc.
    const speciesRef = this.db
      .collection(`games/${gameId}/species`)
      .doc(speciesId).ref;
    const speciesColors =
      color === 'red' ? RED_FIRST_COLORS : GREEN_FIRST_COLORS;
    const species = createSpecies(speciesId, playerId, speciesColors);
    batch.set(speciesRef, species);

    return { playerId, speciesId, batch };
  }

  public createSecondSpeciesByBatch(
    playerId: string,
    batch: firebase.firestore.WriteBatch
  ): firebase.firestore.WriteBatch {
    const gameId = this.query.getActiveId();
    const speciesId = this.db.createId();
    const player = this.playerQuery.getEntity(playerId);

    // Creates species doc.
    const speciesRef = this.db
      .collection(`games/${gameId}/species`)
      .doc(speciesId).ref;
    const speciesColors =
      player.color == 'red' ? RED_SECOND_COLORS : GREEN_SECOND_COLORS;
    const species = createSpecies(speciesId, player.id, speciesColors);
    batch.set(speciesRef, species);

    // Updates player doc.
    const playerRef = this.db
      .collection(`games/${gameId}/players`)
      .doc(player.id).ref;
    const newSpeciesId = firebase.firestore.FieldValue.arrayUnion(speciesId);
    batch.update(playerRef, { speciesIds: newSpeciesId });

    return batch;
  }

  private createGameUsingBatch(
    gameId: string,
    name: string,
    playerId: string,
    playingSpeciesId: string,
    isFirstPlayer: boolean,
    batch: firebase.firestore.WriteBatch
  ): firebase.firestore.WriteBatch {
    const gameRef = this.db.collection('games').doc(gameId).ref;
    const game = createGame({
      id: gameId,
      name,
      playerIds: [playerId],
      playingPlayerId: isFirstPlayer ? playerId : '',
      playingSpeciesId: isFirstPlayer ? playingSpeciesId : '',
    });

    batch.set(gameRef, game);
    return batch;
  }

  // Needs to receive existing abilities while game creation,
  // gets it from game object afterwards.
  public getRandomAbility(existingAbilities?: Ability[]): Ability {
    // App testing cheat code
    const testingAbilityId: string = TESTING_ABILITY;
    const usedAbilities = existingAbilities
      ? existingAbilities
      : this.query.getActive().inGameAbilities;
    const usedAbilityIds = usedAbilities.map((ability: Ability) => ability.id);

    // Selects an ability only within unused abilities.
    const availableAbilities = ABILITIES.filter(
      (ability) => !usedAbilityIds.includes(ability.id)
    );

    const randomAbility =
      testingAbilityId !== ''
        ? ABILITIES.filter((ability) => ability.id === testingAbilityId)[0]
        : availableAbilities[
            Math.floor(Math.random() * availableAbilities.length)
          ];

    return randomAbility;
  }

  async getColorOfFirstPlayer(gameId: string): Promise<string> {
    const playersRef = this.db.collection(`games/${gameId}/players`);
    const playersSnapshot = await playersRef.get().toPromise();

    if (!playersSnapshot.empty) {
      const firstPlayer = playersSnapshot.docs[0].data() as Player;
      return firstPlayer.color;
    }

    return null;
  }

  // Creates player, player's species & update game docs.
  public async addActiveUserAsPlayer(gameId: string) {
    const existingPlayerColor = await this.getColorOfFirstPlayer(gameId);
    // Creates 2nd player.
    const color = existingPlayerColor == 'red' ? 'green' : 'red';
    const isFirstPlayer = color === 'green' ? true : false;

    const playerBatchCreation = await this.createPlayerUsingBatch(
      gameId,
      color
    );
    const firestorePlayerIds = firebase.firestore.FieldValue.arrayUnion(
      playerBatchCreation.playerId
    );

    const gameUpdateData: any = {
      playerIds: firestorePlayerIds,
    };

    if (isFirstPlayer) {
      gameUpdateData.playingPlayerId = playerBatchCreation.playerId;
      gameUpdateData.playingSpeciesId = playerBatchCreation.speciesId;
    }
    // Updates game doc.
    const gameRef = this.db.collection('games').doc(gameId).ref;
    const batch = playerBatchCreation.batch.update(gameRef, gameUpdateData);

    await batch
      .commit()
      .catch((error: any) => console.log('Adding a player failed: ', error));
  }

  public removeActive(): void {
    const activeGameId = this.query.getActiveId();
    this.store.removeActive(activeGameId);
  }

  // Adds a new tile choice or clear the tile choices.
  public async updateTileChoice(tileChoice?: TileChoice) {
    const gameId = this.query.getActiveId();
    const gameDoc = this.db.doc(`games/${gameId}`);
    const tileChoices = tileChoice
      ? firebase.firestore.FieldValue.arrayUnion(tileChoice)
      : [];

    return await gameDoc
      .update({ tileChoices })
      .catch((error) => console.log('Updating tile choice failed: ', error));
  }

  public async switchStartStage(startStage: StartStage) {
    const gameId = this.query.getActiveId();
    const gameDoc = this.db.doc(`games/${gameId}`);

    await gameDoc.update({ startStage }).catch((error) => {
      console.log('Switch start state failed: ', error);
    });
  }

  public async updateIsStarting(isStarting: boolean) {
    const id = this.query.getActiveId();
    await this.collection
      .doc(id)
      .update({ isStarting })
      .catch((error) => {
        console.log('isStarting update failed: ', error);
      });
  }

  public completePlayerAction(
    actionParams: {
      playerId: string;
      speciesId: string;
      action: GameAction;
      originTileId: number;
      data: ActionData;
    },
    existingBatch?: firebase.firestore.WriteBatch
  ) {
    let batch = existingBatch || this.db.firestore.batch();
    const game = this.query.getActive();
    const gameRef = this.db.collection('games').doc(game.id).ref;

    this.snackbar.open(
      `${`${actionParams.action
        .charAt(0)
        .toUpperCase()}${actionParams.action.slice(1)}`} effectuée !`,
      null,
      {
        duration: 800,
        panelClass: 'orange-snackbar',
      }
    );

    this.saveLastAction(actionParams, batch);
    this.updateRemainingActions(batch);
  }

  public saveLastAction(
    actionParams: {
      playerId: string;
      speciesId: string;
      action: GameAction;
      originTileId: number;
      data: ActionData;
    },
    existingBatch?: firebase.firestore.WriteBatch
  ): firebase.firestore.WriteBatch {
    const game = this.query.getActive();
    const gameRef = this.db.collection('games').doc(game.id).ref;
    const batch = existingBatch || this.db.firestore.batch();

    const actionId = `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
    batch.update(gameRef, {
      lastAction: { ...actionParams, id: actionId, isShown: false },
    });

    if (existingBatch) return batch;

    batch.commit().catch((error) => {
      console.log('Saving last action failed: ', error);
    });
  }

  public updateRemainingActions(existingBatch?: firebase.firestore.WriteBatch) {
    const game = this.query.getActive();
    const gameRef = this.db.collection('games').doc(game.id).ref;
    const batch = existingBatch || this.db.firestore.batch();
    const isLastAction = this.query.isLastAction;

    if (isLastAction) {
      // Change turn after the commit for the opponent message to appear before the turn change.
      batch
        .commit()
        .catch((error) => {
          console.log('Update remaining action failed: ', error);
        })
        .then(() => {
          this.skipTurn();
          return;
        });
    } else {
      // Updates game remaining actions.
      const remainingActions = firebase.firestore.FieldValue.increment(-1);
      batch.update(gameRef, { remainingActions });

      batch.commit().catch((error) => {
        console.log('Update remaining action failed: ', error);
      });
    }
  }

  public skipTurn() {
    const game = this.query.getActive();
    const gameRef = this.db.collection('games').doc(game.id).ref;
    const batch = this.db.firestore.batch();
    const remainingActions = DEFAULT_ACTION_PER_TURN;
    batch.update(gameRef, { remainingActions });
    this.tileService.removeActive();

    if (this.playerQuery.isLastActivePlayerSpeciesActive) {
      this.switchPlayingPlayerAndSpeciesUsingBatch(gameRef, batch);
      if (this.playerQuery.isLastPlayerPlaying) this.incrementTurnCount(batch);
    }
    // Otherwise activates the next species.
    else {
      batch.update(gameRef, {
        playingSpeciesId: this.playerQuery.activePlayerLastSpeciesId,
      });
    }
    batch.commit().catch((error) => {
      console.log('Skipping turn failed: ', error);
    });
  }

  private switchPlayingPlayerAndSpeciesUsingBatch(
    gameRef: DocumentReference,
    batch: firebase.firestore.WriteBatch
  ): firebase.firestore.WriteBatch {
    const unplayingPlayer = this.playerQuery.unplayingPlayer;

    batch.update(gameRef, { playingPlayerId: unplayingPlayer.id });
    batch.update(gameRef, { playingSpeciesId: unplayingPlayer.speciesIds[0] });

    return batch;
  }

  private incrementTurnCount(
    batch: firebase.firestore.WriteBatch
  ): firebase.firestore.WriteBatch {
    const game = this.query.getActive();
    const gameRef = this.db.collection('games').doc(game.id).ref;
    const increment = firebase.firestore.FieldValue.increment(1);

    // Every 3 turns, a new era begins.
    if (game.turnCount === 3) {
      this.countScores();

      batch.update(gameRef, {
        eraCount: increment,
        turnCount: 1,
      });
    } else {
      batch.update(gameRef, { turnCount: increment });
    }

    return batch;
  }

  public async prepareSecondSpecies() {
    const playerIds = this.playerQuery.allPlayerIds;
    await this.createSecondSpecies();
    this.updateIsStarting(true);
    this.switchStartStage('launching');
    this.playerQuery.switchReadyState(playerIds, true);
  }

  public async createSecondSpecies() {
    const playerIds = this.playerQuery.allPlayerIds;
    let batch = this.db.firestore.batch();
    for (const playerId of playerIds) {
      batch = this.createSecondSpeciesByBatch(playerId, batch);
    }

    await batch.commit().catch((error) => {
      console.log('Creating new species failed: ', error);
    });
  }

  public updateRemainingMigrations(
    remainingMigrations: number,
    batch: firebase.firestore.WriteBatch
  ): firebase.firestore.WriteBatch {
    const game = this.query.getActive();
    const gameRef = this.db.collection('games').doc(game.id).ref;

    return batch.update(gameRef, { remainingMigrations });
  }

  public saveAbilityUsedByBatch(
    ability: Ability,
    batch: firebase.firestore.WriteBatch
  ): firebase.firestore.WriteBatch {
    const gameId = this.query.getActiveId();
    const gameRef = this.db.doc(`games/${gameId}`).ref;
    const inGameAbilitiesUpdate =
      firebase.firestore.FieldValue.arrayUnion(ability);

    return batch.update(gameRef, { inGameAbilities: inGameAbilitiesUpdate });
  }

  public async countScores(): Promise<void> {
    const players: Player[] = this.playerQuery.getAll();
    const playerScores: { [playerId: string]: number } = {};
    const game: Game = this.query.getActive();
    let batch = this.db.firestore.batch();

    players.forEach((player: Player) => {
      const playerRef = this.db
        .collection(`games/${game.id}/players`)
        .doc(player.id).ref;
      const { playerRegionScores, eraScore } =
        this.calculatePlayerRegionScores(player);
      playerScores[player.id] = player.score + eraScore;

      batch = this.updatePlayerData(
        batch,
        playerRef,
        playerScores,
        playerRegionScores,
        player.id
      );
    });

    if (this.checkWinConditions(playerScores, game, batch)) {
      const winnerId = this.determineWinner(playerScores);
      batch = this.updatePlayerVictoryWithBatch(winnerId, false, batch);
    }

    return await batch
      .commit()
      .catch((error) => console.log('Updating score failed: ', error));
  }

  private calculatePlayerRegionScores(player: Player): {
    playerRegionScores: RegionScores;
    eraScore: number;
  } {
    let playerRegionScores: RegionScores = {};
    let eraScore = 0;

    Regions.forEach((region) => {
      if (this.isPlayerControllingRegion(player, region)) {
        playerRegionScores[region.name] = region.score;
        eraScore += region.score;
      } else {
        playerRegionScores[region.name] = 0;
      }
    });

    playerRegionScores.totalEra = eraScore;

    return { playerRegionScores, eraScore };
  }

  private updatePlayerData(
    batch: firebase.firestore.WriteBatch,
    playerRef: firebase.firestore.DocumentReference,
    playerScores: { [playerId: string]: number },
    playerRegionScores: RegionScores,
    playerId: string
  ): firebase.firestore.WriteBatch {
    return batch.update(playerRef, {
      score: playerScores[playerId],
      regionScores: playerRegionScores,
      isAnimationPlaying: true,
      animationState: 'endEraTitle',
    });
  }

  private checkWinConditions(
    playerScores: { [playerId: string]: number },
    game: Game,
    batch: firebase.firestore.WriteBatch
  ): boolean {
    if (
      Object.values(playerScores).some((score) => score >= WINNING_POINTS) ||
      game.eraCount === LAST_ERA
    )
      return true;

    return false;
  }

  private determineWinner(playerScores: {
    [playerId: string]: number;
  }): string {
    const playerIds = this.playerQuery.allPlayerIds;
    let winnerId: string;
    if (playerScores[playerIds[0]] > playerScores[playerIds[1]])
      winnerId = playerIds[0];
    if (playerScores[playerIds[0]] < playerScores[playerIds[1]])
      winnerId = playerIds[1];
    if (playerScores[playerIds[0]] === playerScores[playerIds[1]])
      winnerId = this.comparePlayersProperty('abilities');
    if (winnerId === 'draw') winnerId = this.comparePlayersProperty('tileIds');

    // If there's still a draw, randomly select one of the two players
    if (winnerId === 'draw')
      winnerId = playerIds[Math.floor(Math.random() * playerIds.length)];

    return winnerId;
  }

  // Compare which player has more abilities or tileIds.
  public comparePlayersProperty(propertyName: 'abilities' | 'tileIds'): string {
    const players = this.playerQuery.allPlayersSuperchargedWithSpecies;
    let maxPropertyCount = 0;
    let winnerId = '';

    for (const player of players) {
      const playerSpecies = player.species;
      let playerPropertyCount = 0;

      for (const species of playerSpecies) {
        playerPropertyCount += species[propertyName].length;
      }

      if (playerPropertyCount > maxPropertyCount) {
        maxPropertyCount = playerPropertyCount;
        winnerId = player.id;
      } else if (playerPropertyCount === maxPropertyCount) {
        winnerId = 'draw';
      }
    }

    return winnerId;
  }

  public isPlayerControllingRegion(player: Player, region: Region): boolean {
    const playerSpeciesTileIds =
      this.playerQuery.getPlayerSpeciesTileIds(player);
    let isPlayerControllingRegion: boolean = true;

    region.tileIds.forEach((tileId) => {
      if (isPlayerControllingRegion)
        playerSpeciesTileIds.includes(tileId)
          ? (isPlayerControllingRegion = true)
          : (isPlayerControllingRegion = false);
    });

    return isPlayerControllingRegion;
  }

  public async updatePlayerVictory(
    playerId: string,
    isAnnihilation: boolean
  ): Promise<void> {
    let batch = this.db.firestore.batch();
    batch = this.updatePlayerVictoryWithBatch(playerId, isAnnihilation, batch);

    return batch.commit().catch((error) => {
      console.log('Updating victory failed: ', error);
    });
  }

  public updatePlayerVictoryWithBatch(
    playerId: string,
    isAnnihilation: boolean,
    batch: firebase.firestore.WriteBatch
  ): firebase.firestore.WriteBatch {
    const gameId = this.query.getActiveId();
    const gameRef = this.db.collection('games').doc(gameId).ref;

    batch.update(gameRef, {
      isFinished: true,
      winnerId: playerId,
    });

    const players = this.playerQuery.getAll();
    for (const player of players) {
      const userRef = this.db.collection('users').doc(player.id).ref;

      // Update gamesPlayed, matchesPlayed, and matchesWon in the user document
      batch.update(userRef, {
        gamesPlayed: firebase.firestore.FieldValue.arrayUnion(gameId),
        matchesPlayed: firebase.firestore.FieldValue.increment(1),
        matchesWon:
          player.id === playerId
            ? firebase.firestore.FieldValue.increment(1)
            : firebase.firestore.FieldValue.increment(0),
      });

      if (isAnnihilation) {
        const playerRef = this.db
          .collection(`games/${gameId}/players`)
          .doc(player.id).ref;
        // Activate victory animation
        batch.update(playerRef, {
          isAnimationPlaying: true,
          animationState: 'victory',
        });
      }
    }

    return batch;
  }

  public updateUiAdaptationMenuOpen(bool: boolean) {
    const gameId = this.query.getActiveId();
    this.store.ui.update(gameId, { isAdaptationMenuOpen: bool });
  }

  public updateActionMessage(actionMessage: string) {
    const gameId = this.query.getActiveId();
    this.store.ui.update(gameId, { actionMessage });
  }

  public async updateLastActionShown(bool: boolean): Promise<void> {
    const gameId = this.query.getActiveId();
    const gameRef = this.db.collection('games').doc(gameId).ref;

    // Update the lastAction.isShown field in the game document
    return gameRef
      .update({
        'lastAction.isShown': bool,
      })
      .catch((error) => {
        console.log('Updating lastAction.isShown failed: ', error);
      });
  }
}
