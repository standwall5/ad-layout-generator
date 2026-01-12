import json
import time
import re
from datetime import datetime
from urllib.parse import urlparse, parse_qs, unquote
import pandas as pd
from playwright.sync_api import sync_playwright

# Configuration
URL = "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=PH&is_targeted_country=false&media_type=all&q=deposit&search_type=keyword_unordered"
TARGET = 100
OUTPUT_JSON = "ads_data.json"  # Simple filename that HTML will read
OUTPUT_CSV = "facebook_ads_full_media.csv"

results = []
seen_ids = set()
existing_ads = []


def generate_timestamp():
    """Generate random timestamp for display"""
    import random
    units = ["m", "h", "d", "w"]
    unit = random.choice(units)
    if unit == "m":
        value = random.randint(5, 59)
    elif unit == "h":
        value = random.randint(1, 23)
    elif unit == "d":
        value = random.randint(1, 6)
    else:
        value = random.randint(1, 4)
    return f"{value}{unit}"


def extract_redirect_url(fb_link):
    """Extract actual URL from Facebook redirect link"""
    try:
        if not fb_link:
            return ""
        
        if "l.facebook.com" in fb_link:
            parsed = urlparse(fb_link)
            params = parse_qs(parsed.query)
            if 'u' in params:
                return unquote(params['u'][0])
        
        return fb_link
    except:
        return fb_link


def clean_domain(url):
    """Extract clean domain for display"""
    try:
        if not url:
            return ""
        parsed = urlparse(url)
        domain = parsed.netloc or parsed.path
        domain = domain.replace("www.", "").upper()
        return domain.split("/")[0]
    except:
        return ""


def create_ad_signature(ad):
    """Create a unique signature for an ad to detect duplicates"""
    # Use advertiser + first 100 chars of body text as signature
    text = ad.get('body_text', '')[:100]
    advertiser = ad.get('advertiser', '')
    return f"{advertiser}_{text}"


def load_existing_ads():
    """Load existing ads from JSON file"""
    try:
        with open(OUTPUT_JSON, 'r', encoding='utf-8') as f:
            return json.load(f)
    except FileNotFoundError:
        print("📝 No existing ads file found. Will create new one.")
        return []
    except json.JSONDecodeError:
        print("⚠️  Existing ads file is corrupted. Will create new one.")
        return []


print("🚀 Starting Facebook Ad Library Scraper")
print(f"📍 Target: {TARGET} NEW ads")
print(f"🌐 URL: {URL}\n")

# Load existing ads to check for duplicates
existing_ads = load_existing_ads()
existing_signatures = {create_ad_signature(ad) for ad in existing_ads}
print(f"📚 Found {len(existing_ads)} existing ads in {OUTPUT_JSON}")
print(f"🎯 Will add {TARGET} new unique ads\n")

