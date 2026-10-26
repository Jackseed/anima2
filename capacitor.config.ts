import { resolve } from 'path';
import type { CapacitorConfig } from '@capacitor/cli';

// `CAP_EMULATORS=1 npx cap sync` lets a development build reach the local Firebase emulators
// over plain HTTP (with `adb reverse tcp:9099 tcp:9099` and `adb reverse tcp:8080 tcp:8080`).
const useEmulators = process.env['CAP_EMULATORS'] === '1';

const config: CapacitorConfig = {
  appId: 'com.anima2',
  appName: 'Anima',
  webDir: 'dist/anima/browser',
  // Same origin as the 1.x app (https://localhost), so players keep their signed-in account.
  server: {
    androidScheme: 'https',
    cleartext: useEmulators,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1000,
      backgroundColor: '#ffffff',
    },
  },
  android: {
    allowMixedContent: useEmulators,
    buildOptions: {
      // Keystore lives outside the repo, in ../deploy/keystores.
      keystorePath: resolve(__dirname, '../deploy/keystores/keystore'),
      keystoreAlias: 'key0',
      releaseType: 'AAB',
    },
  },
};

export default config;
