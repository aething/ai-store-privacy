#!/bin/bash

# Variables for colored output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}==== Starting Android Application Build Process ====${NC}"

# Step 1: Build web application
echo -e "${YELLOW}Step 1: Building web application${NC}"
npm run build

if [ $? -ne 0 ]; then
  echo -e "${RED}Error during web application build${NC}"
  exit 1
fi

echo -e "${GREEN}Web application successfully built${NC}"

# Check if android directory exists
if [ ! -d "android" ]; then
  # Step 2: Initialize Capacitor project
  echo -e "${YELLOW}Step 2: Initializing Capacitor project${NC}"
  npx cap init "AI Store" "com.aething.aistore" --web-dir "client/dist"
  
  if [ $? -ne 0 ]; then
    echo -e "${RED}Error initializing Capacitor project${NC}"
    exit 1
  fi
  
  echo -e "${GREEN}Capacitor project successfully initialized${NC}"
  
  # Step 3: Add Android platform
  echo -e "${YELLOW}Step 3: Adding Android platform${NC}"
  npx cap add android
  
  if [ $? -ne 0 ]; then
    echo -e "${RED}Error adding Android platform${NC}"
    exit 1
  fi
  
  echo -e "${GREEN}Android platform successfully added${NC}"
else
  echo -e "${GREEN}Android project already initialized${NC}"
fi

# Step 4: Copy and optimize index.html for Android
echo -e "${YELLOW}Step 4: Optimizing index.html for Android${NC}"
INDEX_FILE="client/dist/index.html"

if [ -f "$INDEX_FILE" ]; then
  # Create backup of original file
  cp "$INDEX_FILE" "${INDEX_FILE}.bak"
  
  # Find and update viewport meta tag for better WebView display
  if grep -q '<meta name="viewport"' "$INDEX_FILE"; then
    sed -i 's/<meta name="viewport"[^>]*>/<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no">/' "$INDEX_FILE"
  else
    sed -i '/<head>/a \  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover, user-scalable=no">' "$INDEX_FILE"
  fi
  
  # Add preload for critical resources
  if ! grep -q 'rel="preload"' "$INDEX_FILE"; then
    sed -i '/<head>/a \  <link rel="preload" href="/fonts/roboto.woff2" as="font" type="font/woff2" crossorigin>\n  <link rel="preload" href="/styles/main.css" as="style">' "$INDEX_FILE"
  fi
  
  # Add CSS for better display in WebView
  if ! grep -q '.capacitor-webview-fix' "$INDEX_FILE"; then
    sed -i '/<style>/a \    /* Additional styles for Android WebView */\n    .capacitor-webview-fix {\n      overscroll-behavior-y: none;\n      -webkit-tap-highlight-color: transparent;\n    }\n    body {\n      overscroll-behavior-y: none;\n      -webkit-tap-highlight-color: transparent;\n      -webkit-touch-callout: none;\n    }' "$INDEX_FILE"
  fi
  
  # Add class to body for special styles in WebView
  sed -i 's/<body>/<body class="capacitor-webview-fix">/' "$INDEX_FILE"
  
  echo -e "${GREEN}index.html optimized for Android WebView${NC}"
else
  echo -e "${RED}Error: index.html not found${NC}"
fi

# Step 5: Copy web application changes to Android project
echo -e "${YELLOW}Step 5: Copying web application changes to Android project${NC}"
npx cap copy android

if [ $? -ne 0 ]; then
  echo -e "${RED}Error copying changes to Android project${NC}"
  exit 1
fi

echo -e "${GREEN}Changes successfully copied to Android project${NC}"

# Step 6: Update native plugins
echo -e "${YELLOW}Step 6: Updating native plugins${NC}"
npx cap sync android

if [ $? -ne 0 ]; then
  echo -e "${RED}Error updating native plugins${NC}"
  exit 1
fi

echo -e "${GREEN}Native plugins successfully updated${NC}"

# Step 7: Configure Android project for optimal WebView performance
echo -e "${YELLOW}Step 7: Optimizing Android WebView settings${NC}"

# Path to MainActivity.java
MAIN_ACTIVITY="android/app/src/main/java/com/aething/aistore/MainActivity.java"

if [ -f "$MAIN_ACTIVITY" ]; then
  # Create backup
  cp "$MAIN_ACTIVITY" "${MAIN_ACTIVITY}.bak"
  
  # Check for onCreate method and add WebView settings
  if grep -q "onCreate" "$MAIN_ACTIVITY"; then
    # If method already contains WebView settings, don't modify it
    if ! grep -q "WebSettings webSettings" "$MAIN_ACTIVITY"; then
      # Add WebView settings in onCreate method
      sed -i '/super.onCreate/a \        WebView webView = (WebView) findViewById(R.id.webview);\n        WebSettings webSettings = webView.getSettings();\n        webSettings.setDomStorageEnabled(true);\n        webSettings.setAllowFileAccess(true);\n        webSettings.setAllowContentAccess(true);\n        webSettings.setJavaScriptCanOpenWindowsAutomatically(true);\n        webSettings.setCacheMode(WebSettings.LOAD_DEFAULT);' "$MAIN_ACTIVITY"
      
      # Add import for WebSettings if it doesn't exist
      if ! grep -q "import android.webkit.WebSettings;" "$MAIN_ACTIVITY"; then
        sed -i '/package com.aething.aistore;/a \import android.webkit.WebSettings;\nimport android.webkit.WebView;' "$MAIN_ACTIVITY"
      fi
      
      echo -e "${GREEN}WebView settings added to MainActivity.java${NC}"
    else
      echo -e "${BLUE}WebView settings already present in MainActivity.java${NC}"
    fi
  else
    echo -e "${YELLOW}Warning: onCreate method not found in MainActivity.java${NC}"
  fi
else
  echo -e "${YELLOW}MainActivity.java file not found, skipping WebView optimization${NC}"
fi

# Step 8: Build APK file in debug mode
echo -e "${YELLOW}Step 8: Building APK file (debug)${NC}"
cd android && ./gradlew assembleDebug

if [ $? -ne 0 ]; then
  echo -e "${RED}Error building APK file${NC}"
  exit 1
fi

echo -e "${GREEN}APK file successfully built${NC}"

# Create directory for storing APK if it doesn't exist
mkdir -p ../apk-build

# Copy built APK file
cp app/build/outputs/apk/debug/app-debug.apk ../apk-build/ai-store-android-pwa.apk

echo -e "${GREEN}===========================================${NC}"
echo -e "${GREEN}Android application build completed successfully!${NC}"
echo -e "${GREEN}APK file available at: ${NC}apk-build/ai-store-android-pwa.apk"
echo -e "${GREEN}===========================================${NC}"

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

cd ..