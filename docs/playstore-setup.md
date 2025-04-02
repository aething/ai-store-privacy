# Google Play Store Setup

This document explains how to prepare our application for distribution on the Google Play Store as a Progressive Web App (PWA).

## Prerequisites

1. A Google Play Developer account ($25 USD one-time fee)
2. TWA (Trusted Web Activity) or Bubblewrap for packaging the PWA
3. Keystore for signing the APK file

## Configuration Steps

### 1. Set Environment Variables for Mobile App

Add the following to your `.env` file or Replit environment variables:

```
VITE_IS_MOBILE_APP=true
VITE_API_URL=https://[your-replit-url].replit.app
```

### 2. Verify Web App Manifest

Ensure the `manifest.json` file in `client/public/` has the following:

- `short_name`: Short name for the app (30 characters or less)
- `name`: Full name of the app
- `icons`: Icons for different sizes (48x48 to 512x512)
- `start_url`: The URL that should be loaded when the app starts
- `display`: Set to "standalone" for app-like experience
- `theme_color`: Primary color of your app
- `background_color`: Background color during loading
- `orientation`: Preferred orientation (portrait/landscape/any)
- `related_applications`: Links to other versions of your app

### 3. Configure Service Worker

If not already done, implement a service worker for offline support:

```javascript
// client/public/service-worker.js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('v1').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json',
        // Add other important assets here
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

### 4. Package Your PWA with Bubblewrap

Install Bubblewrap CLI:

```bash
npm i -g @bubblewrap/cli
```

Initialize your TWA project:

```bash
bubblewrap init --manifest https://[your-replit-url].replit.app/manifest.json
```

Build the project:

```bash
bubblewrap build
```

### 5. Prepare Metadata for Google Play

Prepare the following assets for your Google Play Store listing:
- Feature graphic (1024 x 500 px)
- App icon (512 x 512 px)
- At least 2 screenshots for each supported device type
- App description with features including tax calculation functionality
- Privacy policy URL

## Tax Handling for Google Play

The application automatically handles taxes for different countries:

| Country | Tax Type | Rate | Implementation |
|---------|----------|------|----------------|
| Germany | MwSt. | 19% | Displayed on checkout page |
| France | TVA | 20% | Displayed on checkout page |
| Italy | IVA | 22% | Displayed on checkout page |
| Spain | IVA | 21% | Displayed on checkout page |
| USA | None | 0% | No tax applied |

All tax calculations are performed server-side but displayed to the user in the app.

## Testing Mobile Functionality

1. Enable debugging in Chrome DevTools:
   - Open Chrome DevTools
   - Go to More Tools > Remote devices
   - Connect your device or use Device Mode to simulate a mobile device

2. Test handling of different screen sizes:
   - Use responsive design mode in Chrome DevTools
   - Test on real devices when possible

3. Test tax calculation for different countries:
   - Use test users from different countries
   - Or use the API endpoint with `force_country` parameter for testing

## Final Checklist Before Submission

- [ ] Web App Manifest is complete and valid
- [ ] Service Worker is implemented and tested
- [ ] All API calls use absolute URLs instead of relative paths
- [ ] The app works offline for core functionality
- [ ] Accessibility has been tested
- [ ] Tax information is displayed correctly for all supported countries
- [ ] App complies with Google Play policies
- [ ] Privacy policy is in place and accessible

## Post-Submission Steps

After submission to Google Play Store:

1. Monitor the review process (typically takes 1-3 days)
2. Be prepared to address any policy violations or technical issues
3. Use Google Play Console to track app performance, including installs, ratings, and crashes