# QuickSplit Pro 🧾⚡

A modern, high-precision, fintech-grade expense suite and bill calculator designed for real-world scaling, team lunches, dining groups, travel splits, and shared household finances. Built with **React 19**, **Tailwind CSS v4**, and **Vite** — engineered with Swiss/Linear typography (**Plus Jakarta Sans**, **Inter**, and **JetBrains Mono**), client-side deep-link session sharing, multi-payer debt minimization, smart receipt parsing, and 100% offline security.

---

## 🎯 Architecture & Workspace Overview

Unlike generic AI-generated landing pages with marketing fluff, **QuickSplit Pro** is structured directly as an authentic, high-utility web application organized into 4 cohesive operational views:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ QuickSplit PRO  [Dinner with Team]   [🧮 Calc] [⚖️ Settle] [📊 Analytics] [📁 Saved] │
└─────────────────────────────────────────────────────────────────────────────┘
```

1. **🧮 Calculator Workspace**:
   - **Equal Split**: Instant calculation dividing subtotal, discounts, tax, tip, and round-up evenly.
   - **Itemized Split**: Granular dish-by-dish order entry with multi-select consumer chips, prorated discounts, and proportional taxes.
   - **Discounts & Promo Codes**: Prorates flat vouchers (e.g. $20 off) or percentage discounts (e.g. 15% Zomato Gold / Swiggy One) across all item shares.
   - **Sales Tax / GST Engine**: Configurable tax rates (5% GST, 8.5% Sales Tax, 12%, 18%) applied to the discounted subtotal.
   - **Smart Round-Up**: Rounds individual shares up to the nearest whole integer ($17.40 → $18.00); spare cents are automatically awarded to the server's tip bonus.
   - **Live Merchant Receipt Card**: Photogenic, high-resolution digital check card with instant PNG image export (`html-to-image`), CSV spreadsheet download, print/PDF styling, and WhatsApp formatted text copy.

2. **⚖️ Settlement Ledger ("Who Owes Whom")**:
   - **Multi-Payer Upfront Contributions**: Accurately records who paid what upfront (e.g., Alice paid $150 on card, Bob paid $40 in cash, Charlie paid $0).
   - **Net Balance Matrix**: Real-time auditing of who is a Creditor (`+$45.00` to receive) vs Debtor (`-$30.00` to pay).
   - **Optimal Debt Minimization**: Executes a greedy transfer minimization algorithm to calculate the absolute fewest direct bank transfers required to balance everyone's tab.
   - **1-Click WhatsApp / Slack Copy**: Formatted plain-text summary ready to paste directly into group chats.

3. **📊 Financial Audit & Analytics**:
   - **Executive KPI Cards**: Total check, per-person average, peak individual consumer, and tax/tip ratio.
   - **Segmented Contribution Proportion Bar**: Interactive visual bar displaying each participant's share percentage of the total bill.
   - **Complete Audit Spreadsheet**: Itemized breakdown table showing Base Share, Discount, Tax, Tip, Total Share, and % of Check.

4. **📁 Local Archives & Saved Bills**:
   - Private browser-persisted ledger in `localStorage`.
   - Search by session title or category (`Dining`, `Travel`, `Groceries`, `Office`, `Event`).
   - 1-click **Restore to Workspace** and batch CSV export.

5. **🔗 Deep-Link State Sharing (`#share=...`)**:
   - Instant 1-click "Share Link" encodes the entire session state (items, friends, bill, tip, tax, discount) into a compact base64 URL hash.
   - Anyone opening the link on their mobile or desktop sees the exact calculated bill instantly — zero backend or login required.

6. **📋 Smart Receipt Text Parser**:
   - Paste raw bill text from SMS messages, Swiggy, Zomato, Uber Eats, or paper check transcriptions.
   - Automatically extracts dish names, quantities (e.g. `2x IPA Beer`), and prices into the itemized split.

---

## 📁 Project Structure

