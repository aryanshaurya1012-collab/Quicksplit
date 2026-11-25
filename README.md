# QuickSplit Pro 🧾⚡

A bespoke, high-precision financial expense suite and tactical bill calculator engineered for groups, team lunches, dining parties, road trips, and shared household tabs. Built with **React 19**, **Tailwind CSS v4**, and **Vite** — designed with an unmistakable **Industrial Craft & Neo-Brutalist** aesthetic (**Space Grotesk**, **Manrope**, and **Space Mono**), physical perforated thermal register tickets, client-side deep-link session sharing, multi-payer debt minimization, and 100% offline privacy.

---

## 🎯 Architectural Arrangement & Workspace Design

Unlike generic AI-generated landing pages or standard card templates with soft purple gradients, **QuickSplit Pro** is designed like an authentic, high-utility financial operations terminal organized into a **3-Zone Tactical Workspace** across 4 dedicated views:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ QUICKSPLIT PRO  [Dinner with Team]   [01 Calc] [02 Settle] [03 Audit] [04 Log]│
├─────────────────────────────────────────────────────────────────────────────┤
│ LIVE TICKER: [SUB: ₹2,400] | [TAX+TIP: +₹360] | [TOTAL: ₹2,760] | [CREW: 4] │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 1. 🧮 3-Zone Tactical Split Console (Calculator View)
- **Zone 1: Financial Terminal (Inputs & Rates)**:
  - Big numeric register with mechanical denomination keys (`+50`, `+100`, `+500`, `+1000`).
  - Tactile operational mode toggle: `= Equal Split` vs `÷ Itemized Check`.
  - Expandable Discounts & Tax/GST accordion with flat and percentage vouchers.
  - Stepped Gratuity Rate gauge with micro-notes (0% to 25% presets + custom tip).
- **Zone 2: Crew & Distribution Ledger**:
  - Interactive group roster with inline member renaming, paid/due toggles, and avatar color stamps.
  - Granular dish-by-dish order entry with multi-select consumer chips in itemized mode.
  - **Smart Round-Up**: Rounds individual shares up to the nearest whole integer ($17.40 → $18.00); spare cents are automatically awarded to the server's tip bonus.
- **Zone 3: Perforated Thermal Register Check (Anchor Slip)**:
  - Physical thermal check slip with authentic dot-matrix register markings (`REG #04`, `TIME`, `TABLE 07`).
  - **Geometric jagged tear-off bottom edge (`receipt-tear-bottom`)** and stylized barcode graphic.
  - Monospace accounting breakdown with dot leaders and member share status.
  - **Action Deck**: 1-click **Copy for WhatsApp** (with celebratory confetti), **Share Web Link**, **Download Slip (PNG Image)**, **CSV Sheet Export**, **Print / Save as PDF**, and **UPI Instant QR Code Generator**.

---

### 2. ⚖️ Debt Minimization Ledger ("Who Owes Whom")
- **Multi-Payer Contributions**: Accurately records who paid what upfront on card or cash.
- **Net Balance Audit**: Real-time auditing of Creditors (`+$45.00` to receive) vs Debtors (`-$30.00` to pay).
- **Greedy Debt Minimization Algorithm**: Calculates the absolute minimum number of peer-to-peer bank transfers needed to square everyone up.
- **1-Click Chat Plan Copy**: Formatted plain-text summary ready to paste directly into group WhatsApp or Slack channels.

---

### 3. 📊 Financial Audit & Analytics
- **Executive KPI Cards**: Total check, average per head, peak consumer, and tax/tip ratio.
- **Segmented Contribution Proportion Bar**: Interactive visual bar displaying each participant's share percentage of the total bill.
- **Audited Ledger Table**: Complete spreadsheet breakdown showing Base Share, Discount, Tax, Tip, Total Share, and % of Check.

---

### 4. 📁 Local Archives & Saved Bills
- 100% private browser-persisted ledger stored in `localStorage`.
- Search saved splits by session title or category (`Dining`, `Travel`, `Groceries`, `Office`, `Event`).
- 1-click **Restore to Workspace** and batch CSV spreadsheet download.

---

### 5. 🔗 Zero-Backend Deep-Link State Sharing (`#share=...`)
- Encodes the complete session state (dishes, friends, bill, tip, tax, discount) into a compact base64 URL hash.
- Anyone opening the link on their phone or desktop sees the exact calculated bill instantly — zero database, zero server tracking, zero login required.

---

### 6. 📋 Smart Receipt Text Parser
- Paste raw bill text from SMS messages, Swiggy, Zomato, Uber Eats, or paper check transcriptions.
- Automatically extracts dish names, quantities (e.g. `2x IPA Beer`), and prices directly into the itemized split.

---

## 📁 Repository Structure

