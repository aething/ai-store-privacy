# Android Build Instructions

This document provides instructions for building the Android version of the AI Store application.

## Prerequisites

To build the Android application, you will need:

1. **Java Development Kit (JDK)** - version 11 or higher
2. **Android Studio** - latest version recommended
3. **Android SDK** - with Build Tools corresponding to the target SDK version (34)
4. **Gradle** - included with Android Studio

## Project Setup

The project has already been configured with Capacitor for Android. The steps below assume you have already:

1. Built the web application
2. Added the Android platform
3. Copied and synced web assets to the Android project

If not, run the following scripts in order:
```bash
./build-step1.sh  # Build web application
./build-step2.sh  # Add Android platform
./build-step3.sh  # Copy and sync changes
```

## Building the APK

### Option 1: Command Line (requires JDK and Android SDK)

```bash
# Navigate to the Android folder
cd android

# Build debug APK
./gradlew assembleDebug

# The APK will be available at:
# android/app/build/outputs/apk/debug/app-debug.apk
```

### Option 2: Android Studio

1. Open Android Studio
2. Select "Open an existing Android Studio project"
3. Navigate to and select the `android` folder in this project
4. Wait for the project to sync and index
5. Select "Build > Build Bundle(s) / APK(s) > Build APK(s)"
6. The APK will be built and you'll be notified when it's complete

## Creating a Release Build

For Google Play Store publication, you should create a signed AAB (Android App Bundle) file:

1. Create a keystore file (if you don't already have one):
   ```bash
   keytool -genkey -v -keystore aistore.keystore -alias aistore -keyalg RSA -keysize 2048 -validity 10000
   ```

2. Configure the signing in `android/app/build.gradle`:
   ```gradle
   android {
       // ...
       
       signingConfigs {
           release {
               storeFile file("path/to/aistore.keystore")
               storePassword "your-store-password"
               keyAlias "aistore"
               keyPassword "your-key-password"
           }
       }
       
       buildTypes {
           release {
               signingConfig signingConfigs.release
               // ...
           }
       }
   }
   ```

3. Build the release AAB:
   ```bash
   cd android
   ./gradlew bundleRelease
   ```

4. The AAB will be available at:
   ```
   android/app/build/outputs/bundle/release/app-release.aab
   ```

## Testing the APK

Before publishing, test the APK on a real device:

1. Enable USB debugging on your Android device
2. Connect your device to the computer
3. Install the APK using ADB:
   ```bash
   adb install android/app/build/outputs/apk/debug/app-debug.apk
   ```

## Additional Configuration

### App Icons

The app icons are located in:
```
android/app/src/main/res/mipmap-*/
```

To replace these icons with custom ones, you can:
1. Use Android Studio's Asset Studio (right-click on res folder > New > Image Asset)
2. Use the Capacitor CLI to generate icons using a custom source image:
   ```bash
   npx @capacitor/assets generate --iconSource path/to/your/icon.png
   ```

### Splash Screen

To customize the splash screen:
1. Configure it in `capacitor.config.ts` under the `plugins.SplashScreen` section
2. Replace the splash image in `android/app/src/main/res/drawable/splash.png`

## Troubleshooting

### Common Issues

1. **JAVA_HOME not set**
   Set the JAVA_HOME environment variable to your JDK installation directory

2. **Gradle sync failed**
   - Check your internet connection
   - Make sure Gradle wrapper is available
   - Try running `./gradlew --refresh-dependencies`

3. **Build failures related to Android SDK**
   Make sure you have the correct SDK version and build tools installed

4. **Keystore issues**
   Double-check the keystore path and passwords in your gradle configuration

5. **Capacitor plugin-related errors**
   Make sure all Capacitor plugins are properly installed and configured

## Publishing to Google Play Store

See the separate `publish-checklist.md` document for detailed instructions on publishing to Google Play Store.