import json
import os
import time
import re
from pathlib import Path
from datetime import datetime
from urllib.parse import urlparse, parse_qs, unquote
import pandas as pd
from playwright.sync_api import sync_playwright

# ============= CONFIGURATION =============
ADS_LIBRARY_URL = "https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=PH&is_targeted_country=false&media_type=all&q=deposit&search_type=keyword_unordered"
FB_CLONE_PATH = "C:/Users/johnp/Desktop/2025 Programming/Facebook Website Fake Ad/ad-layout-generator/pages/facebook/facebook-with-ads.html"  # UPDATE THIS!
TARGET_ADS = 50  # Number of ads to scrape
OUTPUT_DIR = "ad_screenshots"
JSON_FILE = "facebook_ads_for_organizer.json"
CSV_FILE = "facebook_ads_data.csv"

# Create output directory
Path(OUTPUT_DIR).mkdir(exist_ok=True)

results = []
seen_ids = set()

# ============= HELPER FUNCTIONS =============
def generate_timestamp():
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
    try:
        if not url:
            return ""
        parsed = urlparse(url)
        domain = parsed.netloc or parsed.path
        domain = domain.replace("www.", "").upper()
        return domain.split("/")[0]
    except:
        return ""

# ============= STEP 1: SCRAPE ADS =============
print("=" * 60)
print("🚀 STEP 1: SCRAPING FACEBOOK ADS")
print("=" * 60)
print(f"📍 Target: {TARGET_ADS} ads")
print(f"🌐 URL: {ADS_LIBRARY_URL}\n")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    context = browser.new_context(viewport={'width': 1920, 'height': 1080})
    page = context.new_page()
    
    print("⏳ Loading Ad Library...")
    page.goto(ADS_LIBRARY_URL, wait_until='domcontentloaded', timeout=60000)
    page.wait_for_timeout(5000)
    
    try:
        page.wait_for_selector('._7jyh', timeout=15000)
        print("✅ Ads loaded!\n")
    except:
        print("❌ Could not find ads\n")
    
    scroll_count = 0
    max_scrolls = 50
    no_new_ads = 0
    
    print("📜 Scrolling and collecting ads...\n")
    
    while len(results) < TARGET_ADS and scroll_count < max_scrolls:
        cards = page.query_selector_all('._7jyh')
        
        if not cards:
            scroll_count += 1
            page.evaluate("window.scrollBy(0, 1000)")
            page.wait_for_timeout(2000)
            continue
        
        current_batch = 0
        
        for card in cards:
            try:
                html = card.inner_html()[:200]
                card_id = str(hash(html))
                
                if card_id in seen_ids:
                    continue
                seen_ids.add(card_id)
                
                # Extract advertiser
                advertiser = "Unknown"
                page_id = ""
                advertiser_link = card.query_selector('a.xt0psk2.x1hl2dhg')
                if advertiser_link:
                    advertiser = advertiser_link.inner_text().strip()
                    href = advertiser_link.get_attribute('href') or ''
                    match = re.search(r'view_all_page_id=(\d+)', href)
                    if match:
                        page_id = match.group(1)
                
                # Extract profile image
                profile_img = ""
                profile_img_el = card.query_selector('img._8nqq')
                if profile_img_el:
                    profile_img = profile_img_el.get_attribute('src') or ''
                
                # Extract body text
                body_text = ""
                text_el = card.query_selector('div[style*="white-space: pre-wrap"]')
                if text_el:
                    body_text = text_el.inner_text().strip()
                
                # Extract media
                media_type = ""
                media_url = ""
                poster_url = ""
                
                video = card.query_selector('video')
                if video:
                    media_type = "video"
                    media_url = video.get_attribute('src') or ''
                    poster_url = video.get_attribute('poster') or ''
                else:
                    all_imgs = card.query_selector_all('img')
                    for img in all_imgs:
                        src = img.get_attribute('src') or ''
                        if 'scontent' in src and not any(s in src for s in ['s60x60', 's50x50', 's40x40']):
                            media_type = "image"
                            media_url = src
                            break
                
                # Extract CTA
                cta_url = ""
                cta_caption = ""
                cta_button_text = ""
                
                all_links = card.query_selector_all('a[href]')
                for link in all_links:
                    href = link.get_attribute('href') or ''
                    if 'l.facebook.com' in href:
                        cta_url = extract_redirect_url(href)
                        if cta_url and 'facebook.com' not in cta_url:
                            cta_caption = clean_domain(cta_url)
                            button_text = link.inner_text().strip()
                            if button_text and len(button_text) < 50:
                                cta_button_text = button_text
                            break
                
                # Validate
                if not advertiser or advertiser == "Unknown":
                    continue
                if not body_text and not media_url:
                    continue
                
                # Save result
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
                    "timestamp": generate_timestamp(),
                }
                
                results.append(ad_data)
                current_batch += 1
                
                print(f"   ✅ #{len(results)}: {advertiser[:40]}")
                
                if len(results) >= TARGET_ADS:
                    break
                    
            except Exception as e:
                continue
        
        if current_batch == 0:
            no_new_ads += 1
            if no_new_ads >= 5:
                break
        else:
            no_new_ads = 0
        
        scroll_count += 1
        page.evaluate("window.scrollBy(0, window.innerHeight * 1.5)")
        page.wait_for_timeout(3000)
    
    browser.close()

