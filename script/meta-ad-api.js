/**
 * Meta Ad Library API Integration
 * Fetches ad data from Meta's Ad Library API and structures it for use in layout clones
 */

class MetaAdAPI {
  constructor(accessToken) {
    this.accessToken = accessToken;
    this.baseUrl = "https://graph.facebook.com/v24.0";
    this.adLibraryUrl = `${this.baseUrl}/ads_archive`;
  }

  /**
   * Search for ads in the Meta Ad Library
   * @param {Object} params - Search parameters
   * @param {string} params.search_terms - Keywords to search for
   * @param {string} params.ad_reached_countries - Country code (e.g., 'US', 'GB')
   * @param {string} params.ad_type - Type of ad (default: 'POLITICAL_AND_ISSUE_ADS' or 'ALL')
   * @param {number} params.limit - Number of results to return (default: 10)
   * @returns {Promise<Array>} Array of ad objects
   */
  async searchAds(params = {}) {
    const country = params.ad_reached_countries || params.country || "US";
    const searchTerms = params.search_terms || "";
    const adType = params.ad_type || "ALL";
    const adActiveStatus = params.ad_active_status || "ALL";
    const limit = params.limit || 10;
    const fields =
      "id,ad_creative_bodies,ad_creative_link_captions,ad_creative_link_descriptions,ad_creative_link_titles,ad_snapshot_url,page_name,page_id,ad_delivery_start_time,ad_delivery_stop_time,currency,spend";

    // Build query string manually to match Meta's format exactly
    const queryParams = [
      `access_token=${encodeURIComponent(this.accessToken)}`,
      `search_terms=${encodeURIComponent(searchTerms)}`,
      `ad_reached_countries=${encodeURIComponent(`['${country}']`)}`,
      `ad_type=${adType}`,
      `ad_active_status=${adActiveStatus}`,
      `limit=${limit}`,
      `fields=${encodeURIComponent(fields)}`,
    ];

    try {
      const queryString = queryParams.join("&");
      const fullUrl = `${this.adLibraryUrl}?${queryString}`;

      // Debug logging
      console.log("🔍 API Request:", {
        url: fullUrl,
        searchTerms: searchTerms,
        country: country,
        adType: adType,
      });

      const response = await fetch(fullUrl);

      // Log response details
      console.log("📡 API Response:", {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || response.statusText;
        const errorType = errorData.error?.type || "Unknown";
        const errorCode = errorData.error?.code || response.status;

        console.error("❌ API Error Details:", {
          status: response.status,
          type: errorType,
          code: errorCode,
          message: errorMessage,
          fullError: errorData,
        });

        throw new Error(`API Error ${response.status}: ${errorMessage}`);
      }

      const data = await response.json();
      console.log("✅ API Success:", {
        totalAds: data.data?.length || 0,
        hasData: !!data.data,
      });

      return this.processAdData(data.data || []);
    } catch (error) {
      console.error("💥 Error fetching ads:", error);
      throw error;
    }
  }

  /**
   * Get detailed information about a specific ad
   * @param {string} adId - The ad ID
   * @returns {Promise<Object>} Ad details
   */
  async getAdDetails(adId) {
    try {
      const url = `${this.baseUrl}/${adId}?access_token=${this.accessToken}&fields=id,ad_creative_bodies,ad_creative_link_captions,ad_creative_link_descriptions,ad_creative_link_titles,ad_snapshot_url,page_name,page_id`;
      const response = await fetch(url);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `API Error: ${response.status} ${response.statusText} - ${errorData.error?.message || ""}`,
        );
      }

      const data = await response.json();
      return this.processAdData([data])[0];
    } catch (error) {
      console.error("Error fetching ad details:", error);
      throw error;
    }
  }

  /**
   * Fetch ad snapshot (rendered ad HTML)
   * @param {string} snapshotUrl - The ad snapshot URL from the API
   * @returns {Promise<string>} HTML content of the ad
   */
  async getAdSnapshot(snapshotUrl) {
    try {
      const response = await fetch(snapshotUrl);
      if (!response.ok) {
        throw new Error(`Snapshot Error: ${response.status}`);
      }
      return await response.text();
    } catch (error) {
      console.error("Error fetching ad snapshot:", error);
      throw error;
    }
  }

  /**
   * Process raw ad data into a structured format
   * @param {Array} ads - Raw ad data from API
   * @returns {Array} Processed ad objects
   */
  processAdData(ads) {
    return ads.map((ad) => {
      // Extract the first body, title, description, caption (API returns arrays)
      const body = ad.ad_creative_bodies?.[0] || "";
      const linkTitle = ad.ad_creative_link_titles?.[0] || "";
      const linkDescription = ad.ad_creative_link_descriptions?.[0] || "";
      const linkCaption = ad.ad_creative_link_captions?.[0] || "";

      return {
        id: ad.id,
        pageName: ad.page_name || "Unknown Page",
        pageId: ad.page_id || "",

        // Ad content
        bodyText: body,
        headerText: linkTitle,
        descriptionText: linkDescription,
        captionText: linkCaption,

        // Ad metadata
        snapshotUrl: ad.ad_snapshot_url || "",
        startTime: ad.ad_delivery_start_time || null,
        endTime: ad.ad_delivery_stop_time || null,
        currency: ad.currency || "USD",
        spend: ad.spend || null,

        // For layout mapping
        timestamp: this.formatTimestamp(ad.ad_delivery_start_time),
        isSponsored: true,
      };
    });
  }

  /**
   * Format timestamp for display
   * @param {string} timestamp - ISO timestamp
   * @returns {string} Formatted timestamp
   */
  formatTimestamp(timestamp) {
    if (!timestamp) return "Just now";

    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }

  /**
   * Extract image URLs from ad snapshot HTML
   * @param {string} snapshotHtml - HTML content from snapshot
   * @returns {Array<string>} Array of image URLs
   */
  extractImagesFromSnapshot(snapshotHtml) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(snapshotHtml, "text/html");
    const images = doc.querySelectorAll("img");
    return Array.from(images)
      .map((img) => img.src)
      .filter((src) => src && !src.includes("data:image"));
  }

  /**
   * Extract link URL from ad snapshot HTML
   * @param {string} snapshotHtml - HTML content from snapshot
   * @returns {string} Link URL
   */
  extractLinkFromSnapshot(snapshotHtml) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(snapshotHtml, "text/html");
    const link = doc.querySelector("a[href]");
    return link ? link.href : "";
  }
}

