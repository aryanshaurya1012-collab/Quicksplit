# QuickSplit 🧾⚡

A modern, playful, and ultra-responsive bill and tip calculator for splitting checks fairly among friends. Built with **React 19**, **Tailwind CSS**, and **Vite** — featuring crisp fintech typography (**Plus Jakarta Sans** & **Inter**), fluid micro-animations, multi-currency support, and 100% client-side privacy.

---

## ✨ Features

- ⚛️ **Modern Component Architecture**: Built with React 19 and Tailwind CSS for 60fps reactive updates across any screen size.
- 🎨 **Fintech-Grade Typography**: Powered by **[Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans)** (headings & branding) and **[Inter](https://fonts.google.com/specimen/Inter)** (UI body & tabular numerals) — the modern design standard of Stripe, Wise, and Linear.
- ⚡ **Dual Splitting Modes**:
  - **Equal Split**: Immediate 1-second math dividing the bill, tip, and rounding evenly among everyone.
  - **Itemized Split**: Add individual dishes or drinks, assign them to the friends who shared each item, and see exactly what each person owes down to the cent!
- 👥 **Interactive Group Management**: Add or remove friends, tap to rename avatars, and track who has paid or is still pending right on the digital receipt.
- 🪙 **Smart Round-Up**: Round shares up to the nearest whole currency unit ($17.40 → $18.00); spare cents are automatically transferred to the server's tip bonus.
- ⚡ **Dynamic Quick-Add Chips**: One-tap amount increments tailored to your active currency (`+50`, `+100`, `+500`, etc.) and a 1-tap clear button.
- 🌐 **9 Global Currencies**: Localized formatting using native `Intl.NumberFormat` for INR (₹), USD ($), EUR (€), GBP (£), CAD (CA$), AUD (A$), JPY (¥), SGD (S$), and AED (د.إ).
- 📱 **UPI Payment QR Generator**: Instant QR code generator for Indian UPI payments (GPay, PhonePe, Paytm).
- 📋 **Copy & Native Share with Confetti**: One-tap copy with celebratory confetti (`canvas-confetti`) and native Web Share API support.
- 🖨️ **Print & PDF Export**: Instant formatted receipt print stylesheet to save or print digital checks.
- 🔊 **Tactile Audio Feedback**: Subtle, satisfying click sounds generated natively via the Web Audio API (can be muted anytime via the 🔊 icon).
- 💾 **Persistent History**: View past calculations in `localStorage` with one-click **Restore** or **Delete**.
- 🌓 **Bulletproof Dark & Light Mode**: High-contrast, accessibility-checked theme palette with persistent preference.
- 📱 **Universal Device Usability**: Flawlessly optimized across desktop PCs, laptops, tablets, and mobile smartphones with a responsive drawer menu.
- 🌟 **Landing Experience**: Engaging Hero section with a live floating receipt preview, "How It Works" 3-step guide, FAQ accordions, and About section.

---

## 📁 Project Structure

```
Quicksplit/
├── index.html          # Root HTML entry point
├── package.json        # Dependencies & npm scripts
├── vite.config.js      # Vite and Tailwind CSS configuration
├── src/
│   ├── App.jsx         # Main application component (Equal & Itemized modes)
│   ├── main.jsx        # React root mounting point
│   ├── index.css       # Tailwind CSS imports & typography definitions
│   ├── constants.js    # Currency definitions, presets, and color palettes
│   └── utils.js        # Formatting, math engine, and Web Audio haptics
├── assets/
│   └── favicon.svg     # Vector brand mark
└── README.md           # Documentation
```

---

## 🚀 Getting Started

### Local Development with Vite

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the Vite development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

3. **Build for production**:
   ```bash
   npm run build
   ```

4. **Preview the production build**:
   ```bash
   npm run preview
   ```

---

## 📐 Calculation Rules & Math

### 1. Standard Equal Split Formula

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

QuickSplit executes entirely in your browser. All preferences (theme, currency, calculation history, sound preference) are stored in your device's `localStorage`. No analytics, no third-party trackers, and no server communication.

---

## 📄 License

Open source under the [MIT License](https://opensource.org/licenses/MIT).
