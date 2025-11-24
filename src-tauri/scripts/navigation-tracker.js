console.log('🔧 Initializing navigation tracker for:', window.navigationTrackerLabel);

// Navigation tracking state
let currentUrl = window.location.href;
let currentTitle = document.title || window.location.hostname || 'Untitled';

// Function to track navigation
function trackNavigation(source = 'unknown') {
    const url = window.location.href;
    const title = document.title || window.location.hostname || 'Untitled';
    
    // Skip if no change
    if (url === currentUrl && title === currentTitle) return;
    
    console.log('🔄 Navigation tracked (' + source + '):', title, '→', url);
    
    // Update state
    currentUrl = url;
    currentTitle = title;
    
    if (window.__TAURI__ && window.__TAURI__.core) {
        window.__TAURI__.core.invoke('track_navigation', {
            windowLabel: window.navigationTrackerLabel,
            url: url,
            title: title
        }).then(result => {
            console.log('✅ Track navigation success:', result);
        }).catch(err => {
            console.error('❌ Failed to track navigation:', err);
        });
    } else {
        console.error('❌ Tauri API not available');
    }
}

// Initialize tracking
console.log('🚀 Starting navigation tracking...');

// Track initial page load
trackNavigation('initialization');

// Listen for navigation events
window.addEventListener('popstate', () => trackNavigation('popstate'));
window.addEventListener('hashchange', () => trackNavigation('hashchange'));

// Handle SPA navigation (for modern web apps like Scrapbox)
const originalPushState = history.pushState;
const originalReplaceState = history.replaceState;

history.pushState = function(...args) {
    originalPushState.apply(this, args);
    trackNavigation('pushState');
};

history.replaceState = function(...args) {
    originalReplaceState.apply(this, args);
    trackNavigation('replaceState');
};

// Monitor title changes (for dynamic title updates)
let titleObserver;
if (document.querySelector('title')) {
    titleObserver = new MutationObserver(() => trackNavigation('titleChange'));
    titleObserver.observe(document.querySelector('title'), { childList: true });
}

// Add to favorites functionality
function addToFavorites() {
    const url = window.location.href;
    const title = document.title || window.location.hostname || 'Untitled';
    
    console.log('⭐ Adding to favorites:', title, '→', url);
    
    if (window.__TAURI__ && window.__TAURI__.core) {
        window.__TAURI__.core.invoke('add_to_favorites_from_webview', {
            url: url,
            title: title
        }).then(result => {
            console.log('✅ Added to favorites successfully:', result);
            // Show a subtle notification
            showNotification('お気に入りに追加しました: ' + title);
        }).catch(err => {
            console.error('❌ Failed to add to favorites:', err);
            showNotification('お気に入りの追加に失敗しました');
        });
    } else {
        console.error('❌ Tauri API not available');
    }
}

// Show notification function
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 12px 20px;
        border-radius: 4px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 14px;
        z-index: 10000;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        transition: opacity 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Context menu functionality
document.addEventListener('contextmenu', (e) => {
    // Only add our menu item for Scrapbox pages
    if (window.location.hostname.includes('scrapbox.io')) {
        e.preventDefault();
        showContextMenu(e.pageX, e.pageY);
    }
});

function showContextMenu(x, y) {
    // Remove existing context menu if any
    const existingMenu = document.getElementById('tauri-context-menu');
    if (existingMenu) {
        existingMenu.remove();
    }
    
    // Create context menu
    const menu = document.createElement('div');
    menu.id = 'tauri-context-menu';
    menu.style.cssText = `
        position: fixed;
        left: ${x}px;
        top: ${y}px;
        background: white;
        border: 1px solid #ccc;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        z-index: 10000;
        min-width: 180px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 14px;
    `;
    
    // Add menu item
    const menuItem = document.createElement('div');
    menuItem.textContent = '⭐ お気に入りに追加';
    menuItem.style.cssText = `
        padding: 8px 16px;
        cursor: pointer;
        border-radius: 4px;
        transition: background-color 0.2s;
    `;
    
    menuItem.addEventListener('mouseenter', () => {
        menuItem.style.backgroundColor = '#f0f0f0';
    });
    
    menuItem.addEventListener('mouseleave', () => {
        menuItem.style.backgroundColor = 'transparent';
    });
    
    menuItem.addEventListener('click', () => {
        addToFavorites();
        menu.remove();
    });
    
    menu.appendChild(menuItem);
    document.body.appendChild(menu);
    
    // Remove menu when clicking elsewhere
    setTimeout(() => {
        document.addEventListener('click', function removeMenu() {
            menu.remove();
            document.removeEventListener('click', removeMenu);
        });
    }, 0);
    
    // Adjust position if menu goes off screen
    const rect = menu.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
        menu.style.left = (x - rect.width) + 'px';
    }
    if (rect.bottom > window.innerHeight) {
        menu.style.top = (y - rect.height) + 'px';
    }
}