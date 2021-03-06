import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';
import { actionPerTurn, colonizationCount, createGame } from './game.model';
import { GameQuery } from './game.query';
import { GameStore, GameState } from './game.store';
import firebase from 'firebase/app';
import { Regions, Region } from 'src/app/board/tiles/_state';
import {
  createPlayer,
  Player,
  PlayerQuery,
} from 'src/app/board/players/_state';
import {
  abilityIds,
  createSpecies,
  SpeciesQuery,
} from 'src/app/board/species/_state';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'games' })
export class GameService extends CollectionService<GameState> {
  constructor(
    store: GameStore,
    private query: GameQuery,
    private playerQuery: PlayerQuery,
    private speciesQuery: SpeciesQuery,
    private afAuth: AngularFireAuth
  ) {
    super(store);
  }

  public async createNewGame(name: string): Promise<string> {
    const id = this.db.createId();
    const playerId = (await this.afAuth.currentUser).uid;
    const playerIds = [playerId];
    const playerRef = this.db.collection(`games/${id}/players`).doc(playerId)
      .ref;
    // TODO: randomize first player
    const game = createGame({ id, name, playerIds, activePlayerId: playerId });
    const gameRef = this.db.collection('games').doc(game.id).ref;
    const batch = this.db.firestore.batch();

    batch.set(gameRef, game);

    const speciesId = this.db.createId();
    const player = createPlayer(playerId, [speciesId]);
    batch.set(playerRef, player);

    // TODO: move species creation later
    const speciesRef = this.db.collection(`games/${id}/species`).doc(speciesId)
      .ref;
    const randomAbility =
      abilityIds[Math.floor(Math.random() * abilityIds.length)];
    const species = createSpecies(speciesId, playerId, [randomAbility], []);
    batch.set(speciesRef, species);

    // Create the game
    await batch.commit().catch((error) => {
      console.log('Transaction failed: ', error);
    });
    return id;
  }

  public async switchActionType(
    actionType: '' | 'newSpecies' | 'proliferate' | 'colonize' | 'newAbility'
  ) {
    const id = this.query.getActiveId();
    await this.collection
      .doc(id)
      .update({ actionType })
      .catch((error) => {
        console.log('Transaction failed: ', error);
      });
  }

  public async incrementTurnCount() {
    const game = this.query.getActive();
    const gameRef = this.db.collection('games').doc(game.id).ref;
    const batch = this.db.firestore.batch();
    const increment = firebase.firestore.FieldValue.increment(1);

    batch.update(gameRef, { turnCount: increment });
    batch.update(gameRef, { remainingActions: actionPerTurn });

    // every 3 turns, new era
    if ((game.turnCount + 1) % 3 === 0) {
      batch.update(gameRef, { eraCount: increment });
      this.countAllScore();
    }

    return batch.commit().catch((error) => {
      console.log('Transaction failed: ', error);
    });
  }

  public async decrementRemainingActions() {
    const game = this.query.getActive();
    const gameRef = this.db.collection('games').doc(game.id).ref;
    const batch = this.db.firestore.batch();
    const decrement = firebase.firestore.FieldValue.increment(-1);

    batch.update(gameRef, { remainingActions: decrement });
    batch.update(gameRef, { colonizationCount: colonizationCount });

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
    // iterates on player species to add their tileIds to playerTiles
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

    // creates a boolean to know if the player control the region
    const isPlayerControling = new Array(players.length).fill(true);

    // iterates on region tiles to check if players control it
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
}
