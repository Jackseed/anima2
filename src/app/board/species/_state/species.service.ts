// Angular
import { Injectable } from '@angular/core';

// Angularfire
import {
  AngularFirestoreDocument,
  DocumentReference,
} from '@angular/fire/firestore';

// Firebase
import firebase from 'firebase/app';

// Akita
import { RouterQuery } from '@datorama/akita-ng-router-store';
import { CollectionConfig, CollectionService } from 'akita-ng-fire';

// Material
import { MatDialog } from '@angular/material/dialog';

// States
import {
  Ability,
  AbilityId,
  MoveParameters,
  Species,
  TileSpecies,
} from './species.model';
import { SpeciesStore, SpeciesState } from './species.store';
import { SpeciesQuery } from './species.query';
import { Tile, TileQuery } from '../../tiles/_state';
import {
  GameQuery,
  GameService,
  MAX_SPECIES_ABILITIES,
} from 'src/app/games/_state';
import { PlayerQuery } from '../../players/_state/player.query';

@Injectable({ providedIn: 'root' })
@CollectionConfig({ path: 'games/:gameId/species' })
export class SpeciesService extends CollectionService<SpeciesState> {
  constructor(
    store: SpeciesStore,
    private query: SpeciesQuery,
    private gameQuery: GameQuery,
    private gameService: GameService,
    private tileQuery: TileQuery,
    private playerQuery: PlayerQuery,
    private routerQuery: RouterQuery,
    public dialog: MatDialog
  ) {
    super(store);
  }

  public setActive(id: string) {
    this.store.setActive(id);
  }

  public removeActive(id: string) {
    this.store.removeActive(id);
  }

  // Adds an ability to a species
  public addAbilityToSpeciesByBatch(
    ability: Ability,
    species: Species,
    batch: firebase.firestore.WriteBatch
  ): firebase.firestore.WriteBatch {
    if (species.abilities.length === MAX_SPECIES_ABILITIES) return batch;
    const gameId = this.gameQuery.getActiveId();
    const firestoreAbility = firebase.firestore.FieldValue.arrayUnion(ability);
    const speciesRef = this.db.doc(`games/${gameId}/species/${species.id}`).ref;

    return batch.update(speciesRef, { abilities: firestoreAbility });
  }

  // Updates a tile with an updated species object.
  public getUpdatedSpeciesOnTile(
    tile: Tile,
    speciesId: string,
    quantity: number,
    mainAbilityId: AbilityId
  ): TileSpecies[] {
    let updatedSpecies = [];
    const isSpeciesOnTile = this.query.isSpeciesOnTile(speciesId, tile);
    const species = this.query.getEntity(speciesId);

    // If the species isn't on the tile yet, adds it.
    if (!isSpeciesOnTile) {
      const tileSpecies: TileSpecies = {
        ...species,
        tileId: Number(tile.id),
        quantity,
        mainAbilityId,
      };
      updatedSpecies = tile.species.concat(tileSpecies);
    }

    // If species is already there, updates quantity.
    else {
      const speciesIndex = tile.species.findIndex(
        (specie) => specie.id === speciesId
      );
      updatedSpecies = JSON.parse(JSON.stringify(tile.species));
      const existingQuantity = updatedSpecies[speciesIndex].quantity;
      const newQuantity = existingQuantity + quantity;
      // If there is no more species on this tile, removes it.
      if (newQuantity <= 0) {
        updatedSpecies.splice(speciesIndex, 1);
      } else {
        // Otherwise, updates quantity.
        updatedSpecies[speciesIndex].quantity = newQuantity;
      }
    }
    return updatedSpecies;
  }

  // Moves species (from a tile) to a tile.
  public move(
    moveParams: MoveParameters,
    existingBatch?: firebase.firestore.WriteBatch
  ): firebase.firestore.WriteBatch | Promise<void> {
    const gameId = this.routerQuery.getParams().id;
    const gameDoc = `games/${gameId}`;
    let batch = existingBatch ? existingBatch : this.db.firestore.batch();

    // First, updates tileIds on the species doc.
    batch = this.batchUpdateMovingSpeciesTileIds(gameDoc, batch, moveParams);

    // Then, updates tile docs with new species quantity.
    batch = this.batchUpdateTileWithSpeciesQuantity(
      gameDoc,
      batch,
      moveParams.destinationId,
      moveParams.movingSpecies,
      moveParams.quantity
    );

    if (moveParams.previousTileId) {
      batch = this.batchUpdateTileWithSpeciesQuantity(
        gameDoc,
        batch,
        moveParams.previousTileId,
        moveParams.movingSpecies,
        -moveParams.quantity
      );
    }
    if (moveParams.migrationUsed) {
      // Finally, updates remaining migrations, if it's a move.
      batch = this.batchUpdateRemainingMigrations(
        gameDoc,
        batch,
        moveParams.migrationUsed
      );
    }

    if (existingBatch) return batch;

    return batch.commit().catch((err) => console.log('Move failed ', err));
  }

