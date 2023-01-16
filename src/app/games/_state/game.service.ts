// Angular
import { Injectable } from '@angular/core';

// AngularFire
import { AngularFireAuth } from '@angular/fire/auth';

// Firebase
import firebase from 'firebase/app';

// Akita
import { CollectionConfig, CollectionService } from 'akita-ng-fire';

// States
import {
  DEFAULT_ACTION_PER_TURN,
  createGame,
  StartStage,
  GREEN_PRIMARY_COLOR,
  GREEN_SECONDARY_COLOR,
  Colors,
  RED_PRIMARY_COLOR,
  RED_SECONDARY_COLOR,
} from './game.model';
import { GameQuery } from './game.query';
import { GameStore, GameState } from './game.store';
import { Regions, Region, TileService } from 'src/app/board/tiles/_state';
import { PlayerQuery } from 'src/app/board/players/_state/player.query';
import {
  createPlayer,
  Player,
} from 'src/app/board/players/_state/player.model';
import {
  ABILITIES,
  Ability,
  createSpecies,
  neutrals,
  Species,
} from 'src/app/board/species/_state/species.model';
import { SpeciesQuery } from 'src/app/board/species/_state/species.query';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'games' })
export class GameService extends CollectionService<GameState> {
  constructor(
    store: GameStore,
    private query: GameQuery,
    private afAuth: AngularFireAuth,
    private tileService: TileService,
    private playerQuery: PlayerQuery,
    private speciesQuery: SpeciesQuery
  ) {
    super(store);
  }

  public async createNewGame(name: string): Promise<string> {
    const gameId = this.db.createId();
    let batch = this.db.firestore.batch();

    // Creates neutrals.
    const neutralBatchCreation = this.neutralsBatchCreation(gameId, batch);

    // Creates tiles.
    batch = this.tileService.batchSetTiles(
      gameId,
      neutralBatchCreation.batch,
      neutralBatchCreation.allNeutrals
    );

    // Creates 1st player.
    const colors = {
      primary: GREEN_PRIMARY_COLOR,
      secondary: GREEN_SECONDARY_COLOR,
    };
    const playerBatchCreation = await this.playerBatchCreation(
      gameId,
      colors,
      batch
    );

    // Creates game object.
    batch = this.gameBatchCreation(
      gameId,
      name,
      playerBatchCreation.playerId,
      neutralBatchCreation.usedAbilities,
      playerBatchCreation.batch
    );

    await batch
      .commit()
      .then((_) => this.store.setActive(gameId))
      .catch((error) => {
        console.log('Game creation failed: ', error);
      });
    return gameId;
  }

