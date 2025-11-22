console.log('🔧 Initializing navigation tracker for:', window.navigationTrackerLabel);

// Navigation tracking state
let currentUrl = window.location.href;
let currentTitle = document.title || window.location.hostname || 'Untitled';

// Function to track navigation
function trackNavigation(url, title, source) {
    console.log('🔄 Navigation tracked (' + source + '):', title, '→', url);
    
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
setTimeout(() => {
    trackNavigation(currentUrl, currentTitle, 'initialization');
}, 100);

// Start monitoring for changes
setInterval(() => {
    const newUrl = window.location.href;
    const newTitle = document.title || window.location.hostname || 'Untitled';
    
    if (newUrl !== currentUrl || newTitle !== currentTitle) {
        trackNavigation(newUrl, newTitle, 'polling');
        currentUrl = newUrl;
        currentTitle = newTitle;
    }
}, 300);

// Listen for browser navigation events
window.addEventListener('popstate', () => {
    setTimeout(() => {
        const url = window.location.href;
        const title = document.title || window.location.hostname || 'Untitled';
        trackNavigation(url, title, 'popstate');
        currentUrl = url;
        currentTitle = title;
    }, 50);
});

window.addEventListener('hashchange', () => {
    const url = window.location.href;
    const title = document.title || window.location.hostname || 'Untitled';
    trackNavigation(url, title, 'hashchange');
    currentUrl = url;
    currentTitle = title;
});