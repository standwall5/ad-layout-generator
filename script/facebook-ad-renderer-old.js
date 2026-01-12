// /**
//  * Facebook Ad Renderer
//  * Maps Meta Ad Library API data to Facebook feed layout clones
//  */

// class FacebookAdRenderer {
//   constructor(containerSelector = "#feed-container") {
//     this.container = document.querySelector(containerSelector);
//     if (!this.container) {
//       console.error(`Container ${containerSelector} not found`);
//     }
//   }

//   /**
//    * Render a single ad post in the Facebook feed
//    * @param {Object} adData - Processed ad data from MetaAdAPI
//    * @param {Object} options - Rendering options
//    * @returns {HTMLElement} The rendered ad element
//    */
//   renderAd(adData, options = {}) {
//     const {
//       showSponsoredLabel = true,
//       showAdControls = true,
//       profileImageUrl = null,
//       adImageUrl = null,
//     } = options;

//     // Use images from adData if not provided in options
//     const finalProfileImageUrl =
//       profileImageUrl || adData.profilePictureUrl || null;
//     const finalAdImageUrl = adImageUrl || adData.imageUrl || null;

//     const adPost = document.createElement("div");
//     adPost.className = "ad-post bg-white rounded-lg shadow-sm mb-4";
//     adPost.dataset.adId = adData.id;

//     adPost.innerHTML = `
//             <!-- Ad Header -->
//             <div class="ad-header p-4 flex items-start justify-between">
//                 <div class="flex items-start gap-3 flex-1">
//                     <!-- Profile Picture -->
//                     <a href="#" class="flex-shrink-0">
//                         <img
//                             src="${finalProfileImageUrl || this.getDefaultProfileImage(adData.pageName)}"
//                             alt="${adData.pageName}"
//                             class="w-10 h-10 rounded-full object-cover"
//                         />
//                     </a>

//                     <!-- Page Info -->
//                     <div class="flex-1 min-w-0">
//                         <div class="flex items-center gap-1">
//                             <a href="#" class="font-semibold text-[15px] text-[#050505] hover:underline">
//                                 ${this.escapeHtml(adData.pageName)}
//                             </a>
//                             ${showSponsoredLabel ? '<span class="text-[#65676b] text-[13px]">· Sponsored</span>' : ""}
//                         </div>
//                         <div class="flex items-center gap-1 text-[13px] text-[#65676b]">
//                             <span>${adData.timestamp}</span>
//                             <span>·</span>
//                             <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 16 16">
//                                 <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm0 14.5a6.5 6.5 0 110-13 6.5 6.5 0 010 13zm-.5-6.5v-3a.5.5 0 011 0v3a.5.5 0 01-1 0z"/>
//                             </svg>
//                         </div>
//                     </div>
//                 </div>

//                 <!-- More Options Button -->
//                 ${
//                   showAdControls
//                     ? `
//                 <button class="ad-options-btn p-2 hover:bg-gray-100 rounded-full -mr-2" aria-label="More options">
//                     <svg class="w-5 h-5 text-[#65676b]" fill="currentColor" viewBox="0 0 20 20">
//                         <g transform="translate(-446 -350)">
//                             <path d="M458 360a2 2 0 1 1-4 0 2 2 0 0 1 4 0m6 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0m-12 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0"></path>
//                         </g>
//                     </svg>
//                 </button>
//                 `
//                     : ""
//                 }
//             </div>

//             <!-- Ad Body Text -->
//             ${
//               adData.bodyText
//                 ? `
//             <div class="ad-body px-4 pb-3">
//                 <p class="text-[15px] text-[#050505] whitespace-pre-wrap">${this.escapeHtml(adData.bodyText)}</p>
//             </div>
//             `
//                 : ""
//             }

//             <!-- Ad Media (Image/Video) -->
//             ${
//               finalAdImageUrl
//                 ? `
//             <div class="ad-media">
//                 <img
//                     src="${finalAdImageUrl}"
//                     alt="Ad content"
//                     class="w-full object-cover"
//                     style="max-height: 600px;"
//                 />
//             </div>
//             `
//                 : ""
//             }

//             <!-- Link Preview Card -->
//             ${
//               adData.headerText || adData.linkCaption || adData.descriptionText
//                 ? `
//             <div class="ad-link-preview border-t border-gray-200">
//                 <a href="#" class="block hover:bg-gray-50 transition-colors">
//                     <div class="p-3">
//                         ${
//                           adData.captionText
//                             ? `
//                         <div class="text-[12px] text-[#65676b] uppercase mb-1">
//                             ${this.escapeHtml(adData.captionText)}
//                         </div>
//                         `
//                             : ""
//                         }
//                         ${
//                           adData.headerText
//                             ? `
//                         <div class="text-[17px] font-semibold text-[#050505] mb-1 line-clamp-2">
//                             ${this.escapeHtml(adData.headerText)}
//                         </div>
//                         `
//                             : ""
//                         }
//                         ${
//                           adData.descriptionText
//                             ? `
//                         <div class="text-[14px] text-[#65676b] line-clamp-2">
//                             ${this.escapeHtml(adData.descriptionText)}
//                         </div>
//                         `
//                             : ""
//                         }
//                     </div>
//                 </a>
//             </div>
//             `
//                 : ""
//             }

