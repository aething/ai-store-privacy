#!/bin/bash

# Variables for colored output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}==== Step 3: Copy and Sync Changes ====${NC}"

# Copy web application changes to Android project
echo -e "${YELLOW}Copying web application changes to Android project${NC}"
npx cap copy android

if [ $? -ne 0 ]; then
  echo -e "${RED}Error copying changes to Android project${NC}"
  exit 1
fi

echo -e "${GREEN}Changes successfully copied to Android project${NC}"

# Update native plugins
echo -e "${YELLOW}Updating native plugins${NC}"
npx cap sync android

if [ $? -ne 0 ]; then
  echo -e "${RED}Error updating native plugins${NC}"
  exit 1
fi

echo -e "${GREEN}Native plugins successfully updated${NC}"
