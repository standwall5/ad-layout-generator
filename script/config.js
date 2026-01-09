/**
 * Configuration File
 * Customize API settings, styling, and behavior
 */

const AdSimulatorConfig = {
    // ===========================================
    // API CONFIGURATION
    // ===========================================

    api: {
        // Meta Graph API version
        version: 'v18.0',

        // Base URL for Meta Graph API
        baseUrl: 'https://graph.facebook.com',

        // Default search parameters
        defaultParams: {
            ad_reached_countries: 'US',
            ad_type: 'ALL', // 'ALL' or 'POLITICAL_AND_ISSUE_ADS'
            ad_active_status: 'ALL', // 'ALL', 'ACTIVE', 'INACTIVE'
            limit: 10,
            search_page_ids: '', // Optional: filter by page IDs
            search_terms: ''
        },

        // API request timeout (milliseconds)
        timeout: 30000,

        // Rate limiting
        rateLimiting: {
            enabled: true,
            requestsPerMinute: 20,
            delayBetweenRequests: 1000 // milliseconds
        }
    },

    // ===========================================
    // CACHE CONFIGURATION
    // ===========================================

    cache: {
        // Enable/disable caching
        enabled: true,

        // Cache expiry time in minutes
        expiryMinutes: 60,

        // LocalStorage key prefix
        keyPrefix: 'meta_ad_cache',

        // Maximum cache size (number of entries)
        maxEntries: 50,

        // Clear cache on page load
        clearOnLoad: false
    },

    // ===========================================
    // RENDERER CONFIGURATION
    // ===========================================

    renderer: {
        // Default container selector
        containerSelector: '#feed-container',

        // Show elements
        showSponsoredLabel: true,
        showAdControls: true,
        showEngagementStats: true,
        showActionButtons: true,

        // Animation settings
        animations: {
            enabled: true,
            fadeInDuration: 300, // milliseconds
            staggerDelay: 100 // milliseconds between each ad
        },

        // Profile image settings
        profileImage: {
            useGenerated: true, // Generate from initial if no image provided
            defaultUrl: null,
            size: 40 // pixels
        },

        // Ad image settings
        adImage: {
            maxHeight: 600, // pixels
            lazyLoad: true,
            placeholder: 'data:image/svg+xml;base64,...' // Optional placeholder
        },

        // Engagement numbers (for simulation)
        engagement: {
            likes: { min: 50, max: 1000 },
            comments: { min: 5, max: 200 },
            shares: { min: 2, max: 100 }
        },

        // Text truncation
        truncate: {
            bodyText: null, // null = no truncation, number = max chars
            headerText: 100,
            descriptionText: 150
        }
    },

    // ===========================================
    // FEED SIMULATOR CONFIGURATION
    // ===========================================

    simulator: {
        // Auto-refresh settings
        autoRefresh: {
            enabled: false,
            interval: 300000 // 5 minutes in milliseconds
        },

        // Mixed feed settings
        mixedFeed: {
            adFrequency: 3, // Show 1 ad every N posts
            shuffleAds: false,
            shuffleRegularPosts: false
        },

        // Loading states
        loading: {
            showIndicator: true,
            minDisplayTime: 500 // minimum time to show loader
        },

        // Error handling
        errorHandling: {
            showToasts: true,
            autoRetry: false,
            maxRetries: 3,
            retryDelay: 2000 // milliseconds
        }
    },

    // ===========================================
    // UI CONFIGURATION
    // ===========================================

    ui: {
        // Toast notifications
        toasts: {
            enabled: true,
            duration: 5000, // milliseconds
            position: 'top-right', // 'top-right', 'top-left', 'bottom-right', 'bottom-left'
            maxVisible: 3
        },

        // Control panel
        controlPanel: {
            sticky: true,
            collapsible: false,
            defaultCollapsed: false
        },

        // Theme
        theme: {
            primaryColor: '#1877f2',
            successColor: '#42b72a',
            errorColor: '#f02849',
            warningColor: '#ff6d00',
            backgroundColor: '#f0f2f5'
        },

        // Responsive breakpoints
        breakpoints: {
            mobile: 640,
            tablet: 768,
            desktop: 1024
        }
    },

    // ===========================================
    // COUNTRY CODES
    // ===========================================

    countries: [
        { code: 'US', name: 'United States', flag: '🇺🇸' },
        { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
        { code: 'CA', name: 'Canada', flag: '🇨🇦' },
        { code: 'AU', name: 'Australia', flag: '🇦🇺' },
        { code: 'DE', name: 'Germany', flag: '🇩🇪' },
        { code: 'FR', name: 'France', flag: '🇫🇷' },
        { code: 'IN', name: 'India', flag: '🇮🇳' },
        { code: 'BR', name: 'Brazil', flag: '🇧🇷' },
        { code: 'JP', name: 'Japan', flag: '🇯🇵' },
        { code: 'MX', name: 'Mexico', flag: '🇲🇽' },
        { code: 'IT', name: 'Italy', flag: '🇮🇹' },
        { code: 'ES', name: 'Spain', flag: '🇪🇸' },
        { code: 'NL', name: 'Netherlands', flag: '🇳🇱' },
        { code: 'SE', name: 'Sweden', flag: '🇸🇪' },
        { code: 'PL', name: 'Poland', flag: '🇵🇱' },
        { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
        { code: 'SG', name: 'Singapore', flag: '🇸🇬' },
        { code: 'MY', name: 'Malaysia', flag: '🇲🇾' },
        { code: 'TH', name: 'Thailand', flag: '🇹🇭' },
        { code: 'PH', name: 'Philippines', flag: '🇵🇭' }
    ],

    // ===========================================
    // AD TYPES
    // ===========================================

    adTypes: [
        {
            value: 'ALL',
            label: 'All Ads',
            description: 'Show all types of ads'
        },
        {
            value: 'POLITICAL_AND_ISSUE_ADS',
            label: 'Political & Issue Ads',
            description: 'Ads about social issues, elections, or politics'
        }
    ],

    // ===========================================
    // STORAGE KEYS
    // ===========================================

    storage: {
        accessToken: 'meta_access_token',
        lastSearch: 'meta_last_search',
        userPreferences: 'meta_user_preferences',
        adCache: 'meta_ad_cache'
    },

    // ===========================================
    // FEATURES FLAGS
    // ===========================================

    features: {
        downloadAds: true,
        exportJSON: true,
        exportCSV: false,
        shareAds: false,
        bookmarkAds: false,
        compareAds: false,
        analytics: false,
        darkMode: false
    },

    // ===========================================
    // ANALYTICS (Optional)
    // ===========================================

    analytics: {
        enabled: false,
        trackSearches: true,
        trackClicks: true,
        trackErrors: true,
        // Add your analytics provider settings here
        provider: null, // 'google', 'mixpanel', 'amplitude', etc.
        trackingId: null
    },

    // ===========================================
    // DEVELOPMENT
    // ===========================================

    development: {
        debug: false,
        verboseLogging: false,
        showAPIResponses: false,
        mockData: false,
        bypassCache: false
    },

    // ===========================================
    // CUSTOM FILTERS
    // ===========================================

    filters: {
        // Custom filtering functions
        enabled: true,

        // Filter out ads with no images
        requireImages: false,

        // Filter out ads with no body text
        requireBodyText: false,

        // Minimum body text length
        minBodyLength: 0,

        // Filter by spend range
        minSpend: null,
        maxSpend: null,

        // Filter by date range
        startDate: null,
        endDate: null
    },

    // ===========================================
    // SORTING OPTIONS
    // ===========================================

    sorting: {
        defaultSort: 'newest', // 'newest', 'oldest', 'spend', 'page_name'

        options: [
            { value: 'newest', label: 'Newest First' },
            { value: 'oldest', label: 'Oldest First' },
            { value: 'spend_high', label: 'Highest Spend' },
            { value: 'spend_low', label: 'Lowest Spend' },
            { value: 'page_name', label: 'Page Name (A-Z)' }
        ]
    },

    // ===========================================
    // LOCALE & FORMATTING
    // ===========================================

    locale: {
        language: 'en-US',
        dateFormat: 'short', // 'short', 'long', 'relative'
        currency: 'USD',
        timezone: 'America/New_York'
    },

    // ===========================================
    // HELPER METHODS
    // ===========================================

    /**
     * Get API endpoint URL
     */
    getApiUrl(endpoint = '') {
        return `${this.api.baseUrl}/${this.api.version}${endpoint}`;
    },

    /**
     * Get country name from code
     */
    getCountryName(code) {
        const country = this.countries.find(c => c.code === code);
        return country ? country.name : code;
    },

    /**
     * Get theme color
     */
    getThemeColor(type) {
        return this.ui.theme[`${type}Color`] || this.ui.theme.primaryColor;
    },

    /**
     * Check if feature is enabled
     */
    isFeatureEnabled(feature) {
        return this.features[feature] === true;
    },

    /**
     * Merge with custom config
     */
    merge(customConfig) {
        return this._deepMerge(this, customConfig);
    },

    /**
     * Deep merge helper
     */
    _deepMerge(target, source) {
        const output = { ...target };

        if (this._isObject(target) && this._isObject(source)) {
            Object.keys(source).forEach(key => {
                if (this._isObject(source[key])) {
                    if (!(key in target)) {
                        output[key] = source[key];
                    } else {
                        output[key] = this._deepMerge(target[key], source[key]);
                    }
                } else {
                    output[key] = source[key];
                }
            });
        }

        return output;
    },

    /**
     * Check if value is object
     */
    _isObject(item) {
        return item && typeof item === 'object' && !Array.isArray(item);
    }
};

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdSimulatorConfig;
}

// Make available globally
if (typeof window !== 'undefined') {
    window.AdSimulatorConfig = AdSimulatorConfig;
}
