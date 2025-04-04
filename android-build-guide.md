# Android Build Guide for AI Store

This guide provides detailed instructions for building an Android APK file from our PWA application. The provided ZIP archive contains all necessary files for building the application.

## Prerequisites

To build the Android application, you'll need:

1. **Android Studio** (latest version recommended)
2. **Java Development Kit (JDK)** 11 or higher
3. **Gradle** (included with Android Studio)
4. **Android SDK** with API level 34 or newer (can be installed via Android Studio)

## Option 1: Using Android Studio (Recommended)

### Step 1: Extract the ZIP Archive

Extract the `ai-store-android-pwa.zip` file to a directory on your computer.

### Step 2: Open Project in Android Studio

1. Open Android Studio
2. Select "Open an Existing Project"
3. Navigate to the extracted folder and select the `android` directory

### Step 3: Sync Project

1. Wait for Gradle sync to complete
2. If prompted to update Gradle or any dependencies, follow the instructions

### Step 4: Build the APK

To build a debug APK (for testing):
1. Select Build → Build Bundle(s) / APK(s) → Build APK(s)
2. The APK will be generated at `android/app/build/outputs/apk/debug/app-debug.apk`

To build a release APK (for Google Play Store):
1. Create a keystore file (if you don't have one):
   ```
   keytool -genkey -v -keystore aistore.keystore -alias aistore -keyalg RSA -keysize 2048 -validity 10000
   ```
2. Place the keystore file in the `android/app` directory
3. Configure signing in `android/app/build.gradle`:
   ```gradle
   android {
      ...
      signingConfigs {
         release {
               storeFile file('aistore.keystore')
               storePassword 'your-store-password'
               keyAlias 'aistore'
               keyPassword 'your-key-password'
         }
      }
      buildTypes {
         release {
               signingConfig signingConfigs.release
               ...
         }
      }
   }
   ```
4. Select Build → Generate Signed Bundle / APK → APK
5. Follow the wizard, selecting your keystore and providing passwords
6. The signed APK will be at `android/app/build/outputs/apk/release/app-release.apk`

### Step 5: Build AAB (Android App Bundle)

For Google Play Store submission, an AAB file is recommended:
1. Select Build → Generate Signed Bundle / APK → Android App Bundle
2. Follow the wizard, selecting your keystore
3. The AAB will be at `android/app/build/outputs/bundle/release/app-release.aab`

## Option 2: Using Command Line

If you prefer command line tools:

```bash
# Navigate to android directory
cd path/to/extracted/archive/android

# Build debug APK
./gradlew assembleDebug

# Build release APK (requires keystore setup)
./gradlew assembleRelease

# Build release AAB (for Google Play Store)
./gradlew bundleRelease
```

## Google Play Store Submission Requirements

For Play Store submission, ensure you have:

1. Google Play Developer account ($25 one-time fee)
2. Signed AAB or APK file
3. App icon (512x512 PNG)
4. Feature graphic (1024x500 PNG)
5. Screenshots (at least 2)
6. App description, privacy policy URL, etc.

The archive includes metadata and icons required for submission in the `android/app/src/main/res` directory.

## Troubleshooting

Common issues and solutions:

1. **Gradle sync fails**: Update Gradle to latest version
2. **Build errors related to SDK**: Install required SDK packages via Android Studio's SDK Manager
3. **Signing issues**: Double-check keystore path and passwords
4. **Memory issues**: Increase Gradle memory in `android/gradle.properties`:
   ```
   org.gradle.jvmargs=-Xmx4g -XX:MaxPermSize=2048m
   ```

## Additional Resources

- [Android Developer Documentation](https://developer.android.com/docs)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer/)
- [Capacitor Android Documentation](https://capacitorjs.com/docs/android)

## Technical Support

If you encounter issues during the build process, please contact our development team for assistance.