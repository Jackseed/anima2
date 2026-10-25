import { resolve } from 'path';
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.anima2',
  appName: 'Anima',
  webDir: 'public',
  server: {
    androidScheme: 'https',
  },
  android: {
    buildOptions: {
      // Keystore lives outside the repo, in ../deploy/keystores.
      keystorePath: resolve(__dirname, '../deploy/keystores/keystore'),
      keystoreAlias: 'key0',
    },
  },
};

export default config;
