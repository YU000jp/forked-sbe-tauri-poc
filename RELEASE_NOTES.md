# SBEデスクトップアプリ v0.1.0

初回リリースです。Tauri 2.0 を使用した軽量デスクトップアプリケーションとして、Scrapbox (Cosense) プロジェクトの閲覧環境を提供します。

## ✨ 主な機能

### 🌐 WebView管理
- 複数のScrapboxプロジェクトウィンドウを作成・管理
- ページナビゲーションと履歴の自動追跡
- 最近訪れたウィンドウのクイックアクセス

### ⭐ お気に入りシステム
- 任意のScrapboxページを右クリックでお気に入りに追加
- WebView Cookieによる認証で、プライベートプロジェクトへシームレスにアクセス
- localStorageによる永続的な保存

### 📚 Scrapbox API連携
- プロジェクトページ一覧の取得・表示
- プライベートプロジェクトへの認証対応
- 更新日、作成日、閲覧数、タイトルでのソート機能
- リアルタイム更新とローディング状態の表示

### 🎨 モダンなUI/UX
- OSの設定に基づく自動ダークモード/ライトモード切り替え
- モダンブラウザライクなタブベースインターフェース
- デスクトップ利用に最適化されたレスポンシブデザイン
- API操作中のビジュアルフィードバック

### 🔧 高度な機能
- カスタムコンテキストメニューとページインタラクション用のJavaScript注入
- ユーザーアクションの成功/エラーフィードバック
- macOS、Windows、Linuxのクロスプラットフォーム対応

## 📊 パフォーマンス

- **バイナリサイズ**: ~11MB (ARM64 macOS)
- **DMGパッケージ**: ~3.9MB (圧縮済み)
- **メモリ使用量**: ~30-50MB (Electronの ~100-200MB と比較)
- **起動時間**: OSネイティブWebViewによる高速起動

### Electronとの比較
| 指標 | Tauri版 | 一般的なElectronアプリ |
|------|---------|----------------------|
| バイナリサイズ | 11MB | 100-300MB |
| メモリ使用量 | 30-50MB | 100-200MB |
| WebViewエンジン | OSネイティブ | バンドルされたChromium |
| セキュリティ | Rust + OS WebView | Node.js + Chromium |

## 🚀 インストール

### Windows
1. `sbe-tauri-poc_0.1.0_x64_en-US.msi` または `sbe-tauri-poc_0.1.0_x64-setup.exe` をダウンロード
2. ダウンロードしたインストーラーを実行
3. インストールウィザードの指示に従ってインストール

### macOS
1. お使いのMacのアーキテクチャに合わせて以下をダウンロード:
   - Apple Silicon (M1/M2/M3): `sbe-tauri-poc_aarch64.dmg`
   - Intel Mac: `sbe-tauri-poc_x64.dmg`
2. DMGファイルをマウントし、アプリケーションフォルダにドラッグ
3. **重要**: 公証されていないため、初回起動時に以下のコマンドが必要な場合があります:
   ```bash
   xattr -r -d com.apple.quarantine /Applications/sbe-tauri-poc.app
   ```
   または、システム環境設定 > セキュリティとプライバシー から「このまま開く」を選択

### Linux
以下のいずれかをダウンロード:

#### Debian/Ubuntu (.deb)
```bash
sudo dpkg -i sbe-tauri-poc_0.1.0_amd64.deb
```

#### AppImage (ディストリビューション非依存)
```bash
chmod +x sbe-tauri-poc_0.1.0_amd64.AppImage
./sbe-tauri-poc_0.1.0_amd64.AppImage
```

## 🔧 技術スタック

### フロントエンド
- Vue 3 (Composition API)
- TypeScript
- Vite
- CSSカスタムプロパティによるテーマ管理

### バックエンド
- Rust (安全で高性能なバックエンド)
- Tauri 2.0
- reqwest (HTTP APIコール)
- serde (JSON シリアライズ/デシリアライズ)

## 🐛 既知の問題

- macOSでは公証が未対応のため、初回起動時にセキュリティ警告が表示される場合があります
- 一部のWebView機能はプラットフォームによって動作が異なる場合があります

## 📝 変更内容

### 追加
- Tauri 2.0による初回デスクトップアプリケーションリリース
- Windows/macOS/Linux用のインストーラー/パッケージ
- WebViewベースのScrapboxプロジェクト閲覧機能
- お気に入り管理機能
- ダークモード対応

### 設定
- `tauri.conf.json` の本番環境設定を最適化
- マルチプラットフォームビルド設定

## 🔗 関連プロジェクト

このプロジェクトは、オリジナルの [SBE (Scrapbox in Electron)](https://github.com/kondoumh/sbe) にインスパイアされたTauriベースの試験的実装です。

## 📄 ライセンス

MITライセンス（詳細はLICENSEファイルを参照）

---

**フィードバックや問題報告は[Issues](https://github.com/YU000jp/forked-sbe-tauri-poc/issues)までお願いします。**
