# System Architecture

## 📐 Overview

The Facebook Ad Feed Simulator is a client-side JavaScript application that integrates with Meta's Ad Library API to fetch and display real advertisements in a simulated Facebook feed.

---

## 🏗️ Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                       │
│                                                               │
│  ┌─────────────────────┐    ┌──────────────────────────┐   │
│  │  Control Panel      │    │   Feed Container         │   │
│  │  - Token Input      │    │   - Rendered Ads         │   │
│  │  - Search Form      │    │   - Scrollable Feed      │   │
│  │  - Settings         │    │   - Interactive Posts    │   │
│  └──────────┬──────────┘    └────────────▲─────────────┘   │
└─────────────┼──────────────────────────────┼─────────────────┘
              │                              │
              │ User Actions                 │ Rendered HTML
              ▼                              │
┌─────────────────────────────────────────────┼─────────────────┐
│                   FEED SIMULATOR            │                 │
│               (feed-simulator.js)           │                 │
│                                             │                 │
│  Main Controller & Orchestrator             │                 │
│  - Manages workflow                         │                 │
│  - Coordinates API & Renderer               │                 │
│  - Handles state                            │                 │
│  - Error handling                           │                 │
│  - UI notifications                         │                 │
└──────────┬──────────────────────────────────┼─────────────────┘
           │                                  │
           │ Fetch Ads                        │ Render Ads
           ▼                                  │
┌──────────────────────────┐    ┌────────────┴──────────────┐
│     META AD API          │    │  FACEBOOK AD RENDERER     │
│   (meta-ad-api.js)       │    │  (facebook-ad-renderer.js)│
│                          │    │                           │
│  - API Communication     │    │  - HTML Generation        │
│  - Search ads            │    │  - Styling                │
│  - Get ad details        │    │  - DOM Manipulation       │
│  - Fetch snapshots       │    │  - Image Updates          │
│  - Data processing       │    │  - Animations             │
└──────────┬───────────────┘    └───────────────────────────┘
           │                                  ▲
           │ HTTP Requests                    │ Ad Data
           ▼                                  │
┌──────────────────────────┐                 │
│   META GRAPH API         │                 │
│  (External Service)      │                 │
│                          │                 │
│  - Ad Library API        │─────────────────┘
│  - Returns ad data       │   Processed Data
│  - Ad snapshots          │
└──────────┬───────────────┘
           │
           │ Store/Retrieve
           ▼
┌──────────────────────────┐
│   LOCAL STORAGE          │
│   (Browser Cache)        │
│                          │
│  - Access tokens         │
│  - Cached ad data        │
│  - User preferences      │
└──────────────────────────┘
```

---

## 📦 Component Breakdown

### 1. **meta-ad-api.js** - API Layer

**Responsibilities:**
- Communicate with Meta's Ad Library API
- Handle authentication (access tokens)
- Format API requests
- Process API responses
- Extract data from ad snapshots
- Error handling for API calls

**Key Classes:**
- `MetaAdAPI` - Main API client
- `AdDataCache` - Local caching mechanism

**Key Methods:**
```javascript
searchAds(params)          // Search for ads
getAdDetails(adId)         // Get specific ad
getAdSnapshot(url)         // Fetch ad HTML
processAdData(ads)         // Structure ad data
extractImagesFromSnapshot() // Parse images
```

**Dependencies:**
- Fetch API (native)
- DOM Parser (for snapshot parsing)

---

### 2. **facebook-ad-renderer.js** - Presentation Layer

**Responsibilities:**
- Convert ad data to HTML elements
- Apply Facebook-style CSS
- Manage DOM elements
- Handle animations
- Generate placeholder images
- Update rendered content

**Key Classes:**
- `FacebookAdRenderer` - Main rendering engine

**Key Methods:**
```javascript
renderAd(adData, options)      // Render single ad
renderMultipleAds(adsArray)    // Render multiple ads
updateAdImage(adId, url)       // Update ad image
clearFeed()                    // Clear container
intersperseAds()               // Mix ads with posts
```

**Output:**
- Fully styled HTML elements
- Interactive ad posts
- Facebook-authentic UI

---

### 3. **feed-simulator.js** - Application Layer

**Responsibilities:**
- Orchestrate overall workflow
- Manage application state
- Coordinate API and renderer
- Handle user interactions
- Display notifications
- Manage auto-refresh
- Export functionality

**Key Classes:**
- `FeedSimulator` - Main controller

**Key Methods:**
```javascript
loadAds(searchParams)       // Load and display ads
searchAds(keyword, params)  // Search wrapper
refresh()                   // Refresh feed
downloadAds()               // Export JSON
clearCache()                // Cache management
updateConfig(config)        // Update settings
```

**State Management:**
```javascript
{
    currentAds: [],         // Currently displayed ads
    config: {},             // App configuration
    api: MetaAdAPI,         // API instance
    renderer: Renderer,     // Renderer instance
    cache: AdDataCache      // Cache instance
}
```

---

### 4. **config.js** - Configuration Layer

**Responsibilities:**
- Centralize all settings
- Provide default values
- Allow customization
- Define constants

**Configuration Sections:**
- API settings (endpoints, versions)
- Cache settings (expiry, size)
- Renderer settings (styling, animations)
- UI settings (theme, toasts)
- Feature flags

---

## 🔄 Data Flow

### Search Flow

```
User Input (Keyword)
        │
        ▼
