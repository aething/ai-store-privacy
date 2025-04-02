import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aistore.app',
  appName: 'AI Store',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: "#FFFFFF",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      androidSpinnerStyle: "large",
      spinnerColor: "#4a90e2"
    }
  },
  server: {
    // Раскомментируйте для тестирования живого сервера вместо локального
    // url: "https://your-deployed-url.com",
    cleartext: true,
    hostname: "localhost"
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true
  }
};

export default config;
