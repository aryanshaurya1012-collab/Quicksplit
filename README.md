# QuickSplit 🧾⚡

A modern, playful, and ultra-responsive bill and tip calculator for splitting checks fairly among friends. Built with **React 19**, **Tailwind CSS**, and **Vite** — featuring crisp fintech typography (**Plus Jakarta Sans** & **Inter**), fluid micro-animations, multi-currency support, 100% offline functionality, and client-side privacy.

---

## ✨ Features (All Implemented & Live)

- ⚛️ **Modern Component Architecture**: Built with React 19, Tailwind CSS, Lucide Icons, and Canvas Confetti for reactive 60fps updates across all screen sizes.
- 🎨 **Fintech-Grade Typography**: Styled with **[Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans)** (headings & branding), **[Inter](https://fonts.google.com/specimen/Inter)** (UI body text & controls), and **[JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono)** (tabular numbers that never wobble).
- ⚡ **Dual Splitting Modes**:
  - **Equal Split**: 1-second math dividing the subtotal, tip, and rounding evenly across everyone.
  - **Itemized Split**: Add individual dishes and drinks, tag the friends who shared each item, and see exactly what each person owes down to the cent with proportional tip.
- 👥 **Interactive Group Management**:
  - **Add Friends by Name**: Type a friend's name and tap "+ Add Person" to add them with an assigned avatar color.
  - **Remove Anyone**: Individual `×` button on every friend chip to remove any specific person (minimum 1).
  - **Rename Avatars**: Click any friend's name to edit it inline with Enter / blur confirmation.
  - **Paid / Pending Tracker**: 1-tap toggle on both friend chips and the digital receipt to track who has settled up.
  - **Quick Sizes**: 1-tap stepper (- / +) and size presets (1, 2, 3, 4, 5, 6, 8, 10 people).
- 🪙 **Smart Round-Up**: Round shares up to the nearest whole currency unit (\$17.40 → \$18.00); spare cents are automatically calculated and passed to your server as a tip bonus. Works seamlessly in both Equal and Itemized modes.
- ⚡ **Dynamic Quick-Add Chips**: One-tap amount increments tailored to your active currency (`+50`, `+100`, `+500` for INR; `+5`, `+10`, `+20`, `+50` for USD/EUR) available for both bill subtotal and item prices, plus a 1-tap Clear button.
- 🌐 **9 Global Currencies**: Localized formatting using native `Intl.NumberFormat` for `INR (₹)`, `USD ($)`, `EUR (€)`, `GBP (£)`, `CAD (CA$)`, `AUD (A$)`, `JPY (¥)`, `SGD (S$)`, and `AED (د.إ)` with zero network latency.
- 📱 **100% Offline UPI QR Generator**: Generates client-side QR codes entirely in-memory using the `qrcode` library — no third-party APIs or network requests. Friends can scan directly with Google Pay, PhonePe, or Paytm.
- 📋 **Copy & Native Share with Confetti**: One-tap copy with celebratory confetti (`canvas-confetti`) and native Web Share API support. Generates formatted receipts with itemized order breakdowns and individual totals.
- 🖨️ **Print & PDF Export**: Instant formatted receipt print stylesheet (`@media print`) to save clean PDF receipts or print physical checks.
- 🔊 **Tactile Audio Feedback**: Subtle, satisfying click sounds generated natively in the browser via the Web Audio API (can be muted anytime via the 🔊 icon in the header).
- 💾 **Persistent History**: View past calculations in `localStorage` with a dedicated **Save** button, auto-save on copy/share/print, **1-Click Restore** (restores complete bill, tip, friends, and itemized dishes), and individual delete or clear all.
- 🌓 **Bulletproof Dark & Light Mode**: High-contrast, accessible theme palette with persistent preference stored in `localStorage` and instant CSS class switching.
- 📱 **Universal Device Usability**: Flawlessly optimized across desktop PCs, laptops, tablets, and smartphones with a responsive slide-down mobile drawer menu.
- ⌨️ **Power-User Keyboard Shortcuts**: Instant hotkeys (`[C]` Copy, `[S]` Save, `[T]` Theme, `[M]` Mode, `[R]` Reset) for rapid desktop workflow.
- 📊 **Segmented Split Visualizer Bar**: Revolut/Fintech-grade visual proportion bar highlighting each friend's share and percentage of the total check.
- 🌟 **Landing Experience**: Engaging Hero section with a live floating receipt preview, "How It Works" 3-step guide, FAQ accordions, About QuickSplit stats, and a floating Back to Top button.

---

## 📁 Project Structure

```
Quicksplit/
├── index.html              # Root HTML entry point (Plus Jakarta Sans & Inter fonts)
├── package.json            # Dependencies & scripts (React 19, Vite, Tailwind v4, QRCode, Confetti)
├── vite.config.js          # Vite and Tailwind CSS configuration
├── src/
│   ├── components/         # Modular UI components
│   │   ├── Navbar.jsx          # Header with branding, mode switch, audio, currency, theme
│   │   ├── Hero.jsx            # Interactive hero showcase with live preview playground
│   │   ├── HowItWorks.jsx      # 3-step workflow overview cards
│   │   ├── EqualSplitForm.jsx  # Bill subtotal input & quick-add chips
│   │   ├── ItemizedSplitForm.jsx # Dishes/drinks order entry & per-item friend tags
│   │   ├── TipSelector.jsx     # Tip presets with musical pentatonic chimes & custom tip
│   │   ├── GroupManager.jsx    # Add person, remove (×), inline rename, paid toggles
│   │   ├── ReceiptCard.jsx     # Digital check card, line items, actions & privacy pill
│   │   ├── SplitVisualizer.jsx # Segmented fintech proportion bar & percentage chips
│   │   ├── RecentSplits.jsx    # Saved splits grid with 1-click restore & delete
│   │   ├── FaqSection.jsx      # Interactive FAQ accordions
│   │   ├── AboutSection.jsx    # Project stats (0 trackers, 9 currencies, 100% client-side)
│   │   ├── UpiModal.jsx        # 100% offline QR generator with UPI deep links
│   │   ├── Footer.jsx          # Keyboard shortcuts pill & copyright footer
│   │   └── BackToTop.jsx       # Floating scroll-to-top button
│   ├── hooks/              # Custom React hooks
│   │   ├── useAudioHaptics.js  # Musical synthesizer chimes & click haptics
│   │   └── useTheme.js         # High-contrast dark/light synchronization
│   ├── utils/              # Pure utility functions
│   │   ├── currency.js         # NumberFormat currency & tip percentage formatters
│   │   ├── math.js             # Equal and itemized mathematical split engine
│   │   └── receipt.js          # Formatted receipt string generator
│   ├── constants/          # Static currency configurations & color palettes
│   ├── App.jsx             # Clean declarative conductor component
│   ├── index.css           # Tailwind CSS styles, animations, and print stylesheet
│   └── main.jsx            # React root mounting point
├── assets/
│   └── favicon.svg         # Vector brand mark
└── README.md               # Documentation
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

### 3. Itemized Split Formula

$$\text{Per Item Friend Share} = \frac{\text{Item Price}}{\text{Count of Consumers for Item}}$$

$$\text{Friend Base Share} = \sum \text{Per Item Friend Share}$$

$$\text{Friend Final Share} = \text{Friend Base Share} \times \left(1 + \frac{\text{Tip \%}}{100}\right)$$

---

## 🔒 100% Private & Offline Ready

QuickSplit executes entirely in your browser. All preferences (theme, currency, calculation history, sound preference) and UPI QR codes are computed strictly on your device. No analytics, no third-party trackers, and no server communication.

---

## 📄 License

Open source under the [MIT License](https://opensource.org/licenses/MIT).