FeedSimulator.searchAds()
        │
        ├─→ Check Cache
        │   └─→ If found: Return cached data
        │
        ▼
MetaAdAPI.searchAds()
        │
        ▼
HTTP Request to Meta API
        │
        ▼
Process Response
        │
        ▼
Store in Cache
        │
        ▼
FeedSimulator receives data
        │
        ▼
FacebookAdRenderer.renderMultipleAds()
        │
        ├─→ Generate HTML for each ad
        ├─→ Apply styles
        └─→ Append to container
        │
        ▼
Display in Feed
        │
        ▼
(Async) Fetch images from snapshots
        │
        ▼
Update rendered ads with images
```

### Ad Object Transformation

```
API Response (Raw)
{
    id: "123",
    ad_creative_bodies: ["Text..."],
    ad_creative_link_titles: ["Title"],
    page_name: "Nike",
    ad_snapshot_url: "https://..."
}
        │
        ▼
Processed Ad Data
{
    id: "123",
    bodyText: "Text...",
    headerText: "Title",
    pageName: "Nike",
    snapshotUrl: "https://...",
    timestamp: "2h",
    isSponsored: true
}
        │
        ▼
HTML Element
<div class="ad-post">
    <div class="ad-header">...</div>
    <div class="ad-body">...</div>
    <div class="ad-media">...</div>
    <div class="ad-actions">...</div>
</div>
```

---

## 🗄️ Data Storage

### localStorage Structure

```javascript
{
    "meta_access_token": "EAABwz...",
    
    "meta_ad_cache": {
        "search_key_1": {
            data: [/* ads */],
            timestamp: 1234567890
        },
        "search_key_2": {
            data: [/* ads */],
            timestamp: 1234567891
        }
    },
    
    "meta_user_preferences": {
        autoRefresh: false,
        cacheEnabled: true,
        lastCountry: "US"
    }
}
```

---

## 🔐 Security Considerations

1. **Access Token Storage**
   - Stored in localStorage (client-side only)
   - Not transmitted except to Meta API
   - User should rotate regularly

2. **XSS Prevention**
   - All user-generated content is escaped
   - HTML sanitization on render
   - No eval() or innerHTML with raw data

3. **API Communication**
   - HTTPS only
   - Direct to Meta API (no proxy)
   - Token in URL parameters (Meta's standard)

4. **Data Privacy**
   - No server-side storage
   - All data in browser only
   - Cache can be cleared anytime

---

## 🚀 Performance Optimizations

1. **Caching**
   - LocalStorage for API responses
   - Reduces redundant API calls
   - Configurable expiry time

2. **Lazy Loading**
   - Images loaded asynchronously
   - Snapshots fetched after initial render
   - Progressive enhancement

3. **Staggered Rendering**
   - Ads appear with delay
   - Smooth animation
   - Better perceived performance

4. **Rate Limiting**
   - Controlled API requests
   - Delays between searches
   - Respects Meta's limits

---

## 🔌 External Dependencies

### Required
- **Tailwind CSS** (CDN) - Styling framework
- **Meta Graph API** - Ad data source

### Native Browser APIs
- Fetch API - HTTP requests
- localStorage - Data persistence
- DOM Parser - HTML parsing
- requestAnimationFrame - Animations

### No Build Process Required
- Pure vanilla JavaScript
- No transpilation needed
- No bundler required
- Works in modern browsers

---

## 🌐 Browser Compatibility

**Supported Browsers:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Required Features:**
- ES6+ syntax
- Fetch API
- localStorage
- CSS Grid/Flexbox
- Async/await

---

## 🧩 Extension Points

### Custom Renderers

```javascript
class CustomAdRenderer extends FacebookAdRenderer {
    renderAd(adData, options) {
        // Custom rendering logic
        return customElement;
    }
}
```

### Custom API Adapters

```javascript
class CustomAPI extends MetaAdAPI {
    async searchAds(params) {
        // Custom API integration
        return processedAds;
    }
}
```

### Middleware/Plugins

```javascript
FeedSimulator.use({
    beforeRender(ads) {
        // Modify ads before rendering
        return filteredAds;
    },
    afterRender(elements) {
        // Process rendered elements
    }
});
```

---

## 📊 Error Handling Strategy

```
User Action
    │
    ▼
