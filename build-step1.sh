#!/bin/bash

# Variables for colored output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${YELLOW}==== Step 1: Building Web Application ====${NC}"

# Build web application
npm run build

if [ $? -ne 0 ]; then
  echo -e "${RED}Error during web application build${NC}"
  exit 1
fi

echo -e "${GREEN}Web application successfully built${NC}"
