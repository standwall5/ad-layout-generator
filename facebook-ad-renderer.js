// facebook-ad-renderer.js - Auto-loads from ads_data.json
class FacebookAdRenderer {
  constructor(containerSelector) {
    this.container = document.querySelector(containerSelector);
    this.TEXT_PREVIEW_LENGTH = 200; // Characters to show before "See More"
    this.adsDataFile = "ads_data.json"; // The file scraper creates
  }

  clearFeed() {
    this.container.innerHTML = "";
  }

  /**
   * Load ads from JSON file automatically
   */
  async loadAdsFromFile() {
    try {
      const response = await fetch(this.adsDataFile);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const ads = await response.json();
      return ads;
    } catch (error) {
      console.error("Error loading ads:", error);
      throw error;
    }
  }

  renderAd(adData, options = {}) {
    const {
      showSponsoredLabel = true,
      showAdControls = true,
      profileImageUrl = null,
      adImageUrl = null,
    } = options;

    const adElement = document.createElement("div");
    adElement.className = "ad-post bg-white rounded-lg shadow-sm mb-4";

    // Use provided URLs or fallback to ad data
    const profileImg =
      profileImageUrl ||
      adData.profilePictureUrl ||
      this.getPlaceholderImage(40);
    const mediaUrl = adImageUrl || adData.imageUrl || adData.videoUrl || "";
    const hasMedia = mediaUrl && mediaUrl.length > 0;

    // Check if text needs truncation
    const bodyText = adData.bodyText || "";
    const needsTruncation = bodyText.length > this.TEXT_PREVIEW_LENGTH;
    const truncatedText = needsTruncation
      ? bodyText.substring(0, this.TEXT_PREVIEW_LENGTH) + "..."
      : bodyText;

    adElement.innerHTML = `
            <!-- Ad Header -->
            <div class="ad-header p-4 flex items-start justify-between">
                <div class="flex items-center gap-3">
                    <img 
                        src="${profileImg}" 
                        alt="${adData.pageName}"
                        class="w-10 h-10 rounded-full object-cover"
                        onerror="this.src='https://via.placeholder.com/40/cccccc/666666?text=${
                          adData.pageName?.charAt(0) || "A"
                        }'"
                    />
                    <div>
                        <div class="font-semibold text-[15px] text-[#050505]">
                            ${adData.pageName || "Advertiser"}
                        </div>
                        <div class="text-[13px] text-[#65676b] flex items-center gap-1">
                            ${
                              showSponsoredLabel
                                ? "<strong>Sponsored</strong> · "
                                : ""
                            }
                            <span>${adData.timestamp || "1h"}</span>
                        </div>
                    </div>
                </div>
                ${
                  showAdControls
                    ? `
                <button class="text-[#65676b] hover:bg-gray-100 rounded-full p-2">
                    <svg fill="currentColor" viewBox="0 0 20 20" width="20" height="20">
                        <g fill-rule="evenodd" transform="translate(-446 -350)">
                            <path d="M458 360a2 2 0 1 1-4 0 2 2 0 0 1 4 0m6 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0m-12 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0"></path>
                        </g>
                    </svg>
                </button>
                `
                    : ""
                }
            </div>

            <!-- Ad Body Text with See More -->
            ${
              bodyText
                ? `
            <div class="px-4 pb-3">
                <div class="text-[15px] text-[#050505]">
                    <span class="ad-text-content">${this.escapeHtml(
                      truncatedText
                    )}</span>
                    ${
                      needsTruncation
                        ? `
                        <span class="ad-text-full hidden">${this.escapeHtml(
                          bodyText
                        )}</span>
                        <button class="see-more-btn text-[#65676b] hover:underline font-semibold ml-1">
                            See more
                        </button>
                    `
                        : ""
                    }
                </div>
            </div>
            `
                : ""
            }

            <!-- Media Content -->
            ${hasMedia ? this.renderMedia(adData) : ""}

            <!-- Link Preview / CTA -->
            ${
              adData.linkUrl || adData.captionText
                ? this.renderLinkPreview(adData)
                : ""
            }

            <!-- Engagement Stats -->
            <div class="px-4 py-2 border-t border-gray-200">
                <div class="flex items-center justify-between text-[#65676b] text-[13px]">
                    <span>Low impression count</span>
                    <div class="flex gap-2">
                        <span>👍 ${this.randomEngagement(10, 500)}</span>
                        <span>💬 ${this.randomEngagement(5, 100)}</span>
                    </div>
                </div>
            </div>
        `;

    // Add "See More" functionality
    if (needsTruncation) {
      const seeMoreBtn = adElement.querySelector(".see-more-btn");
      const textContent = adElement.querySelector(".ad-text-content");

      if (seeMoreBtn && textContent) {
        let isExpanded = false;

        seeMoreBtn.addEventListener("click", () => {
          isExpanded = !isExpanded;

          if (isExpanded) {
            textContent.textContent = bodyText;
            seeMoreBtn.textContent = "See less";
          } else {
            textContent.textContent = truncatedText;
            seeMoreBtn.textContent = "See more";
          }
        });
      }
    }

    return adElement;
  }

