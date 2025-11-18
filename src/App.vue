<script setup lang="ts">
import { ref, onMounted } from "vue";
import { invoke } from "@tauri-apps/api/core";

interface RecentWindow {
  id: string;
  title: string;
  url: string;
  lastAccessed: Date;
}

interface Favorite {
  id: string;
  title: string;
  url: string;
}

const recentWindows = ref<RecentWindow[]>([]);
const favorites = ref<Favorite[]>([]);
const newFavoriteUrl = ref("");
const errorMessage = ref("");
const isLoading = ref(false);

// メイン機能
const openScrapboxHome = async () => {
  try {
    isLoading.value = true;
    const windowId = `scrapbox-home-${Date.now()}`;
    await invoke('create_webview_window', { 
      url: "https://scrapbox.io",
      label: windowId
    });
    
    // 履歴に追加
    addToRecent({
      id: windowId,
      title: "Scrapbox Home",
      url: "https://scrapbox.io",
      lastAccessed: new Date()
    });
    
    errorMessage.value = "";
  } catch (error) {
    console.error('Failed to open Scrapbox:', error);
    errorMessage.value = `Scrapboxの起動に失敗しました: ${error}`;
  } finally {
    isLoading.value = false;
  }
};

const openScrapboxProject = async (projectName: string) => {
  try {
    const url = `https://scrapbox.io/${projectName}`;
    const windowId = `scrapbox-${projectName}-${Date.now()}`;
    await invoke('create_webview_window', { 
      url,
      label: windowId
    });
    
    addToRecent({
      id: windowId,
      title: `Scrapbox - ${projectName}`,
      url,
      lastAccessed: new Date()
    });
    
    errorMessage.value = "";
  } catch (error) {
    console.error('Failed to open Scrapbox project:', error);
    errorMessage.value = `プロジェクトの起動に失敗しました: ${error}`;
  }
};

const openCustomProject = async () => {
  const projectName = prompt("Scrapboxプロジェクト名を入力してください:");
  if (projectName) {
    await openScrapboxProject(projectName);
  }
};

// 履歴管理
const addToRecent = (window: RecentWindow) => {
  // 重複を削除
  recentWindows.value = recentWindows.value.filter(w => w.id !== window.id);
  // 先頭に追加
  recentWindows.value.unshift(window);
  // 最大10件まで保持
  if (recentWindows.value.length > 10) {
    recentWindows.value = recentWindows.value.slice(0, 10);
  }
  saveToStorage();
};

const reopenWindow = async (window: RecentWindow) => {
  try {
    const windowId = `reopen-${Date.now()}`;
    await invoke('create_webview_window', { 
      url: window.url,
      label: windowId
    });
    
    // 履歴を更新
    addToRecent({
      ...window,
      id: windowId,
      lastAccessed: new Date()
    });
    
    errorMessage.value = "";
  } catch (error) {
    console.error('Failed to reopen window:', error);
    errorMessage.value = `ウィンドウの再起動に失敗しました: ${error}`;
  }
};

const removeFromRecent = (windowId: string) => {
  recentWindows.value = recentWindows.value.filter(w => w.id !== windowId);
  saveToStorage();
};

// お気に入り管理
const addFavorite = () => {
  if (!newFavoriteUrl.value.trim()) return;
  
  try {
    const url = new URL(newFavoriteUrl.value);
    const favorite: Favorite = {
      id: `fav-${Date.now()}`,
      title: url.pathname.split('/').filter(p => p).pop() || url.hostname,
      url: newFavoriteUrl.value
    };
    
    favorites.value.push(favorite);
    newFavoriteUrl.value = "";
    saveToStorage();
    errorMessage.value = "";
  } catch (error) {
    errorMessage.value = "有効なURLを入力してください";
  }
};

const openFavorite = async (favorite: Favorite) => {
  try {
    const windowId = `favorite-${Date.now()}`;
    await invoke('create_webview_window', { 
      url: favorite.url,
      label: windowId
    });
    
    addToRecent({
      id: windowId,
      title: favorite.title,
      url: favorite.url,
      lastAccessed: new Date()
    });
    
    errorMessage.value = "";
  } catch (error) {
    console.error('Failed to open favorite:', error);
    errorMessage.value = `お気に入りの起動に失敗しました: ${error}`;
  }
};

const removeFavorite = (favoriteId: string) => {
  favorites.value = favorites.value.filter(f => f.id !== favoriteId);
  saveToStorage();
};

