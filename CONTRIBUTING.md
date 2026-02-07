# Contributing to SBE Tauri PoC

Thank you for your interest in contributing to the SBE Tauri PoC project!

## Development Setup

### Prerequisites

- [Node.js](https://nodejs.org/) v16 or later
- [Rust](https://rustup.rs/) latest stable version
- Platform-specific dependencies:
  - **macOS**: Xcode Command Line Tools
  - **Windows**: Visual Studio Build Tools
  - **Linux**: WebKit2GTK development packages

### Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/YU000jp/forked-sbe-tauri-poc.git
   cd forked-sbe-tauri-poc
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run tauri dev
   ```

## Building

### Development Build
```bash
npm run build  # Build frontend only
```

### Production Build
```bash
npm run tauri build
```

The built application will be available in `src-tauri/target/release/bundle/`.

## Release Process

We use automated GitHub Actions workflows to build and publish releases for all platforms.

### Creating a New Release

1. **Update version numbers** in:
   - `package.json`
   - `src-tauri/tauri.conf.json`
   - `src-tauri/Cargo.toml`

2. **Update RELEASE_NOTES.md** with:
   - New features
   - Bug fixes
   - Breaking changes
   - Known issues

3. **Create and push a git tag**:
   ```bash
   # Using the helper script
   ./scripts/create-release.sh v0.2.0
   git push origin v0.2.0
   
   # Or manually
   git tag -a v0.2.0 -m "Release v0.2.0"
   git push origin v0.2.0
   ```

4. **Monitor the build**:
   - Go to the [Actions tab](https://github.com/YU000jp/forked-sbe-tauri-poc/actions)
   - Watch the "Release" workflow
   - The workflow will:
     - Build for Windows (x64)
     - Build for macOS (Intel + Apple Silicon)
     - Build for Linux (amd64)
     - Create a GitHub release
     - Upload all artifacts

5. **Verify the release**:
   - Check the [Releases page](https://github.com/YU000jp/forked-sbe-tauri-poc/releases)
   - Download and test installers for each platform
   - Update release notes if needed

### Release Workflow Details

The release workflow (`.github/workflows/release.yml`) automatically:
- Triggers on git tags starting with `v`
- Builds cross-platform binaries
- Creates installer packages for each platform
- Publishes a pre-release on GitHub
- Uploads all build artifacts

### Manual Release (if needed)

If the automated workflow fails or you need to manually create a release:

1. Build locally for your platform:
   ```bash
   npm run tauri build
   ```

2. Create release using `gh` CLI:
   ```bash
   gh release create v0.2.0 src-tauri/target/release/bundle/* \
     --title "SBEデスクトップアプリ v0.2.0" \
     --notes-file ./RELEASE_NOTES.md \
     --prerelease
   ```

## Code Style

- **Frontend**: Follow Vue 3 and TypeScript best practices
- **Backend**: Follow Rust conventions and use `cargo fmt`
- **Commits**: Use conventional commit messages

## Pull Requests

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Questions?

Feel free to open an issue for any questions or discussions.
