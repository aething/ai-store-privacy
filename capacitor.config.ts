import { CapacitorConfig } from '@capacitor/cli';

/**
 * Конфигурация Capacitor для подготовки к публикации в Google Play Market
 * Настройки оптимизированы согласно рекомендациям Google для PWA и гибридных приложений
 * https://developer.android.com/google-play/guides/subscription-validation
 */
const config: CapacitorConfig = {
  // Уникальный идентификатор приложения для Google Play Store
  appId: 'com.aething.aistore',
  
  // Название приложения, которое будет отображаться в Google Play
  appName: 'AI Store',
  
  // Каталог собранного фронтенда
  webDir: 'client/dist',
  
  // Отключаем встроенный runtime
  bundledWebRuntime: false,
  
  // Настройки сервера
  server: {
    // Рекомендуется использовать https для всех приложений в Play Market
    androidScheme: 'https',
    // В релизной версии рекомендуется отключить cleartext (HTTP без шифрования)
    cleartext: false
  },
  
  // Настройки для Android
  android: {
    // Минимальная рекомендуемая версия Android API - 23 (Android 6.0 Marshmallow)
    minSdkVersion: 23,
    // Целевая версия SDK должна регулярно обновляться согласно требованиям Google Play
    targetSdkVersion: 33,
    
    // Настройки для build.gradle
    buildOptions: {
      keystorePath: undefined,
      keystorePassword: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
      signingType: 'apksigner'
    },
    
    // Включаем инструменты аналитики для Google Play
    useLegacyBridgeMode: false,
    
    // Настройки манифеста
    overrideUserAgent: false,
    backgroundColor: '#FFFFFF'
  },
  
  // Настройки Push-уведомлений (опционально)
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