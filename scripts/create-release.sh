#!/bin/bash
# Release helper script for SBE Tauri PoC
# Usage: ./scripts/create-release.sh <version>
# Example: ./scripts/create-release.sh v0.1.0

set -e

if [ -z "$1" ]; then
  echo "Usage: $0 <version>"
  echo "Example: $0 v0.1.0"
  exit 1
fi

VERSION=$1

# Validate version format
if [[ ! $VERSION =~ ^v[0-9]+\.[0-9]+\.[0-9]+(-.*)?$ ]]; then
  echo "Error: Version must follow semantic versioning format (e.g., v0.1.0, v1.0.0-beta.1)"
  exit 1
fi

echo "Creating release $VERSION..."
echo ""

# Check if we're on main branch or a release branch
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
  echo "Error: You have uncommitted changes. Please commit or stash them first."
  exit 1
fi

# Check if tag already exists
if git rev-parse "$VERSION" >/dev/null 2>&1; then
  echo "Error: Tag $VERSION already exists"
  exit 1
fi

# Create and push tag
echo "Creating tag $VERSION..."
git tag -a "$VERSION" -m "Release $VERSION"

echo ""
echo "Tag $VERSION created successfully!"
echo ""
echo "To push the tag and trigger the release workflow, run:"
echo "  git push origin $VERSION"
echo ""
echo "This will:"
echo "  1. Trigger the GitHub Actions release workflow"
echo "  2. Build the application for all platforms (Windows, macOS, Linux)"
echo "  3. Create a GitHub release with all artifacts"
echo "  4. Mark the release as pre-release"
echo ""
echo "To delete the tag if needed, run:"
echo "  git tag -d $VERSION"
