/**
 * Facebook Ad Library Data Extractor
 *
 * HOW TO USE:
 * 1. Go to https://www.facebook.com/ads/library/
 * 2. Search for ads (e.g., "deposit" in Philippines)
 * 3. Scroll down to load more ads
 * 4. Open browser console (F12)
 * 5. Paste this entire script and press Enter
 * 6. Run: extractAllAds()
 * 7. Copy the JSON output
 *
 * IMPORTANT: This is for personal research/educational use only.
 * Respect Facebook's Terms of Service.
 */

(function() {
    'use strict';

    console.log('🔍 Facebook Ad Library Extractor loaded!');
    console.log('📋 Usage: extractAllAds()');

    /**
     * Extract data from all visible ads on the page
     */
    window.extractAllAds = function() {
        console.log('🚀 Starting extraction...');

        const ads = [];
        let adCount = 0;

        // Try multiple selectors as Facebook's structure may vary
        const adContainers = document.querySelectorAll('[data-testid="search-result-item"], [role="article"], .x1yztbdb');

        console.log(`📦 Found ${adContainers.length} potential ad containers`);

        adContainers.forEach((container, index) => {
            try {
                const ad = extractAdData(container, index);
                if (ad && (ad.bodyText || ad.pageName)) {
                    ads.push(ad);
                    adCount++;
                }
            } catch (error) {
                console.warn(`⚠️ Failed to extract ad ${index}:`, error);
            }
        });

        console.log(`✅ Successfully extracted ${adCount} ads`);

        // Display results
        displayResults(ads);

        // Store in global variable for easy access
        window.extractedAds = ads;

        return ads;
    };

    /**
     * Extract data from a single ad container
     */
    function extractAdData(container, index) {
        const ad = {
            id: `ad_${Date.now()}_${index}`,
            pageName: '',
            pageId: '',
            bodyText: '',
            headerText: '',
            descriptionText: '',
            captionText: '',
            snapshotUrl: '',
            startTime: new Date().toISOString(),
            endTime: null,
            currency: 'PHP',
            spend: null,
            timestamp: generateRandomTimestamp(),
            isSponsored: true,
            imageUrl: '',
            linkUrl: ''
        };

        // Extract page/advertiser name
        const pageNameElement = container.querySelector('[role="heading"], [class*="pageName"], h3, h2, strong');
        if (pageNameElement) {
            ad.pageName = cleanText(pageNameElement.textContent);
        }

        // Extract ad body text - look for longer text blocks
        const textElements = container.querySelectorAll('div[dir="auto"], span[dir="auto"], p');
        let longestText = '';
        textElements.forEach(el => {
            const text = cleanText(el.textContent);
            if (text.length > longestText.length && text.length > 20 && !text.includes('See More') && !text.includes('Ad Library')) {
                longestText = text;
            }
        });
        ad.bodyText = longestText;

        // Extract headline/title - usually bold or larger text
        const headlineElements = container.querySelectorAll('span[class*="bold"], div[class*="title"], [style*="font-weight"]');
        headlineElements.forEach(el => {
            const text = cleanText(el.textContent);
            if (text.length > 5 && text.length < 100 && text !== ad.bodyText && text !== ad.pageName) {
                if (!ad.headerText || text.length > ad.headerText.length) {
                    ad.headerText = text;
                }
            }
        });

        // Extract image URL
        const imgElement = container.querySelector('img[src*="scontent"]');
        if (imgElement) {
            ad.imageUrl = imgElement.src;
        }

        // Extract link/caption - look for URLs or domain names
        const linkElements = container.querySelectorAll('a[href], span[class*="link"]');
        linkElements.forEach(el => {
            const text = cleanText(el.textContent);
            const href = el.getAttribute('href');

            if (text.match(/\w+\.(com|ph|net|org)/i)) {
                ad.captionText = text.replace(/^https?:\/\//i, '').replace(/\/$/, '').toUpperCase();
            }

            if (href && href.includes('http') && !href.includes('facebook.com/ads/library')) {
                ad.linkUrl = href;
            }
        });

        // Extract "Started running on" date if visible
        const dateElement = container.querySelector('[class*="date"], [class*="time"]');
        if (dateElement) {
            const dateText = cleanText(dateElement.textContent);
            if (dateText.match(/\d{1,2}\/\d{1,2}\/\d{2,4}|\w+ \d{1,2},? \d{4}/)) {
                ad.startTime = dateText;
            }
        }

        return ad;
    }

    /**
     * Clean text - remove extra whitespace and unwanted characters
     */
    function cleanText(text) {
        return text
            .replace(/\s+/g, ' ')
            .replace(/[\u200B-\u200D\uFEFF]/g, '')
            .trim();
    }

    /**
     * Generate random timestamp for display
     */
    function generateRandomTimestamp() {
        const units = ['m', 'h', 'd'];
        const unit = units[Math.floor(Math.random() * units.length)];
        let value;

        switch(unit) {
            case 'm': value = Math.floor(Math.random() * 59) + 1; break;
            case 'h': value = Math.floor(Math.random() * 23) + 1; break;
            case 'd': value = Math.floor(Math.random() * 6) + 1; break;
        }

        return `${value}${unit}`;
    }

    /**
     * Display results in console
     */
    function displayResults(ads) {
        console.log('\n📊 EXTRACTION RESULTS:\n');
        console.log(`Total ads extracted: ${ads.length}`);
        console.log(`Ads with body text: ${ads.filter(a => a.bodyText).length}`);
        console.log(`Ads with page name: ${ads.filter(a => a.pageName).length}`);
        console.log(`Ads with images: ${ads.filter(a => a.imageUrl).length}`);
        console.log(`Ads with links: ${ads.filter(a => a.captionText).length}`);

        console.log('\n📝 Sample ad:');
        if (ads.length > 0) {
            console.log(JSON.stringify(ads[0], null, 2));
        }

        console.log('\n💾 To copy all data:');
        console.log('1. Run: copyToClipboard()');
        console.log('2. Or access: window.extractedAds');
        console.log('3. Or run: downloadJSON()');
    }

    /**
     * Copy extracted data to clipboard
     */
    window.copyToClipboard = function() {
        if (!window.extractedAds || window.extractedAds.length === 0) {
            console.error('❌ No data to copy. Run extractAllAds() first!');
            return;
        }

        const json = JSON.stringify(window.extractedAds, null, 2);

        navigator.clipboard.writeText(json).then(() => {
            console.log('✅ JSON copied to clipboard!');
            console.log(`📋 ${window.extractedAds.length} ads copied`);
        }).catch(err => {
            console.error('❌ Failed to copy:', err);
            console.log('💡 Try manually copying from: window.extractedAds');
        });
    };

    /**
     * Download extracted data as JSON file
     */
    window.downloadJSON = function() {
        if (!window.extractedAds || window.extractedAds.length === 0) {
            console.error('❌ No data to download. Run extractAllAds() first!');
            return;
        }

        const json = JSON.stringify(window.extractedAds, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `fb-ads-library-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        console.log('✅ JSON file downloaded!');
        console.log(`💾 ${window.extractedAds.length} ads saved`);
    };

    /**
     * Preview extracted ads in a nice table
     */
    window.previewAds = function() {
        if (!window.extractedAds || window.extractedAds.length === 0) {
            console.error('❌ No data to preview. Run extractAllAds() first!');
            return;
        }

        console.table(window.extractedAds.map(ad => ({
            'Page': ad.pageName.substring(0, 30),
            'Body': ad.bodyText.substring(0, 50) + '...',
            'Headline': ad.headerText.substring(0, 30),
            'Link': ad.captionText,
            'Has Image': ad.imageUrl ? '✓' : '✗'
        })));
    };

    /**
     * Auto-scroll and extract (useful for loading more ads)
     */
    window.autoScrollAndExtract = function(scrolls = 5, delay = 2000) {
        console.log(`🔄 Auto-scrolling ${scrolls} times (${delay}ms delay)...`);

        let currentScroll = 0;

        const scrollInterval = setInterval(() => {
            window.scrollTo(0, document.body.scrollHeight);
            currentScroll++;

            console.log(`📜 Scroll ${currentScroll}/${scrolls}`);

            if (currentScroll >= scrolls) {
                clearInterval(scrollInterval);
                console.log('✅ Scrolling complete! Waiting 2 seconds for content to load...');

                setTimeout(() => {
                    console.log('🚀 Extracting ads...');
                    window.extractAllAds();
                }, 2000);
            }
        }, delay);
    };

    /**
     * Filter extracted ads by keyword
     */
    window.filterAds = function(keyword) {
        if (!window.extractedAds || window.extractedAds.length === 0) {
            console.error('❌ No data to filter. Run extractAllAds() first!');
            return;
        }

        const filtered = window.extractedAds.filter(ad =>
            ad.pageName.toLowerCase().includes(keyword.toLowerCase()) ||
            ad.bodyText.toLowerCase().includes(keyword.toLowerCase()) ||
            ad.headerText.toLowerCase().includes(keyword.toLowerCase())
        );

        console.log(`🔍 Found ${filtered.length} ads matching "${keyword}"`);
        return filtered;
    };

    /**
     * Export ads in different formats
     */
    window.exportAs = function(format = 'json') {
        if (!window.extractedAds || window.extractedAds.length === 0) {
            console.error('❌ No data to export. Run extractAllAds() first!');
            return;
        }

        if (format === 'json') {
            window.downloadJSON();
        } else if (format === 'csv') {
            exportAsCSV();
        } else if (format === 'txt') {
            exportAsTXT();
        } else {
            console.error('❌ Unknown format. Use: json, csv, or txt');
        }
    };

    function exportAsCSV() {
        const headers = ['Page Name', 'Body Text', 'Headline', 'Link', 'Image URL'];
        const rows = window.extractedAds.map(ad => [
            ad.pageName,
            ad.bodyText,
            ad.headerText,
            ad.captionText,
            ad.imageUrl
        ]);

        const csv = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        downloadFile(csv, `fb-ads-${Date.now()}.csv`, 'text/csv');
        console.log('✅ CSV file downloaded!');
    }

    function exportAsTXT() {
        const txt = window.extractedAds.map((ad, i) => `
=== AD ${i + 1} ===
Page: ${ad.pageName}
Body: ${ad.bodyText}
Headline: ${ad.headerText}
Link: ${ad.captionText}
---
`).join('\n');

        downloadFile(txt, `fb-ads-${Date.now()}.txt`, 'text/plain');
        console.log('✅ TXT file downloaded!');
    }

    function downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Display help
    console.log('\n📚 AVAILABLE COMMANDS:\n');
    console.log('extractAllAds()           - Extract all visible ads');
    console.log('autoScrollAndExtract(5)   - Auto-scroll 5 times and extract');
    console.log('copyToClipboard()         - Copy extracted data to clipboard');
    console.log('downloadJSON()            - Download as JSON file');
    console.log('exportAs("csv")           - Export as CSV file');
    console.log('exportAs("txt")           - Export as TXT file');
    console.log('previewAds()              - Preview in table format');
    console.log('filterAds("keyword")      - Filter by keyword');
    console.log('\n💡 TIP: First run autoScrollAndExtract(10) to load more ads!\n');

})();
