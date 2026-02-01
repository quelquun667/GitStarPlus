/**
 * GitStar+ Settings Page
 */

const SETTINGS_KEY = 'gitstarplus_settings';

/**
 * Load settings from storage
 */
async function loadSettings() {
    return new Promise((resolve) => {
        chrome.storage.local.get([SETTINGS_KEY], (result) => {
            resolve(result[SETTINGS_KEY] || { buttonStyle: 'full' });
        });
    });
}

/**
 * Save settings to storage
 */
async function saveSettings(settings) {
    return new Promise((resolve) => {
        chrome.storage.local.set({ [SETTINGS_KEY]: settings }, resolve);
    });
}

/**
 * Show saved toast
 */
function showToast(message) {
    const toast = document.getElementById('saved-toast');
    toast.textContent = message || 'Settings saved';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}

/**
 * Update statistics
 */
async function updateStats() {
    const favorites = await window.GitStarStorage.getFavorites();
    document.getElementById('favorites-count').textContent = favorites.length;

    // Calculate storage size
    const data = await window.GitStarStorage.exportFavorites();
    const sizeKB = (new Blob([data]).size / 1024).toFixed(2);
    document.getElementById('storage-used').textContent = `${sizeKB} KB`;
}

/**
 * Initialize settings page
 */
async function init() {
    const settings = await loadSettings();

    // Set current values
    document.getElementById('button-style-select').value = settings.buttonStyle || 'full';

    // Update stats
    await updateStats();

    // Button style change
    document.getElementById('button-style-select').addEventListener('change', async (e) => {
        const settings = await loadSettings();
        settings.buttonStyle = e.target.value;
        await saveSettings(settings);
        showToast();
    });

    // Clear all button
    document.getElementById('clear-all-btn').addEventListener('click', async () => {
        if (confirm('Are you sure you want to delete ALL your favorites? This action cannot be undone.')) {
            await window.GitStarStorage.clearAllFavorites();
            await updateStats();
            showToast('All favorites deleted');
        }
    });
}

document.addEventListener('DOMContentLoaded', init);
