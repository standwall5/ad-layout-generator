/**
 * Example Usage Script
 * Demonstrates how to use the Facebook Ad Feed Simulator programmatically
 */

// ============================================
// EXAMPLE 1: Basic Setup and Search
// ============================================

async function example1_BasicSearch() {
    console.log('=== Example 1: Basic Search ===');

    // Initialize the simulator with your access token
    const simulator = new FeedSimulator({
        accessToken: 'YOUR_META_ACCESS_TOKEN_HERE',
        containerSelector: '#feed-container',
        cacheEnabled: true,
        autoRefresh: false
    });

    // Search for Nike ads in the US
    await simulator.searchAds('Nike', {
        country: 'US',
        limit: 10
    });

    console.log('Loaded ads:', simulator.getCurrentAds());
}

// ============================================
// EXAMPLE 2: Advanced Search with Filters
// ============================================

async function example2_AdvancedSearch() {
    console.log('=== Example 2: Advanced Search ===');

    const simulator = new FeedSimulator({
        accessToken: 'YOUR_TOKEN',
        containerSelector: '#feed-container'
    });

    // Search for political ads
    await simulator.loadAds({
        search_terms: 'election 2024',
        ad_reached_countries: 'US',
        ad_type: 'POLITICAL_AND_ISSUE_ADS',
        ad_active_status: 'ALL',
        limit: 20
    });
}

// ============================================
// EXAMPLE 3: Multiple Brand Monitoring
// ============================================

