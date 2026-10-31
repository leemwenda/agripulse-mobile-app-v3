import type { CapacitorConfig } from '@capacitor/cli';

// ============================================================================
// Capacitor configuration for AgriPulse Mobile (Android)
//
// This file documents the intended native packaging configuration. Building
// the actual android/ project requires Node + the Android SDK/Gradle/JDK,
// which are NOT available in this web-preview sandbox (verified: no `java`,
// no `$ANDROID_HOME`). See docs/android-build.md for the exact, verified
// commands to run this in a real development environment or CI.
// ============================================================================
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
    // Use HTTPS scheme for the WebView origin so that secure cookies/APIs
    // behave consistently with production. Do NOT point this at a developer
    // machine's LAN IP in a release build.
    androidScheme: 'https',
  },
  plugins: {
    CapacitorHttp: { enabled: true },
  },
};

export default config;
