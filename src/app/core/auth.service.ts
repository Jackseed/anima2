import { computed, Injectable, signal } from '@angular/core';
import {
  deleteUser,
  EmailAuthProvider,
  linkWithCredential,
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { deleteDoc, doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';

export const MAX_NAME_LENGTH = 20;

@Injectable({ providedIn: 'root' })
export class AuthService {
  // undefined while Firebase restores the session.
  readonly user = signal<User | null | undefined>(undefined);
  readonly uid = computed(() => this.user()?.uid ?? null);
  readonly name = signal('');
  readonly isAnonymous = computed(() => this.user()?.isAnonymous ?? true);
  readonly email = computed(() => this.user()?.email ?? null);

  private readonly ready: Promise<User | null>;

  constructor() {
    this.ready = new Promise((resolve) => {
      onAuthStateChanged(auth, (user) => {
        this.user.set(user);
        this.name.set(user?.displayName ?? '');
        resolve(user);
      });
    });
  }

  // Current user, once Firebase has restored the session at startup.
  async whenReady(): Promise<User | null> {
    await this.ready;
    return this.user() ?? null;
  }

  async playAsGuest(name: string): Promise<void> {
    const credential = await signInAnonymously(auth);
    await this.rename(name, credential.user);
  }

  async rename(name: string, user = auth.currentUser): Promise<void> {
    if (!user) return;
    const cleanName = name.trim().slice(0, MAX_NAME_LENGTH);
    await updateProfile(user, { displayName: cleanName });
    await setDoc(doc(db, 'users', user.uid), { id: user.uid, name: cleanName, updatedAt: serverTimestamp() }, { merge: true });
    this.name.set(cleanName);
  }

  // Turns the guest account into an email account, keeping the same uid and games.
  async saveAccount(email: string, password: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('Not signed in');
    const result = await linkWithCredential(user, EmailAuthProvider.credential(email.trim(), password));
    this.user.set(result.user);
  }

  async signInWithEmail(email: string, password: string): Promise<void> {
    await signInWithEmailAndPassword(auth, email.trim(), password);
  }

  // Stats recorded by the 1.x app on the user document.
  async legacyStats(): Promise<{ played: number; won: number }> {
    const user = auth.currentUser;
    if (!user) return { played: 0, won: 0 };
    const snapshot = await getDoc(doc(db, 'users', user.uid));
    const data = snapshot.data() ?? {};
    return { played: Number(data['matchesPlayed'] ?? 0), won: Number(data['matchesWon'] ?? 0) };
  }

  async signOut(): Promise<void> {
    await signOut(auth);
  }

  async deleteAccount(): Promise<void> {
    const user = auth.currentUser;
    if (!user) return;
    await deleteDoc(doc(db, 'users', user.uid));
    await deleteUser(user);
  }
}
