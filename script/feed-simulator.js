/**
 * Facebook Feed Simulator - Main Controller
 * Orchestrates the fetching and rendering of Meta ads in a simulated Facebook feed
 */

class FeedSimulator {
    constructor(config = {}) {
        this.config = {
            accessToken: config.accessToken || '',
            containerSelector: config.containerSelector || '#feed-container',
            adFrequency: config.adFrequency || 3, // Show ad every N posts
            cacheEnabled: config.cacheEnabled !== false,
            autoRefresh: config.autoRefresh || false,
            refreshInterval: config.refreshInterval || 300000, // 5 minutes
            ...config
        };

        // Initialize components
        this.api = null;
        this.cache = null;
        this.renderer = null;
        this.currentAds = [];
        this.refreshTimer = null;

        this.init();
    }

    /**
     * Initialize the feed simulator
     */
    init() {
        if (this.config.accessToken) {
            this.api = new MetaAdAPI(this.config.accessToken);
        }

        if (this.config.cacheEnabled) {
            this.cache = new AdDataCache(60); // 60 minute cache
        }

        this.renderer = new FacebookAdRenderer(this.config.containerSelector);

        // Setup auto-refresh if enabled
        if (this.config.autoRefresh && this.refreshTimer === null) {
            this.startAutoRefresh();
        }

        console.log('Feed Simulator initialized');
    }

    /**
     * Load and display ads in the feed
     * @param {Object} searchParams - Search parameters for Meta Ad Library API
     * @returns {Promise<void>}
     */
    async loadAds(searchParams = {}) {
        if (!this.api) {
            console.error('MetaAdAPI not initialized. Please provide an access token.');
            this.showError('API not configured. Please set your access token.');
            return;
        }

        try {
            this.showLoading();

            const cacheKey = JSON.stringify(searchParams);
            let ads = null;

            // Try to get from cache first
            if (this.cache) {
                ads = this.cache.get(cacheKey);
                if (ads) {
                    console.log('Loaded ads from cache');
                }
            }

            // Fetch from API if not in cache
            if (!ads) {
                console.log('Fetching ads from API...');
                ads = await this.api.searchAds(searchParams);

                // Cache the results
                if (this.cache && ads.length > 0) {
                    this.cache.set(cacheKey, ads);
                }
            }

            // Store current ads
            this.currentAds = ads;

            // Render the ads
            this.renderer.clearFeed();
            this.renderer.renderMultipleAds(ads, {
                showSponsoredLabel: true,
                showAdControls: true
            });

            // Fetch and update images from snapshots (async)
            this.fetchAdImages(ads);

            this.hideLoading();
            this.showSuccess(`Loaded ${ads.length} ads`);

        } catch (error) {
            console.error('Error loading ads:', error);
            this.hideLoading();
            this.showError(`Failed to load ads: ${error.message}`);
        }
    }

    /**
     * Fetch ad images from snapshots and update the rendered ads
     * @param {Array} ads - Array of ad data
     */
    async fetchAdImages(ads) {
        for (const ad of ads) {
            if (!ad.snapshotUrl) continue;

            try {
                const snapshotHtml = await this.api.getAdSnapshot(ad.snapshotUrl);
                const images = this.api.extractImagesFromSnapshot(snapshotHtml);

                if (images.length > 0) {
                    // Update the ad with the first image
                    this.renderer.updateAdImage(ad.id, images[0]);
                }
            } catch (error) {
                console.warn(`Failed to fetch snapshot for ad ${ad.id}:`, error);
            }
        }
    }

    /**
     * Search for ads by keyword
     * @param {string} keyword - Search term
     * @param {Object} additionalParams - Additional API parameters
     */
    async searchAds(keyword, additionalParams = {}) {
        const searchParams = {
            search_terms: keyword,
            ad_reached_countries: additionalParams.country || 'US',
            ad_type: additionalParams.ad_type || 'ALL',
            limit: additionalParams.limit || 10,
            ...additionalParams
        };

        await this.loadAds(searchParams);
    }

    /**
     * Simulate a feed with mixed content (ads + regular posts)
     * @param {Array} regularPosts - Array of regular post HTML elements
     * @param {Object} adSearchParams - Parameters for ad search
     */
    async simulateMixedFeed(regularPosts = [], adSearchParams = {}) {
        if (!this.api) {
            console.error('API not initialized');
            return;
        }

        try {
            this.showLoading();

            // Fetch ads
            const ads = await this.api.searchAds(adSearchParams);
            this.currentAds = ads;

            // Clear and intersperse
            this.renderer.clearFeed();
            this.renderer.intersperseAds(ads, regularPosts, this.config.adFrequency);

            // Fetch images
            this.fetchAdImages(ads);

            this.hideLoading();

        } catch (error) {
            console.error('Error simulating feed:', error);
            this.hideLoading();
            this.showError(`Failed to simulate feed: ${error.message}`);
        }
    }

