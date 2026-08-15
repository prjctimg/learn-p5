#!/bin/sh
set -e

# Usage: ./scripts/bump-version.sh <version>
# Example: ./scripts/bump-version.sh 0.6.56
#
# Updates version in:
#   - app.json (expo.version)
#   - package.json (version)
#   - src/constants/Version.generated.ts

VERSION="$1"

if [ -z "$VERSION" ]; then
  echo "Usage: $0 <version>"
  echo "Example: $0 0.6.56"
  exit 1
fi

# Validate version format (semver-like: X.Y.Z)
if ! echo "$VERSION" | grep -qE '^[0-9]+\.[0-9]+\.[0-9]+$'; then
  echo "Error: Version must be in semver format (e.g., 0.6.56)"
  exit 1
fi

echo "Bumping version to $VERSION..."

# Update app.json
node -e "
const fs = require('fs');
const app = JSON.parse(fs.readFileSync('app.json', 'utf8'));
app.expo.version = '$VERSION';
fs.writeFileSync('app.json', JSON.stringify(app, null, 2) + '\n');
console.log('  Updated app.json');
"

# Update package.json
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.version = '$VERSION';
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
console.log('  Updated package.json');
"

# Update Version.generated.ts
echo "export const APP_VERSION = \"v$VERSION\";" > src/constants/Version.generated.ts
echo "  Updated Version.generated.ts"

echo "Version bumped to $VERSION"
