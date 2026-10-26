import { readFileSync } from 'node:fs';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { applyCommand, createGame, joinGame, seededRng, type Command, type GameState } from '@anima/engine';
import { deleteDoc, doc, getDoc, serverTimestamp, setDoc, updateDoc, type Firestore } from 'firebase/firestore';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';

let env: RulesTestEnvironment;

const db = (uid?: string) =>
  (uid ? env.authenticatedContext(uid).firestore() : env.unauthenticatedContext().firestore()) as unknown as Firestore;

function mirrors(state: GameState) {
  return { playerIds: state.players.map((p) => p.id), phase: state.phase, isOpen: state.phase === 'waiting' };
}

function newMatch(uid: string) {
  const state = createGame({ id: uid, name: uid }, seededRng(1));
  return {
    name: 'Partie',
    createdBy: uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    version: 1,
    state,
    ...mirrors(state),
  };
}

async function seed(id: string, data: Record<string, unknown>) {
  await env.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore() as unknown as Firestore, 'matches', id), data);
  });
}

async function seedJoined(id: string): Promise<GameState> {
  const created = createGame({ id: 'alice', name: 'Alice' }, seededRng(1));
  const state = joinGame(created, { id: 'bob', name: 'Bob' }, seededRng(2));
  await seed(id, { ...newMatch('alice'), createdAt: new Date(0), updatedAt: new Date(0), version: 2, state, ...mirrors(state) });
  return state;
}

function update(state: GameState, version: number) {
  return { state, ...mirrors(state), version, updatedAt: serverTimestamp() };
}

function command(state: GameState, uid: string, cmd: Command): GameState {
  const result = applyCommand(state, uid, cmd, seededRng(3));
  if (!result.ok) throw new Error(result.error);
  return result.state;
}

// Plays the placement so that green is on turn.
function placed(state: GameState): GameState {
  for (const player of state.players) {
    const choice = state.setup!.choices[player.id];
    state = command(state, player.id, { type: 'chooseAbility', abilityId: choice.abilityChoices[0] });
  }
  state = command(state, state.players[0].id, { type: 'chooseStartTile', tileId: 66 });
  return command(state, state.players[1].id, { type: 'chooseStartTile', tileId: 91 });
}

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-anima',
    firestore: { rules: readFileSync('firestore.rules', 'utf8'), host: '127.0.0.1', port: 8080 },
  });
});

beforeEach(async () => {
  await env.clearFirestore();
});

afterAll(async () => {
  await env.cleanup();
});