  private batchUpdateTileWithSpeciesQuantity(
    gameDoc: string,
    batch: firebase.firestore.WriteBatch,
    tileId: number,
    species: Species,
    quantity: number
  ): firebase.firestore.WriteBatch {
    const tileDoc: AngularFirestoreDocument<Tile> = this.db.doc<Tile>(
      `${gameDoc}/tiles/${tileId}`
    );
    const tile = this.tileQuery.getEntity(tileId.toString());
    const updatedSpecies = this.getUpdatedSpeciesOnTile(
      tile,
      species.id,
      quantity,
      species.abilities[0].id
    );
    return batch.update(tileDoc.ref, { species: updatedSpecies });
  }

  private batchUpdateMovingSpeciesTileIds(
    gameDoc: string,
    batch: firebase.firestore.WriteBatch,
    moveParams: MoveParameters
  ): firebase.firestore.WriteBatch {
    const speciesRef: DocumentReference<Species> = this.db.doc<Species>(
      `${gameDoc}/species/${moveParams.movingSpecies.id}`
    ).ref;
    let movingSpeciesTileIds: number[] = JSON.parse(
      JSON.stringify(moveParams.movingSpecies.tileIds)
    );
    console.log('moving species tileIds: ', movingSpeciesTileIds);
    // Iterates as much as species to move.
    for (let i = 0; i < Math.abs(moveParams.quantity); i++) {
      // Adds 1 species to the new tile.
      if (moveParams.quantity > 0)
        movingSpeciesTileIds.push(moveParams.destinationId);
      // Removes 1 species to previous tile id or if quantity is negative.
      if (moveParams.quantity < 0 || moveParams.previousTileId) {
        const tileId = moveParams.previousTileId
          ? moveParams.previousTileId
          : moveParams.destinationId;
        const index = movingSpeciesTileIds.indexOf(tileId);
        index !== -1
          ? movingSpeciesTileIds.splice(index, 1)
          : (movingSpeciesTileIds = []);
      }
    }
    // Deletes species & adds its abilities if no more individuals.
    if (movingSpeciesTileIds.length === 0)
      return (batch = this.batchDeleteSpecies(gameDoc, batch, moveParams));

    return batch.update(speciesRef, { tileIds: movingSpeciesTileIds });
  }

  private batchDeleteSpecies(
    gameDoc: string,
    batch: firebase.firestore.WriteBatch,
    moveParams: MoveParameters
  ): firebase.firestore.WriteBatch {
    const deletedSpecies = moveParams.movingSpecies;
    const deletedSpeciesRef: DocumentReference<Species> = this.db.doc<Species>(
      `${gameDoc}/species/${deletedSpecies.id}`
    ).ref;
    batch.delete(deletedSpeciesRef);

    // Adds deleted species' abilities to the attacking one.
    if (moveParams.attackingSpecies) {
      for (const ability of deletedSpecies.abilities) {
        batch = this.addAbilityToSpeciesByBatch(
          ability,
          moveParams.attackingSpecies,
          batch
        );
      }
    }

    // If it's a player's species, removes it from its stack.
    if (deletedSpecies.playerId !== 'neutral') {
      const playerRef = this.db.doc(
        `${gameDoc}/players/${deletedSpecies.playerId}`
      ).ref;
      const speciesIds = firebase.firestore.FieldValue.arrayRemove(
        deletedSpecies.id
      );
      batch.update(playerRef, {
        speciesIds,
      });
    }

    // If it's the last player's species, ends the game.
    const player = this.playerQuery.getEntity(deletedSpecies.playerId);
    if (player.speciesIds.length === 1) {
      const winnerId = this.playerQuery.getPlayerOpponentId(player.id);
      batch = this.gameService.updatePlayerVictory(winnerId, true, batch);
    }

    return batch;
  }

  private batchUpdateRemainingMigrations(
    gameDoc: string,
    batch: firebase.firestore.WriteBatch,
    migrationUsed: number
  ): firebase.firestore.WriteBatch {
    const gameRef = this.db.doc(gameDoc).ref;
    const decrement = firebase.firestore.FieldValue.increment(-migrationUsed);

    return batch.update(gameRef, { remainingMigrations: decrement });
  }
}
