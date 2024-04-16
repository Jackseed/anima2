import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.anima2',
  appName: 'anima',
  webDir: 'public',
  server: {
    androidScheme: 'https'
  }
};

export default config;