describe('matches', () => {
  it('are hidden from signed-out visitors', async () => {
    await seed('m1', { ...newMatch('alice'), createdAt: new Date(0), updatedAt: new Date(0) });
    await assertFails(getDoc(doc(db(), 'matches/m1')));
    await assertSucceeds(getDoc(doc(db('bob'), 'matches/m1')));
  });

  it('can only be created by the player who waits in it', async () => {
    await assertSucceeds(setDoc(doc(db('alice'), 'matches/m1'), newMatch('alice')));
    await assertFails(setDoc(doc(db('alice'), 'matches/m2'), newMatch('bob')));
    await assertFails(setDoc(doc(db('alice'), 'matches/m3'), { ...newMatch('alice'), version: 5 }));
    await assertFails(setDoc(doc(db('alice'), 'matches/m4'), { ...newMatch('alice'), isOpen: false }));
    await assertFails(setDoc(doc(db('alice'), 'matches/m5'), { ...newMatch('alice'), cheat: true }));
  });

  it('can be joined once, by another player', async () => {
    const created = newMatch('alice');
    await seed('m1', { ...created, createdAt: new Date(0), updatedAt: new Date(0) });
    const joined = joinGame(created.state, { id: 'bob', name: 'Bob' }, seededRng(2));
    await assertFails(updateDoc(doc(db('alice'), 'matches/m1'), update(joinGame(created.state, { id: 'x', name: 'X' }, seededRng(2)), 2)));
    await assertFails(updateDoc(doc(db('bob'), 'matches/m1'), update(joined, 3)));
    await assertSucceeds(updateDoc(doc(db('bob'), 'matches/m1'), update(joined, 2)));
    const third = { ...update(joined, 3), playerIds: ['alice', 'bob', 'carol'] };
    await assertFails(updateDoc(doc(db('carol'), 'matches/m1'), third));
  });

  it('accept moves from both players during the placement', async () => {
    const state = await seedJoined('m1');
    const alice = command(state, 'alice', { type: 'chooseAbility', abilityId: state.setup!.choices['alice'].abilityChoices[0] });
    await assertSucceeds(updateDoc(doc(db('alice'), 'matches/m1'), update(alice, 3)));
    const bob = command(alice, 'bob', { type: 'chooseAbility', abilityId: alice.setup!.choices['bob'].abilityChoices[0] });
    await assertSucceeds(updateDoc(doc(db('bob'), 'matches/m1'), update(bob, 4)));
    await assertFails(updateDoc(doc(db('carol'), 'matches/m1'), update(bob, 5)));
  });

  it('only accept moves from the player on turn afterwards', async () => {
    const state = placed(await seedJoined('m1'));
    await env.withSecurityRulesDisabled(async (context) => {
      await updateDoc(doc(context.firestore() as unknown as Firestore, 'matches/m1'), { state, ...mirrors(state), version: 10 });
    });
    const onTurn = state.turn!.playerId;
    const other = state.players.find((p) => p.id !== onTurn)!.id;
    const next = command(state, onTurn, { type: 'endTurn' });
    await assertFails(updateDoc(doc(db(other), 'matches/m1'), update(next, 11)));
    await assertFails(updateDoc(doc(db(onTurn), 'matches/m1'), { ...update(next, 11), name: 'Renamed' }));
    await assertFails(updateDoc(doc(db(onTurn), 'matches/m1'), update(next, 12)));
    await assertSucceeds(updateDoc(doc(db(onTurn), 'matches/m1'), update(next, 11)));
  });

  it('let a player resign at any time, but not claim the victory', async () => {
    const state = placed(await seedJoined('m1'));
    await env.withSecurityRulesDisabled(async (context) => {
      await updateDoc(doc(context.firestore() as unknown as Firestore, 'matches/m1'), { state, ...mirrors(state), version: 10 });
    });
    const other = state.players.find((p) => p.id !== state.turn!.playerId)!.id;
    const fake = {
      ...state,
      phase: 'finished' as const,
      winner: { playerId: other, reason: 'resignation' as const },
      turn: null,
    };
    await assertFails(updateDoc(doc(db(other), 'matches/m1'), update(fake, 11)));
    const resigned = command(state, other, { type: 'resign' });
    await assertSucceeds(updateDoc(doc(db(other), 'matches/m1'), update(resigned, 11)));
  });

  it('can be cancelled by their creator while nobody joined', async () => {
    await seed('open', { ...newMatch('alice'), createdAt: new Date(0), updatedAt: new Date(0) });
    await assertFails(deleteDoc(doc(db('bob'), 'matches/open')));
    await assertSucceeds(deleteDoc(doc(db('alice'), 'matches/open')));
    await seedJoined('joined');
    await assertFails(deleteDoc(doc(db('alice'), 'matches/joined')));
  });
});

describe('users', () => {
  it('can only be written by their owner, except the 1.x game stats', async () => {
    await assertSucceeds(setDoc(doc(db('alice'), 'users/alice'), { id: 'alice', name: 'Alice' }));
    await assertFails(setDoc(doc(db('bob'), 'users/alice'), { id: 'alice', name: 'Bob' }));
    await assertFails(updateDoc(doc(db('bob'), 'users/alice'), { name: 'Hacked' }));
    await assertSucceeds(updateDoc(doc(db('bob'), 'users/alice'), { matchesPlayed: 1, matchesWon: 0, gamesPlayed: ['g1'] }));
    await assertFails(getDoc(doc(db(), 'users/alice')));
  });
});

describe('1.x games', () => {
  it('stay open to signed-in players only', async () => {
    await assertSucceeds(setDoc(doc(db('alice'), 'games/g1/tiles/1'), { id: 1 }));
    await assertSucceeds(getDoc(doc(db('bob'), 'games/g1/tiles/1')));
    await assertFails(getDoc(doc(db(), 'games/g1')));
  });
});