print(f"\n✅ Scraped {len(results)} ads!\n")

if len(results) == 0:
    print("❌ No ads collected. Exiting.")
    exit()

# Save data
df = pd.DataFrame(results)
df.to_csv(CSV_FILE, index=False, encoding='utf-8-sig')

organizer_ads = []
for idx, row in df.iterrows():
    ad = {
        "id": f"scraped_{int(time.time())}_{idx}",
        "pageName": row["advertiser"],
        "pageId": row.get("page_id", ""),
        "bodyText": row["body_text"],
        "headerText": "",
        "descriptionText": "",
        "captionText": row.get("cta_caption", ""),
        "ctaButtonText": row.get("cta_button_text", "Download"),
        "linkUrl": row.get("cta_url", ""),
        "timestamp": row["timestamp"],
        "isSponsored": True,
        "imageUrl": row["media_url"] if row["media_type"] == "image" else row.get("video_poster", ""),
        "videoUrl": row["media_url"] if row["media_type"] == "video" else "",
        "profilePictureUrl": row["profile_image"],
        "isFakeAd": False,
    }
    organizer_ads.append(ad)

with open(JSON_FILE, "w", encoding="utf-8") as f:
    json.dump(organizer_ads, f, indent=2, ensure_ascii=False)

print(f"💾 Saved: {JSON_FILE}, {CSV_FILE}")

# ============= STEP 2: SCREENSHOT ADS =============
print("\n" + "=" * 60)
print("📸 STEP 2: TAKING SCREENSHOTS")
print("=" * 60)
print(f"📁 Output: {OUTPUT_DIR}/\n")

with sync_playwright() as p:
    browser = p.chromium.launch(headless=False)
    page = browser.new_page(viewport={'width': 1920, 'height': 1080})
    
    print("⏳ Loading Facebook clone...")
    page.goto(FB_CLONE_PATH)
    page.wait_for_timeout(1000)
    
    # Inject ads into localStorage
    print("💾 Injecting ads...")
    ads_json_str = json.dumps(organizer_ads).replace('"', '\\"').replace('\n', '')
    page.evaluate(f'localStorage.setItem("manual_ads_data", "{ads_json_str}")')
    
    print("🔄 Reloading...")
    page.reload()
    page.wait_for_timeout(2000)
    
    # Click load button
    try:
        page.click('#load-ads-btn')
        page.wait_for_timeout(2000)
    except:
        pass
    
    # Toggle to real ads
    try:
        is_checked = page.evaluate('document.getElementById("fake-ads-toggle")?.checked')
        if is_checked:
            page.click('#fake-ads-toggle')
            page.wait_for_timeout(1000)
    except:
        pass
    
    print("⏳ Waiting for ads to render...")
    page.wait_for_timeout(3000)
    
    # Find and screenshot each ad
    ad_cards = page.query_selector_all('.ad-post')
    
    if not ad_cards:
        print("❌ No ad cards found!")
        browser.close()
        exit()
    
    print(f"✅ Found {len(ad_cards)} cards\n")
    print("📸 Taking screenshots...\n")
    
    for idx, card in enumerate(ad_cards):
        try:
            advertiser_el = card.query_selector('.font-semibold')
            advertiser_name = "Unknown"
            if advertiser_el:
                advertiser_name = advertiser_el.inner_text().strip()
            
            safe_name = "".join(c if c.isalnum() or c in (' ', '-', '_') else '_' for c in advertiser_name)
            safe_name = safe_name[:50]
            
            filename = f"{idx+1:03d}_{safe_name}.png"
            filepath = os.path.join(OUTPUT_DIR, filename)
            
            card.scroll_into_view_if_needed()
            page.wait_for_timeout(500)
            
            card.screenshot(path=filepath)
            
            print(f"   ✅ {idx+1}/{len(ad_cards)}: {advertiser_name[:40]}")
            
        except Exception as e:
            print(f"   ⚠️  Error on card {idx+1}: {str(e)}")
    
    browser.close()

# ============= SUMMARY =============
print("\n" + "=" * 60)
print("✨ COMPLETE!")
print("=" * 60)
print(f"📊 Scraped: {len(results)} ads")
print(f"📸 Screenshots: {len([f for f in os.listdir(OUTPUT_DIR) if f.endswith('.png')])}")
print(f"📁 Location: {OUTPUT_DIR}/")
print(f"💾 Data: {JSON_FILE}, {CSV_FILE}")
print("\n🎓 Ready for your capstone presentation!")