#!/bin/sh
set -e
VERSION=$(git describe --tags --abbrev=0 2>/dev/null || node -p "require('./package.json').version")
echo "export const APP_VERSION = \"$VERSION\";" > src/constants/Version.generated.ts
