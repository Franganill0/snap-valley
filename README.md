# Snap Valley · PWA prototype

Snap Valley is a mobile-first installable web app prototype. It has a dark interface with neon-green accents, a 12-slot deck builder, custom card-name entry, and local saving on the current device. The card picker includes a few shortcuts; you can also type any card name.

The analyzer, complete card/location catalogue, live meta, collection sync, accounts, and cloud backup are not connected yet. Those will need current structured game data and a hosted data service.

## Install on Android

1. Publish this folder on a website served over HTTPS.
2. Open the website in Chrome on the phone.
3. Choose **Install app** from Chrome's menu (the wording can vary by device and version).

The manifest, app icons, and service worker are included. After the first successful online visit, the service worker caches the app shell so the interface can reopen offline. Live data will need an internet connection once connected.

Opening `index.html` as a `file:` URL is only a local preview. It does not enable PWA installation or service workers. Use HTTPS for the phone install flow.
