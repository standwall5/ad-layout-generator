# Meta Ad Library API Access - Important Information

## 🚨 Issue: User Access Tokens Don't Work

You're getting **Error 500 (OAuthException Code 1)** because the Meta Ad Library API has specific access requirements that regular user access tokens don't meet.

## ✅ Your Current Status

- ✅ Token is VALID
- ✅ Has `ads_read` permission
- ❌ Still getting Error 500 because Ad Library API requires special access

---

## 📋 Solutions

### Option 1: Use the Public Ad Library Search (Recommended for Testing)

The **Ad Library Search** is publicly accessible and doesn't require API access:

**Manual Search:**
- Visit: https://www.facebook.com/ads/library/
- Search for ads by keyword
- Filter by country
- Browse ads visually

**Web Scraping Alternative:**
You could scrape the public Ad Library website, but this violates Meta's Terms of Service and is not recommended.

---

### Option 2: Get Your App Approved for Ad Library API

To use the actual Ad Library API programmatically, you need:

#### Step 1: Create a Meta App
1. Go to https://developers.facebook.com/apps
2. Click "Create App"
3. Choose "Business" type
4. Fill in app details

#### Step 2: Request Ad Library API Access
1. In your app dashboard, go to "App Review"
2. Request access to "Ad Library API"
3. You'll need to provide:
   - Valid use case (research, transparency, monitoring)
   - Privacy Policy URL
   - Terms of Service URL
   - Business verification

#### Step 3: Get Approved
- Meta will review your request (can take days/weeks)
- Once approved, you'll get API access
- Then generate an **App Access Token** or **System User Token**

---

### Option 3: Use System User Token (For Businesses)

If you have a Business Manager account:

1. Go to **Business Settings** → **System Users**
2. Create a new System User
3. Generate an access token for that user
4. Assign Ad Library API permissions
5. Use that token instead of user token

---

### Option 4: Alternative - Use Public Search (Manual)

Since programmatic access requires app approval, here's a manual workflow:

1. **Search manually**: https://www.facebook.com/ads/library/
2. **Filter**: By country (Philippines), keyword ("loan"), etc.
3. **Export data**: Take screenshots or manually copy ad info
4. **Input into your simulator**: Use the renderer with mock data

---

## 🔄 Workaround: Create Mock Data for Testing

While waiting for API approval, you can test your system with mock data:

### Create Mock Ads

```javascript
// In your browser console or a test file
const mockAds = [
    {
        id: "1234567890",
        pageName: "Sample Bank Philippines",
        pageId: "123456",
        bodyText: "Get your loan approved in 24 hours! Low interest rates, flexible payment terms. Apply now!",
        headerText: "Quick Loan Philippines",
        descriptionText: "Fast approval, competitive rates",
        captionText: "SAMPLEBANK.PH",
        snapshotUrl: "",
        startTime: new Date().toISOString(),
        endTime: null,
        currency: "PHP",
        spend: null,
        timestamp: "2h",
        isSponsored: true
    },
    {
        id: "0987654321",
        pageName: "Fast Cash Lending",
        pageId: "654321",
        bodyText: "Need cash fast? We approve loans up to ₱50,000 in minutes. No collateral required!",
        headerText: "Instant Loan Approval",
        descriptionText: "Online application, quick disbursement",
        captionText: "FASTCASH.COM.PH",
        snapshotUrl: "",
        startTime: new Date().toISOString(),
        endTime: null,
        currency: "PHP",
        spend: null,
        timestamp: "5h",
        isSponsored: true
    }
];

// Use with renderer
const renderer = new FacebookAdRenderer('#feed-container');
renderer.renderMultipleAds(mockAds);
```

---

## 📊 Why This Happens

The Ad Library API is **heavily restricted** because it provides access to:
- Political advertising data
- Commercial ad transparency
- Advertiser information
- Spending data

**Meta requires:**
- Business verification
- Valid use case
- App review and approval
- Compliance with transparency policies

**Regular user tokens** (even with `ads_read` permission) **cannot access** this data.

---

## 🎯 Recommended Path Forward

### For Development/Testing:
1. ✅ Use **mock data** to test your UI and renderer
2. ✅ Manually browse https://www.facebook.com/ads/library/ 
3. ✅ Copy real ad examples to create realistic mock data

### For Production:
1. Create and verify a Business account
2. Create a Meta App for your business
3. Submit for Ad Library API review
4. Wait for approval (7-14 days typically)
5. Use approved app token

---

## 🔗 Official Documentation

- **Ad Library API**: https://www.facebook.com/ads/library/api/
- **App Review**: https://developers.facebook.com/docs/app-review
- **Ad Library Public Search**: https://www.facebook.com/ads/library/
- **Business Verification**: https://www.facebook.com/business/help/2058515294227817

---

## 💡 Alternative: Screenshot-Based Approach

Since you have the Facebook layout clone, you could:

1. Manually search ads on https://www.facebook.com/ads/library/
2. Take screenshots of ads you want to analyze
3. Manually extract the data:
   - Page name
   - Ad text
   - Headline
   - Description
   - Link
4. Create JSON files with this data
5. Load into your renderer

**Example JSON format:**
```json
{
    "ads": [
        {
            "pageName": "XYZ Lending",
            "bodyText": "Fast loans up to 50k...",
            "headerText": "Apply Now",
            "descriptionText": "Quick approval",
            "captionText": "XYZLENDING.PH"
        }
    ]
}
```

---

## ⚠️ Important Note

The Error 500 you're seeing is **NOT a bug in your code**. It's Meta's way of saying:

> "Your token doesn't have the required authorization level for Ad Library API"

Your implementation is correct! You just need proper API access from Meta.

---

## 🚀 Next Steps

**Short term (Today):**
1. Use the mock data approach above
2. Test your renderer with fake but realistic data
3. Build out the UI features

**Long term (For production):**
1. Apply for Business verification
2. Create a proper Meta App
3. Request Ad Library API access
4. Wait for approval
5. Use approved access token

---

**Your system works! You just need the right type of access token. 🎉**