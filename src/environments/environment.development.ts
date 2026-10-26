import { firebaseConfig } from './firebase-config';

// `ng serve` talks to the local emulators (`npm run emulators`), under a demo project
// that cannot reach production.
export const environment = {
  production: false,
  useEmulators: true,
  firebase: { ...firebaseConfig, projectId: 'demo-anima' },
};
