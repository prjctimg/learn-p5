#!/bin/sh
set -e

# Bump the app version in app.json (expo.version), the Android versionCode,
# and package.json (version).
#
# Usage:
#   ./scripts/bump-version.sh          # auto-increment the patch (0.6.118 -> 0.6.119)
#   ./scripts/bump-version.sh <X.Y.Z>  # override with an explicit version

VERSION="$1"

if [ -z "$VERSION" ]; then
  CURRENT=$(node -e "process.stdout.write(require('./package.json').version)")
  if ! echo "$CURRENT" | grep -qE '^[0-9]+\.[0-9]+\.[0-9]+$'; then
    echo "Error: current version '$CURRENT' is not semver; pass an explicit <X.Y.Z>" >&2
    exit 1
  fi
  VERSION=$(echo "$CURRENT" | awk -F. '{printf "%d.%d.%d", $1, $2, $3+1}')
  echo "Auto-incrementing patch: $CURRENT -> $VERSION"
fi

if ! echo "$VERSION" | grep -qE '^[0-9]+\.[0-9]+\.[0-9]+$'; then
  echo "Error: version must be in semver format (e.g., 0.6.118)"
  exit 1
fi

echo "Bumping version to $VERSION..."

# Update app.json
node -e "
const fs = require('fs');
const app = JSON.parse(fs.readFileSync('app.json', 'utf8'));
app.expo.version = '$VERSION';
if (app.expo.android && typeof app.expo.android.versionCode === 'number') {
  app.expo.android.versionCode += 1;
  console.log('  Updated app.json (versionCode ' + app.expo.android.versionCode + ')');
} else {
  console.log('  Updated app.json');
}
fs.writeFileSync('app.json', JSON.stringify(app, null, 2) + '\n');
"

# Update package.json and the matching entries in package-lock.json
node -e "
const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
pkg.version = '$VERSION';
fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
console.log('  Updated package.json');

if (fs.existsSync('package-lock.json')) {
  const lock = JSON.parse(fs.readFileSync('package-lock.json', 'utf8'));
  lock.version = '$VERSION';
  if (lock.packages && lock.packages['']) lock.packages[''].version = '$VERSION';
  fs.writeFileSync('package-lock.json', JSON.stringify(lock, null, 2) + '\n');
  console.log('  Updated package-lock.json');
}
"

echo "Version bumped to $VERSION"
