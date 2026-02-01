/**
 * GitStar+ Settings Page
 */

const SETTINGS_KEY = 'gitstarplus_settings';

const i18n = {
    fr: {
        language_label: "Langue de l'interface",
        button_text_label: "Texte du bouton",
        favorites_count: "Nombre de favoris",
        storage_used: "Espace utilisé",
        clear_all: "Supprimer tous les favoris",
        clear_btn: "Supprimer tout",
        clear_confirm: "Êtes-vous sûr de vouloir supprimer TOUS vos favoris ? Cette action est irréversible.",
        saved: "✓ Paramètres sauvegardés",
        cleared: "Tous les favoris ont été supprimés"
    },
    en: {
        language_label: "Interface language",
        button_text_label: "Button text",
        favorites_count: "Favorites count",
        storage_used: "Storage used",
        clear_all: "Delete all favorites",
        clear_btn: "Delete all",
        clear_confirm: "Are you sure you want to delete ALL your favorites? This action cannot be undone.",
        saved: "✓ Settings saved",
        cleared: "All favorites have been deleted"
    }
};

let currentLang = 'fr';

/**
 * Load settings from storage
 */
async function loadSettings() {
    return new Promise((resolve) => {
        chrome.storage.local.get([SETTINGS_KEY], (result) => {
            resolve(result[SETTINGS_KEY] || { language: 'fr', buttonStyle: 'full' });
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
 * Update UI with translations
 */
function updateTranslations(lang) {
    currentLang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (i18n[lang][key]) {
            el.textContent = i18n[lang][key];
        }
    });
}

/**
 * Show saved toast
 */
function showToast(message) {
    const toast = document.getElementById('saved-toast');
    toast.textContent = message || i18n[currentLang].saved;
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
    document.getElementById('language-select').value = settings.language || 'fr';
    document.getElementById('button-style-select').value = settings.buttonStyle || 'full';

    // Update translations
    updateTranslations(settings.language || 'fr');

    // Update stats
    await updateStats();

    // Language change
    document.getElementById('language-select').addEventListener('change', async (e) => {
        const newLang = e.target.value;
        const settings = await loadSettings();
        settings.language = newLang;
        await saveSettings(settings);
        updateTranslations(newLang);
        showToast();
    });

    // Button style change
    document.getElementById('button-style-select').addEventListener('change', async (e) => {
        const settings = await loadSettings();
        settings.buttonStyle = e.target.value;
        await saveSettings(settings);
        showToast();
    });

    // Clear all button
    document.getElementById('clear-all-btn').addEventListener('click', async () => {
        if (confirm(i18n[currentLang].clear_confirm)) {
            await window.GitStarStorage.clearAllFavorites();
            await updateStats();
            showToast(i18n[currentLang].cleared);
        }
    });
}

document.addEventListener('DOMContentLoaded', init);
