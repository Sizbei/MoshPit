#!/bin/bash
set -euo pipefail

# ------------------------------------------------------------------
# MoshPit -- EAS Build Helper
# Usage: ./scripts/build.sh [development|preview|production] [ios|android|all]
# ------------------------------------------------------------------

PROFILE="${1:-development}"
PLATFORM="${2:-all}"

GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

info() { echo -e "${GREEN}[BUILD]${NC} $1"; }
fail() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# Validate profile
case "$PROFILE" in
  development|preview|production) ;;
  *) fail "Invalid profile '$PROFILE'. Use: development, preview, or production" ;;
esac

# Validate platform
case "$PLATFORM" in
  ios|android|all) ;;
  *) fail "Invalid platform '$PLATFORM'. Use: ios, android, or all" ;;
esac

# Check EAS CLI
if ! command -v eas &>/dev/null; then
  fail "EAS CLI not found. Install with: npm install -g eas-cli"
fi

# Check login
if ! eas whoami &>/dev/null 2>&1; then
  fail "Not logged in to EAS. Run: eas login"
fi

info "Profile:  $PROFILE"
info "Platform: $PLATFORM"
echo ""

# Run TypeScript check before building
info "Running TypeScript check..."
if ! npx tsc --noEmit; then
  fail "TypeScript errors found. Fix them before building."
fi
info "TypeScript check passed"
echo ""

# Build
if [ "$PLATFORM" = "all" ]; then
  info "Building for iOS..."
  eas build --profile "$PROFILE" --platform ios --non-interactive

  info "Building for Android..."
  eas build --profile "$PROFILE" --platform android --non-interactive
else
  info "Building for $PLATFORM..."
  eas build --profile "$PROFILE" --platform "$PLATFORM" --non-interactive
fi

echo ""
info "Build submitted. Check status at: https://expo.dev"