```
Quicksplit/
├── index.html                  # Root HTML entry point (Plus Jakarta Sans, Inter & Manifest)
├── package.json                # Dependencies, test runners & benchmark scripts
├── vite.config.js              # Vite and Tailwind CSS configuration
├── assets/                     # App assets, icons, manifest, and dining presets
│   ├── favicon.svg             # Vector brand mark
│   ├── icon-192.svg            # 192px PWA maskable icon
│   ├── icon-512.svg            # 512px PWA maskable icon
│   ├── site.webmanifest        # Progressive Web App manifest
│   └── sample-receipts.json    # Preset dining scenarios (Pizza, Sushi, Brunch)
├── css/                        # Standalone CSS stylesheet
│   └── styles.css              # Custom styling, print styles, and modal components
├── js/                         # Standalone modular JavaScript library
│   ├── app.js                  # Standalone application conductor
│   ├── calculator.js           # Pure math engine, debt minimizer & parser
│   └── storage.js              # Persistence layer
├── scripts/                    # Automated testing and benchmark scripts
│   ├── verify-math.js          # 29-assertion mathematical test suite
│   └── benchmark.js            # High-throughput performance benchmark (>50,000 ops/sec)
├── src/                        # Modern React 19 Application
│   ├── components/             # Modular UI components
│   │   ├── Navbar.jsx              # Linear-style application header with segmented tabs
│   │   ├── SessionHeader.jsx       # Event title editor, category tag & live KPI chips
│   │   ├── EqualSplitForm.jsx      # Bill subtotal input & quick-add chips
│   │   ├── ItemizedSplitForm.jsx   # Dishes/drinks order entry & per-item friend tags
│   │   ├── TaxAndDiscount.jsx      # Discounts, vouchers and Sales Tax / GST selector
│   │   ├── TipSelector.jsx         # Tip presets with musical pentatonic chimes & custom tip
│   │   ├── GroupManager.jsx        # Add person, remove (×), inline rename, paid toggles
│   │   ├── ReceiptCard.jsx         # Digital check card, line items, PNG/CSV exporters
│   │   ├── SettlementLedgerView.jsx# Dedicated "Who Owes Whom" balance matrix & debt minimizer
│   │   ├── AnalyticsView.jsx       # Expense analytics, segmented bar & audit spreadsheet
│   │   ├── HistoryView.jsx         # Local archives ledger with search & 1-click restore
│   │   ├── SettlementModal.jsx     # Quick settlement dialog
│   │   ├── SmartPasteModal.jsx     # Smart receipt bill text parser modal
│   │   ├── SampleReceiptsModal.jsx # Preset dining scenarios loader modal
│   │   ├── HelpModal.jsx           # Keyboard shortcuts, math rules & documentation modal
│   │   ├── UpiModal.jsx            # 100% offline QR generator with UPI deep links
│   │   ├── Footer.jsx              # Shortcuts pill & copyright footer
│   │   └── BackToTop.jsx           # Floating scroll-to-top button
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAudioHaptics.js      # Musical synthesizer chimes & click haptics
│   │   └── useTheme.js             # High-contrast dark/light synchronization
│   ├── utils/                  # Mathematical engines & utilities
│   │   ├── currency.js             # Intl.NumberFormat currency & tip percentage formatters
│   │   ├── math.js                 # Equal and itemized mathematical split engine
│   │   ├── settlement.js           # Multi-payer debt minimization algorithm
│   │   ├── parser.js               # Smart receipt bill text parser
│   │   ├── csv.js                  # CSV spreadsheet export generator
│   │   ├── receipt.js              # Formatted receipt string generator
│   │   └── shareLink.js            # Deep-link session URL encoder / decoder
│   ├── constants/              # Static currency configurations & color palettes
│   ├── App.jsx                 # Declarative application orchestrator
│   ├── index.css               # Tailwind CSS styles, animations, and print stylesheet
│   └── main.jsx                # React root mounting point
└── README.md                   # Complete documentation
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Vite Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Run Automated Mathematical Unit Tests
```bash
npm test
```
Executes all 29 mathematical test suites covering equal split, ceiling round-up, discounts, taxes, consumer itemized assignment, debt settlement minimization, and receipt parsing.

### 4. Run Performance Benchmark
```bash
npm run benchmark
```
Benchmarks 10,000 calculation runs for split math, itemized breakdowns, debt minimization, and text parsing to verify sub-millisecond execution (>50,000 operations/sec).

### 5. Build for Production
```bash
npm run build
```

---

## ⌨️ Power-User Keyboard Shortcuts

- `[1]` : Switch to **Calculator** view
- `[2]` : Switch to **Settlement Ledger** view
- `[3]` : Switch to **Analytics & Audit** view
- `[4]` : Switch to **Saved Bills** view
- `[M]` : Toggle between **Equal** and **Itemized** split modes
- `[C]` : Copy formatted receipt summary to clipboard
- `[S]` : Save current bill calculation to local history
- `[T]` : Toggle Dark / Light theme
- `[R]` : Reset active form to default values

---

## 🔒 100% Private & Offline Ready

QuickSplit Pro executes entirely inside your browser runtime. All preferences (theme, currency, calculation history, audio setting), deep-link URL state compression, and UPI QR codes are computed strictly on your device. No analytics, no third-party trackers, and no server communication.

---

## 📄 License

Open source under the [MIT License](https://opensource.org/licenses/MIT).
