# QuickSplit 2.0

A playful, responsive bill and tip calculator for splitting checks fairly. Built with plain HTML, CSS, and vanilla JavaScript — no build step required.

## Features

- Live bill, tip, and per-person calculations
- Currency formatting for INR, USD, EUR, and GBP (formatting only — no exchange conversion)
- Tip presets (5%, 10%, 15%, 20%) plus custom tip
- People count with plus/minus controls
- Receipt view with copy and share actions
- Recent splits saved in `localStorage`
- Light / dark theme with persisted preference
- Accessible labels, keyboard controls, and `prefers-reduced-motion` support

## Project structure

```
index.html          Main page and semantic layout
css/styles.css      Theme, layout, and component styles
js/calculator.js    Pure calculation and formatting helpers
js/storage.js       Safe localStorage helpers (theme + history)
js/app.js           UI wiring and interactions
assets/favicon.svg  Brand favicon
README.md           This file
```

## Run locally

Because this is a static site, open it with any local static server (recommended) or open `index.html` directly in a browser.

Using Python:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

Using Node (if available):

```bash
npx --yes serve .
```

## Calculation rules

- Tip = Bill Amount × Tip Percentage ÷ 100
- Total = Bill Amount + Tip
- Per Person = Total ÷ Number of People

Currency formatting uses `Intl.NumberFormat`. INR is the default.

### Example

| Input | Value |
| --- | --- |
| Bill | ₹2500 |
| Tip | 10% |
| People | 6 |

| Result | Value |
| --- | --- |
| Tip | ₹250.00 |
| Total | ₹2,750.00 |
| Per person | ₹458.33 |

## Validation

- Negative bill amounts are rejected
- Invalid tip values are rejected
- People count must be a positive whole number
- Empty or invalid inputs never show `NaN` or `Infinity`

## Browser storage

QuickSplit stores only:

- Theme preference (`quicksplit-theme`)
- A small list of recent calculation summaries (`quicksplit-recent`)

If `localStorage` is unavailable or corrupted, the app continues safely without crashing.

## Repository

https://github.com/aryanshaurya1012-collab/Quicksplit