//             <!-- Engagement Stats -->
//             <div class="ad-stats px-4 py-2 flex items-center justify-between text-[15px] text-[#65676b]">
//                 <div class="flex items-center gap-1">
//                     <div class="flex -space-x-1">
//                         <span class="inline-flex items-center justify-center w-[18px] h-[18px] rounded-full bg-[#1877f2]">
//                             <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 16 16">
//                                 <path d="M8 0a8 8 0 00-8 8c0 4.4 3.6 8 8 8s8-3.6 8-8-3.6-8-8-8zm3.9 6.2l-4.3 4.3c-.1.1-.2.1-.3.1s-.2 0-.3-.1L4.1 7.6c-.2-.2-.2-.5 0-.7s.5-.2.7 0L7 9.1l4-4c.2-.2.5-.2.7 0s.2.5.2.7-.1.2-.1.4z"/>
//                             </svg>
//                         </span>
//                         <span class="inline-flex items-center justify-center w-[18px] h-[18px] rounded-full bg-[#f02849]">
//                             <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 16 16">
//                                 <path d="M8 1a7 7 0 00-7 7c0 3.9 3.1 7 7 7s7-3.1 7-7-3.1-7-7-7zm3.7 10.3c-.4.4-1.1.4-1.5 0L8 9.1l-2.2 2.2c-.4.4-1.1.4-1.5 0s-.4-1.1 0-1.5L6.5 8 4.3 5.8c-.4-.4-.4-1.1 0-1.5s1.1-.4 1.5 0L8 6.5l2.2-2.2c.4-.4 1.1-.4 1.5 0s.4 1.1 0 1.5L9.5 8l2.2 2.2c.4.4.4 1.1 0 1.5z"/>
//                             </svg>
//                         </span>
//                     </div>
//                     <span class="ml-1 text-[15px]">${this.generateRandomEngagement(100, 500)}</span>
//                 </div>
//                 <div class="flex gap-2">
//                     <span>${this.generateRandomEngagement(10, 100)} comments</span>
//                     <span>${this.generateRandomEngagement(5, 50)} shares</span>
//                 </div>
//             </div>

//             <!-- Action Buttons -->
//             <div class="ad-actions px-4 py-1 border-t border-gray-200">
//                 <div class="flex items-center justify-around py-1">
//                     <button class="flex items-center justify-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors flex-1">
//                         <svg class="w-5 h-5 text-[#65676b]" fill="currentColor" viewBox="0 0 20 20">
//                             <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z"/>
//                         </svg>
//                         <span class="text-[15px] font-semibold text-[#65676b]">Like</span>
//                     </button>
//                     <button class="flex items-center justify-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors flex-1">
//                         <svg class="w-5 h-5 text-[#65676b]" fill="currentColor" viewBox="0 0 20 20">
//                             <path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l.917-3.917A6.992 6.992 0 012 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd"/>
//                         </svg>
//                         <span class="text-[15px] font-semibold text-[#65676b]">Comment</span>
//                     </button>
//                     <button class="flex items-center justify-center gap-2 px-3 py-2 rounded-md hover:bg-gray-100 transition-colors flex-1">
//                         <svg class="w-5 h-5 text-[#65676b]" fill="currentColor" viewBox="0 0 20 20">
//                             <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z"/>
//                         </svg>
//                         <span class="text-[15px] font-semibold text-[#65676b]">Share</span>
//                     </button>
//                 </div>
//             </div>
//         `;

//     return adPost;
//   }

//   /**
//    * Render multiple ads to the feed
//    * @param {Array} adsData - Array of ad data objects
//    * @param {Object} options - Rendering options
//    */
//   renderMultipleAds(adsData, options = {}) {
//     if (!this.container) {
//       console.error("Container not found");
//       return;
//     }

//     adsData.forEach((adData, index) => {
//       const adElement = this.renderAd(adData, options);

//       // Add slight delay for staggered appearance
//       setTimeout(() => {
//         this.container.appendChild(adElement);
//       }, index * 100);
//     });
//   }

//   /**
//    * Clear all ads from the feed
//    */
//   clearFeed() {
//     if (this.container) {
//       this.container.innerHTML = "";
//     }
//   }

