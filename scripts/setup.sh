#!/bin/bash
set -euo pipefail

# ------------------------------------------------------------------
# MoshPit -- Developer Setup
# Checks prerequisites, installs dependencies, and prepares the
# local environment so you can start developing immediately.
# ------------------------------------------------------------------

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

info()  { echo -e "${GREEN}[OK]${NC}   $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
fail()  { echo -e "${RED}[FAIL]${NC} $1"; exit 1; }

echo ""
echo "========================================="
echo "  MoshPit Development Setup"
echo "========================================="
echo ""

# ---------- Node.js ----------
REQUIRED_NODE_MAJOR=18
if command -v node &>/dev/null; then
  NODE_VERSION=$(node -v | sed 's/v//')
  NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d. -f1)
  if [ "$NODE_MAJOR" -ge "$REQUIRED_NODE_MAJOR" ]; then
    info "Node.js v${NODE_VERSION}"
  else
    fail "Node.js >= ${REQUIRED_NODE_MAJOR} required (found v${NODE_VERSION}). Install via https://nodejs.org"
  fi
else
  fail "Node.js not found. Install v${REQUIRED_NODE_MAJOR}+ from https://nodejs.org"
fi

# ---------- npm ----------
if command -v npm &>/dev/null; then
  info "npm $(npm -v)"
else
  fail "npm not found. It should ship with Node.js."
fi

# ---------- Expo CLI (local via npx) ----------
if npx expo --version &>/dev/null 2>&1; then
  info "Expo CLI $(npx expo --version 2>/dev/null)"
else
  warn "Expo CLI not available via npx. It will be installed with dependencies."
fi

# ---------- EAS CLI ----------
if command -v eas &>/dev/null; then
  info "EAS CLI $(eas --version 2>/dev/null)"
else
  warn "EAS CLI not installed. Install with: npm install -g eas-cli"
fi

# ---------- .env ----------
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    cp .env.example .env
    warn ".env created from .env.example -- fill in your keys before running the app."
  else
    warn "No .env.example found. Create a .env file manually."
  fi
else
  info ".env already exists"
fi

# ---------- Install dependencies ----------
echo ""
echo "Installing dependencies..."
npm install
info "Dependencies installed"

# ---------- TypeScript check ----------
echo ""
echo "Running TypeScript check..."
if npx tsc --noEmit 2>/dev/null; then
  info "TypeScript: no errors"
else
  warn "TypeScript reported errors. Run 'npx tsc --noEmit' to see details."
fi

# ---------- Done ----------
echo ""
echo "========================================="
echo "  Setup complete!"
echo "========================================="
echo ""
echo "Next steps:"
echo "  1. Fill in your API keys in .env"
echo "  2. Start the dev server:"
echo "       npx expo start"
echo "  3. Open on a device:"
echo "       Press 'i' for iOS simulator"
echo "       Press 'a' for Android emulator"
echo "       Scan the QR code with Expo Go on a physical device"
echo ""
echo "For EAS builds:"
echo "  npx eas build --profile development --platform ios"
echo "  npx eas build --profile development --platform android"
echo ""
