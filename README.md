# QuickSplit 2.0 🧾✨

A playful, responsive, and private bill and tip calculator for splitting checks fairly among friends. Built with semantic HTML5, modern CSS3, and vanilla JavaScript — no framework, no build steps, and zero external runtime dependencies.

---

## 🌟 Key Features

- **⚡ Instant Reactive Calculations**: Subtotal, tip amount, total check, and per-person shares update live as you type.
- **🪙 "Round Up Per Person" Option**: Avoid awkward loose change or fractional cents by rounding each share up to the nearest whole currency unit — the extra cents are automatically passed to the server as a tip bonus!
- **🌐 9 Global Currencies**: Localized formatting using native `Intl.NumberFormat` for:
  - **INR** (₹) — Indian Rupee
  - **USD** ($) — US Dollar
  - **EUR** (€) — Euro
  - **GBP** (£) — British Pound
  - **CAD** (CA$) — Canadian Dollar
  - **AUD** (A$) — Australian Dollar
  - **JPY** (¥) — Japanese Yen (integer formatting)
  - **SGD** (S$) — Singapore Dollar
  - **AED** (د.إ) — UAE Dirham
- **🎯 7 Tip Presets & Custom Input**: One-tap buttons for `0%`, `5%`, `10%`, `15%`, `18%`, `20%`, and `25%`, plus an exact custom percentage input.
- **👥 Flexible Group Controls**: Stepper buttons (`−` and `+`) with disabled states when at 1 person, plus quick chips for popular party sizes (`1`, `2`, `3`, `4`, `5`, `6`, `8`).
- **⏩ Quick Bill Shortcuts**: One-tap increment chips (`+10`, `+50`, `+100`, `+500`) and a quick-clear (`×`) button inside the input.
- **🧾 Authentic Receipt Panel**: Live time stamp, itemized breakdown, and an eye-catching "Each Person Pays" hero card with micro-animations.
- **📋 Copy & Native Share**: Copy a cleanly formatted receipt summary to your clipboard or share directly to WhatsApp, Telegram, iMessage, Slack, or SMS via the Web Share API.
- **💾 Local History with Granular Control**: View recent calculations with one-click **Restore** or **Delete** per item, plus a "Clear all" button.
- **🌓 Dynamic Light & Dark Theme**: High-contrast, accessibility-checked color palettes with system preference detection, persisted storage, and an animated Sun/Moon toggle.
- **♿ Accessibility & Performance First**: WCAG 2.1 AA compliant, screen-reader status hints, visible keyboard skip links, full keyboard navigability, and `prefers-reduced-motion` support.
- **🔒 100% Private & Offline Ready**: All calculations execute purely in the browser. No server calls, no telemetry, no tracking cookies, and no data leaves your device.

---

## 📁 Project Structure

```
Quicksplit/
├── index.html          # Semantic HTML5 markup and accessibility structure
├── css/
│   └── styles.css      # CSS variables, theme palettes, layouts, and animations
├── js/
│   ├── calculator.js   # Pure, UI-agnostic math and formatting engine
│   ├── storage.js      # Robust, fail-safe localStorage persistence wrapper
│   └── app.js          # DOM interactions, event listeners, and UI state
├── assets/
│   └── favicon.svg     # Vector brand mark
└── README.md           # Documentation and developer guide
```

---

## 🚀 Running Locally

Because QuickSplit is built with vanilla web technologies, you can run it using any local static file server or simply double-click `index.html` to open it directly in any modern browser.

### Option A: Using Python 3

