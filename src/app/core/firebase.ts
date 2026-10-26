import { initializeApp } from 'firebase/app';
import {
  browserLocalPersistence,
  connectAuthEmulator,
  indexedDBLocalPersistence,
  initializeAuth,
} from 'firebase/auth';
import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import { environment } from '../../environments/environment';

export const firebaseApp = initializeApp(environment.firebase);

// initializeAuth without a popup resolver: getAuth() hangs in iOS web views.
export const auth = initializeAuth(firebaseApp, {
  persistence: [indexedDBLocalPersistence, browserLocalPersistence],
});

export const db = getFirestore(firebaseApp);

if (environment.useEmulators) {
  const host = location.hostname || 'localhost';
  connectAuthEmulator(auth, `http://${host}:9099`, { disableWarnings: true });
  connectFirestoreEmulator(db, host, 8080);
}
