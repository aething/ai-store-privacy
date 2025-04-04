#!/bin/bash

# Variables for colored output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}==== Step 2: Adding Android Platform ====${NC}"

# Add Android platform
npx cap add android

if [ $? -ne 0 ]; then
  echo -e "${RED}Error adding Android platform${NC}"
  exit 1
fi

echo -e "${GREEN}Android platform successfully added${NC}"