with sync_playwright() as p:
    print("🔧 Launching browser...")
    browser = p.chromium.launch(
        headless=False,
        args=['--disable-blink-features=AutomationControlled']
    )
    
    context = browser.new_context(
        viewport={'width': 1920, 'height': 1080},
        user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    )
    
    page = context.new_page()
    
    print("⏳ Loading page...")
    page.goto(URL, wait_until='domcontentloaded', timeout=60000)
    page.wait_for_timeout(5000)
    
    # Wait for ads to load using the specific class
    print("⏳ Waiting for ads to appear...")
    try:
        page.wait_for_selector('._7jyh', timeout=15000)
        print("✅ Ads loaded!\n")
    except:
        print("❌ Could not find ads with class ._7jyh\n")

    scroll_count = 0
    max_scrolls = 50
    no_new_ads = 0
    duplicates_found = 0
    
    print("📜 Scrolling and collecting ads...\n")
    
    while len(results) < TARGET and scroll_count < max_scrolls:
        # Get all ad cards using the specific class ._7jyh
        cards = page.query_selector_all('._7jyh')
        
        if not cards:
            print(f"   ⚠️ No cards found on scroll {scroll_count + 1}")
            scroll_count += 1
            page.evaluate("window.scrollBy(0, 1000)")
            page.wait_for_timeout(2000)
            continue
        
        current_batch = 0
        
        for idx, card in enumerate(cards):
            try:
                # Get HTML to create unique ID
                html = card.inner_html()[:200]
                card_id = str(hash(html))
                
                if card_id in seen_ids:
                    continue
                
                seen_ids.add(card_id)
                
                # === ADVERTISER NAME ===
                advertiser = "Unknown Advertiser"
                page_id = ""
                
                # Look for advertiser link (contains page_id or ads/library)
                advertiser_link = card.query_selector('a.xt0psk2.x1hl2dhg')
                if advertiser_link:
                    advertiser = advertiser_link.inner_text().strip()
                    href = advertiser_link.get_attribute('href') or ''
                    
                    # Extract page ID from various URL patterns
                    match = re.search(r'view_all_page_id=(\d+)', href)
                    if not match:
                        match = re.search(r'/(\d+)/', href)
                    if match:
                        page_id = match.group(1)
                
                if not advertiser or advertiser == "Unknown Advertiser":
                    # Fallback: look for any strong text near top
                    strong = card.query_selector('strong')
                    if strong and "Sponsored" not in strong.inner_text():
                        advertiser = strong.inner_text().strip()
                
                # === PROFILE IMAGE ===
                profile_img = ""
                
                # Look for the profile image (class _8nqq)
                profile_img_el = card.query_selector('img._8nqq')
                if profile_img_el:
                    profile_img = profile_img_el.get_attribute('src') or ''
                
                if not profile_img:
                    # Fallback: first small image
                    all_imgs = card.query_selector_all('img')
                    for img in all_imgs:
                        src = img.get_attribute('src') or ''
                        if 'scontent' in src and any(s in src for s in ['s60x60', 's50x50', 's40x40']):
                            profile_img = src
                            break
                
                # === AD BODY TEXT ===
                body_text = ""
                
                # Look for white-space: pre-wrap div (this is where ad text usually is)
                text_el = card.query_selector('div[style*="white-space: pre-wrap"]')
                if text_el:
                    body_text = text_el.inner_text().strip()
                
                if not body_text:
                    # Look for _4ik4 _4ik5 divs
                    text_divs = card.query_selector_all('._4ik4._4ik5')
                    for div in text_divs:
                        text = div.inner_text().strip()
                        if len(text) > 20 and "Sponsored" not in text:
                            body_text = text
                            break
                
                # === MEDIA (Video or Image) ===
                media_type = ""
                media_url = ""
                poster_url = ""
                
                # Check for video first
                video = card.query_selector('video')
                if video:
                    media_type = "video"
                    media_url = video.get_attribute('src') or ''
                    poster_url = video.get_attribute('poster') or ''
                
                if not media_url:
                    # Look for main ad image (not profile pic)
                    all_imgs = card.query_selector_all('img')
                    for img in all_imgs:
                        src = img.get_attribute('src') or ''
                        if 'scontent' in src:
                            # Skip small images (profile pics)
                            if not any(s in src for s in ['s60x60', 's50x50', 's40x40', 's80x80', '_s.']):
                                media_type = "image"
                                media_url = src
                                break
                
                # === CTA LINK & BUTTON ===
                cta_url = ""
                cta_caption = ""
                cta_button_text = ""
                link_description = ""
                
                # Look for external links
                all_links = card.query_selector_all('a[href]')
                for link in all_links:
                    href = link.get_attribute('href') or ''
                    
                    # Look for l.facebook.com redirect links
                    if 'l.facebook.com' in href:
                        cta_url = extract_redirect_url(href)
                        if cta_url and 'facebook.com' not in cta_url:
                            cta_caption = clean_domain(cta_url)
                            
                            # Try to get button text from parent
                            button_text = link.inner_text().strip()
                            if button_text and len(button_text) < 50:
                                cta_button_text = button_text
                            break
                
                # Look for link description text
                link_divs = card.query_selector_all('div[tabindex="0"]')
                for div in link_divs:
                    text = div.inner_text().strip()
                    if text and len(text) > 10 and len(text) < 200:
                        if text != advertiser and text != body_text and 'FACEBOOK.COM' not in text:
                            link_description = text
                            break
                
                # === CHECK IF WE HAVE MINIMUM DATA ===
                if not advertiser or advertiser == "Unknown Advertiser":
                    continue
                
                if not body_text and not media_url:
                    continue
                
                # === BUILD RESULT ===
                ad_data = {
                    "advertiser": advertiser,
                    "page_id": page_id,
                    "profile_image": profile_img,
                    "body_text": body_text,
                    "media_type": media_type,
                    "media_url": media_url,
                    "video_poster": poster_url,
                    "cta_url": cta_url,
                    "cta_caption": cta_caption,
                    "cta_button_text": cta_button_text or "Download",
                    "link_description": link_description,
                    "timestamp": generate_timestamp(),
                }
                
                # Check for duplicates
                signature = create_ad_signature(ad_data)
                if signature in existing_signatures:
                    duplicates_found += 1
                    print(f"   ⏭️  Duplicate: {advertiser[:30]}")
                    continue
                
                # Add to existing signatures to prevent duplicates within this run
                existing_signatures.add(signature)
                
                results.append(ad_data)
                current_batch += 1
                
                # Show preview
                preview = f"{advertiser[:30]}"
                if media_type:
                    preview += f" [{media_type}]"
                if cta_caption:
                    preview += f" → {cta_caption}"
                    
                print(f"   ✅ #{len(results)}: {preview}")
                
                if len(results) >= TARGET:
                    break
                    
            except Exception as e:
                print(f"   ⚠️ Error on card {idx}: {str(e)}")
                continue
        
        if current_batch == 0:
            no_new_ads += 1
            if no_new_ads >= 5:
                print(f"\n⚠️ No new ads after 5 scrolls. Stopping.")
                break
        else:
            no_new_ads = 0
        
        # Scroll down
        scroll_count += 1
        page.evaluate("window.scrollBy(0, window.innerHeight * 1.5)")
        page.wait_for_timeout(3000)
    
    browser.close()