  renderMedia(adData) {
    if (adData.videoUrl) {
      return `
            <div class="relative bg-black">
                <video 
                    class="w-full max-h-[500px] object-contain"
                    controls
                    poster="${adData.imageUrl || ""}"
                    src="${adData.videoUrl}"
                >
                </video>
            </div>
            `;
    } else if (adData.imageUrl) {
      return `
            <div class="relative">
                <img 
                    src="${adData.imageUrl}" 
                    alt="Ad content"
                    class="w-full object-cover max-h-[600px]"
                    onerror="this.style.display='none'"
                />
            </div>
            `;
    }
    return "";
  }

  renderLinkPreview(adData) {
    const urlDisplay = adData.captionText || this.extractDomain(adData.linkUrl);

    // Check if we should show a link preview image
    const hasLinkPreviewImage =
      adData.linkUrl && adData.imageUrl && !adData.videoUrl;

    return `
        <a 
            href="${adData.linkUrl || "#"}" 
            target="_blank"
            rel="nofollow noreferrer"
            class="block border-t border-gray-200 hover:bg-gray-50 transition-colors"
        >
            ${
              hasLinkPreviewImage
                ? `
            <!-- Link Preview Image -->
            <div class="relative bg-gray-100">
                <img 
                    src="${adData.imageUrl}" 
                    alt="Link preview"
                    class="w-full object-cover max-h-[400px]"
                    onerror="this.parentElement.style.display='none'"
                />
            </div>
            `
                : ""
            }
            
            <div class="p-3 bg-gray-50">
                <!-- URL Display -->
                ${
                  urlDisplay
                    ? `
                <div class="text-[12px] text-[#65676b] uppercase mb-1 font-medium">
                    ${urlDisplay}
                </div>
                `
                    : ""
                }
                
                <!-- Link Description -->
                ${
                  adData.descriptionText
                    ? `
                <div class="text-[14px] text-[#050505] line-clamp-2 mb-2">
                    ${this.escapeHtml(adData.descriptionText)}
                </div>
                `
                    : ""
                }
                
                <!-- CTA Button -->
                ${
                  adData.ctaButtonText
                    ? `
                <div class="mt-2">
                    <div class="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-2.5 rounded-md text-[15px] font-semibold transition-colors">
                        ${adData.ctaButtonText}
                    </div>
                </div>
                `
                    : ""
                }
            </div>
        </a>
        `;
  }

  extractDomain(url) {
    if (!url) return "";
    try {
      const domain = new URL(url).hostname;
      return domain.replace("www.", "").toUpperCase();
    } catch {
      return "";
    }
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  getPlaceholderImage(size = 40) {
    return `https://via.placeholder.com/${size}/cccccc/666666?text=Ad`;
  }

  randomEngagement(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
}

// Export for use in other scripts
if (typeof module !== "undefined" && module.exports) {
  module.exports = FacebookAdRenderer;
}