//   /**
//    * Intersperse ads with regular posts
//    * @param {Array} adsData - Array of ad data
//    * @param {Array} regularPosts - Array of regular post elements
//    * @param {number} adFrequency - Show ad every N posts (default: 3)
//    */
//   intersperseAds(adsData, regularPosts, adFrequency = 3) {
//     if (!this.container) return;

//     let adIndex = 0;
//     let postIndex = 0;

//     while (postIndex < regularPosts.length || adIndex < adsData.length) {
//       // Add regular posts
//       for (let i = 0; i < adFrequency && postIndex < regularPosts.length; i++) {
//         this.container.appendChild(regularPosts[postIndex]);
//         postIndex++;
//       }

//       // Add an ad
//       if (adIndex < adsData.length) {
//         const adElement = this.renderAd(adsData[adIndex]);
//         this.container.appendChild(adElement);
//         adIndex++;
//       }
//     }
//   }

//   /**
//    * Update ad with fetched image from snapshot
//    * @param {string} adId - Ad ID
//    * @param {string} imageUrl - Image URL
//    */
//   updateAdImage(adId, imageUrl) {
//     const adElement = this.container?.querySelector(`[data-ad-id="${adId}"]`);
//     if (!adElement) return;

//     const mediaContainer = adElement.querySelector(".ad-media");
//     if (mediaContainer) {
//       mediaContainer.innerHTML = `
//                 <img
//                     src="${imageUrl}"
//                     alt="Ad content"
//                     class="w-full object-cover"
//                     style="max-height: 600px;"
//                 />
//             `;
//     } else {
//       // Create media container if it doesn't exist
//       const bodyElement = adElement.querySelector(".ad-body");
//       const newMediaContainer = document.createElement("div");
//       newMediaContainer.className = "ad-media";
//       newMediaContainer.innerHTML = `
//                 <img
//                     src="${imageUrl}"
//                     alt="Ad content"
//                     class="w-full object-cover"
//                     style="max-height: 600px;"
//                 />
//             `;

//       if (bodyElement) {
//         bodyElement.after(newMediaContainer);
//       } else {
//         const header = adElement.querySelector(".ad-header");
//         header?.after(newMediaContainer);
//       }
//     }
//   }

//   /**
//    * Escape HTML to prevent XSS
//    * @param {string} text - Text to escape
//    * @returns {string} Escaped text
//    */
//   escapeHtml(text) {
//     if (!text) return "";
//     const div = document.createElement("div");
//     div.textContent = text;
//     return div.innerHTML;
//   }

//   /**
//    * Generate a default profile image using initial
//    * @param {string} name - Page name
//    * @returns {string} Data URL for profile image
//    */
//   getDefaultProfileImage(name) {
//     const initial = name.charAt(0).toUpperCase();
//     const colors = [
//       "#1877f2",
//       "#42b72a",
//       "#f02849",
//       "#7c4dff",
//       "#00c853",
//       "#ff6d00",
//       "#d50000",
//       "#aa00ff",
//       "#0091ea",
//       "#00c853",
//     ];
//     const color = colors[name.charCodeAt(0) % colors.length];

//     // Create SVG profile image
//     const svg = `
//             <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
//                 <rect width="40" height="40" fill="${color}" rx="20"/>
//                 <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle"
//                       font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="white">
//                     ${initial}
//                 </text>
//             </svg>
//         `;

//     return "data:image/svg+xml;base64," + btoa(svg);
//   }

//   /**
//    * Generate random engagement numbers
//    * @param {number} min - Minimum value
//    * @param {number} max - Maximum value
//    * @returns {string} Formatted number
//    */
//   generateRandomEngagement(min, max) {
//     const num = Math.floor(Math.random() * (max - min + 1)) + min;
//     if (num >= 1000) {
//       return (num / 1000).toFixed(1) + "K";
//     }
//     return num.toString();
//   }

//   /**
//    * Add click tracking to ad
//    * @param {HTMLElement} adElement - Ad DOM element
//    * @param {Function} callback - Click handler
//    */
//   addClickTracking(adElement, callback) {
//     adElement.addEventListener("click", (e) => {
//       const adId = adElement.dataset.adId;
//       callback(adId, e.target);
//     });
//   }

//   /**
//    * Animate ad appearance
//    * @param {HTMLElement} adElement - Ad DOM element
//    */
//   animateAdAppearance(adElement) {
//     adElement.style.opacity = "0";
//     adElement.style.transform = "translateY(20px)";
//     adElement.style.transition = "opacity 0.3s ease, transform 0.3s ease";

//     requestAnimationFrame(() => {
//       adElement.style.opacity = "1";
//       adElement.style.transform = "translateY(0)";
//     });
//   }
// }

// // Export for use in other modules
// if (typeof module !== "undefined" && module.exports) {
//   module.exports = FacebookAdRenderer;
// }
