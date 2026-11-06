import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'me.agripulse.app',
  appName: 'AgriPulse',
  webDir: 'dist',
  android: {
    allowMixedContent: false,
  },
  ios: {
    scheme: 'agripulse',
    contentInset: 'always',
  },
  server: {
    androidScheme: 'https',
  },
  plugins: {
    CapacitorHttp: { enabled: true },
    SplashScreen: {
      launchAutoHide: true,        // Automatically hide
      launchShowDuration: 200,     // Hide quickly so React takes over
      backgroundColor: '#F7FBF8',  // Match our React splash perfectly
      androidSplashResourceName: 'splash',
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
      androidScaleType: 'CENTER_CROP',
    },
  },
};

export default config;
