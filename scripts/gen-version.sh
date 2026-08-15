#!/bin/sh
set -e
VERSION=$(node -p "require('./app.json').expo.version" 2>/dev/null || git describe --tags --abbrev=0 2>/dev/null || echo "0.0.0")
echo "export const APP_VERSION = \"v$VERSION\";" > src/constants/Version.generated.ts
