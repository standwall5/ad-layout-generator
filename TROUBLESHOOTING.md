# Troubleshooting Guide

Common issues and solutions for the Facebook Ad Feed Simulator.

---

## 🔍 Quick Diagnostics

### Is everything working?
Run this quick check:

```javascript
// 1. Check if scripts loaded
console.log(typeof MetaAdAPI);        // Should be "function"
console.log(typeof FacebookAdRenderer); // Should be "function"
console.log(typeof FeedSimulator);     // Should be "function"

// 2. Check if container exists
console.log(document.querySelector('#feed-container')); // Should be an element

// 3. Test API (replace YOUR_TOKEN)
const api = new MetaAdAPI('YOUR_TOKEN');
api.searchAds({ search_terms: 'test', limit: 1 })
   .then(ads => console.log('API works!', ads))
   .catch(err => console.error('API error:', err));
```

---

## 🚨 Common Errors

### 1. "API Error: 401 Unauthorized"

**Symptoms:**
- Error appears when searching for ads
- Status code 401 in console

**Causes:**
- Invalid access token
- Expired access token
- Token lacks required permissions

**Solutions:**

✅ **Generate a new access token:**
1. Visit [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
2. Click "Generate Access Token"
3. Grant `ads_read` permission
4. Copy the new token
5. Paste in your app and save

✅ **Check token permissions:**
```javascript
// Test your token
fetch('https://graph.facebook.com/v18.0/me?access_token=YOUR_TOKEN')
  .then(r => r.json())
  .then(d => console.log('Token valid for user:', d.name))
  .catch(e => console.error('Token invalid:', e));
```

✅ **Use long-lived token:**
Short-lived tokens expire after a few hours. Generate a 60-day token:
```
https://graph.facebook.com/v18.0/oauth/access_token?
  grant_type=fb_exchange_token&
  client_id={app-id}&
  client_secret={app-secret}&
  fb_exchange_token={short-lived-token}
```

---

### 2. "API Error: 400 Bad Request"

**Symptoms:**
- Error when searching
- Status code 400

**Causes:**
- Invalid country code
- Empty search terms
- Invalid ad_type parameter
- Malformed request

**Solutions:**

✅ **Verify country code:**
```javascript
// Valid country codes (ISO 2-letter)
const validCountries = ['US', 'GB', 'CA', 'AU', 'DE', 'FR', 'IN', 'BR'];
```

✅ **Check search parameters:**
```javascript
// Correct format
{
    search_terms: 'Nike',           // ✅ Not empty
    ad_reached_countries: 'US',     // ✅ Valid ISO code
    ad_type: 'ALL',                 // ✅ 'ALL' or 'POLITICAL_AND_ISSUE_ADS'
    limit: 10                       // ✅ Number between 1-50
}

// Common mistakes
{
    search_terms: '',               // ❌ Empty
    ad_reached_countries: 'USA',    // ❌ Should be 'US'
    ad_type: 'all',                 // ❌ Should be uppercase 'ALL'
    limit: 100                      // ❌ Max is 50
}
```

✅ **Test with minimal params:**
```javascript
await api.searchAds({
    search_terms: 'Nike',
    ad_reached_countries: 'US',
    limit: 1
});
```

---

### 3. "Container not found" or Nothing Renders

**Symptoms:**
- No error, but ads don't appear
- Console shows "Container not found"

**Causes:**
- Container element doesn't exist
- Wrong selector
- Scripts loading before DOM ready

**Solutions:**

✅ **Check container exists:**
```javascript
const container = document.querySelector('#feed-container');
console.log(container); // Should not be null
```

✅ **Verify selector matches:**
```html
<!-- HTML -->
<div id="feed-container"></div>

<!-- JavaScript - selector must match -->
<script>
const simulator = new FeedSimulator({
    containerSelector: '#feed-container' // Must match ID
});
</script>
```

✅ **Wait for DOM to load:**
```javascript
// Wrap in DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    const simulator = new FeedSimulator({
        accessToken: 'YOUR_TOKEN',
        containerSelector: '#feed-container'
    });
});

// Or use defer attribute
<script defer src="script/feed-simulator.js"></script>
```

---

### 4. No Images Showing

**Symptoms:**
- Ads render but images are missing
- Placeholder images instead of actual ad images

**Causes:**
- CORS restrictions
- Ad has no images
- Snapshot fetch failed
- Images blocked by browser

**Solutions:**

✅ **Use a local server:**
```bash
# Python
python -m http.server 8000

# Node.js
npx http-server -p 8000

# PHP
php -S localhost:8000
```

✅ **Not all ads have images:**
This is normal. The Ad Library doesn't always include images.

✅ **Check console for errors:**
```javascript
// Images load asynchronously
// Check console for fetch errors
console.log('Fetching images...');
```

✅ **Manually provide image URL:**
```javascript
renderer.renderAd(adData, {
    adImageUrl: 'https://example.com/custom-image.jpg'
});
```

---

### 5. "Rate limit exceeded" or Error 429

**Symptoms:**
- Error after multiple searches
- Status code 429
- "Too many requests" message

**Causes:**
- Too many API calls in short time
- Meta's rate limiting

**Solutions:**

✅ **Enable caching:**
```javascript
const simulator = new FeedSimulator({
    accessToken: 'YOUR_TOKEN',
    cacheEnabled: true  // ✅ Enable this
});
```

✅ **Add delays between requests:**
```javascript
const brands = ['Nike', 'Adidas', 'Puma'];
for (const brand of brands) {
    await simulator.searchAds(brand);
    await new Promise(r => setTimeout(r, 2000)); // Wait 2 seconds
}
```

✅ **Reduce request frequency:**
- Use cache
- Batch searches
- Wait before retrying

---

### 6. Scripts Not Loading

**Symptoms:**
- "MetaAdAPI is not defined"
- "FeedSimulator is not defined"
- Console errors about undefined

**Causes:**
- Wrong script paths
- Scripts in wrong order
- File not found

**Solutions:**

✅ **Check script order:**
```html
<!-- Correct order -->
<script src="../../script/meta-ad-api.js"></script>
<script src="../../script/facebook-ad-renderer.js"></script>
<script src="../../script/feed-simulator.js"></script>
<script src="your-code.js"></script>
```

✅ **Verify file paths:**
```html
<!-- If HTML is in: pages/facebook/demo.html -->
<!-- Scripts should be: -->
<script src="../../script/meta-ad-api.js"></script>

<!-- Check browser console for 404 errors -->
```

✅ **Use absolute paths (if using server):**
```html
<script src="/script/meta-ad-api.js"></script>
```

---

### 7. localStorage Issues

**Symptoms:**
- Cache not working
- Token not saving
- "localStorage is not defined"

**Causes:**
- Private/Incognito mode
- localStorage disabled
- Storage quota exceeded

**Solutions:**

✅ **Check if localStorage available:**
```javascript
if (typeof Storage !== 'undefined') {
    console.log('localStorage available');
} else {
    console.log('localStorage not supported');
}
```

✅ **Clear localStorage:**
```javascript
localStorage.clear();
// Or specific keys
localStorage.removeItem('meta_access_token');
localStorage.removeItem('meta_ad_cache');
```

✅ **Check storage quota:**
```javascript
// Check usage
if (navigator.storage && navigator.storage.estimate) {
    navigator.storage.estimate().then(estimate => {
        console.log('Used:', estimate.usage);
        console.log('Quota:', estimate.quota);
    });
}
```

---

### 8. Tailwind CSS Not Loading

**Symptoms:**
- No styling
- Plain HTML appearance
- Ads look unstyled

**Causes:**
- CDN blocked
- No internet connection
- Script tag missing

**Solutions:**

✅ **Check CDN link:**
```html
<script src="https://cdn.tailwindcss.com"></script>
```

✅ **Verify in Network tab:**
- Open DevTools → Network
- Look for "tailwindcss.com"
- Should show 200 status

✅ **Use local Tailwind (alternative):**
Download and host Tailwind CSS locally if CDN is blocked.

---

### 9. CORS Errors

**Symptoms:**
- "CORS policy" errors in console
- Failed to fetch
- Access blocked

**Causes:**
- Opening HTML file directly (file://)
- Browser security restrictions

**Solutions:**

✅ **Use a local web server:**
```bash
# Don't open file:// in browser
# Instead, use a server:

python -m http.server 8000
# Then visit: http://localhost:8000/pages/facebook/demo.html
```

✅ **Browser extension (last resort):**
Install a CORS extension, but this is not recommended for production.

---

### 10. Token Expires Too Quickly

**Symptoms:**
- Token works initially
- Stops working after a few hours
- Need to regenerate frequently

**Causes:**
- Using short-lived user token

**Solutions:**

✅ **Generate long-lived token (60 days):**
Visit this URL (replace values):
```
https://graph.facebook.com/v18.0/oauth/access_token?
  grant_type=fb_exchange_token&
  client_id={your-app-id}&
  client_secret={your-app-secret}&
  fb_exchange_token={your-short-lived-token}
```

✅ **Use Page Access Token:**
Page tokens don't expire if the page admin doesn't change password.

✅ **Use System User Token:**
For long-term automated use, create a system user in Business Manager.

---

## 🔧 Advanced Debugging

### Enable Debug Mode

```javascript
// Add to config.js
development: {
    debug: true,
    verboseLogging: true,
    showAPIResponses: true
}
```

### Check API Response

```javascript
const api = new MetaAdAPI('YOUR_TOKEN');
const ads = await api.searchAds({ search_terms: 'Nike', limit: 1 });
console.log('Full API response:', ads);
```

### Inspect Rendered Elements

```javascript
const renderer = new FacebookAdRenderer('#feed-container');
const element = renderer.renderAd(adData);
console.log('Rendered element:', element);
document.body.appendChild(element);
```

### Test Individual Components

```javascript
// Test API only
const api = new MetaAdAPI('TOKEN');
api.searchAds({ search_terms: 'test' })
   .then(ads => console.log('✓ API works'))
   .catch(err => console.error('✗ API failed:', err));

// Test Renderer only
const renderer = new FacebookAdRenderer('#feed');
const mockAd = {
    id: '1',
    pageName: 'Test',
    bodyText: 'Test ad',
    timestamp: '1h'
};
renderer.renderAd(mockAd);
```

---

## 🌐 Browser-Specific Issues

### Chrome
- Check Extensions: Some ad blockers may interfere
- Clear Cache: Settings → Privacy → Clear browsing data
- Console: F12 → Console tab for errors

### Firefox
- Enhanced Tracking Protection may block some features
- Try disabling for localhost
- Check Console: F12 → Console

### Safari
- Enable Developer Menu: Preferences → Advanced
- Check "Show Develop menu"
- Console: Develop → Show JavaScript Console

---

## 📱 Mobile/Responsive Issues

### Layout Breaking on Mobile

```javascript
// Check viewport meta tag
<meta name="viewport" content="width=device-width, initial-scale=1.0">

// Use responsive classes
<div class="max-w-2xl mx-auto px-4">
```

---

## 🔍 Network Debugging

### Check API Calls

1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "Fetch/XHR"
4. Search for ads → Watch for request
5. Check Status, Response, Headers

### Common Status Codes

- **200 OK**: Request succeeded
- **400 Bad Request**: Invalid parameters
- **401 Unauthorized**: Invalid token
- **403 Forbidden**: Permission denied
- **429 Too Many Requests**: Rate limited
- **500 Server Error**: Meta API issue

---

## 💾 Cache Issues

### Cache Not Working

```javascript
// Verify cache is enabled
const simulator = new FeedSimulator({
    cacheEnabled: true  // Check this is true
});

// Manually check cache
const cache = new AdDataCache();
console.log('Cache contents:', cache.getAll());
```

### Clear All Caches

```javascript
// Clear simulator cache
simulator.clearCache();

// Clear browser cache
localStorage.clear();

// Hard refresh page
// Windows/Linux: Ctrl + Shift + R
// Mac: Cmd + Shift + R
```

---

## 🐛 Still Having Issues?

### Debugging Checklist

- [ ] Access token is valid and recent
- [ ] Scripts loaded in correct order
- [ ] Container element exists in HTML
- [ ] Using local server (not file://)
- [ ] Browser console shows no errors
- [ ] Network tab shows successful API calls
- [ ] Tailwind CSS is loading
- [ ] localStorage is available
- [ ] Search parameters are valid

### Get More Help

1. **Check Documentation**
   - README.md
   - SETUP_GUIDE.md
   - QUICK_REFERENCE.md

2. **Review Examples**
   - example-usage.js
   - minimal-example.html

3. **Test with Minimal Code**
   - Start with minimal-example.html
   - Add features one at a time

4. **Check Meta Documentation**
   - [Ad Library API Docs](https://www.facebook.com/ads/library/api/)
   - [Graph API Explorer](https://developers.facebook.com/tools/explorer/)

5. **Open an Issue**
   - Provide error messages
   - Share console logs
   - Describe steps to reproduce

---

## 📞 Support Resources

- **Project Docs**: Check included MD files
- **Meta Support**: [developers.facebook.com/support](https://developers.facebook.com/support/)
- **Graph API**: [developers.facebook.com/docs/graph-api](https://developers.facebook.com/docs/graph-api)
- **Community**: Stack Overflow (tag: facebook-graph-api)

---

**Last Updated:** 2024
**Document Version:** 1.0