Try Operation
    │
    ├─→ Success → Display Result
    │
    └─→ Error
        │
        ├─→ Network Error → Show "Check connection"
        ├─→ Auth Error → Show "Invalid token"
        ├─→ Rate Limit → Show "Please wait"
        └─→ Other → Show generic message
        │
        ▼
    Log to Console (if debug enabled)
        │
        ▼
    Show Toast Notification
        │
        ▼
    Update Status Display
```

---

## 🔄 State Management

```javascript
// Application State
{
    // Config
    config: {
        accessToken: string,
        containerSelector: string,
        cacheEnabled: boolean,
        autoRefresh: boolean
    },
    
    // Runtime State
    currentAds: Ad[],
    isLoading: boolean,
    lastSearchParams: object,
    refreshTimer: number | null,
    
    // Instances
    api: MetaAdAPI,
    renderer: FacebookAdRenderer,
    cache: AdDataCache
}
```

---

## 🧪 Testing Strategy

### Unit Testing (Recommended)
- Test API methods independently
- Test renderer output
- Test data transformations
- Mock API responses

### Integration Testing
- Test full search flow
- Test caching mechanism
- Test error scenarios

### Manual Testing
- Different search terms
- Various countries
- Token expiry handling
- UI interactions

---

## 📈 Scalability Considerations

**Current Limitations:**
- Client-side only (no backend)
- LocalStorage size limits (~5-10MB)
- Browser memory for large result sets
- Meta API rate limits

**Potential Improvements:**
- Add backend proxy for caching
- Database for long-term storage
- Pagination for large result sets
- WebWorkers for heavy processing
- IndexedDB for larger cache

---

## 🎯 Design Patterns Used

1. **Singleton** - FeedSimulator instance
2. **Factory** - Ad element creation
3. **Observer** - Event listeners
4. **Strategy** - Configurable rendering options
5. **Facade** - Simplified API interface
6. **Decorator** - Enhanced ad elements

---

## 📝 Code Organization

```
Separation of Concerns:
├── API Layer (meta-ad-api.js)
│   └── Data fetching & processing
├── Presentation Layer (facebook-ad-renderer.js)
│   └── HTML generation & styling
├── Application Layer (feed-simulator.js)
│   └── Business logic & orchestration
└── Configuration (config.js)
    └── Settings & constants
```

---

## 🚀 Future Architecture Enhancements

1. **Module System**
   - Convert to ES6 modules
   - Enable tree-shaking
   - Better dependency management

2. **TypeScript**
   - Type safety
   - Better IDE support
   - Reduced runtime errors

3. **State Management Library**
   - Redux/MobX integration
   - Predictable state updates
   - Time-travel debugging

4. **Component Framework**
   - React/Vue integration
   - Reactive updates
   - Better composition

5. **Backend API**
   - Server-side caching
   - Rate limit management
   - Analytics collection

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Maintained By:** Project Contributors