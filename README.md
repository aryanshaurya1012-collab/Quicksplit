# QuickSplit 2.0 🧾⚡

A modern, playful, and ultra-responsive bill and tip calculator for splitting checks fairly among friends. Built with **React 19**, **Tailwind CSS**, and **Vite** — engineered with gorgeous fintech typography (**Plus Jakarta Sans** & **Inter**), fluid micro-animations, and 100% client-side privacy.

---

## ✨ What's New in 2.0

- ⚛️ **Modern Component Architecture**: Built with React 19 and Tailwind CSS for 60fps reactive updates.
- 🎨 **World-Class Typography**: Switched from outdated fonts to **Plus Jakarta Sans** (headings & interface) and **Inter** (body & numbers) — the same fonts used by Stripe, Wise, and Linear.
- 🎯 **All-in-One Interactive Studio**: No more endless scrolling past marketing banners — the calculator and live digital receipt are immediately accessible side-by-side.
- 👥 **Friend Avatars & Custom Names**: Add, remove, and rename group members with custom avatars and colors.
- 💰 **Payment Status Tracker**: Mark each friend as "Paid" or "Pending" right on the receipt.
- 🪙 **Smart Round-Up**: Round shares up to the nearest whole currency unit and pass the extra cents to the server as a tip bonus.
- ⚡ **Dynamic Quick-Add Chips**: One-tap amount increments tailored to your active currency (`+50`, `+100`, `+500`, etc.) and a 1-tap clear button.
- 🌐 **9 Global Currencies**: Localized formatting using `Intl.NumberFormat` for INR (₹), USD ($), EUR (€), GBP (£), CAD (CA$), AUD (A$), JPY (¥), SGD (S$), and AED (د.إ).
- 📱 **UPI Payment QR Generator**: Instant QR code generation for UPI apps (GPay, PhonePe, Paytm) in India.
- 📋 **Copy & Native Share with Confetti**: One-tap copy with celebratory confetti (`canvas-confetti`) and native Web Share API support.
- 💾 **Persistent History**: View past calculations in `localStorage` with one-click **Restore** or **Delete**.
- 🌓 **Smooth Dark & Light Mode**: High-contrast, accessibility-checked theme palette with persistent preference.
- 🚀 **Zero-Config Standalone Execution**: Pre-compiled with `vite-plugin-singlefile` — runs immediately when double-clicking `index.html` directly on `file:///` **OR** through `npm run dev`!

---

## 📁 Project Structure

```
Quicksplit/
├── index.html          # Standalone, self-contained production bundle (works on file:/// & web)
├── template.html       # Vite development HTML template
├── package.json        # Dependencies & scripts (React 19, Tailwind, Lucide, Vite)
├── vite.config.js      # Vite configuration with Tailwind CSS & singlefile plugin
├── scripts/
│   └── build.js        # Automated build & standalone bundle generator
├── src/
│   ├── App.jsx         # Main interactive calculator component
│   ├── main.jsx        # React root mounting point
│   ├── index.css       # Tailwind CSS & typography definitions
│   ├── constants.js    # Currency definitions, presets, and color palettes
│   └── utils.js        # Formatting, math engine, and Web Audio haptics
├── assets/
│   └── favicon.svg     # Vector brand mark
└── README.md           # Documentation
```

---

## 🚀 Getting Started

### Option 1: Direct File Open (No Server Required!)
Simply double-click `index.html` or open it directly in Google Chrome, Microsoft Edge, Safari, or Firefox. Everything is self-contained.

### Option 2: Local Development with Vite

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the Vite development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser with hot module replacement (HMR).

3. **Build the production standalone bundle**:
   ```bash
   npm run build
   ```
   Compiles all React code, Tailwind CSS, and Lucide icons into a unified, standalone `index.html`.

---

## 📐 Calculation Rules & Math

### 1. Standard Split Formula

$$\text{Tip Amount} = \text{Bill Subtotal} \times \frac{\text{Tip \%}}{100}$$

$$\text{Total Check} = \text{Bill Subtotal} + \text{Tip Amount}$$

$$\text{Per Person} = \frac{\text{Total Check}}{\text{Number of People}}$$

### 2. "Round Up Per Person" Formula

$$\text{Per Person (Rounded)} = \lceil \text{Per Person (Raw)} \rceil$$

$$\text{Adjusted Total} = \text{Per Person (Rounded)} \times \text{Number of People}$$

$$\text{Rounding Bonus} = \text{Adjusted Total} - \text{Total Check}$$

$$\text{Adjusted Tip} = \text{Tip Amount} + \text{Rounding Bonus}$$

---

## 🔒 100% Private & Offline Ready

QuickSplit executes entirely in your browser. All preferences (theme, currency, calculation history) are stored in your device's `localStorage`. No analytics, no third-party trackers, and no server communication.

---

## 📄 License

Open source under the [MIT License](https://opensource.org/licenses/MIT).
