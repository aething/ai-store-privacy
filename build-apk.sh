#!/bin/bash

# Variables for colored output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}==== Step 4: Building APK File ====${NC}"

# Create directory for storing APK if it doesn't exist
mkdir -p apk-build

# Go to Android directory
cd android

# Build APK file
echo -e "${YELLOW}Building APK file (debug)${NC}"
./gradlew assembleDebug

if [ $? -ne 0 ]; then
  echo -e "${RED}Error building APK file${NC}"
  exit 1
fi

# Copy built APK file
cp app/build/outputs/apk/debug/app-debug.apk ../apk-build/ai-store-android-pwa.apk

echo -e "${GREEN}===========================================${NC}"
echo -e "${GREEN}Android application build completed successfully!${NC}"
echo -e "${GREEN}APK file available at: ${NC}apk-build/ai-store-android-pwa.apk"
echo -e "${GREEN}===========================================${NC}"

# Return to initial directory
cd ..

# Recommendations for creating a release build
echo -e "${YELLOW}Next steps for release build:${NC}"
echo -e "1. ${BLUE}Create keystore file:${NC}"
echo -e "   keytool -genkey -v -keystore aistore.keystore -alias aistore -keyalg RSA -keysize 2048 -validity 10000"
echo -e "2. ${BLUE}To create AAB file (recommended format for Google Play):${NC}"
echo -e "   In Android Studio: Build → Generate Signed Bundle / APK → Android App Bundle"
echo -e "3. ${BLUE}To run AAB build via command line:${NC}"
echo -e "   ./gradlew bundleRelease"
echo -e "4. ${BLUE}Final AAB file will be available at:${NC}"
echo -e "   app/build/outputs/bundle/release/app-release.aab"