```bash
python -m http.server 8000
```
Then visit [`http://localhost:8000`](http://localhost:8000).

### Option B: Using Node.js (npx)

```bash
npx --yes serve .
```

### Option C: Direct File Open
Open `index.html` directly in Google Chrome, Mozilla Firefox, Apple Safari, or Microsoft Edge.

---

## 📐 Calculation Rules & Math

### 1. Standard Split Formula

$$\text{Tip Amount} = \text{Bill Subtotal} \times \frac{\text{Tip \%}}{100}$$

$$\text{Total Bill} = \text{Bill Subtotal} + \text{Tip Amount}$$

$$\text{Per Person} = \frac{\text{Total Bill}}{\text{Number of People}}$$

### 2. "Round Up Per Person" Formula

When the **"Round up per person"** toggle is enabled:

$$\text{Per Person (Rounded)} = \lceil \text{Per Person (Raw)} \rceil$$

$$\text{Adjusted Total} = \text{Per Person (Rounded)} \times \text{Number of People}$$

$$\text{Rounding Bonus} = \text{Adjusted Total} - \text{Total Bill}$$

$$\text{Adjusted Tip} = \text{Tip Amount} + \text{Rounding Bonus}$$

### Example Comparison

| Parameter | Standard Split | With Round-Up Enabled |
| :--- | :--- | :--- |
| **Bill Amount** | ₹2,500.00 | ₹2,500.00 |
| **Tip Rate** | 10% | 10% |
| **People** | 6 | 6 |
| **Calculated Tip** | ₹250.00 | ₹254.00 (₹250 + ₹4 rounding) |
| **Total Bill** | ₹2,750.00 | ₹2,754.00 |
| **Each Pays** | **₹458.33** | **₹459.00** *(clean integer)* |

---

## 📋 Clipboard Summary Format

When you click **Copy summary** or **Share summary**, QuickSplit produces a clean, readable text block designed for chat apps:

```text
🧾 QuickSplit — Bill Summary
────────────────────────────
Bill Amount:        ₹2,500.00
Tip Percentage:     10%
Tip Amount:         ₹254.00
Rounding Bonus:     +₹4.00
Total Bill:         ₹2,754.00
Number of People:   6 people
────────────────────────────
👉 Amount Per Person: ₹459.00 (Rounded up)
────────────────────────────
Calculated with QuickSplit ✨
```

---

## 💾 Browser Storage Specifications

QuickSplit stores only your personal UI preferences and calculation summaries locally on your device:

| Storage Key | Type | Description |
| :--- | :--- | :--- |
| `quicksplit-theme` | `string` | `"light"` or `"dark"` |
| `quicksplit-currency` | `string` | Chosen ISO currency code (e.g. `"INR"`, `"USD"`) |
| `quicksplit-round` | `string` | `"true"` or `"false"` (round-up toggle state) |
| `quicksplit-recent` | `JSON Array` | Recent calculation objects (up to 8 items) |

If `localStorage` is disabled or blocked by browser privacy settings, QuickSplit degrades gracefully in memory without throwing errors or crashing.

---

## 🎨 UI/UX Design System

- **Typography**:
  - Headings & Branding: `Syne` (Bold, geometric display font)
  - Body & Microcopy: `Outfit` (Clean, legible modern grotesque)
  - Figures & Code: `IBM Plex Mono` (Tabular numbers for perfect alignment)
- **Design Tokens**:
  - Accent Violet: `#6D4AFF` (primary brand action)
  - Coral Pink: `#FF5E62` (secondary badge & step highlight)
  - Mint Teal: `#14B8A6` (success & highlight states)
  - Warm Amber: `#F59E0B` (accents & dark mode sun)
- **Glassmorphic Navigation**: Sticky header with `backdrop-filter: blur(16px)` and active section scrollspy.
- **Micro-Interactions**: Haptic-style scale pulses, smooth accordion expansion, and animated numerical updates.

---

## 🛡️ Input Validation & Safety

- Negative or non-numeric bill amounts are rejected with real-time feedback.
- Group size is constrained to positive whole integers between `1` and `1,000`.
- Numbers are capped safely to prevent `NaN`, `Infinity`, or layout-breaking overflow.
- Mouse wheel scrolling on focused number inputs is intercepted to prevent accidental value alterations on desktop.

---

## 📄 License

Open source under the [MIT License](https://opensource.org/licenses/MIT). Feel free to use, modify, and distribute.
