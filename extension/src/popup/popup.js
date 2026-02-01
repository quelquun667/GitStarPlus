/**
 * GitStar+ Popup
 * Handles the popup UI functionality
 */

document.addEventListener('DOMContentLoaded', init);

let allFavorites = [];

/**
 * Initialize the popup
 */
async function init() {
    await loadFavorites();
    setupEventListeners();
}

/**
 * Load and display favorites
 */
async function loadFavorites() {
    try {
        allFavorites = await window.GitStarStorage.getFavorites();
        updateCounter(allFavorites.length);
        renderFavorites(allFavorites);
    } catch (err) {
        console.error('Error loading favorites:', err);
        showEmptyState(true);
    }
}

/**
 * Update the favorites counter
 * @param {number} count
 */
function updateCounter(count) {
    document.getElementById('counter').textContent = count;
}

/**
 * Render the favorites list
 * @param {Array} favorites
 */
function renderFavorites(favorites) {
    const listEl = document.getElementById('favorites-list');
    const emptyEl = document.getElementById('empty-state');

    if (favorites.length === 0) {
        listEl.innerHTML = '';
        showEmptyState(true);
        return;
    }

    showEmptyState(false);

    // Sort by most recently added
    const sorted = [...favorites].sort((a, b) =>
        new Date(b.addedAt) - new Date(a.addedAt)
    );

    listEl.innerHTML = sorted.map(fav => `
    <div class="favorite-item" data-id="${escapeHtml(fav.id)}">
      <a href="${escapeHtml(fav.url)}" target="_blank" class="favorite-link">
        <div class="favorite-avatar">
          <img src="https://github.com/${escapeHtml(fav.owner)}.png?size=40" alt="${escapeHtml(fav.owner)}" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 16 16%22><rect fill=%22%23ddd%22 width=%2216%22 height=%2216%22/></svg>'">
        </div>
        <div class="favorite-info">
          <span class="favorite-name">${escapeHtml(fav.name)}</span>
          <span class="favorite-owner">${escapeHtml(fav.owner)}</span>
        </div>
      </a>
      <button class="remove-btn" data-id="${escapeHtml(fav.id)}" title="Retirer des favoris">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"/>
        </svg>
      </button>
    </div>
  `).join('');

    // Add click handlers for remove buttons
    listEl.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', handleRemove);
    });
}

/**
 * Show or hide empty state
 * @param {boolean} show
 */
function showEmptyState(show) {
    document.getElementById('empty-state').style.display = show ? 'flex' : 'none';
    document.getElementById('favorites-list').style.display = show ? 'none' : 'block';
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Search
    document.getElementById('search-input').addEventListener('input', handleSearch);

    // Export
    document.getElementById('export-btn').addEventListener('click', handleExport);

    // Import
    document.getElementById('import-btn').addEventListener('click', () => {
        document.getElementById('import-file').click();
    });
    document.getElementById('import-file').addEventListener('change', handleImport);
}

/**
 * Handle search input
 * @param {Event} e
 */
function handleSearch(e) {
    const query = e.target.value.toLowerCase().trim();

    if (!query) {
        renderFavorites(allFavorites);
        return;
    }

    const filtered = allFavorites.filter(fav =>
        fav.name.toLowerCase().includes(query) ||
        fav.owner.toLowerCase().includes(query) ||
        (fav.description && fav.description.toLowerCase().includes(query))
    );

    renderFavorites(filtered);
}

/**
 * Handle remove button click
 * @param {Event} e
 */
async function handleRemove(e) {
    e.preventDefault();
    e.stopPropagation();

    const btn = e.currentTarget;
    const id = btn.dataset.id;

    try {
        await window.GitStarStorage.removeFavorite(id);

        // Update local array
        allFavorites = allFavorites.filter(f => f.id !== id);
        updateCounter(allFavorites.length);

        // Animate removal
        const item = btn.closest('.favorite-item');
        item.classList.add('removing');

        setTimeout(() => {
            renderFavorites(allFavorites);
        }, 200);
    } catch (err) {
        console.error('Error removing favorite:', err);
    }
}

/**
 * Handle export
 */
async function handleExport() {
    try {
        const json = await window.GitStarStorage.exportFavorites();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const date = new Date().toISOString().split('T')[0];
        const filename = `gitstarplus-favorites-${date}.json`;

        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();

        URL.revokeObjectURL(url);

        showNotification('Favoris exportés avec succès!');
    } catch (err) {
        console.error('Export error:', err);
        showNotification('Erreur lors de l\'export', true);
    }
}

/**
 * Handle import
 * @param {Event} e
 */
async function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    try {
        const content = await file.text();
        const result = await window.GitStarStorage.importFavorites(content, true);

        if (result.success) {
            await loadFavorites();
            showNotification(`${result.count} favoris importés!`);
        } else {
            showNotification(result.error, true);
        }
    } catch (err) {
        console.error('Import error:', err);
        showNotification('Erreur lors de l\'import', true);
    }

    // Reset file input
    e.target.value = '';
}

/**
 * Show a notification
 * @param {string} message
 * @param {boolean} isError
 */
function showNotification(message, isError = false) {
    // Simple notification using the header area
    const header = document.querySelector('.header');
    const notif = document.createElement('div');
    notif.className = `notification ${isError ? 'error' : 'success'}`;
    notif.textContent = message;

    header.appendChild(notif);

    setTimeout(() => {
        notif.classList.add('fade-out');
        setTimeout(() => notif.remove(), 300);
    }, 2500);
}

/**
 * Escape HTML to prevent XSS
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