async function example3_MonitorBrands() {
    console.log('=== Example 3: Monitor Multiple Brands ===');

    const simulator = new FeedSimulator({
        accessToken: 'YOUR_TOKEN',
        containerSelector: '#feed-container'
    });

    const brands = ['Nike', 'Adidas', 'Puma', 'Reebok', 'Under Armour'];
    const allAds = [];

    // Search for each brand
    for (const brand of brands) {
        console.log(`Searching for ${brand} ads...`);

        await simulator.searchAds(brand, {
            country: 'US',
            limit: 5
        });

        allAds.push(...simulator.getCurrentAds());

        // Wait 1 second between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`Total ads collected: ${allAds.length}`);
}

// ============================================
// EXAMPLE 4: Export Ad Data
// ============================================

async function example4_ExportData() {
    console.log('=== Example 4: Export Ad Data ===');

    const simulator = new FeedSimulator({
        accessToken: 'YOUR_TOKEN',
        containerSelector: '#feed-container'
    });

    // Search for ads
    await simulator.searchAds('iPhone', {
        country: 'US',
        limit: 15
    });

    // Get the data as JSON string
    const jsonData = simulator.exportAdsAsJSON();
    console.log('JSON Data:', jsonData);

    // Or download as a file
    simulator.downloadAds(); // Downloads as JSON file

    // Or process the data
    const ads = simulator.getCurrentAds();
    ads.forEach(ad => {
        console.log(`Ad from ${ad.pageName}: ${ad.bodyText}`);
    });
}

// ============================================
// EXAMPLE 5: Custom Rendering
// ============================================

async function example5_CustomRendering() {
    console.log('=== Example 5: Custom Rendering ===');

    // Initialize API and Renderer separately for more control
    const api = new MetaAdAPI('YOUR_TOKEN');
    const renderer = new FacebookAdRenderer('#feed-container');

    // Fetch ads
    const ads = await api.searchAds({
        search_terms: 'Tesla',
        ad_reached_countries: 'US',
        limit: 10
    });

    // Render each ad with custom options
    ads.forEach((ad, index) => {
        const adElement = renderer.renderAd(ad, {
            showSponsoredLabel: true,
            showAdControls: true,
            profileImageUrl: null, // Will use generated avatar
            adImageUrl: null // Will fetch from snapshot
        });

        // Add custom attributes or event listeners
        adElement.dataset.index = index;
        adElement.addEventListener('click', (e) => {
            console.log(`Clicked on ad #${index} from ${ad.pageName}`);
        });

        // Animate the ad appearance
        renderer.animateAdAppearance(adElement);
    });
}

// ============================================
// EXAMPLE 6: Fetch and Update Images
// ============================================

async function example6_FetchImages() {
    console.log('=== Example 6: Fetch Ad Images ===');

    const api = new MetaAdAPI('YOUR_TOKEN');
    const renderer = new FacebookAdRenderer('#feed-container');

    // Fetch ads
    const ads = await api.searchAds({
        search_terms: 'gaming',
        ad_reached_countries: 'US',
        limit: 5
    });

    // Render ads first (without images)
    renderer.renderMultipleAds(ads);

    // Then fetch images from snapshots asynchronously
    for (const ad of ads) {
        if (ad.snapshotUrl) {
            try {
                // Fetch the snapshot HTML
                const snapshotHtml = await api.getAdSnapshot(ad.snapshotUrl);

                // Extract images
                const images = api.extractImagesFromSnapshot(snapshotHtml);

                if (images.length > 0) {
                    // Update the ad with the first image
                    renderer.updateAdImage(ad.id, images[0]);
                    console.log(`Updated image for ad ${ad.id}`);
                }
            } catch (error) {
                console.warn(`Failed to fetch image for ad ${ad.id}:`, error);
            }
        }
    }
}

// ============================================
// EXAMPLE 7: Mix Ads with Regular Posts
// ============================================

async function example7_MixedFeed() {
    console.log('=== Example 7: Mixed Feed ===');

    const simulator = new FeedSimulator({
        accessToken: 'YOUR_TOKEN',
        containerSelector: '#feed-container'
    });

    // Create some fake regular posts
    const regularPosts = [];
    for (let i = 0; i < 10; i++) {
        const post = document.createElement('div');
        post.className = 'bg-white rounded-lg shadow-sm p-4 mb-4';
        post.innerHTML = `
            <div class="flex items-center gap-2 mb-3">
                <div class="w-10 h-10 bg-gray-300 rounded-full"></div>
                <div>
                    <div class="font-semibold">User ${i + 1}</div>
                    <div class="text-xs text-gray-500">2h ago</div>
                </div>
            </div>
            <p class="text-sm">This is a regular post #${i + 1}</p>
        `;
        regularPosts.push(post);
    }

    // Intersperse ads with regular posts (1 ad every 3 posts)
    await simulator.simulateMixedFeed(regularPosts, {
        search_terms: 'fashion',
        country: 'US',
        limit: 5
    });
}

// ============================================
// EXAMPLE 8: Auto-Refresh Feed
// ============================================

async function example8_AutoRefresh() {
    console.log('=== Example 8: Auto-Refresh ===');

    const simulator = new FeedSimulator({
        accessToken: 'YOUR_TOKEN',
        containerSelector: '#feed-container',
        autoRefresh: true,
        refreshInterval: 60000 // Refresh every 1 minute
    });

    // Initial load
    await simulator.searchAds('technology', {
        country: 'US',
        limit: 10
    });

    console.log('Feed will auto-refresh every minute');

    // Stop auto-refresh after 5 minutes
    setTimeout(() => {
        simulator.stopAutoRefresh();
        console.log('Auto-refresh stopped');
    }, 300000); // 5 minutes
}

// ============================================
// EXAMPLE 9: Cache Management
// ============================================

async function example9_CacheManagement() {
    console.log('=== Example 9: Cache Management ===');

    const simulator = new FeedSimulator({
        accessToken: 'YOUR_TOKEN',
        containerSelector: '#feed-container',
        cacheEnabled: true
    });

    // First search - will fetch from API
    console.log('First search (from API)...');
    await simulator.searchAds('iPhone', {
        country: 'US',
        limit: 10
    });

    // Second search with same params - will use cache
    console.log('Second search (from cache)...');
    await simulator.searchAds('iPhone', {
        country: 'US',
        limit: 10
    });

    // Clear cache
    console.log('Clearing cache...');
    simulator.clearCache();

    // Third search - will fetch from API again
    console.log('Third search (from API again)...');
    await simulator.searchAds('iPhone', {
        country: 'US',
        limit: 10
    });
}

// ============================================
// EXAMPLE 10: Error Handling
// ============================================

async function example10_ErrorHandling() {
    console.log('=== Example 10: Error Handling ===');

    const simulator = new FeedSimulator({
        accessToken: 'INVALID_TOKEN', // Intentionally invalid
        containerSelector: '#feed-container'
    });

    try {
        await simulator.searchAds('test', {
            country: 'US',
            limit: 5
        });
    } catch (error) {
        console.error('Error occurred:', error.message);

        // Handle different error types
        if (error.message.includes('401')) {
            console.log('Authentication failed. Please check your access token.');
        } else if (error.message.includes('400')) {
            console.log('Bad request. Check your search parameters.');
        } else if (error.message.includes('429')) {
            console.log('Rate limited. Please wait before trying again.');
        }
    }
}

// ============================================
// EXAMPLE 11: Country Comparison
// ============================================

async function example11_CountryComparison() {
    console.log('=== Example 11: Country Comparison ===');

    const api = new MetaAdAPI('YOUR_TOKEN');
    const countries = ['US', 'GB', 'CA', 'AU', 'DE'];
    const results = {};

    for (const country of countries) {
        console.log(`Fetching ads for ${country}...`);

        const ads = await api.searchAds({
            search_terms: 'Apple',
            ad_reached_countries: country,
            limit: 10
        });

        results[country] = ads.length;

        // Wait to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log('Ads by country:', results);
}

// ============================================
// EXAMPLE 12: Ad Analytics
// ============================================

async function example12_AdAnalytics() {
    console.log('=== Example 12: Ad Analytics ===');

    const api = new MetaAdAPI('YOUR_TOKEN');

    const ads = await api.searchAds({
        search_terms: 'Nike',
        ad_reached_countries: 'US',
        limit: 50
    });

    // Analyze ad content
    const analytics = {
        totalAds: ads.length,
        adsWithImages: 0,
        adsWithLinks: 0,
        averageBodyLength: 0,
        topPages: {},
        currencies: {}
    };

    let totalBodyLength = 0;

    ads.forEach(ad => {
        // Count ads with images (those with snapshot URLs)
        if (ad.snapshotUrl) analytics.adsWithImages++;

        // Count ads with link titles
        if (ad.headerText) analytics.adsWithLinks++;

        // Calculate average body length
        totalBodyLength += ad.bodyText.length;

        // Track top pages
        analytics.topPages[ad.pageName] = (analytics.topPages[ad.pageName] || 0) + 1;

        // Track currencies
        analytics.currencies[ad.currency] = (analytics.currencies[ad.currency] || 0) + 1;
    });

    analytics.averageBodyLength = Math.round(totalBodyLength / ads.length);

    console.log('Ad Analytics:', analytics);
}

// ============================================
// HOW TO USE THESE EXAMPLES
// ============================================

/*
To use these examples:

1. Include the required scripts in your HTML:
   <script src="../../script/meta-ad-api.js"></script>
   <script src="../../script/facebook-ad-renderer.js"></script>
   <script src="../../script/feed-simulator.js"></script>
   <script src="../../script/example-usage.js"></script>

2. Replace 'YOUR_TOKEN' with your actual Meta access token

3. Call any example function:
   - From browser console: example1_BasicSearch()
   - In your code: await example1_BasicSearch()

4. Make sure you have a container element:
   <div id="feed-container"></div>
*/

// Example: Run on page load
document.addEventListener('DOMContentLoaded', async () => {
    // Uncomment to run an example automatically
    // await example1_BasicSearch();
});

console.log('Example usage script loaded. Available examples:');
console.log('- example1_BasicSearch()');
console.log('- example2_AdvancedSearch()');
console.log('- example3_MonitorBrands()');
console.log('- example4_ExportData()');
console.log('- example5_CustomRendering()');
console.log('- example6_FetchImages()');
console.log('- example7_MixedFeed()');
console.log('- example8_AutoRefresh()');
console.log('- example9_CacheManagement()');
console.log('- example10_ErrorHandling()');
console.log('- example11_CountryComparison()');
console.log('- example12_AdAnalytics()');
