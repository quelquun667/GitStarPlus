/**
 * GitStar+ Background Service Worker
 * Handles installation events
 */

/**
 * Set up the extension on install/update
 */
chrome.runtime.onInstalled.addListener((details) => {
    console.log('GitStar+ installed/updated:', details.reason);

    // Initialize storage on first install
    if (details.reason === 'install') {
        chrome.storage.local.set({
            'gitstarplus_data': {
                favorites: [],
                version: 1
            },
            'gitstarplus_settings': {
                language: 'fr',
                buttonStyle: 'full'
            }
        });

        console.log('GitStar+ storage initialized');
    }
});

/**
 * Handle messages from content scripts or popup
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'GET_TAB_URL') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
                sendResponse({ url: tabs[0].url });
            } else {
                sendResponse({ url: null });
            }
        });
        return true; // Keep message channel open for async response
    }

    // Get current settings
    if (message.type === 'GET_SETTINGS') {
        chrome.storage.local.get(['gitstarplus_settings'], (result) => {
            sendResponse(result.gitstarplus_settings || { language: 'fr', buttonStyle: 'full' });
        });
        return true;
    }
});
