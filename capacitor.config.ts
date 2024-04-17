import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.anima2',
  appName: 'anima',
  webDir: 'public',
  server: {
    androidScheme: 'https'
  }
,
    android: {
       buildOptions: {
          keystorePath: '/Users/vincent/Documents/Dev projects/Anima/deploy/keystores/keystore',
          keystoreAlias: 'key0',
       }
    }
  };

export default config;
