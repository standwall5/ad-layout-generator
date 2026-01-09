import json
import time
from datetime import datetime

import pandas as pd
from playwright.sync_api import sync_playwright

# URL already has the search query built in - just scrape everything on this page
URL = "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=PH&is_targeted_country=false&media_type=all&q=deposit&search_type=keyword_unordered"
TARGET = 500
OUTPUT_CSV = "facebook_ads_full_media.csv"
OUTPUT_JSON = "facebook_ads_for_organizer.json"

results = []
seen = set()


def generate_timestamp():
    """Generate random timestamp for display"""
    import random

    units = ["m", "h", "d"]
    unit = random.choice(units)
    if unit == "m":
        value = random.randint(1, 59)
    elif unit == "h":
        value = random.randint(1, 23)
    else:
        value = random.randint(1, 6)
    return f"{value}{unit}"


print("🚀 Starting Facebook Ad Library Scraper...")
print(f"📍 URL: {URL}")
print(f"🎯 Target: {TARGET} ads\n")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page()

    print("⏳ Loading Ad Library page...")
    page.goto(URL, timeout=60000)
    page.wait_for_timeout(8000)  # Wait for initial load
    print("✅ Page loaded!\n")

    scroll_attempts = 0
    no_new_ads_count = 0
    last_result_count = 0

    print("📜 Starting auto-scroll and collection...\n")

    while len(results) < TARGET:
        # Get all ad cards on page
        cards = page.query_selector_all(
            '[data-testid="ad-library-dynamic-content-container"]'
        )

        if not cards:
            print("⚠️  No ad cards found yet, waiting...")
            page.wait_for_timeout(3000)
            scroll_attempts += 1
            if scroll_attempts > 10:
                print("❌ No ads found after waiting. Exiting.")
                break
            continue

        # Process each card
        for card in cards:
            try:
                # Ad text
                text_el = card.query_selector('div[style*="white-space: pre-wrap"]')
                text = text_el.inner_text().strip() if text_el else ""

                # Skip if no text or already seen
                if not text or text in seen:
                    continue
                seen.add(text)

                # Advertiser name
                advertiser_el = card.query_selector(
                    'a[href^="https://www.facebook.com/"]'
                )
                advertiser = (
                    advertiser_el.inner_text().strip()
                    if advertiser_el
                    else "Unknown Advertiser"
                )

                # Profile image - try multiple selectors
                profile_img = ""
                try:
                    # Try to find profile image near advertiser name
                    # Method 1: Look for circular profile images
                    profile_imgs = card.query_selector_all("img")
                    for img in profile_imgs:
                        src = img.get_attribute("src") or ""
                        # Profile pics usually have these patterns and are small (s60x60 or similar)
                        if "scontent" in src and (
                            "s60x60" in src or "s50x50" in src or "s40x40" in src
                        ):
                            profile_img = src
                            break

                    # Method 2: If not found, look for first small image
                    if not profile_img:
                        for img in profile_imgs:
                            src = img.get_attribute("src") or ""
                            if "scontent" in src and "_s." in src:
                                profile_img = src
                                break
                except:
                    pass

                # Main media (image or video)
                media_type = ""
                media_url = ""

                video_el = card.query_selector("video")
                if video_el:
                    media_type = "video"
                    media_url = (
                        video_el.get_attribute("src")
                        or video_el.get_attribute("poster")
                        or ""
                    )
                else:
                    img_el = card.query_selector('img[src*="scontent"]')
                    if img_el:
                        media_type = "image"
                        media_url = img_el.get_attribute("src") or ""

                # Extract link/caption
                link_text = ""
                link_els = card.query_selector_all("a[href]")
                for link_el in link_els:
                    link_href = link_el.get_attribute("href") or ""
                    if "http" in link_href and "facebook.com" not in link_href:
                        link_text = link_href.split("//")[-1].split("/")[0].upper()
                        break

                results.append(
                    {
                        "advertiser": advertiser,
                        "profile_image": profile_img,
                        "text": text,
                        "media_type": media_type,
                        "media_url": media_url,
                        "link_caption": link_text,
                    }
                )

                print(f"✓ Collected {len(results)}/{TARGET} - {advertiser[:40]}")

                if len(results) >= TARGET:
                    break

            except Exception as e:
                # Silently continue on errors
                continue

        # Check if we're still getting new ads
        if len(results) == last_result_count:
            no_new_ads_count += 1
            if no_new_ads_count >= 3:
                print(
                    f"\n⚠️  No new ads after 3 scroll attempts. Stopping with {len(results)} ads."
                )
                break
        else:
            no_new_ads_count = 0

        last_result_count = len(results)

        # Auto-scroll to load more
        page.evaluate("window.scrollBy(0, window.innerHeight * 2)")
        page.wait_for_timeout(2000)  # Wait for new content to load
        scroll_attempts += 1

        # Stop if we've scrolled too many times
        if scroll_attempts > 150:
            print(f"\n⚠️  Reached scroll limit. Stopping with {len(results)} ads.")
            break

    browser.close()
    print(f"\n✅ Scraping complete! Collected {len(results)} ads")

# Save as CSV
df = pd.DataFrame(results)
df.to_csv(OUTPUT_CSV, index=False)
print(f"📊 Saved CSV: {OUTPUT_CSV}")

# Convert to JSON format for ad-organizer
organizer_ads = []
for idx, row in df.iterrows():
    ad = {
        "id": f"scraped_{int(time.time())}_{idx}",
        "pageName": row["advertiser"],
        "pageId": "",
        "bodyText": row["text"],
        "headerText": "",
        "descriptionText": "",
        "captionText": row.get("link_caption", ""),
        "snapshotUrl": "",
        "startTime": datetime.now().isoformat(),
        "endTime": None,
        "currency": "PHP",
        "spend": None,
        "timestamp": generate_timestamp(),
        "isSponsored": True,
        "imageUrl": row["media_url"] if row["media_type"] == "image" else "",
        "profilePictureUrl": row["profile_image"],
        "isFakeAd": False,  # These are real ads from Ad Library
    }
    organizer_ads.append(ad)

# Save as JSON
with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
    json.dump(organizer_ads, f, indent=2, ensure_ascii=False)

print(f"📦 Saved JSON: {OUTPUT_JSON}")
print(f"\n💡 To use these ads:")
print(f"   1. Open ad-data-organizer.html")
print(f"   2. Copy content from {OUTPUT_JSON}")
print(f"   3. Or import directly into localStorage")
print(f"\n✨ Done! {len(results)} real ads ready to use.")