```
Quicksplit/
├── index.html                  # Root HTML entry point (Space Grotesk, Manrope, Space Mono)
├── package.json                # Dependencies, test runners & benchmark scripts
├── vite.config.js              # Vite and Tailwind CSS v4 configuration
├── assets/                     # Vector brand marks, icons, manifest, and dining presets
│   ├── favicon.svg             # Terracotta division badge
│   ├── icon-192.svg            # 192px PWA maskable icon
│   ├── icon-512.svg            # 512px PWA maskable icon
│   ├── site.webmanifest        # Progressive Web App manifest
│   └── sample-receipts.json    # 5 rich dining & travel presets (Pizza, Sushi, Brunch, Roadtrip, Coffee)
├── css/                        # Standalone CSS stylesheet
│   └── styles.css              # Custom styling, print styles, and modal components
├── js/                         # Standalone modular JavaScript library
│   ├── app.js                  # Standalone application conductor
│   ├── calculator.js           # Pure math engine, debt minimizer & parser
│   └── storage.js              # LocalStorage persistence layer
├── scripts/                    # Automated testing and benchmark scripts
│   ├── verify-math.js          # 29-assertion mathematical verification suite
│   └── benchmark.js            # High-throughput performance benchmark (>50,000 ops/sec)
├── src/                        # Modern React 19 Application
│   ├── components/             # Modular UI components
│   │   ├── Navbar.jsx              # Industrial masthead with segmented dock and status indicators
│   │   ├── SessionHeader.jsx       # Event title editor, category dropdown & live audit chips
│   │   ├── EqualSplitForm.jsx      # Numeric terminal display & mechanical quick-add chips
│   │   ├── ItemizedSplitForm.jsx   # Dishes/drinks order entry & per-item friend tags
│   │   ├── TaxAndDiscount.jsx      # Discounts, vouchers and Sales Tax / GST selector
│   │   ├── TipSelector.jsx         # Stepped gratuity gauge & custom tip input
│   │   ├── GroupManager.jsx        # Member stepper, inline rename, paid stamps & round-up switch
│   │   ├── ReceiptCard.jsx         # Thermal paper ticket with jagged tear edge, barcode & action deck
│   │   ├── SettlementLedgerView.jsx# "Who Owes Whom" balance matrix & debt minimizer
│   │   ├── AnalyticsView.jsx       # Financial audit analytics, segmented bar & audit spreadsheet
│   │   ├── HistoryView.jsx         # Local archives ledger with search & 1-click restore
│   │   ├── SettlementModal.jsx     # Quick settlement dialog
│   │   ├── SmartPasteModal.jsx     # Smart receipt bill text parser modal
│   │   ├── SampleReceiptsModal.jsx # Preset dining scenarios loader modal
│   │   ├── HelpModal.jsx           # Keyboard shortcuts, math rules & documentation modal
│   │   ├── UpiModal.jsx            # 100% offline QR generator with UPI deep links
│   │   ├── Footer.jsx              # Shortcuts pill & offline privacy notice
│   │   └── BackToTop.jsx           # Floating scroll-to-top button
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAudioHaptics.js      # Musical synthesizer chimes & click haptics
│   │   └── useTheme.js             # High-contrast dark/light synchronization
│   ├── utils/                  # Mathematical engines & utilities
│   │   ├── currency.js             # Intl.NumberFormat currency & tip percentage formatters
│   │   ├── math.js                 # Equal and itemized mathematical split engine
│   │   ├── settlement.js           # Multi-payer debt minimization algorithm
│   │   ├── parser.js               # Smart receipt bill text parser
│   │   ├── receipt.js              # Monospace ASCII receipt summary builder
│   │   ├── csv.js                  # Spreadsheet exporter
│   │   └── shareLink.js            # URL hash session encoder/decoder
│   ├── constants/              # Application constants, currencies & presets
│   │   └── index.js                # Currencies, presets, and Craft Studio color palette
│   ├── index.css               # Tailwind CSS v4, hard shadows & thermal tear clip-path
│   ├── main.jsx                # React DOM root mounting
│   └── App.jsx                 # Master application conductor & 3-zone workspace
```

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|:---:|:---|
| `1` | Switch to **Calculator** view |
| `2` | Switch to **Settlements** view |
| `3` | Switch to **Analytics** view |
| `4` | Switch to **Saved Bills** view |
| `M` | Toggle split mode (`Equal` ⇄ `Itemized`) |
| `T` | Toggle Dark / Light theme |
| `C` | Instant Copy formatted receipt summary (with confetti) |
| `S` | Save current calculation to local archive |
| `R` | Reset / zero current bill |
| `?` | Open Help & Keyboard Shortcuts guide |

---

## 🧪 Mathematical Verification & Benchmarks

Run the automated test suite and high-throughput benchmark:

```bash
# Run mathematical verification suite (29 tests)
npm test

# Run sub-millisecond calculation benchmark
npm run benchmark

# Build production bundle
npm run build
```

---

## 🔒 Privacy & Offline Guarantee

QuickSplit Pro executes **100% on your device**. All math computations, receipt image exports, QR codes, and session deep-links are processed entirely in client-side memory. Zero bill amounts, names, or payment details ever leave your browser.
