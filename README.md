# Snap Valley

Snap Valley is a mobile-first installable web app for building and analysing Marvel Snap decks.

## What it does

- Build a 12-card list with searchable card name, energy cost, power, and ability text.
- Analyse the curve, recognized archetypes and common card packages.
- Show a conditional turn-by-turn energy line and estimate the chance of drawing key card(s) by turn 3 or the final turn.
- Recommend a 12-card list from 2–11 chosen cards, with a reason for each addition and alternatives.
- Suggest same-cost replacements, and search released locations for a deck-specific interaction note.
- Save the deck and completion seeds in local storage on the current device.

## Data and limits

- cards.js and cards.json contain 610 unique card records retrieved on 2026-10-21 from [SNAP.FAN](https://snap.fan/cards/); 504 are marked as deck-buildable. Generated tokens and transformed cards remain in the source catalogue but are excluded from deck suggestions.
- locations.js and locations.json contain 190 released location rules retrieved on 2026-10-21 from [SNAP.FAN locations](https://snap.fan/locations/).
- The catalogue files make the app usable offline after they have loaded once.
- The analyzer uses curated combo links plus card text tags and an energy-curve heuristic. The turn line assumes you draw its proposed cards; it does not simulate a real hand, opponents, changing energy/card costs, board state, or every card interaction.
- Probabilities assume a 12-card deck, random draws, the selected opening hand size, and no additional draw effects.
- Recommendations in this version are based on synergy and curve, not win-rate data. Current official patch notes and a live community meta page are linked in the app for checking competitive statistics and their sample sizes.
- This is an independent fan project, not affiliated with Marvel, Second Dinner, or Nuverse.

## Install on Android

1. Publish the folder on a site served over HTTPS.
2. Open the site in Chrome on the phone.
3. Choose **Install app** from Chrome's menu (the wording can vary by device).

The service worker caches the shell and bundled catalogs for offline use. Opening index.html as a file URL is only a preview; use HTTPS for installation and offline caching.
