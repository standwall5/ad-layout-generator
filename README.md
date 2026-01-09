# Facebook Ad Feed Simulator

A complete system to fetch real ads from Meta's Ad Library API and display them in an authentic Facebook-style feed.

## 🎯 What This Does

This project allows you to:
- **Fetch real ads** from Meta's Ad Library API
- **Display them** in a simulated Facebook feed with authentic styling
- **Extract all ad data**: images, headers, captions, text, advertiser info, links
- **Map API data** to your Facebook layout clones
- **Simulate a realistic feed** showing ads as they would appear on Facebook

## 🚀 Quick Start

### 1. Get Your Access Token

Visit the [Meta Graph API Explorer](https://developers.facebook.com/tools/explorer/) and generate an access token with `ads_read` permission.

### 2. Open the Demo

Open `pages/facebook/facebook-feed-demo.html` in your browser (or use a local server for best results).

### 3. Configure & Search

1. Paste your access token and click "Save Token"
2. Enter a search term (e.g., "Nike", "iPhone", "Tesla")
3. Click "Search Ads"
4. Watch as real ads populate your feed!

## 📂 Project Structure

```
ad-layout-generator/
├── pages/
│   └── facebook/
│       ├── facebook.html              # Original Facebook layout clone
│       └── facebook-feed-demo.html    # Interactive demo with controls
├── script/
│   ├── meta-ad-api.js                # Meta Ad Library API integration
│   ├── facebook-ad-renderer.js       # Maps API data to HTML layouts
│   ├── feed-simulator.js             # Main controller & orchestrator
│   └── example-usage.js              # Code examples
├── README.md                          # This file
└── SETUP_GUIDE.md                    # Detailed setup instructions
```

## ✨ Features

### API Integration
- ✅ Fetch ads from Meta Ad Library API
- ✅ Search by keyword, country, and ad type
- ✅ Support for all ad types (general & political)
- ✅ Automatic rate limiting handling
- ✅ Local caching to reduce API calls

### Ad Display
- ✅ Authentic Facebook post styling
- ✅ Sponsored labels
- ✅ Profile pictures (generated or custom)
- ✅ Ad body text with proper formatting
- ✅ Link preview cards with titles, descriptions, and captions
- ✅ Ad images extracted from snapshots
- ✅ Engagement buttons (Like, Comment, Share)
- ✅ Timestamps and metadata

### Control Features
- ✅ Interactive control panel
- ✅ Real-time search
- ✅ Auto-refresh capability
- ✅ Export ads as JSON
- ✅ Cache management
- ✅ Error handling with helpful messages

## 💻 Usage

### Using the Demo Interface

The easiest way to use this project is through the demo interface:

```bash
# Open in browser
pages/facebook/facebook-feed-demo.html

# Or use a local server (recommended)
python -m http.server 8000
# Then visit: http://localhost:8000/pages/facebook/facebook-feed-demo.html
```

### Programmatic Usage

```html
<!DOCTYPE html>
<html>
<head>
    <script src="script/meta-ad-api.js"></script>
    <script src="script/facebook-ad-renderer.js"></script>
    <script src="script/feed-simulator.js"></script>
</head>
<body>
    <div id="feed-container"></div>

    <script>
        // Initialize the simulator
        const simulator = new FeedSimulator({
            accessToken: 'YOUR_ACCESS_TOKEN',
            containerSelector: '#feed-container',
            cacheEnabled: true,
            autoRefresh: false
        });

        // Search for ads
        await simulator.searchAds('Nike', {
            country: 'US',
            limit: 10
        });
    </script>
</body>
</html>
```

### Basic API Usage

```javascript
// Initialize API
const api = new MetaAdAPI('YOUR_ACCESS_TOKEN');

// Search for ads
const ads = await api.searchAds({
    search_terms: 'iPhone',
    ad_reached_countries: 'US',
    ad_type: 'ALL',
    limit: 10
});

// Render ads
const renderer = new FacebookAdRenderer('#feed-container');
renderer.renderMultipleAds(ads);
```

## 📊 Ad Data Structure

Each ad contains:

```javascript
{
    id: "123456789",
    pageName: "Nike",                    // Who posted the ad
    pageId: "987654321",
    
    bodyText: "Just Do It...",          // Main ad text
    headerText: "Shop Now",             // Link title
    descriptionText: "Free shipping",    // Link description
    captionText: "NIKE.COM",            // Link caption/URL display
    
    snapshotUrl: "https://...",         // Ad snapshot URL
    startTime: "2024-01-15...",         // When ad started running
    endTime: null,                       // When ad stopped (if ended)
    currency: "USD",
    spend: { lower_bound: "100", ... }, // Spend range
    
    timestamp: "2h",                     // Display-friendly timestamp
    isSponsored: true
}
```

## 🛠️ API Components

### MetaAdAPI
Handles all communication with Meta's Ad Library API.

**Key Methods:**
- `searchAds(params)` - Search for ads by keyword
- `getAdDetails(adId)` - Get specific ad details
- `getAdSnapshot(url)` - Fetch ad snapshot HTML
- `extractImagesFromSnapshot(html)` - Extract image URLs

### FacebookAdRenderer
Converts ad data into Facebook-styled HTML elements.

**Key Methods:**
- `renderAd(adData, options)` - Render single ad
- `renderMultipleAds(adsData)` - Render multiple ads
- `updateAdImage(adId, imageUrl)` - Update ad with image
- `clearFeed()` - Clear all ads

### FeedSimulator
Orchestrates the entire system (API + Renderer).

**Key Methods:**
- `searchAds(keyword, params)` - Search and display ads
- `refresh()` - Refresh current feed
- `downloadAds()` - Export as JSON
- `clearCache()` - Clear cached data

## 📖 Documentation

For detailed setup instructions, API reference, troubleshooting, and examples:

👉 **[Read the Complete Setup Guide](SETUP_GUIDE.md)**

## 🔑 Getting Your Access Token

1. Visit [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Select your app or use the default "Graph API Explorer" app
3. Click "Generate Access Token"
4. Grant `ads_read` permission
5. Copy the token

**Note:** User tokens expire after a few hours. For long-term use, generate a long-lived token (60 days) or use a system user token.

## 🎨 Customization

### Custom Styling

The rendered ads use Tailwind CSS classes. You can customize by:

```javascript
// Modify rendering options
const adElement = renderer.renderAd(adData, {
    showSponsoredLabel: true,
    showAdControls: true,
    profileImageUrl: 'custom-avatar.jpg',
    adImageUrl: 'custom-ad-image.jpg'
});
```

### Custom Event Handling

```javascript
renderer.addClickTracking(adElement, (adId, target) => {
    console.log('Ad clicked:', adId);
    // Your custom tracking code
});
```

## 🐛 Common Issues

### "API Error: 401 Unauthorized"
- Your access token is invalid or expired
- Generate a new token from Graph API Explorer

### "API Error: 400 Bad Request"
- Check your search parameters (country code, search terms)
- Ensure ad_type is "ALL" or "POLITICAL_AND_ISSUE_ADS"

### No images showing
- Not all ads have images in the Ad Library
- Some images may be blocked by CORS
- Try using a local server instead of opening HTML directly

### Rate limiting
- Enable caching to reduce API calls
- Add delays between requests
- Meta has rate limits on API usage

## 📝 Examples

See `script/example-usage.js` for 12 comprehensive examples including:

1. Basic ad search
2. Advanced filtering
3. Multiple brand monitoring
4. Data export
5. Custom rendering
6. Image fetching
7. Mixed feed simulation
8. Auto-refresh
9. Cache management
10. Error handling
11. Country comparison
12. Ad analytics

## 🔒 Security

- ⚠️ Never commit access tokens to version control
- ⚠️ Use environment variables for production
- ⚠️ Rotate tokens regularly
- ⚠️ Use HTTPS in production

## 📄 License

This project is for educational and research purposes. Please comply with:
- [Meta's Terms of Service](https://www.facebook.com/terms.php)
- [Meta API Terms](https://developers.facebook.com/terms)
- [Ad Library API Terms](https://www.facebook.com/ads/library/api/)

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📚 Resources

- [Meta Ad Library](https://www.facebook.com/ads/library/)
- [Ad Library API Docs](https://www.facebook.com/ads/library/api/)
- [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
- [Meta for Developers](https://developers.facebook.com/)

## 💡 Use Cases

- **Research**: Study advertising trends and strategies
- **Competitive Analysis**: Monitor competitor ads
- **Education**: Learn about digital advertising
- **Development**: Build ad monitoring tools
- **Transparency**: Investigate political advertising

## 🎯 Roadmap

Potential future features:
- [ ] Instagram ad layouts
- [ ] Video ad support
- [ ] Advanced filtering (by spend, impressions)
- [ ] Comparative analytics dashboard
- [ ] Automated reporting
- [ ] Bulk ad downloading
- [ ] Ad performance tracking

---

**Built with ❤️ for transparency in digital advertising**

For questions, issues, or contributions, please open an issue on GitHub.