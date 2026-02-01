/**
 * GitStar+ Content Script
 * Injects the second star button on GitHub repository pages
 * Matches GitHub's native button styling perfectly
 */

(function () {
    'use strict';

    const BUTTON_ID = 'gitstarplus-btn';
    const WRAPPER_ID = 'gitstarplus-wrapper';
    let currentRepo = null;

    /**
     * Extract repository info from the current page
     * @returns {Object|null} Repository info or null if not on a repo page
     */
    function getRepoInfo() {
        const path = window.location.pathname;
        const match = path.match(/^\/([^\/]+)\/([^\/]+)/);

        if (!match) return null;

        const owner = match[1];
        const name = match[2];

        // Skip non-repo pages
        const excludedPaths = ['settings', 'organizations', 'orgs', 'users', 'login', 'join', 'pricing', 'features', 'marketplace', 'explore', 'topics', 'trending', 'collections', 'events', 'sponsors', 'notifications', 'new', 'codespaces', 'search', 'pulls', 'issues', 'discussions', 'actions', 'projects', 'security', 'insights', 'wiki'];
        if (excludedPaths.includes(owner)) return null;

        // Get description if available
        const descElement = document.querySelector('p.f4.my-3') ||
            document.querySelector('[data-pjax="#repo-content-pjax-container"] p') ||
            document.querySelector('.BorderGrid-cell p.f4');
        const description = descElement ? descElement.textContent.trim() : '';

        return {
            id: `${owner}/${name}`,
            owner,
            name,
            url: `https://github.com/${owner}/${name}`,
            description
        };
    }

    /**
     * Create the GitStar+ button matching GitHub's exact styling
     * @param {boolean} isActive - Whether the repo is already a favorite
     * @returns {HTMLElement}
     */
    function createGitHubStyledButton(isActive) {
        // Create the outer container matching GitHub's structure
        const container = document.createElement('div');
        container.id = WRAPPER_ID;
        container.className = 'ml-2';
        container.style.cssText = 'display: inline-flex; vertical-align: middle;';

        // Create button group like GitHub's
        const btnGroup = document.createElement('div');
        btnGroup.className = 'BtnGroup';
        btnGroup.style.cssText = 'display: inline-flex;';

        // Main button
        const btn = document.createElement('button');
        btn.id = BUTTON_ID;
        btn.type = 'button';
        btn.className = 'btn-sm btn BtnGroup-item';
        btn.title = isActive ? 'Retirer de GitStar+' : 'Ajouter à GitStar+';
        btn.setAttribute('aria-label', btn.title);
        btn.style.cssText = isActive
            ? 'background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important; color: white !important; border-color: #b45309 !important;'
            : '';

        btn.innerHTML = `
            <svg aria-hidden="true" height="16" viewBox="0 0 16 16" version="1.1" width="16" class="octicon octicon-star${isActive ? '-fill' : ''}" style="fill: ${isActive ? 'white' : 'currentColor'};">
                <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"></path>
            </svg>
            <span data-view-component="true" style="margin-left: 4px;">GitStar+</span>
        `;

        // Store active state on button
        btn.dataset.active = isActive;

        btnGroup.appendChild(btn);
        container.appendChild(btnGroup);

        return container;
    }

    /**
     * Update button state
     * @param {HTMLElement} btn - The button element
     * @param {boolean} isActive - New active state
     */
    function updateButtonState(btn, isActive) {
        btn.dataset.active = isActive;
        btn.title = isActive ? 'Retirer de GitStar+' : 'Ajouter à GitStar+';
        btn.setAttribute('aria-label', btn.title);

        // Update styling
        btn.style.cssText = isActive
            ? 'background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%) !important; color: white !important; border-color: #b45309 !important;'
            : '';

        // Update icon - use setAttribute for SVG elements (className is read-only)
        const svg = btn.querySelector('svg');
        if (svg) {
            svg.style.fill = isActive ? 'white' : 'currentColor';
            // SVG elements need setAttribute for class, not className
            svg.setAttribute('class', `octicon octicon-star${isActive ? '-fill' : ''}`);
        }
    }

    /**
     * Find the action bar and inject our button
     */
    async function injectButton() {
        // Check if already injected
        if (document.getElementById(WRAPPER_ID)) {
            return;
        }

        // Get repo info
        currentRepo = getRepoInfo();
        if (!currentRepo) return;

        // Strategy 1: Find the ul.pagehead-actions (classic GitHub)
        let actionsContainer = document.querySelector('ul.pagehead-actions');

        if (actionsContainer) {
            // Create a new li element like GitHub does
            const li = document.createElement('li');
            li.id = WRAPPER_ID;

            const isActive = await window.GitStarStorage.isFavorite(currentRepo.id);
            const btnContainer = createGitHubStyledButton(isActive);

            // Extract just the BtnGroup from the container
            li.appendChild(btnContainer.querySelector('.BtnGroup'));

            // Insert at the end of the actions list
            actionsContainer.appendChild(li);

            // Add click handler
            const btn = li.querySelector('#' + BUTTON_ID);
            if (btn) btn.addEventListener('click', handleClick);
            return;
        }

        // Strategy 2: Find the repo header actions area (new GitHub UI)
        const starButton = document.querySelector('.starring-container') ||
            document.querySelector('[class*="starring"]') ||
            document.querySelector('button[aria-label*="Star"]')?.closest('div');

        if (starButton) {
            const parent = starButton.parentElement;
            if (parent) {
                const isActive = await window.GitStarStorage.isFavorite(currentRepo.id);
                const container = createGitHubStyledButton(isActive);

                // Insert after the star button
                parent.insertBefore(container, starButton.nextSibling);

                // Add click handler
                const btn = container.querySelector('#' + BUTTON_ID);
                if (btn) btn.addEventListener('click', handleClick);
                return;
            }
        }

        // Strategy 3: Find by looking at the header with Watch, Fork, Star
        const headerActions = document.querySelector('.file-navigation') ||
            document.querySelector('.UnderlineNav-actions') ||
            document.querySelector('[data-turbo-frame="repo-content-turbo-frame"]')?.closest('div')?.querySelector('.d-flex');

        if (headerActions) {
            const isActive = await window.GitStarStorage.isFavorite(currentRepo.id);
            const container = createGitHubStyledButton(isActive);
            headerActions.appendChild(container);

            const btn = container.querySelector('#' + BUTTON_ID);
            if (btn) btn.addEventListener('click', handleClick);
        }
    }

    /**
     * Handle button click
     * @param {Event} e - Click event
     */
    async function handleClick(e) {
        e.preventDefault();
        e.stopPropagation();

        if (!currentRepo) return;

        const btn = e.currentTarget;
        btn.disabled = true;

        try {
            const newState = await window.GitStarStorage.toggleFavorite(currentRepo);
            updateButtonState(btn, newState);

            // Show feedback
            showToast(newState ? '⭐ Ajouté à GitStar+' : 'Retiré de GitStar+');
        } catch (err) {
            console.error('GitStar+ error:', err);
            showToast('Erreur lors de la mise à jour', true);
        } finally {
            btn.disabled = false;
        }
    }

    /**
     * Show a toast notification
     * @param {string} message - Message to show
     * @param {boolean} isError - Whether it's an error message
     */
    function showToast(message, isError = false) {
        // Remove existing toast
        const existing = document.querySelector('.gitstarplus-toast');
        if (existing) existing.remove();

        const toast = document.createElement('div');
        toast.className = `gitstarplus-toast ${isError ? 'error' : 'success'}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        // Trigger animation
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });

        // Remove after delay
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }

    /**
     * Clean up old button if exists (for navigation)
     */
    function cleanup() {
        const existing = document.getElementById(WRAPPER_ID);
        if (existing) existing.remove();
    }

    /**
     * Initialize the content script
     */
    function init() {
        // Initial injection
        injectButton();

        // GitHub uses pjax/turbo for navigation, so we need to watch for URL changes
        let lastUrl = location.href;

        const observer = new MutationObserver(() => {
            if (location.href !== lastUrl) {
                lastUrl = location.href;
                cleanup();
                // Small delay to let GitHub's DOM update
                setTimeout(injectButton, 300);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Also listen for popstate
        window.addEventListener('popstate', () => {
            cleanup();
            setTimeout(injectButton, 300);
        });

        // Listen for turbo:load if Turbo is present
        document.addEventListener('turbo:load', () => {
            cleanup();
            setTimeout(injectButton, 100);
        });

        // Listen for turbo:render
        document.addEventListener('turbo:render', () => {
            cleanup();
            setTimeout(injectButton, 100);
        });

        // Fallback: periodic check for the first few seconds
        let checks = 0;
        const interval = setInterval(() => {
            checks++;
            if (document.getElementById(WRAPPER_ID) || checks > 10) {
                clearInterval(interval);
            } else {
                injectButton();
            }
        }, 500);
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