    /**
     * Refresh the current feed
     */
    async refresh() {
        if (this.currentAds.length === 0) {
            console.log('No ads to refresh');
            return;
        }

        console.log('Refreshing feed...');

        // Get the last search params from cache
        const allCache = this.cache?.getAll() || {};
        const lastKey = Object.keys(allCache).pop();

        if (lastKey) {
            const searchParams = JSON.parse(lastKey);
            await this.loadAds(searchParams);
        }
    }

    /**
     * Start auto-refresh timer
     */
    startAutoRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }

        this.refreshTimer = setInterval(() => {
            console.log('Auto-refreshing feed...');
            this.refresh();
        }, this.config.refreshInterval);

        console.log(`Auto-refresh started (every ${this.config.refreshInterval / 1000}s)`);
    }

    /**
     * Stop auto-refresh timer
     */
    stopAutoRefresh() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
            console.log('Auto-refresh stopped');
        }
    }

    /**
     * Get current ads
     * @returns {Array} Current ad data
     */
    getCurrentAds() {
        return this.currentAds;
    }

    /**
     * Export current ads as JSON
     * @returns {string} JSON string of current ads
     */
    exportAdsAsJSON() {
        return JSON.stringify(this.currentAds, null, 2);
    }

    /**
     * Download current ads as JSON file
     */
    downloadAds() {
        const json = this.exportAdsAsJSON();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `facebook-ads-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Clear cache
     */
    clearCache() {
        if (this.cache) {
            this.cache.clear();
            console.log('Cache cleared');
        }
    }

    /**
     * Update configuration
     * @param {Object} newConfig - New configuration options
     */
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };

        // Reinitialize if access token changed
        if (newConfig.accessToken && newConfig.accessToken !== this.api?.accessToken) {
            this.api = new MetaAdAPI(newConfig.accessToken);
        }

        // Handle auto-refresh changes
        if (newConfig.autoRefresh !== undefined) {
            if (newConfig.autoRefresh) {
                this.startAutoRefresh();
            } else {
                this.stopAutoRefresh();
            }
        }
    }

    /**
     * Show loading indicator
     */
    showLoading() {
        const loadingEl = document.getElementById('loading-indicator');
        if (loadingEl) {
            loadingEl.classList.remove('hidden');
        }
    }

    /**
     * Hide loading indicator
     */
    hideLoading() {
        const loadingEl = document.getElementById('loading-indicator');
        if (loadingEl) {
            loadingEl.classList.add('hidden');
        }
    }

    /**
     * Show success message
     * @param {string} message - Success message
     */
    showSuccess(message) {
        this.showToast(message, 'success');
    }

    /**
     * Show error message
     * @param {string} message - Error message
     */
    showError(message) {
        this.showToast(message, 'error');
    }

    /**
     * Show toast notification
     * @param {string} message - Message to display
     * @param {string} type - Type of toast (success, error, info)
     */
    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toast-container') || this.createToastContainer();

        const toast = document.createElement('div');
        toast.className = `toast toast-${type} px-4 py-3 rounded-lg shadow-lg mb-2 transition-all transform translate-x-0`;

        const bgColors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            info: 'bg-blue-500'
        };

        toast.classList.add(bgColors[type] || bgColors.info);
        toast.innerHTML = `
            <div class="flex items-center gap-2 text-white">
                <span>${message}</span>
                <button class="ml-2 text-white hover:text-gray-200" onclick="this.parentElement.parentElement.remove()">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                    </svg>
                </button>
            </div>
        `;

        toastContainer.appendChild(toast);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            toast.style.transform = 'translateX(400px)';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 5000);
    }

    /**
     * Create toast container if it doesn't exist
     * @returns {HTMLElement} Toast container element
     */
    createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toast-container';
        container.className = 'fixed top-4 right-4 z-50 flex flex-col items-end';
        document.body.appendChild(container);
        return container;
    }

    /**
     * Destroy the simulator and clean up
     */
    destroy() {
        this.stopAutoRefresh();
        this.renderer?.clearFeed();
        this.currentAds = [];
        console.log('Feed Simulator destroyed');
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FeedSimulator;
}
