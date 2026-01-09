# Facebook Ad Feed Simulator - Setup Guide

A complete system to fetch real ads from Meta's Ad Library API and display them in a simulated Facebook feed using your layout clones.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Prerequisites](#prerequisites)
4. [Getting Your Meta Access Token](#getting-your-meta-access-token)
5. [Installation](#installation)
6. [Usage](#usage)
7. [API Reference](#api-reference)
8. [Troubleshooting](#troubleshooting)
9. [Examples](#examples)

---

## 🎯 Overview

This project integrates Meta's Ad Library API to fetch real advertisement data and display it in a Facebook-style feed. The system includes:

- **Meta Ad API Integration** (`meta-ad-api.js`) - Fetches ads from Meta's Ad Library
- **Facebook Ad Renderer** (`facebook-ad-renderer.js`) - Maps API data to HTML layouts
- **Feed Simulator** (`feed-simulator.js`) - Orchestrates the entire process
- **Demo Interface** (`facebook-feed-demo.html`) - Interactive UI to control the simulator

---

## ✨ Features

- ✅ Fetch real ads from Meta Ad Library API
- ✅ Display ads with authentic Facebook styling
- ✅ Extract ad content: images, headers, captions, text, links
- ✅ Show advertiser page name and timestamp
- ✅ Simulate sponsored post labels
- ✅ Cache ads locally to reduce API calls
- ✅ Search ads by keyword and country
- ✅ Auto-refresh feed capability
- ✅ Download ad data as JSON
- ✅ Responsive design with Tailwind CSS

---

## 📦 Prerequisites

1. **Web Browser** - Modern browser with JavaScript enabled
2. **Meta Developer Account** - Free account at [developers.facebook.com](https://developers.facebook.com)
3. **Access Token** - From Meta's Graph API Explorer
4. **Local Web Server** (optional but recommended) - To avoid CORS issues

---

## 🔑 Getting Your Meta Access Token

### Step 1: Create a Meta Developer Account

1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Click "Get Started" and create an account (or log in with your Facebook account)
3. Complete the registration process

### Step 2: Create an App (Optional)

For basic testing, you can use the Graph API Explorer without creating an app. For production use:

1. Go to [developers.facebook.com/apps](https://developers.facebook.com/apps)
2. Click "Create App"
3. Select "Business" type
4. Fill in app details and create

### Step 3: Generate Access Token

1. Go to [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. In the top right, select your app (or use "Graph API Explorer" default app)
3. Click "Generate Access Token"
4. Grant necessary permissions:
   - `ads_read` (for reading ad data)
   - `pages_read_engagement` (optional, for page data)
5. Copy the generated access token

**Important Notes:**
- User tokens expire after a few hours
- For long-term use, generate a long-lived token (60 days) or use a system user token
- Never share your access token publicly

### Step 4: Extend Token Lifetime (Optional)

To get a long-lived token (60 days):

```bash
https://graph.facebook.com/v18.0/oauth/access_token?
    grant_type=fb_exchange_token&
    client_id={app-id}&
    client_secret={app-secret}&
    fb_exchange_token={short-lived-token}
```

Replace `{app-id}`, `{app-secret}`, and `{short-lived-token}` with your values.

---

## 🚀 Installation

### Option 1: Simple Local Setup

1. **Clone or download this repository**

2. **Open the demo page**
   ```
   ad-layout-generator/pages/facebook/facebook-feed-demo.html
   ```
   
   You can open it directly in your browser, but for best results, use a local server.

### Option 2: Using a Local Server (Recommended)

**Using Python:**
```bash
cd ad-layout-generator
python -m http.server 8000
```

Then visit: `http://localhost:8000/pages/facebook/facebook-feed-demo.html`

**Using Node.js (http-server):**
```bash
npm install -g http-server
cd ad-layout-generator
http-server -p 8000
```

**Using VS Code:**
Install the "Live Server" extension and right-click `facebook-feed-demo.html` > "Open with Live Server"

---

## 📖 Usage

### Quick Start

1. **Open the Demo Page**
   - Navigate to `pages/facebook/facebook-feed-demo.html`

2. **Configure API Token**
   - Paste your Meta access token in the "Access Token" field
   - Click "Save Token"
   - The token is stored in localStorage for future visits

3. **Search for Ads**
   - Enter a search term (e.g., "Nike", "iPhone", "Tesla")
   - Select country (default: United States)
   - Choose ad type (All Ads or Political & Issue Ads)
   - Set number of ads to fetch (1-50)
   - Click "Search Ads"

4. **View Results**
   - Ads will appear in the feed on the right
   - Each ad shows:
     - Page name with "Sponsored" label
     - Ad body text
     - Ad images (if available)
     - Link preview with title, description, and caption
     - Engagement buttons (Like, Comment, Share)

### Using Programmatically

You can also use the system programmatically in your own pages:

```html
<!DOCTYPE html>
<html>
<head>
    <script src="../../script/meta-ad-api.js"></script>
    <script src="../../script/facebook-ad-renderer.js"></script>
    <script src="../../script/feed-simulator.js"></script>
</head>
<body>
    <div id="my-feed"></div>

    <script>
        // Initialize the simulator
        const simulator = new FeedSimulator({
            accessToken: 'YOUR_ACCESS_TOKEN',
            containerSelector: '#my-feed',
            cacheEnabled: true,
            autoRefresh: false
        });

        // Search for ads
        simulator.searchAds('Nike', {
            country: 'US',
            limit: 10
        });
    </script>
</body>
</html>
```

---

## 📚 API Reference

### MetaAdAPI Class

```javascript
const api = new MetaAdAPI(accessToken);
```

#### Methods:

**`searchAds(params)`**
Search for ads in the Meta Ad Library.

```javascript
const ads = await api.searchAds({
    search_terms: 'Nike',
    ad_reached_countries: 'US',
    ad_type: 'ALL',
    limit: 10
});
```

Parameters:
- `search_terms` (string) - Keywords to search for
- `ad_reached_countries` (string) - Country code (US, GB, CA, etc.)
- `ad_type` (string) - 'ALL' or 'POLITICAL_AND_ISSUE_ADS'
- `limit` (number) - Number of results (1-50)

**`getAdDetails(adId)`**
Get detailed information about a specific ad.

```javascript
const adDetails = await api.getAdDetails('123456789');
```

**`getAdSnapshot(snapshotUrl)`**
Fetch the rendered HTML snapshot of an ad.

```javascript
const html = await api.getAdSnapshot(ad.snapshotUrl);
```

---

### FacebookAdRenderer Class

```javascript
const renderer = new FacebookAdRenderer('#feed-container');
```

#### Methods:

**`renderAd(adData, options)`**
Render a single ad in the feed.

```javascript
const adElement = renderer.renderAd(adData, {
    showSponsoredLabel: true,
    showAdControls: true,
    profileImageUrl: null,
    adImageUrl: null
});
```

**`renderMultipleAds(adsData, options)`**
Render multiple ads to the feed.

```javascript
renderer.renderMultipleAds(adsArray, {
    showSponsoredLabel: true
});
```

**`clearFeed()`**
Remove all ads from the feed.

```javascript
renderer.clearFeed();
```

**`updateAdImage(adId, imageUrl)`**
Update an ad's image after fetching from snapshot.

```javascript
renderer.updateAdImage('123456', 'https://example.com/image.jpg');
```

---

### FeedSimulator Class

```javascript
const simulator = new FeedSimulator({
    accessToken: 'YOUR_TOKEN',
    containerSelector: '#feed-container',
    cacheEnabled: true,
    autoRefresh: false,
    refreshInterval: 300000 // 5 minutes
});
```

#### Methods:

**`searchAds(keyword, params)`**
Search and display ads by keyword.

```javascript
await simulator.searchAds('Nike', {
    country: 'US',
    limit: 10
});
```

**`loadAds(searchParams)`**
Load ads with custom search parameters.

```javascript
await simulator.loadAds({
    search_terms: 'iPhone',
    ad_reached_countries: 'GB',
    ad_type: 'ALL',
    limit: 15
});
```

**`refresh()`**
Refresh the current feed.

```javascript
await simulator.refresh();
```

**`downloadAds()`**
Download current ads as JSON file.

```javascript
simulator.downloadAds();
```

**`clearCache()`**
Clear the localStorage cache.

```javascript
simulator.clearCache();
```

---

## 🔍 Ad Data Structure

Each ad object returned by the API has the following structure:

```javascript
{
    id: "123456789",
    pageName: "Nike",
    pageId: "987654321",
    
    // Ad content
    bodyText: "Just Do It. Shop the latest Nike collection...",
    headerText: "Nike Official Store",
    descriptionText: "Free shipping on orders over $50",
    captionText: "NIKE.COM",
    
    // Metadata
    snapshotUrl: "https://www.facebook.com/ads/archive/...",
    startTime: "2024-01-15T10:30:00+0000",
    endTime: null,
    currency: "USD",
    spend: { lower_bound: "100", upper_bound: "499" },
    
    // Display helpers
    timestamp: "2h",
    isSponsored: true
}
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. "API Error: 401 Unauthorized"
**Cause:** Invalid or expired access token

**Solution:**
- Generate a new access token from Graph API Explorer
- Make sure your token has `ads_read` permission
- Check if your token has expired (short-lived tokens expire after a few hours)

#### 2. "API Error: 400 Bad Request"
**Cause:** Invalid search parameters or country code

**Solution:**
- Verify your country code is valid (US, GB, CA, etc.)
- Check that search terms are not empty
- Ensure ad_type is either "ALL" or "POLITICAL_AND_ISSUE_ADS"

#### 3. No images showing in ads
**Cause:** Ad snapshots may not contain images, or CORS restrictions

**Solution:**
- Not all ads have images in the Ad Library
- Some images may be blocked by CORS policies
- Try using a local server instead of opening the file directly

#### 4. "Container not found"
**Cause:** Feed container element doesn't exist

**Solution:**
- Ensure your HTML has an element with the correct ID
- Default is `#feed-container`
- Initialize renderer after DOM is loaded

#### 5. Rate limiting
**Cause:** Too many API requests in a short time

**Solution:**
- Enable caching to reduce API calls
- Meta has rate limits on API usage
- Wait a few minutes before trying again

---

## 💡 Examples

### Example 1: Search Political Ads

```javascript
const simulator = new FeedSimulator({
    accessToken: 'YOUR_TOKEN',
    containerSelector: '#feed-container'
});

await simulator.searchAds('election', {
    country: 'US',
    ad_type: 'POLITICAL_AND_ISSUE_ADS',
    limit: 20
});
```

### Example 2: Monitor Brand Ads

```javascript
const brands = ['Nike', 'Adidas', 'Apple', 'Samsung'];

for (const brand of brands) {
    await simulator.searchAds(brand, {
        country: 'US',
        limit: 5
    });
}
```

### Example 3: Export Ad Data

```javascript
// Search for ads
await simulator.searchAds('Tesla', { limit: 10 });

// Get the data
const ads = simulator.getCurrentAds();

// Export as JSON
const jsonData = simulator.exportAdsAsJSON();
console.log(jsonData);

// Or download as file
simulator.downloadAds();
```

### Example 4: Custom Rendering

```javascript
const renderer = new FacebookAdRenderer('#my-feed');
const api = new MetaAdAPI('YOUR_TOKEN');

// Fetch ads
const ads = await api.searchAds({
    search_terms: 'iPhone',
    ad_reached_countries: 'US',
    limit: 5
});

// Render with custom options
ads.forEach(ad => {
    const element = renderer.renderAd(ad, {
        showSponsoredLabel: false,
        showAdControls: false,
        profileImageUrl: 'custom-avatar.jpg',
        adImageUrl: 'custom-image.jpg'
    });
    
    // Add custom click tracking
    element.addEventListener('click', () => {
        console.log('Ad clicked:', ad.id);
    });
});
```

### Example 5: Mix Ads with Regular Posts

```javascript
// Create some regular post elements
const regularPosts = [
    createRegularPost('Friend posted a photo'),
    createRegularPost('Someone shared a link'),
    createRegularPost('Status update')
];

// Intersperse ads (1 ad every 3 posts)
await simulator.simulateMixedFeed(regularPosts, {
    search_terms: 'fashion',
    limit: 5
});
```

---

## 📁 Project Structure

```
ad-layout-generator/
├── pages/
│   └── facebook/
│       ├── facebook.html              # Original Facebook layout clone
│       └── facebook-feed-demo.html    # Demo with integrated simulator
├── script/
│   ├── meta-ad-api.js                # Meta Ad Library API integration
│   ├── facebook-ad-renderer.js       # Renders ads to HTML
│   └── feed-simulator.js             # Main controller
├── README.md                          # Project overview
└── SETUP_GUIDE.md                    # This file
```

---

## 🔒 Security Notes

1. **Never commit access tokens** to version control
2. **Use environment variables** for production deployments
3. **Rotate tokens regularly** for security
4. **Limit token permissions** to only what's needed
5. **Use HTTPS** in production environments

---

## 📝 License

This project is for educational and research purposes. Please comply with Meta's Terms of Service and API usage policies.

---

## 🤝 Contributing

Feel free to submit issues, fork the repository, and create pull requests for any improvements.

---

## 📞 Support

For issues with:
- **Meta API**: Visit [Facebook Developer Support](https://developers.facebook.com/support/)
- **This Project**: Open an issue in the repository

---

## 🎓 Additional Resources

- [Meta Ad Library API Documentation](https://www.facebook.com/ads/library/api/)
- [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
- [Meta for Developers](https://developers.facebook.com/)
- [Ad Library Search](https://www.facebook.com/ads/library/)

---

**Happy Ad Simulating! 🚀**