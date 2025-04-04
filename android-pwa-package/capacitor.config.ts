import { CapacitorConfig } from '@capacitor/cli';

/**
 * Capacitor configuration for Google Play Store publication
 * Settings are optimized according to Google recommendations for PWA and hybrid applications
 * https://developer.android.com/google-play/guides/subscription-validation
 */
const config: CapacitorConfig = {
  // Unique application identifier for Google Play Store
  appId: 'com.aething.aistore',
  
  // Application name to be displayed in Google Play
  appName: 'AI Store',
  
  // Frontend build directory
  webDir: 'dist/public',
  
  // Disable built-in runtime
  bundledWebRuntime: false,
  
  // Server settings
  server: {
    // HTTPS is recommended for all applications in Play Market
    androidScheme: 'https',
    // In release version, it's recommended to disable cleartext (unencrypted HTTP)
    cleartext: false
  },
  
  // Android settings
  android: {
    // Minimum recommended Android API version - 23 (Android 6.0 Marshmallow)
    minSdkVersion: 23,
    // Target SDK version should be regularly updated according to Google Play requirements
    targetSdkVersion: 34,
    
    // Build.gradle settings
    buildOptions: {
      keystorePath: undefined,
      keystorePassword: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
      signingType: 'apksigner'
    },
    
    // Enable analytics tools for Google Play
    useLegacyBridgeMode: false,
    
    // Manifest settings
    overrideUserAgent: false,
    backgroundColor: '#FFFFFF'
  },
  
  // Push Notifications settings (optional)
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: "#FFFFFF",
      androidScaleType: "CENTER_CROP",
      splashFullScreen: true,
      splashImmersive: true
    }
  }
};

export default config;