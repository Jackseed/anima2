// Angular
import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';

// Firebase
import firebase from 'firebase/app';

// Akita
import { CollectionConfig, CollectionService } from 'akita-ng-fire';

// States
import {
  DEFAULT_ACTION_PER_TURN,
  DEFAULT_REMAINING_MIGRATIONS,
  createGame,
  startState,
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

  // TODO: refactor this
  public async createNewGame(name: string): Promise<string> {
    const gameId = this.db.createId();
    const playerId = (await this.afAuth.currentUser).uid;
    const playerIds = [playerId];
    const playerRef = this.db
      .collection(`games/${gameId}/players`)
      .doc(playerId).ref;
    const primaryColor = '#35A4B5';
    const secondaryColor = '#2885A1';

    const gameRef = this.db.collection('games').doc(gameId).ref;
    let batch = this.db.firestore.batch();
    const completeNeutralSpecies: Species[] = [];

    // Adds random ability to neutrals, creates them and saves their abilities.
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
      completeNeutralSpecies.push(neutralSpecies);
      usedAbilities.push(ability);
      batch.set(speciesRef, neutralSpecies);
    });

    const game = createGame({
      id: gameId,
      name,
      playerIds,
      activePlayerId: playerId,
      inGameAbilities: usedAbilities,
    });

    // Sets tiles.
    batch = this.tileService.batchSetTiles(
      gameId,
      batch,
      completeNeutralSpecies
    );

    // TODO: move species creation later
    // Creates players.
    const speciesId = this.db.createId();
    const player = createPlayer(
      playerId,
      [speciesId],
      primaryColor,
      secondaryColor
    );
    batch.set(playerRef, player);

    // Creates user's species.
    const speciesRef = this.db
      .collection(`games/${gameId}/species`)
      .doc(speciesId).ref;

    const species = createSpecies(speciesId, playerId, primaryColor);
    batch.set(speciesRef, species);

    // Creates the game.
    batch.set(gameRef, game);
    await batch
      .commit()
      .then((_) => this.store.setActive(gameId))
      .catch((error) => {
        console.log('Game creation failed: ', error);
      });
    return gameId;
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

  public async addPlayer(userId: string, gameId: string) {
    const playerIds = firebase.firestore.FieldValue.arrayUnion(userId);
    await this.db
      .doc(`games/${gameId}`)
      .update({ playerIds })
      .catch((error: any) => console.log('Adding a player failed: ', error));
  }

  public setActive(gameId: string): void {
    this.store.setActive(gameId);
  }

  public removeActive(): void {
    const activeGameId = this.query.getActiveId();
    this.store.removeActive(activeGameId);
  }

  public async switchStartState(startState: startState) {
    const id = this.query.getActiveId();
    await this.collection
      .doc(id)
      .update({ startState })
      .catch((error) => {
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

  public async incrementTurnCount() {
    const game = this.query.getActive();
    const gameRef = this.db.collection('games').doc(game.id).ref;
    const batch = this.db.firestore.batch();
    const increment = firebase.firestore.FieldValue.increment(1);

    batch.update(gameRef, { turnCount: increment });
    batch.update(gameRef, { remainingActions: DEFAULT_ACTION_PER_TURN });

    // every 3 turns, new era
    if ((game.turnCount + 1) % 3 === 0) {
      batch.update(gameRef, { eraCount: increment });
      this.countAllScore();
    }

    return batch.commit().catch((error) => {
      console.log('Transaction failed: ', error);
    });
  }

  public async decrementRemainingActions(resetMigration?: boolean) {
    const game = this.query.getActive();
    const gameRef = this.db.collection('games').doc(game.id).ref;
    const batch = this.db.firestore.batch();
    const decrement = firebase.firestore.FieldValue.increment(-1);

    batch.update(gameRef, { remainingActions: decrement });
    if (resetMigration)
      batch.update(gameRef, {
        remainingMigrations: DEFAULT_REMAINING_MIGRATIONS,
      });

    return batch.commit().catch((error) => {
      console.log('Transaction failed: ', error);
    });
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
        // initialize score
        if (!playerScores[player.id]) playerScores[player.id] = 0;
        // add region score if it's controled by player
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
