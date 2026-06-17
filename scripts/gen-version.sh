#!/bin/sh
set -e
VERSION=$(git describe --tags --always --dirty 2>/dev/null || echo "0.0.0")
echo "export const APP_VERSION = \"$VERSION\";" > src/constants/Version.generated.ts