  // Adds random ability to neutrals, creates them and saves their abilities.
  private neutralsBatchCreation(
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
      const neutralSpecies: Species = {
        ...species,
        abilities: [ability],
      };
      allNeutrals.push(neutralSpecies);
      usedAbilities.push(ability);
      batch.set(speciesRef, neutralSpecies);
    });
    return { batch, usedAbilities, allNeutrals };
  }

  // Creates player & player's species docs.
  private async playerBatchCreation(
    gameId: string,
    colors: Colors,
    existingBatch?: firebase.firestore.WriteBatch
  ): Promise<{
    playerId: string;
    batch: firebase.firestore.WriteBatch;
  }> {
    const batch = existingBatch ? existingBatch : this.db.firestore.batch();
    const playerId = (await this.afAuth.currentUser).uid;
    const playerRef = this.db
      .collection(`games/${gameId}/players`)
      .doc(playerId).ref;
    const speciesId = this.db.createId();

    // Creates player doc.
    const player = createPlayer(playerId, [speciesId], colors);
    batch.set(playerRef, player);

    // Creates player's species doc.
    const speciesRef = this.db
      .collection(`games/${gameId}/species`)
      .doc(speciesId).ref;

    const species = createSpecies(speciesId, playerId, colors);
    batch.set(speciesRef, species);

    return { playerId, batch };
  }

  private gameBatchCreation(
    gameId: string,
    name: string,
    playerId: string,
    usedAbilities: Ability[],
    batch: firebase.firestore.WriteBatch
  ): firebase.firestore.WriteBatch {
    const gameRef = this.db.collection('games').doc(gameId).ref;
    const game = createGame({
      id: gameId,
      name,
      playerIds: [playerId],
      playingPlayerId: playerId,
      inGameAbilities: usedAbilities,
    });

    batch.set(gameRef, game);
    return batch;
  }

  // Needs to receive existing abilities while game creation,
  // gets it from game object afterwards.
  public getRandomAbility(existingAbilities?: Ability[]): Ability {
    const usedAbilities = existingAbilities
      ? existingAbilities
      : this.query.getActive().inGameAbilities;
    const usedAbilityIds = usedAbilities.map((ability: Ability) => ability.id);

    // Selects an ability only within unused abilities.
    const availableAbilities = ABILITIES.filter(
      (ability) => !usedAbilityIds.includes(ability.id)
    );

    const randomAbility =
      availableAbilities[Math.floor(Math.random() * availableAbilities.length)];

    return randomAbility;
  }

  // Creates player, player's species & update game docs.

  public async addActiveUserAsPlayer(gameId: string) {
    // Creates 2nd player.
    const colors = {
      primary: RED_PRIMARY_COLOR,
      secondary: RED_SECONDARY_COLOR,
    };
    const playerBatchCreation = await this.playerBatchCreation(gameId, colors);
    const firestorePlayerIds = firebase.firestore.FieldValue.arrayUnion(
      playerBatchCreation.playerId
    );

    // Updates game doc.
    const gameRef = this.db.collection('games').doc(gameId).ref;
    const batch = playerBatchCreation.batch.update(gameRef, {
      playerIds: firestorePlayerIds,
    });

    await batch
      .commit()
      .catch((error: any) => console.log('Adding a player failed: ', error));
  }

  public setActive(gameId: string): void {
    this.store.setActive(gameId);
  }

  public removeActive(): void {
    const activeGameId = this.query.getActiveId();
    this.store.removeActive(activeGameId);
  }

  public async switchStartStage(startStage: StartStage) {
    const gameId = this.query.getActiveId();
    const gameDoc = this.db.doc(`games/${gameId}`);

    gameDoc.update({ startStage }).catch((error) => {
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

  public async updateRemainingActions(
    existingBatch?: firebase.firestore.WriteBatch
  ) {
    let batch = existingBatch ? existingBatch : this.db.firestore.batch();
    const game = this.query.getActive();
    const isLastAction = game.remainingActions === 1;
    const gameRef = this.db.collection('games').doc(game.id).ref;
    const remainingActions = isLastAction
      ? DEFAULT_ACTION_PER_TURN
      : firebase.firestore.FieldValue.increment(-1);

    // If that's the last remaining action, changes turn.
    if (isLastAction) {
      batch = await this.incrementTurnCount(batch);
    }

    batch.update(gameRef, { remainingActions });

    if (existingBatch) return batch;

    batch.commit().catch((error) => {
      console.log('Updating remaining actions failed: ', error);
    });
  }

  public async incrementTurnCount(
    batch: firebase.firestore.WriteBatch
  ): Promise<firebase.firestore.WriteBatch> {
    const game = this.query.getActive();
    const gameRef = this.db.collection('games').doc(game.id).ref;
    const increment = firebase.firestore.FieldValue.increment(1);
    const unplayingPlayerId = this.playerQuery.unplayingPlayerId;

    batch.update(gameRef, { turnCount: increment });
    batch.update(gameRef, { playingPlayerId: unplayingPlayerId });

    // Every 3 turns, a new era begins.
    if ((game.turnCount + 1) % 3 === 0) {
      batch.update(gameRef, { eraCount: increment });
      this.countAllScore();
    }

    return batch;
  }

  public async updateRemainingMigrations(remainingMigrations: number) {
    const game = this.query.getActive();
    const gameDoc = this.db.collection('games').doc(game.id);

    await gameDoc.update({ remainingMigrations }).catch((error) => {
      console.log('Updating remaining migrations failed: ', error);
    });
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

  public countAllScore() {
    const players = this.playerQuery.getAll();
    const regionScores = {};
    const playerScores = {};
    const regions = Regions;
    const gameId = this.query.getActiveId();
    const batch = this.db.firestore.batch();

    regions.forEach((region) => {
      regionScores[region.name] = this.countScore(region);
      players.forEach((player, index: number) => {
        // Initializes score.
        if (!playerScores[player.id]) playerScores[player.id] = 0;
        // Adds region score if it's controled by player.
        playerScores[player.id] += regionScores[region.name][index]
          ? region.score
          : 0;
      });
    });

    players.forEach((player) => {
      const playerRef = this.db
        .collection(`games/${gameId}/players`)
        .doc(player.id).ref;

      if (playerScores[player.id])
        batch.update(playerRef, {
          score: player.score + playerScores[player.id],
        });
    });

    batch.commit().catch((error) => {
      console.log('Transaction failed: ', error);
    });
  }

  public countScore(region: Region) {
    const players: Player[] = this.playerQuery.getAll();
    const playerTiles = {};
    // Iterates on player species to add their tileIds to playerTiles.
    players.forEach((player) =>
      player.speciesIds.forEach((speciesId) => {
        const species = this.speciesQuery.getEntity(speciesId);
        playerTiles.hasOwnProperty(player.id)
          ? (playerTiles[player.id] = [
              ...playerTiles[player.id],
              ...species.tileIds,
            ])
          : (playerTiles[player.id] = species.tileIds);
      })
    );

    // Creates a boolean to know if the player control the region.
    const isPlayerControling = new Array(players.length).fill(true);

    // Iterates on region tiles to check if players control it.
    region.tileIds.forEach((tileId) => {
      players.forEach((player, index: number) => {
        if (isPlayerControling[index])
          playerTiles[player.id].includes(tileId)
            ? (isPlayerControling[index] = true)
            : (isPlayerControling[index] = false);
      });
    });
    return isPlayerControling;
  }

  public updateUiAdaptationMenuOpen(bool: boolean) {
    this.store.ui.update(null, { isAdaptationMenuOpen: bool });
  }
}
