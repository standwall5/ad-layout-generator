# Quick Reference Guide - Facebook Ad Feed Simulator

## 🚀 Getting Started in 3 Steps

1. **Get Token**: Visit [Graph API Explorer](https://developers.facebook.com/tools/explorer/) → Generate Token
2. **Open Demo**: `pages/facebook/facebook-feed-demo.html`
3. **Search Ads**: Paste token → Enter keyword → Click "Search Ads"

---

## 📁 File Structure

```
script/
├── meta-ad-api.js           # API integration
├── facebook-ad-renderer.js  # HTML rendering
├── feed-simulator.js        # Main controller
├── config.js                # Configuration
└── example-usage.js         # Code examples

pages/facebook/
├── facebook-feed-demo.html  # Full-featured demo
├── minimal-example.html     # Simplified version
└── facebook.html            # Original layout
```

---

## 💻 Basic Usage

### Simple HTML Integration

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
        const simulator = new FeedSimulator({
            accessToken: 'YOUR_TOKEN',
            containerSelector: '#feed-container'
        });
        
        simulator.searchAds('Nike', { country: 'US', limit: 10 });
    </script>
</body>
</html>
```

---

## 🔑 API Quick Reference

### MetaAdAPI

```javascript
const api = new MetaAdAPI('YOUR_TOKEN');

// Search ads
const ads = await api.searchAds({
    search_terms: 'iPhone',
    ad_reached_countries: 'US',
    ad_type: 'ALL',
    limit: 10
});

// Get specific ad
const ad = await api.getAdDetails('123456789');

// Get ad snapshot
const html = await api.getAdSnapshot(ad.snapshotUrl);
```

### FacebookAdRenderer

```javascript
const renderer = new FacebookAdRenderer('#feed-container');

// Render single ad
const element = renderer.renderAd(adData, {
    showSponsoredLabel: true,
    showAdControls: true
});

// Render multiple ads
renderer.renderMultipleAds(adsArray);

// Update ad image
renderer.updateAdImage('adId', 'imageUrl');

// Clear feed
renderer.clearFeed();
```

### FeedSimulator

```javascript
const simulator = new FeedSimulator({
    accessToken: 'TOKEN',
    containerSelector: '#feed',
    cacheEnabled: true,
    autoRefresh: false
});

// Search ads
await simulator.searchAds('Tesla', {
    country: 'US',
    limit: 10
});

// Refresh
await simulator.refresh();

// Download
simulator.downloadAds();

// Clear cache
simulator.clearCache();
```

---

## 📊 Ad Data Structure

```javascript
{
    id: "123456789",
    pageName: "Nike",
    pageId: "987654321",
    bodyText: "Just Do It...",
    headerText: "Shop Now",
    descriptionText: "Free shipping",
    captionText: "NIKE.COM",
    snapshotUrl: "https://...",
    startTime: "2024-01-15...",
    endTime: null,
    currency: "USD",
    timestamp: "2h",
    isSponsored: true
}
```

---

## 🌍 Country Codes

| Code | Country        | Code | Country       |
|------|---------------|------|---------------|
| US   | United States | GB   | United Kingdom|
| CA   | Canada        | AU   | Australia     |
| DE   | Germany       | FR   | France        |
| IN   | India         | BR   | Brazil        |
| JP   | Japan         | MX   | Mexico        |

---

## 🎯 Search Parameters

```javascript
{
    search_terms: 'keyword',           // Search keyword
    ad_reached_countries: 'US',        // Country code
    ad_type: 'ALL',                    // 'ALL' or 'POLITICAL_AND_ISSUE_ADS'
    ad_active_status: 'ALL',           // 'ALL', 'ACTIVE', 'INACTIVE'
    limit: 10,                         // Results (1-50)
    search_page_ids: ''                // Optional page IDs
}
```

---

## ⚡ Common Tasks

### Load Ads

```javascript
await simulator.searchAds('Nike', {
    country: 'US',
    limit: 10
});
```

### Export Data

```javascript
const json = simulator.exportAdsAsJSON();
simulator.downloadAds(); // Downloads file
```

### Monitor Multiple Brands

```javascript
const brands = ['Nike', 'Adidas', 'Puma'];
for (const brand of brands) {
    await simulator.searchAds(brand, { limit: 5 });
    await new Promise(r => setTimeout(r, 1000)); // Delay
}
```

### Custom Rendering

```javascript
const api = new MetaAdAPI('TOKEN');
const renderer = new FacebookAdRenderer('#feed');

const ads = await api.searchAds({ search_terms: 'Tesla' });
ads.forEach(ad => {
    const el = renderer.renderAd(ad);
    el.addEventListener('click', () => console.log('Clicked!'));
});
```

---

## 🐛 Troubleshooting

### Error 401 - Unauthorized
**Problem**: Invalid token  
**Solution**: Generate new token from Graph API Explorer

### Error 400 - Bad Request
**Problem**: Invalid parameters  
**Solution**: Check country code and search terms

### No Images
**Problem**: CORS or no images in ad  
**Solution**: Use local server, not all ads have images

### Rate Limiting
**Problem**: Too many requests  
**Solution**: Enable caching, add delays between requests

---

## 🔒 Security Checklist

- ✅ Never commit tokens to version control
- ✅ Use environment variables
- ✅ Rotate tokens regularly
- ✅ Store tokens in localStorage (client-side only)
- ✅ Use HTTPS in production

---

## 🎨 Customization

### Change Colors

Edit `config.js`:
```javascript
ui: {
    theme: {
        primaryColor: '#1877f2',
        successColor: '#42b72a',
        errorColor: '#f02849'
    }
}
```

### Custom Engagement Numbers

```javascript
renderer: {
    engagement: {
        likes: { min: 100, max: 5000 },
        comments: { min: 10, max: 500 }
    }
}
```

### Disable Features

```javascript
const simulator = new FeedSimulator({
    accessToken: 'TOKEN',
    autoRefresh: false,
    cacheEnabled: false
});
```

---

## 📝 Code Snippets

### Save Token to localStorage

```javascript
localStorage.setItem('meta_access_token', token);
const saved = localStorage.getItem('meta_access_token');
```

### Add Click Tracking

```javascript
renderer.addClickTracking(adElement, (adId, target) => {
    console.log('Clicked:', adId);
});
```

### Filter Ads

```javascript
const ads = await api.searchAds({ search_terms: 'Nike' });
const filtered = ads.filter(ad => 
    ad.bodyText.length > 50 && ad.headerText
);
```

### Sort Ads

```javascript
const sorted = ads.sort((a, b) => 
    new Date(b.startTime) - new Date(a.startTime)
);
```

---

## 📚 Resources

- **Demo**: `pages/facebook/facebook-feed-demo.html`
- **Examples**: `script/example-usage.js` (12 examples)
- **Full Guide**: `SETUP_GUIDE.md`
- **Config**: `script/config.js`

### External Links

- [Meta Ad Library](https://www.facebook.com/ads/library/)
- [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
- [API Documentation](https://www.facebook.com/ads/library/api/)
- [Meta Developers](https://developers.facebook.com/)

---

## 🎯 Use Cases

- **Research**: Study advertising trends
- **Competitive Analysis**: Monitor competitors
- **Education**: Learn about digital ads
- **Development**: Build monitoring tools
- **Transparency**: Investigate political ads

---

## ⚠️ Important Notes

1. **Token Expiry**: User tokens expire after a few hours
2. **Rate Limits**: Meta has API rate limits
3. **Cache**: Enable caching to reduce API calls
4. **CORS**: Use local server for best results
5. **Terms**: Comply with Meta's Terms of Service

---

## 🚦 Status Codes

| Code | Meaning | Action |
|------|---------|--------|
| 200 | Success | ✓ Working |
| 400 | Bad Request | Check parameters |
| 401 | Unauthorized | Refresh token |
| 403 | Forbidden | Check permissions |
| 429 | Rate Limited | Wait and retry |
| 500 | Server Error | Try again later |

---

## 💡 Pro Tips

1. **Enable Caching** → Faster, fewer API calls
2. **Use Local Server** → Avoid CORS issues
3. **Add Delays** → Prevent rate limiting
4. **Long-lived Token** → Less token refreshing
5. **localStorage** → Persist settings
6. **Error Handling** → Always use try-catch
7. **Test First** → Start with small limits
8. **Read Docs** → Check SETUP_GUIDE.md

---

**Need Help?** Check `SETUP_GUIDE.md` for detailed documentation!