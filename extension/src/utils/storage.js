/**
 * GitStar+ Storage Module
 * Handles all chrome.storage.local operations for favorites management
 */

const STORAGE_KEY = 'gitstarplus_data';
const CURRENT_VERSION = 1;

/**
 * Get default empty data structure
 */
function getDefaultData() {
  return {
    favorites: [],
    version: CURRENT_VERSION
  };
}

/**
 * Get all stored data
 * @returns {Promise<Object>} The stored data object
 */
async function getData() {
  return new Promise((resolve) => {
    chrome.storage.local.get([STORAGE_KEY], (result) => {
      resolve(result[STORAGE_KEY] || getDefaultData());
    });
  });
}

/**
 * Save data to storage
 * @param {Object} data - The data to save
 */
async function saveData(data) {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEY]: data }, resolve);
  });
}

/**
 * Get all favorites
 * @returns {Promise<Array>} Array of favorites
 */
async function getFavorites() {
  const data = await getData();
  return data.favorites || [];
}

/**
 * Check if a repository is a favorite
 * @param {string} repoId - The repository ID (owner/repo)
 * @returns {Promise<boolean>}
 */
async function isFavorite(repoId) {
  const favorites = await getFavorites();
  return favorites.some(fav => fav.id === repoId);
}

/**
 * Add a repository to favorites
 * @param {Object} repo - The repository object
 * @returns {Promise<void>}
 */
async function addFavorite(repo) {
  const data = await getData();
  
  // Check if already exists
  if (data.favorites.some(fav => fav.id === repo.id)) {
    return;
  }
  
  const favorite = {
    id: repo.id,
    name: repo.name,
    owner: repo.owner,
    url: repo.url,
    description: repo.description || '',
    addedAt: new Date().toISOString(),
    tags: []
  };
  
  data.favorites.push(favorite);
  await saveData(data);
}

/**
 * Remove a repository from favorites
 * @param {string} repoId - The repository ID (owner/repo)
 * @returns {Promise<void>}
 */
async function removeFavorite(repoId) {
  const data = await getData();
  data.favorites = data.favorites.filter(fav => fav.id !== repoId);
  await saveData(data);
}

/**
 * Toggle favorite status of a repository
 * @param {Object} repo - The repository object
 * @returns {Promise<boolean>} New favorite status
 */
async function toggleFavorite(repo) {
  const isCurrentlyFavorite = await isFavorite(repo.id);
  
  if (isCurrentlyFavorite) {
    await removeFavorite(repo.id);
    return false;
  } else {
    await addFavorite(repo);
    return true;
  }
}

/**
 * Export favorites as JSON string
 * @returns {Promise<string>} JSON string of favorites data
 */
async function exportFavorites() {
  const data = await getData();
  return JSON.stringify(data, null, 2);
}

/**
 * Import favorites from JSON string
 * @param {string} jsonString - JSON string to import
 * @param {boolean} merge - If true, merge with existing favorites; if false, replace
 * @returns {Promise<{success: boolean, count: number, error?: string}>}
 */
async function importFavorites(jsonString, merge = true) {
  try {
    const importedData = JSON.parse(jsonString);
    
    // Validate structure
    if (!importedData.favorites || !Array.isArray(importedData.favorites)) {
      return { success: false, count: 0, error: 'Format invalide: favorites manquants' };
    }
    
    // Validate each favorite
    for (const fav of importedData.favorites) {
      if (!fav.id || !fav.name || !fav.owner || !fav.url) {
        return { success: false, count: 0, error: 'Format invalide: champs requis manquants' };
      }
    }
    
    if (merge) {
      const currentData = await getData();
      const existingIds = new Set(currentData.favorites.map(f => f.id));
      
      for (const fav of importedData.favorites) {
        if (!existingIds.has(fav.id)) {
          currentData.favorites.push(fav);
        }
      }
      
      await saveData(currentData);
      return { success: true, count: importedData.favorites.length };
    } else {
      await saveData(importedData);
      return { success: true, count: importedData.favorites.length };
    }
  } catch (e) {
    return { success: false, count: 0, error: 'JSON invalide: ' + e.message };
  }
}

/**
 * Get favorites count
 * @returns {Promise<number>}
 */
async function getFavoritesCount() {
  const favorites = await getFavorites();
  return favorites.length;
}

/**
 * Clear all favorites
 * @returns {Promise<void>}
 */
async function clearAllFavorites() {
  await saveData(getDefaultData());
}

// Make functions available globally for content scripts
if (typeof window !== 'undefined') {
  window.GitStarStorage = {
    getFavorites,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    exportFavorites,
    importFavorites,
    getFavoritesCount,
    clearAllFavorites
  };
}
