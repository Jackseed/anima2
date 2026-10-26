// A player that signs in on the emulators and plays random legal moves through Firestore
// transactions, exactly as the app does. Used by the end-to-end test and for manual testing.
import {
  applyCommand,
  createGame,
  joinGame,
  legalCommands,
  randomItem,
  seededRng,
  type Command,
  type GameState,
} from '@anima/engine';
import { deleteApp, initializeApp, type FirebaseApp } from 'firebase/app';
import { connectAuthEmulator, getAuth, signInAnonymously, updateProfile } from 'firebase/auth';
import {
  connectFirestoreEmulator,
  doc,
  getFirestore,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  setDoc,
  type Firestore,
} from 'firebase/firestore';

export const PROJECT_ID = 'demo-anima';

function mirrors(state: GameState) {
  return { playerIds: state.players.map((p) => p.id), phase: state.phase, isOpen: state.phase === 'waiting' };
}

export class Bot {
  private app!: FirebaseApp;
  private db!: Firestore;
  uid = '';

  constructor(
    readonly name: string,
    private readonly rng = seededRng(Date.now() % 100000),
  ) {}

  async signIn(): Promise<void> {
    this.app = initializeApp({ apiKey: 'demo-key', projectId: PROJECT_ID }, `bot-${this.name}-${Math.random()}`);
    const auth = getAuth(this.app);
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    this.db = getFirestore(this.app);
    connectFirestoreEmulator(this.db, '127.0.0.1', 8080);
    const credential = await signInAnonymously(auth);
    await updateProfile(credential.user, { displayName: this.name });
    this.uid = credential.user.uid;
  }

  async create(name: string): Promise<string> {
    const ref = doc(this.db, 'matches', `bot-${Date.now()}-${Math.floor(this.rng() * 1e6)}`);
    const state = createGame({ id: this.uid, name: this.name }, this.rng);
    await setDoc(ref, {
      name,
      createdBy: this.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      version: 1,
      state,
      ...mirrors(state),
    });
    return ref.id;
  }

  async join(matchId: string): Promise<void> {
    const ref = doc(this.db, 'matches', matchId);
    await runTransaction(this.db, async (transaction) => {
      const match = (await transaction.get(ref)).data()!;
      const state = joinGame(match['state'], { id: this.uid, name: this.name }, this.rng);
      transaction.update(ref, { state, ...mirrors(state), version: match['version'] + 1, updatedAt: serverTimestamp() });
    });
  }

  // Picks a move: actions first, ending the turn now and then.
  chooseCommand(state: GameState): Command | null {
    const commands = legalCommands(state, this.uid);
    if (commands.length === 0) return null;
    const actions = commands.filter((command) => command.type !== 'endTurn');
    return actions.length > 0 && this.rng() < 0.9 ? randomItem(this.rng, actions) : randomItem(this.rng, commands);
  }

  // Retries as the app does when a concurrent move makes the rules refuse a stale write.
  async send(matchId: string, command: Command, attempt = 1): Promise<GameState> {
    try {
      return await this.sendOnce(matchId, command);
    } catch (error) {
      if ((error as { code?: string }).code !== 'permission-denied' || attempt >= 3) throw error;
      return this.send(matchId, command, attempt + 1);
    }
  }

  private sendOnce(matchId: string, command: Command): Promise<GameState> {
    const ref = doc(this.db, 'matches', matchId);
    const seed = Math.floor(this.rng() * 2 ** 32);
    return runTransaction(this.db, async (transaction) => {
      const match = (await transaction.get(ref)).data()!;
      const result = applyCommand(match['state'], this.uid, command, seededRng(seed));
      if (!result.ok) throw new Error(`${command.type} refused: ${result.error}`);
      transaction.update(ref, {
        state: result.state,
        ...mirrors(result.state),
        version: match['version'] + 1,
        updatedAt: serverTimestamp(),
      });
      return result.state;
    });
  }

  // Plays whenever it can, until the game is over.
  playUntilFinished(matchId: string, delayMs = 0): Promise<GameState> {
    return new Promise((resolve, reject) => {
      let busy = false;
      const unsubscribe = onSnapshot(doc(this.db, 'matches', matchId), async (snapshot) => {
        const state = snapshot.data()?.['state'] as GameState | undefined;
        if (!state || busy) return;
        if (state.phase === 'finished') {
          unsubscribe();
          resolve(state);
          return;
        }
        busy = true;
        try {
          const command = this.chooseCommand(state);
          if (!command) return;
          if (delayMs) await new Promise((r) => setTimeout(r, delayMs));
          await this.send(matchId, command);
        } catch (error) {
          // A concurrent move changed the state: the next snapshot gives another chance.
          if (!String(error).includes('refused')) {
            unsubscribe();
            reject(error);
          }
        } finally {
          busy = false;
        }
      });
    });
  }

  async close(): Promise<void> {
    await deleteApp(this.app);
  }
}