// ユーティリティ
const formatTime = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  
  if (minutes < 1) return "たった今";
  if (minutes < 60) return `${minutes}分前`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}時間前`;
  return date.toLocaleDateString();
};

const refreshData = () => {
  loadFromStorage();
  errorMessage.value = "データを更新しました";
  setTimeout(() => {
    errorMessage.value = "";
  }, 2000);
};

// データ永続化
const saveToStorage = () => {
  localStorage.setItem('sbe-recent', JSON.stringify(recentWindows.value.map(w => ({
    ...w,
    lastAccessed: w.lastAccessed.toISOString()
  }))));
  localStorage.setItem('sbe-favorites', JSON.stringify(favorites.value));
};

const loadFromStorage = () => {
  try {
    const recentData = localStorage.getItem('sbe-recent');
    if (recentData) {
      const parsed = JSON.parse(recentData);
      recentWindows.value = parsed.map((w: any) => ({
        ...w,
        lastAccessed: new Date(w.lastAccessed)
      }));
    }
    
    const favData = localStorage.getItem('sbe-favorites');
    if (favData) {
      favorites.value = JSON.parse(favData);
    }
  } catch (error) {
    console.error('Failed to load from storage:', error);
  }
};

onMounted(() => {
  loadFromStorage();
  
  // サンプルのお気に入りを追加（初回のみ）
  if (favorites.value.length === 0) {
    favorites.value = [
      {
        id: 'sample-1',
        title: 'Scrapbox ヘルプ',
        url: 'https://scrapbox.io/help-jp'
      }
    ];
    saveToStorage();
  }
});
</script>

<template>
  <div class="app-container">
    <header class="app-header">
      <div class="app-title">
        <h1>🗂️ SBE - Scrapbox Desktop Manager</h1>
      </div>
      <div class="quick-actions">
        <button @click="openScrapboxHome" class="action-btn primary" :disabled="isLoading">
          📝 Scrapboxを開く
        </button>
        <button @click="refreshData" class="action-btn" :disabled="isLoading">
          ⟳ 更新
        </button>
      </div>
    </header>

    <!-- Quick Launch Section -->
    <div class="quick-launch">
      <h2>🚀 クイックアクセス</h2>
      <div class="launch-grid">
        <button @click="openScrapboxProject('help-jp')" class="launch-item">
          <div class="launch-icon">📖</div>
          <div class="launch-title">Scrapbox ヘルプ</div>
          <div class="launch-url">help-jp</div>
        </button>
        <button @click="openCustomProject" class="launch-item add-project">
          <div class="launch-icon">➕</div>
          <div class="launch-title">プロジェクトを追加</div>
        </button>
      </div>
    </div>
    
    <main class="content-container">
      <!-- Recent Windows Section -->
      <div class="recent-section">
        <h2>📋 最近開いたウィンドウ</h2>
        <div v-if="recentWindows.length > 0" class="recent-list">
          <div v-for="window in recentWindows" :key="window.id" class="recent-item" @click="reopenWindow(window)">
            <div class="recent-info">
              <div class="recent-title">{{ window.title }}</div>
              <div class="recent-url">{{ window.url }}</div>
              <div class="recent-time">{{ formatTime(window.lastAccessed) }}</div>
            </div>
            <div class="recent-actions" @click.stop>
              <button @click="removeFromRecent(window.id)" class="recent-btn danger" title="削除">
                🗑️
              </button>
            </div>
          </div>
        </div>
        <div v-else class="no-recent">
          <p>まだウィンドウを開いていません</p>
        </div>
      </div>

      <!-- Favorites Section -->
      <div class="favorites-section">
        <h2>⭐ お気に入り</h2>
        <div class="favorites-list">
          <div v-for="favorite in favorites" :key="favorite.id" class="favorite-item" @click="openFavorite(favorite)">
            <div class="favorite-info">
              <div class="favorite-title">{{ favorite.title }}</div>
              <div class="favorite-url">{{ favorite.url }}</div>
            </div>
            <div class="favorite-actions" @click.stop>
              <button @click="removeFavorite(favorite.id)" class="favorite-btn danger" title="削除">
                🗑️
              </button>
            </div>
          </div>
          <div class="add-favorite">
            <input 
              v-model="newFavoriteUrl" 
              placeholder="ScrapboxプロジェクトURLを入力" 
              class="favorite-input"
              @keyup.enter="addFavorite"
            >
            <button @click="addFavorite" class="favorite-btn primary">追加</button>
          </div>
        </div>
      </div>
      
      <div v-if="errorMessage" class="error-message">
        {{ errorMessage }}
      </div>
      
      <div class="instructions">
        <h3>使い方:</h3>
        <ul>
          <li>📝 ボタンでScrapboxメインページを専用ウィンドウで開く</li>
          <li>クイックアクセスからよく使うプロジェクトを素早く開く</li>
          <li>「最近開いたウィンドウ」から以前開いたページを再度開く</li>
          <li>「お気に入り」にプロジェクトURLを登録してアクセスを簡単に</li>
          <li>各項目をクリックして開く、🗑️ボタンで削除</li>
        </ul>
        <p><strong>注意:</strong> Scrapboxは専用のWebViewウィンドウで表示されます。</p>
      </div>
    </main>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background: #f8f9fa;
}

/* Header Styles */
.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 16px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 12px rgba(0,0,0,0.15);
}

.app-title h1 {
  font-size: 20px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
}

.quick-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.action-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #0056b3;
  transform: translateY(-1px);
}

.action-btn.primary {
  background: #28a745;
}

.action-btn.primary:hover {
  background: #218838;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* Quick Launch Section */
.quick-launch {
  background: white;
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
}

.quick-launch h2 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #495057;
}

.launch-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.launch-item {
  background: #f8f9fa;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.launch-item:hover {
  border-color: #007bff;
  background: #e7f3ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,123,255,0.15);
}

.launch-item.add-project {
  border-color: #28a745;
  color: #28a745;
}

.launch-item.add-project:hover {
  border-color: #28a745;
  background: #e8f5e8;
}

.launch-icon {
  font-size: 24px;
}

.launch-title {
  font-size: 14px;
  font-weight: 500;
  color: #495057;
}

.launch-url {
  font-size: 12px;
  color: #6c757d;
}

/* Content Container */
.content-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 24px;
  gap: 24px;
  overflow-y: auto;
}

/* Recent Windows Section */
.recent-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.recent-section h2 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #495057;
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.recent-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.recent-item:hover {
  border-color: #007bff;
  background: #f8f9ff;
}

.recent-info {
  flex: 1;
  min-width: 0;
}

.recent-title {
  font-weight: 500;
  font-size: 14px;
  color: #212529;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.recent-url {
  font-size: 12px;
  color: #6c757d;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.recent-time {
  font-size: 11px;
  color: #6c757d;
}

.recent-actions {
  display: flex;
  gap: 8px;
}

.recent-btn {
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  font-size: 16px;
  transition: all 0.2s;
}

.recent-btn:hover {
  background: #e9ecef;
  color: #495057;
}

.recent-btn.danger:hover {
  background: #dc3545;
  color: white;
}

.no-recent {
  text-align: center;
  color: #6c757d;
  font-size: 14px;
  padding: 20px;
}

/* Favorites Section */
.favorites-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.favorites-section h2 {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #495057;
}

.favorites-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.favorite-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.favorite-item:hover {
  border-color: #28a745;
  background: #f8fff8;
}

.favorite-info {
  flex: 1;
  min-width: 0;
}

.favorite-title {
  font-weight: 500;
  font-size: 14px;
  color: #212529;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.favorite-url {
  font-size: 12px;
  color: #6c757d;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.favorite-actions {
  display: flex;
  gap: 8px;
}

.favorite-btn {
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  font-size: 16px;
  transition: all 0.2s;
}

.favorite-btn:hover {
  background: #e9ecef;
  color: #495057;
}

.favorite-btn.primary {
  background: #007bff;
  color: white;
  padding: 6px 12px;
  font-size: 12px;
}

.favorite-btn.primary:hover {
  background: #0056b3;
}

.favorite-btn.danger:hover {
  background: #dc3545;
  color: white;
}

.add-favorite {
  display: flex;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e9ecef;
}

.favorite-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  font-size: 14px;
}

.favorite-input:focus {
  outline: none;
  border-color: #007bff;
}

/* Error Message */
.error-message {
  background: #f8d7da;
  color: #721c24;
  padding: 12px 20px;
  border-left: 4px solid #dc3545;
  border-radius: 6px;
  font-size: 14px;
  margin-bottom: 16px;
}

/* Instructions */
.instructions {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  margin-top: auto;
}

.instructions h3 {
  color: #333;
  margin-bottom: 12px;
  font-size: 16px;
}

.instructions ul {
  list-style-type: disc;
  padding-left: 20px;
}

.instructions li {
  margin-bottom: 6px;
  line-height: 1.4;
  font-size: 14px;
}

.instructions p {
  margin-top: 16px;
  padding: 12px;
  background-color: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 6px;
  color: #856404;
  font-size: 13px;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .app-container {
    background: #1a1a1a;
    color: #f6f6f6;
  }

  .quick-launch,
  .recent-section,
  .favorites-section,
  .instructions {
    background: #2d2d2d;
    color: #f6f6f6;
  }

  .recent-item,
  .favorite-item {
    border-color: #444;
    background: #2d2d2d;
  }

  .recent-item:hover {
    background: #3d3d3d;
    border-color: #007bff;
  }

  .favorite-item:hover {
    background: #3d3d3d;
    border-color: #28a745;
  }

  .favorite-input {
    background: #2d2d2d;
    border-color: #444;
    color: #f6f6f6;
  }

  .launch-item {
    background: #2d2d2d;
    border-color: #444;
    color: #f6f6f6;
  }

  .launch-item:hover {
    background: #3d3d3d;
  }
}
</style>