import { Injectable, inject } from '@angular/core';
import {
  applyCommand,
  createGame,
  joinGame,
  RuleError,
  seededRng,
  type Command,
  type ErrorCode,
  type GameState,
} from '@anima/engine';
import {
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  where,
  deleteDoc,
  type Timestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { AuthService } from './auth.service';
import { db } from './firebase';

// Games of the 1.x app live in "games" with another schema; 2.x games live here.
export const MATCHES = 'matches';
export const MAX_GAME_NAME_LENGTH = 30;

export interface MatchDoc {
  id: string;
  name: string;
  createdBy: string;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
  // Mirrors of the state, for queries and security rules.
  playerIds: string[];
  phase: GameState['phase'];
  isOpen: boolean;
  version: number;
  state: GameState;
}

export class CommandRejected extends Error {
  constructor(public readonly code: ErrorCode | 'CONFLICT') {
    super(code);
  }
}

// Security rules are evaluated against the latest version of the game, before the transaction
// notices that it read an older one: a concurrent move then shows up as permission-denied.
// Replaying the transaction reads the new state and recomputes the move.
async function withRetry<T>(run: () => Promise<T>, attempts = 3): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await run();
    } catch (error) {
      const code = (error as { code?: string }).code;
      if (code !== 'permission-denied' || attempt >= attempts) throw error;
    }
  }
}

function newSeed(): number {
  return Math.floor(Math.random() * 2 ** 32);
}

function mirrors(state: GameState) {
  return {
    playerIds: state.players.map((player) => player.id),
    phase: state.phase,
    isOpen: state.phase === 'waiting',
  };
}

@Injectable({ providedIn: 'root' })
export class MatchService {
  private readonly auth = inject(AuthService);

  private async playerName(): Promise<string> {
    return this.auth.name() || (await this.auth.loadName()) || 'Anima';
  }

  private requireUid(): string {
    const uid = this.auth.uid();
    if (!uid) throw new Error('Not signed in');
    return uid;
  }

  async create(name: string): Promise<string> {
    const uid = this.requireUid();
    const ref = doc(collection(db, MATCHES));
    const state = createGame({ id: uid, name: await this.playerName() }, seededRng(newSeed()));
    await setDoc(ref, {
      name: name.trim().slice(0, MAX_GAME_NAME_LENGTH),
      createdBy: uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      version: 1,
      state,
      ...mirrors(state),
    });
    return ref.id;
  }

  async join(matchId: string): Promise<void> {
    const uid = this.requireUid();
    const ref = doc(db, MATCHES, matchId);
    const seed = newSeed();
    const name = await this.playerName();
    await withRetry(() => runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(ref);
      if (!snapshot.exists()) throw new CommandRejected('NOT_PLAYING');
      const match = snapshot.data() as MatchDoc;
      if (match.playerIds.includes(uid)) return;
      let state: GameState;
      try {
        state = joinGame(match.state, { id: uid, name }, seededRng(seed));
      } catch (error) {
        if (error instanceof RuleError) throw new CommandRejected(error.code);
        throw error;
      }
      transaction.update(ref, { state, ...mirrors(state), version: match.version + 1, updatedAt: serverTimestamp() });
    }));
  }

  // Runs the command in a transaction, so concurrent writes are replayed on the latest state.
  // Returns the state written and its version.
  async send(matchId: string, command: Command, seed = newSeed()): Promise<{ state: GameState; version: number }> {
    const uid = this.requireUid();
    const ref = doc(db, MATCHES, matchId);
    return withRetry(() => runTransaction(db, async (transaction) => {
      const snapshot = await transaction.get(ref);
      if (!snapshot.exists()) throw new CommandRejected('NOT_PLAYING');
      const match = snapshot.data() as MatchDoc;
      const result = applyCommand(match.state, uid, command, seededRng(seed));
      if (!result.ok) throw new CommandRejected(result.error);
      transaction.update(ref, {
        state: result.state,
        ...mirrors(result.state),
        version: match.version + 1,
        updatedAt: serverTimestamp(),
      });
      return { state: result.state, version: match.version + 1 };
    }));
  }

  // The creator can cancel a game nobody joined.
  async cancel(matchId: string): Promise<void> {
    await deleteDoc(doc(db, MATCHES, matchId));
  }

  watch(matchId: string, next: (match: MatchDoc | null) => void, error: (error: Error) => void): Unsubscribe {
    return onSnapshot(
      doc(db, MATCHES, matchId),
      (snapshot) => next(snapshot.exists() ? ({ ...(snapshot.data() as MatchDoc), id: snapshot.id }) : null),
      error,
    );
  }

  watchOpen(next: (matches: MatchDoc[]) => void, error: (error: Error) => void): Unsubscribe {
    const q = query(collection(db, MATCHES), where('isOpen', '==', true), orderBy('createdAt', 'desc'), limit(30));
    return onSnapshot(q, (snapshot) => next(snapshot.docs.map((d) => ({ ...(d.data() as MatchDoc), id: d.id }))), error);
  }

  watchMine(next: (matches: MatchDoc[]) => void, error: (error: Error) => void): Unsubscribe {
    const uid = this.requireUid();
    const q = query(
      collection(db, MATCHES),
      where('playerIds', 'array-contains', uid),
      orderBy('updatedAt', 'desc'),
      limit(30),
    );
    return onSnapshot(q, (snapshot) => next(snapshot.docs.map((d) => ({ ...(d.data() as MatchDoc), id: d.id }))), error);
  }

  async finishedStats(): Promise<{ played: number; won: number }> {
    const uid = this.requireUid();
    const q = query(collection(db, MATCHES), where('playerIds', 'array-contains', uid), where('phase', '==', 'finished'));
    const snapshot = await getDocs(q);
    const matches = snapshot.docs.map((d) => d.data() as MatchDoc);
    return { played: matches.length, won: matches.filter((m) => m.state.winner?.playerId === uid).length };
  }
}