print(f"\n✅ Scraping complete!")
print(f"   New ads collected: {len(results)}")
print(f"   Duplicates skipped: {duplicates_found}\n")

if len(results) == 0:
    print("❌ No new ads were collected.")
    print(f"💾 Keeping existing {len(existing_ads)} ads in {OUTPUT_JSON}")
else:
    # Save CSV
    df = pd.DataFrame(results)
    df.to_csv(OUTPUT_CSV, index=False, encoding='utf-8-sig')
    print(f"💾 Saved CSV: {OUTPUT_CSV}")
    
    # Combine with existing ads for JSON
    all_ads = existing_ads.copy()
    
    for idx, row in df.iterrows():
        ad = {
            "id": f"scraped_{int(time.time())}_{len(all_ads)}",
            "pageName": row["advertiser"],
            "pageId": row.get("page_id", ""),
            "bodyText": row["body_text"],
            "headerText": "",
            "descriptionText": row.get("link_description", ""),
            "captionText": row.get("cta_caption", ""),
            "ctaButtonText": row.get("cta_button_text", "Download"),
            "linkUrl": row.get("cta_url", ""),
            "snapshotUrl": "",
            "startTime": datetime.now().isoformat(),
            "endTime": None,
            "currency": "PHP",
            "spend": None,
            "timestamp": row["timestamp"],
            "isSponsored": True,
            "imageUrl": row["media_url"] if row["media_type"] == "image" else row.get("video_poster", ""),
            "videoUrl": row["media_url"] if row["media_type"] == "video" else "",
            "profilePictureUrl": row["profile_image"],
            "isFakeAd": False,
            "mediaType": row["media_type"],
        }
        all_ads.append(ad)
    
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(all_ads, f, indent=2, ensure_ascii=False)
    
    print(f"💾 Saved JSON: {OUTPUT_JSON}")
    
    print(f"\n📊 Summary:")
    print(f"   Total ads in file: {len(all_ads)}")
    print(f"   Previously existing: {len(existing_ads)}")
    print(f"   Newly added: {len(results)}")
    print(f"   Duplicates skipped: {duplicates_found}")

print(f"\n✨ Done! Your Facebook clone will automatically read from {OUTPUT_JSON}")