/**
 * Ad Data Cache Manager
 * Stores fetched ad data in localStorage to reduce API calls
 */
class AdDataCache {
  constructor(expiryMinutes = 60) {
    this.expiryMs = expiryMinutes * 60 * 1000;
    this.cacheKey = "meta_ad_cache";
  }

  /**
   * Store ads in cache
   * @param {string} key - Cache key (e.g., search term)
   * @param {Array} ads - Ad data to cache
   */
  set(key, ads) {
    try {
      const cache = this.getAll();
      cache[key] = {
        data: ads,
        timestamp: Date.now(),
      };
      localStorage.setItem(this.cacheKey, JSON.stringify(cache));
    } catch (error) {
      console.warn("Failed to cache ads:", error);
    }
  }

  /**
   * Retrieve ads from cache
   * @param {string} key - Cache key
   * @returns {Array|null} Cached ad data or null if expired/not found
   */
  get(key) {
    try {
      const cache = this.getAll();
      const entry = cache[key];

      if (!entry) return null;

      const isExpired = Date.now() - entry.timestamp > this.expiryMs;
      if (isExpired) {
        delete cache[key];
        localStorage.setItem(this.cacheKey, JSON.stringify(cache));
        return null;
      }

      return entry.data;
    } catch (error) {
      console.warn("Failed to retrieve cached ads:", error);
      return null;
    }
  }

  /**
   * Get all cached data
   * @returns {Object} All cached entries
   */
  getAll() {
    try {
      const data = localStorage.getItem(this.cacheKey);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      return {};
    }
  }

  /**
   * Clear all cached data
   */
  clear() {
    localStorage.removeItem(this.cacheKey);
  }
}

// Export for use in other modules
if (typeof module !== "undefined" && module.exports) {
  module.exports = { MetaAdAPI, AdDataCache };
}
