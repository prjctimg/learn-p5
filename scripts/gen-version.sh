#!/bin/sh
set -e
VERSION=$(node -p "require('./package.json').version")
echo "export const APP_VERSION = \"v$VERSION\";" > src/constants/Version.generated.ts
