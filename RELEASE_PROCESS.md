# Release Process Guide for v0.1.0

This document outlines the steps to complete the v0.1.0 release after this PR is merged.

## Prerequisites Checklist

All these items have been completed in this PR:

- ✅ Release workflow created (`.github/workflows/release.yml`)
- ✅ Release notes prepared (`RELEASE_NOTES.md`)
- ✅ README updated with installation instructions
- ✅ Tauri configuration enhanced with production metadata
- ✅ LICENSE file added
- ✅ Contributing guide created
- ✅ Release helper script created

## Steps to Release v0.1.0

### 1. Merge this PR

First, merge this PR into the main branch.

### 2. Create and Push the Tag

After merging to main, create the v0.1.0 tag:

```bash
# Switch to main branch
git checkout main
git pull origin main

# Create the tag using the helper script
./scripts/create-release.sh v0.1.0

# Push the tag to trigger the release workflow
git push origin v0.1.0
```

Or manually:
```bash
git tag -a v0.1.0 -m "Release v0.1.0"
git push origin v0.1.0
```

### 3. Monitor the Build

1. Go to the [Actions tab](https://github.com/YU000jp/forked-sbe-tauri-poc/actions)
2. Watch the "Release" workflow progress
3. The workflow will take approximately 20-30 minutes to complete all builds

### 4. What the Workflow Does

The automated workflow will:

1. **Create the Release**
   - Creates a GitHub release for tag v0.1.0
   - Marks it as pre-release
   - Uses content from `RELEASE_NOTES.md`

2. **Build for macOS** (2 architectures)
   - Apple Silicon (M1/M2/M3): `sbe-tauri-poc_aarch64.dmg`
   - Intel Mac: `sbe-tauri-poc_x64.dmg`

3. **Build for Windows**
   - MSI installer: `sbe-tauri-poc_0.1.0_x64_en-US.msi`
   - NSIS installer: `sbe-tauri-poc_0.1.0_x64-setup.exe`

4. **Build for Linux**
   - Debian package: `sbe-tauri-poc_0.1.0_amd64.deb`
   - AppImage: `sbe-tauri-poc_0.1.0_amd64.AppImage`

5. **Upload Artifacts**
   - All build artifacts are automatically uploaded to the GitHub release

### 5. Verify the Release

After the workflow completes:

1. Visit the [Releases page](https://github.com/YU000jp/forked-sbe-tauri-poc/releases)
2. Verify that v0.1.0 release exists
3. Check that all platform artifacts are attached:
   - 2 macOS files (.dmg)
   - 2 Windows files (.msi, .exe)
   - 2 Linux files (.deb, .AppImage)
4. Test download and installation on at least one platform

### 6. Announce the Release

After verification:
1. Update the issue with the release link
2. Consider announcing on relevant channels
3. Close the release issue

## Troubleshooting

### If the Workflow Fails

1. Check the workflow logs in the Actions tab
2. Common issues:
   - **Build failures**: Check Rust/Node.js dependencies
   - **Upload failures**: Check GitHub token permissions
   - **Platform-specific issues**: May need to adjust workflow configuration

### Manual Release (Fallback)

If automated workflow fails, you can create a release manually:

1. Build locally (on each platform):
   ```bash
   npm install
   npm run tauri build
   ```

2. Upload artifacts manually to GitHub release:
   ```bash
   gh release create v0.1.0 src-tauri/target/release/bundle/* \
     --title "SBEデスクトップアプリ v0.1.0" \
     --notes-file ./RELEASE_NOTES.md \
     --prerelease
   ```

### Testing the Workflow Without Creating a Release

To test the workflow without creating a public release:

1. Go to Actions tab
2. Select "Release" workflow
3. Click "Run workflow"
4. This will build all platforms without creating a tag

## Platform-Specific Notes

### macOS
- The app is **not notarized**, so users will need to run:
  ```bash
  xattr -r -d com.apple.quarantine /Applications/sbe-tauri-poc.app
  ```
- Consider adding notarization in future releases

### Windows
- Both MSI and NSIS installers are provided
- MSI is recommended for corporate environments
- NSIS provides more customization options

### Linux
- .deb package for Debian/Ubuntu-based distributions
- AppImage for universal compatibility across distributions

## Future Releases

For subsequent releases:

1. Update version in:
   - `package.json`
   - `src-tauri/tauri.conf.json`
   - `src-tauri/Cargo.toml`

2. Update `RELEASE_NOTES.md`

3. Create and push new tag (e.g., v0.2.0)

4. Workflow will automatically handle the rest!
