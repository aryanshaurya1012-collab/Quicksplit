import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import confetti from "canvas-confetti";
import { Sparkles, Users, Receipt, Share2 } from "lucide-react";

// Constants & Utilities
import {
  CURRENCIES,
  DEFAULT_CURRENCY,
  TIP_PRESETS,
  DEFAULT_FRIENDS
} from "./constants";
import {
  formatCurrency,
  calculateSplit,
  calculateItemizedSplit,
  buildReceiptSummary,
  calculateSettlements,
  exportToCSV,
  getShareableUrl,
  decodeSessionState
} from "./utils";

// Custom Hooks
import { useTheme } from "./hooks/useTheme";
import { useAudioHaptics } from "./hooks/useAudioHaptics";

// Modular Components
import Navbar from "./components/Navbar";
import SessionHeader from "./components/SessionHeader";
import EqualSplitForm from "./components/EqualSplitForm";
import ItemizedSplitForm from "./components/ItemizedSplitForm";
import TaxAndDiscount from "./components/TaxAndDiscount";
import TipSelector from "./components/TipSelector";
import GroupManager from "./components/GroupManager";
import ReceiptCard from "./components/ReceiptCard";
import SettlementLedgerView from "./components/SettlementLedgerView";
import AnalyticsView from "./components/AnalyticsView";
import HistoryView from "./components/HistoryView";
import Footer from "./components/Footer";
import BackToTop from "./components/BackToTop";

// Modals
import UpiModal from "./components/UpiModal";
import SettlementModal from "./components/SettlementModal";
import SmartPasteModal from "./components/SmartPasteModal";
import SampleReceiptsModal from "./components/SampleReceiptsModal";
import HelpModal from "./components/HelpModal";

export default function App() {
  // Theme & Audio Custom Hooks
  const { theme, toggleTheme } = useTheme();
  const {
    soundEnabled,
    toggleSound,
    playTipChime,
    playSuccessChime,
    playTick,
    playBlipDown
  } = useAudioHaptics();

  // Active View Tab: "calc" | "settle" | "analytics" | "history"
  const [currentTab, setCurrentTab] = useState("calc");

  // Session Meta
  const [sessionTitle, setSessionTitle] = useState("Friday Dinner");
  const [sessionCategory, setSessionCategory] = useState("Dining");

  // App Core State
  const [splitMode, setSplitMode] = useState("equal");
  const [currency, setCurrency] = useState(() => {
    try {
      const stored = localStorage.getItem("quicksplit-currency");
      return CURRENCIES[stored] ? stored : DEFAULT_CURRENCY;
    } catch {
      return DEFAULT_CURRENCY;
    }
  });

  // Equal Mode State
  const [billInput, setBillInput] = useState("2400");
  const [tipPercent, setTipPercent] = useState(15);
  const [isCustomTip, setIsCustomTip] = useState(false);
  const [customTipInput, setCustomTipInput] = useState("");
  const [roundUp, setRoundUp] = useState(false);

  // Discounts & Taxes State
  const [discountVal, setDiscountVal] = useState(0);
  const [discountType, setDiscountType] = useState("percent"); // "percent" or "flat"
  const [taxPercent, setTaxPercent] = useState(0);

  // Group State
  const [friends, setFriends] = useState(DEFAULT_FRIENDS);

  // Itemized Mode State
  const [items, setItems] = useState([
    { id: "item_1", name: "Starters & Appetizers", price: "600", sharedBy: ["p1", "p2", "p3", "p4"] },
    { id: "item_2", name: "Main Course Platters", price: "1200", sharedBy: ["p1", "p2", "p3", "p4"] },
    { id: "item_3", name: "Cocktails & Drinks", price: "600", sharedBy: ["p1", "p2"] }
  ]);

  // Modal, Toast & History State
  const [toastMessage, setToastMessage] = useState("");
  const [showQRModal, setShowQRModal] = useState(false);
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [showSmartPasteModal, setShowSmartPasteModal] = useState(false);
  const [showSampleModal, setShowSampleModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const [history, setHistory] = useState(() => {
    try {
      const raw = localStorage.getItem("quicksplit-history");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const billInputRef = useRef(null);

  // Toast feedback helper
  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 2800);
  }, []);

  // Deep-Link Synchronization on Initial Mount
  useEffect(() => {
    try {
      let code = "";
      if (window.location.hash.startsWith("#share=")) {
        code = window.location.hash.replace("#share=", "");
      } else {
        const params = new URLSearchParams(window.location.search);
        code = params.get("share") || "";
      }

      if (code) {
        const restored = decodeSessionState(code);
        if (restored) {
          if (restored.title) setSessionTitle(restored.title);
          if (restored.category) setSessionCategory(restored.category);
          if (restored.currency) setCurrency(restored.currency);
          if (restored.splitMode) setSplitMode(restored.splitMode);
          if (restored.billInput !== undefined) setBillInput(restored.billInput);
          if (restored.tipPercent !== undefined) {
            setTipPercent(restored.tipPercent);
            setIsCustomTip(!TIP_PRESETS.includes(restored.tipPercent));
          }
          if (restored.roundUp !== undefined) setRoundUp(restored.roundUp);
          if (restored.discountVal !== undefined) setDiscountVal(restored.discountVal);
          if (restored.discountType !== undefined) setDiscountType(restored.discountType);
          if (restored.taxPercent !== undefined) setTaxPercent(restored.taxPercent);
          if (Array.isArray(restored.friends) && restored.friends.length > 0) setFriends(restored.friends);
          if (Array.isArray(restored.items) && restored.items.length > 0) setItems(restored.items);

          showToast(`Loaded shared check: "${restored.title}" ✨`);
        }
      }
    } catch (e) {
      console.warn("Could not parse deep link", e);
    }
  }, [showToast]);

  // Persist currency
  useEffect(() => {
    try {
      localStorage.setItem("quicksplit-currency", currency);
    } catch {}
  }, [currency]);

  // Persist history
  useEffect(() => {
    try {
      localStorage.setItem("quicksplit-history", JSON.stringify(history));
    } catch {}
  }, [history]);

  // Numerical bill parse
  const numericBill = useMemo(() => {
    const parsed = parseFloat(billInput);
    return isNaN(parsed) || parsed < 0 ? 0 : parsed;
  }, [billInput]);

  // Active tip rate
  const activeTipRate = useMemo(() => {
    if (isCustomTip) {
      const parsed = parseFloat(customTipInput);
      return isNaN(parsed) || parsed < 0 ? 0 : parsed;
    }
    return tipPercent;
  }, [isCustomTip, customTipInput, tipPercent]);

  // Mathematical Split Calculations with Discounts & Taxes
  const equalSplit = useMemo(() => {
    return calculateSplit(
      numericBill,
      activeTipRate,
      friends.length,
      roundUp,
      taxPercent,
      discountVal,
      discountType
    );
  }, [numericBill, activeTipRate, friends.length, roundUp, taxPercent, discountVal, discountType]);

  const itemizedSplit = useMemo(() => {
    return calculateItemizedSplit(
      items,
      activeTipRate,
      friends,
      roundUp,
      taxPercent,
      discountVal,
      discountType
    );
  }, [items, activeTipRate, friends, roundUp, taxPercent, discountVal, discountType]);

  // Unified active split depending on active mode
  const activeSplit = useMemo(() => {
    if (splitMode === "itemized") {
      return {
        bill: itemizedSplit.subtotal,
        discountVal: itemizedSplit.discountVal,
        discountType: itemizedSplit.discountType,
        discountAmount: itemizedSplit.discountAmount,
        discountedSubtotal: itemizedSplit.discountedSubtotal,
        taxPercent: itemizedSplit.taxPercent,
        taxAmount: itemizedSplit.taxAmount,
        tipPercent: itemizedSplit.tipPercent,
        tipAmount: itemizedSplit.tipAmount,
        total: itemizedSplit.total,
        people: friends.length,
        perPerson: friends.length > 0 ? itemizedSplit.total / friends.length : 0,
        isRounded: itemizedSplit.isRounded,
        roundingDifference: itemizedSplit.roundingDifference
      };
    }
    return equalSplit;
  }, [splitMode, equalSplit, itemizedSplit, friends.length]);

  // Compute who owes whom debt transfers
  const settlements = useMemo(() => {
    const friendShares = splitMode === "itemized"
      ? itemizedSplit.breakdown
      : friends.map((f) => ({ ...f, totalShare: activeSplit.perPerson }));

    const party = friendShares.map((f, idx) => ({
      ...f,
      paidAmount: idx === 0 ? activeSplit.total : 0
    }));

    return calculateSettlements(party, currency);
  }, [splitMode, itemizedSplit, friends, activeSplit, currency]);

  // Deep-Link Share URL Handler
  const handleShareLink = useCallback(() => {
    playTick();
    const currentState = {
      title: sessionTitle,
      category: sessionCategory,
      currency,
      splitMode,
      billInput,
      tipPercent: activeTipRate,
      roundUp,
      discountVal,
      discountType,
      taxPercent,
      friends,
      items
    };

    const url = getShareableUrl(currentState);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        showToast("Shareable link copied! Send to your friends ✨");
      });
    } else {
      showToast("Link: " + url);
    }
  }, [sessionTitle, sessionCategory, currency, splitMode, billInput, activeTipRate, roundUp, discountVal, discountType, taxPercent, friends, items, playTick, showToast]);

  // Save calculation to local history
  const handleSaveHistory = useCallback((silent = false) => {
    if (activeSplit.bill <= 0) {
      if (!silent) showToast("Enter a bill amount before saving");
      return;
    }

    const entry = {
      id: String(Date.now()),
      title: sessionTitle,
      category: sessionCategory,
      mode: splitMode,
      bill: activeSplit.bill,
      discountVal,
      discountType,
      discountAmount: activeSplit.discountAmount,
      taxPercent,
      taxAmount: activeSplit.taxAmount,
      tipPercent: activeSplit.tipPercent,
      tipAmount: activeSplit.tipAmount,
      total: activeSplit.total,
      people: friends.length,
      perPerson: activeSplit.perPerson,
      isRounded: activeSplit.isRounded,
      currency,
      items: splitMode === "itemized" ? items : undefined,
      friends: friends.map((f) => ({ id: f.id, name: f.name, color: f.color })),
      timestamp: new Date().toISOString()
    };

    setHistory((prev) => [
      entry,
      ...prev.filter((i) => i.id !== entry.id)
    ].slice(0, 20));

    if (!silent) {
      playSuccessChime();
      showToast("Check saved to local history! 💾");
    }
  }, [activeSplit, sessionTitle, sessionCategory, splitMode, friends, currency, items, discountVal, discountType, taxPercent, showToast, playSuccessChime]);

  // Copy receipt summary to clipboard
  const handleCopySummary = useCallback(async () => {
    if (activeSplit.bill <= 0) {
      showToast("Please enter a bill amount first");
      return;
    }

    const isItemized = splitMode === "itemized";
    const friendData = isItemized ? itemizedSplit.breakdown : friends;
    const text = buildReceiptSummary(activeSplit, currency, friendData, items, isItemized, settlements);

    try {
      await navigator.clipboard.writeText(text);
      handleSaveHistory(true);
      playSuccessChime();
      confetti({
        particleCount: 85,
        spread: 60,
        origin: { y: 0.65 }
      });
      showToast("Receipt copied! Ready to paste in WhatsApp/Slack ✨");
    } catch {
      showToast("Could not access clipboard");
    }
  }, [activeSplit, splitMode, itemizedSplit, friends, currency, items, settlements, handleSaveHistory, playSuccessChime, showToast]);

  // Share summary via Web Share API
  const handleShare = useCallback(async () => {
    if (activeSplit.bill <= 0) {
      showToast("Please enter a bill amount first");
      return;
    }

    const isItemized = splitMode === "itemized";
    const friendData = isItemized ? itemizedSplit.breakdown : friends;
    const text = buildReceiptSummary(activeSplit, currency, friendData, items, isItemized, settlements);

    if (navigator.share) {
      try {
        await navigator.share({
          title: `QuickSplit — ${sessionTitle}`,
          text
        });
        handleSaveHistory(true);
        showToast("Shared successfully!");
      } catch (e) {
        if (e.name !== "AbortError") {
          handleCopySummary();
        }
      }
    } else {
      handleCopySummary();
    }
  }, [activeSplit, sessionTitle, splitMode, itemizedSplit, friends, currency, items, settlements, handleSaveHistory, handleCopySummary, showToast]);

  // Print formatted receipt
  const handlePrint = useCallback(() => {
    playTick();
    handleSaveHistory(true);
    window.print();
  }, [playTick, handleSaveHistory]);

  // Export to CSV spreadsheet
  const handleExportCSV = useCallback(() => {
    playTick();
    const friendData = splitMode === "itemized" ? itemizedSplit.breakdown : friends;
    exportToCSV(activeSplit, currency, friendData, splitMode === "itemized" ? items : []);
    showToast("CSV summary spreadsheet exported! 📊");
  }, [splitMode, activeSplit, currency, itemizedSplit, friends, items, playTick, showToast]);

  // Reset form
  const handleReset = useCallback(() => {
    playBlipDown();
    setDiscountVal(0);
    setTaxPercent(0);
    if (splitMode === "equal") {
      setBillInput("");
      setTipPercent(15);
      setIsCustomTip(false);
      setCustomTipInput("");
      setRoundUp(false);
      setFriends(DEFAULT_FRIENDS);
      showToast("Equal split reset to defaults");
      if (billInputRef.current) billInputRef.current.focus();
    } else {
      setItems([]);
      setTipPercent(15);
      setIsCustomTip(false);
      setCustomTipInput("");
      setRoundUp(false);
      showToast("Itemized order list cleared");
    }
  }, [splitMode, playBlipDown, showToast]);

  // Restore history split
  const handleRestoreHistory = useCallback((item) => {
    playTick();
    if (item.title) setSessionTitle(item.title);
    if (item.category) setSessionCategory(item.category);
    setCurrency(item.currency || DEFAULT_CURRENCY);
    setSplitMode(item.mode || "equal");

    if (item.discountVal !== undefined) setDiscountVal(item.discountVal);
    if (item.discountType !== undefined) setDiscountType(item.discountType);
    if (item.taxPercent !== undefined) setTaxPercent(item.taxPercent);

    if (item.mode === "itemized" && Array.isArray(item.items) && item.items.length > 0) {
      setItems(item.items);
    } else {
      setBillInput(String(item.bill));
    }

    setTipPercent(item.tipPercent);
    setIsCustomTip(!TIP_PRESETS.includes(item.tipPercent));
    if (!TIP_PRESETS.includes(item.tipPercent)) {
      setCustomTipInput(String(item.tipPercent));
    }
    setRoundUp(Boolean(item.isRounded));

    if (Array.isArray(item.friends) && item.friends.length > 0) {
      setFriends(item.friends.map((f) => ({ ...f, paid: false })));
    }

    setCurrentTab("calc");
    showToast(`Restored: ${item.title || "Bill Split"}! ✨`);
  }, [playTick, showToast]);

  // Load a preset sample receipt
  const handleLoadSample = useCallback((sample) => {
    playSuccessChime();
    setSessionTitle(sample.title.replace(/^[^a-zA-Z0-9]+/, "").trim());
    setCurrency(sample.currency);
    setSplitMode("itemized");
    setItems(sample.items);
    setDiscountVal(sample.discount || 0);
    setDiscountType(sample.discountType || "percent");
    setTaxPercent(sample.taxPercent || 0);
    setTipPercent(sample.tipPercent || 15);
    setIsCustomTip(false);
    showToast(`Loaded ${sample.title}! ✨`);
  }, [playSuccessChime, showToast]);

  // Import parsed items from Smart Paste
  const handleImportParsedItems = useCallback((newParsedItems) => {
    setSplitMode("itemized");
    setItems((prev) => [...prev, ...newParsedItems]);
    showToast(`Imported ${newParsedItems.length} items from receipt text! 📋`);
  }, [showToast]);

  // Delete history split
  const handleDeleteHistory = useCallback((id) => {
    playBlipDown();
    setHistory((prev) => prev.filter((item) => item.id !== id));
    showToast("Bill removed from history");
  }, [playBlipDown, showToast]);

  // Clear all history
  const handleClearAllHistory = useCallback(() => {
    playBlipDown();
    setHistory([]);
    showToast("History cleared");
  }, [playBlipDown, showToast]);

  // Friend paid status toggle
  const toggleFriendPaid = useCallback((id) => {
    playTick();
    setFriends((prev) =>
      prev.map((f) => (f.id === id ? { ...f, paid: !f.paid } : f))
    );
  }, [playTick]);

  // Keyboard Shortcuts (1-4, C, S, T, M, R)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) {
        return;
      }

      const key = e.key.toLowerCase();
      if (key === "1") {
        setCurrentTab("calc");
      } else if (key === "2") {
        setCurrentTab("settle");
      } else if (key === "3") {
        setCurrentTab("analytics");
      } else if (key === "4") {
        setCurrentTab("history");
      } else if (key === "c") {
        e.preventDefault();
        handleCopySummary();
      } else if (key === "s") {
        e.preventDefault();
        handleSaveHistory(false);
      } else if (key === "t") {
        e.preventDefault();
        toggleTheme();
      } else if (key === "m") {
        e.preventDefault();
        playTick();
        setSplitMode((prev) => (prev === "equal" ? "itemized" : "equal"));
      } else if (key === "r") {
        e.preventDefault();
        handleReset();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleCopySummary, handleSaveHistory, toggleTheme, handleReset, playTick]);

  return (
    <div className={`min-h-screen ${theme === "dark" ? "dark bg-[#0c0d12] text-slate-100" : "bg-[#f8fafc] text-slate-900"} font-sans transition-colors duration-200 selection:bg-indigo-500 selection:text-white flex flex-col justify-between`}>
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-2.5 rounded-full shadow-2xl bg-slate-900/95 text-white dark:bg-white dark:text-slate-900 text-xs sm:text-sm font-semibold backdrop-blur-md transition-all animate-bounce no-print">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div>
        {/* Modern Fintech Sticky Navbar */}
        <Navbar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          currency={currency}
          setCurrency={setCurrency}
          theme={theme}
          toggleTheme={toggleTheme}
          soundEnabled={soundEnabled}
          toggleSound={toggleSound}
          onShareLink={handleShareLink}
          onOpenHelp={() => setShowHelpModal(true)}
          playTick={playTick}
        />

        {/* Main Application Container */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-12 w-full">
          
          {/* Top Session Context Header */}
          <SessionHeader
            sessionTitle={sessionTitle}
            setSessionTitle={setSessionTitle}
            sessionCategory={sessionCategory}
            setSessionCategory={setSessionCategory}
            currency={currency}
            totalCheck={activeSplit.total}
            peopleCount={friends.length}
            onOpenSmartPaste={() => setShowSmartPasteModal(true)}
            onOpenSampleReceipts={() => setShowSampleModal(true)}
            onShareLink={handleShareLink}
            onReset={handleReset}
            playTick={playTick}
          />

          {/* VIEW TAB 1: SPLIT CALCULATOR */}
          {currentTab === "calc" && (
            <div>
              {/* Split Mode Switcher Banner */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 block mb-0.5">
                    Mode
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                    {splitMode === "equal" ? "Equal Division" : "Itemized Order Check"}
                  </h2>
                </div>

                <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 shadow-inner">
                  <button
                    onClick={() => {
                      playTick();
                      setSplitMode("equal");
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      splitMode === "equal"
                        ? "bg-white dark:bg-[#181a24] text-indigo-600 dark:text-indigo-400 shadow-sm"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    Equal Split
                  </button>
                  <button
                    onClick={() => {
                      playTick();
                      setSplitMode("itemized");
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      splitMode === "itemized"
                        ? "bg-white dark:bg-[#181a24] text-teal-600 dark:text-teal-400 shadow-sm"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                    }`}
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    Itemized Order
                  </button>
                </div>
              </div>

              {/* 12-Column Responsive Workspace */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left Inputs (7 cols) */}
                <div className="lg:col-span-7 space-y-6">
                  {splitMode === "equal" ? (
                    <EqualSplitForm
                      billInput={billInput}
                      setBillInput={setBillInput}
                      currency={currency}
                      billInputRef={billInputRef}
                      playTick={playTick}
                      playBlipDown={playBlipDown}
                    />
                  ) : (
                    <ItemizedSplitForm
                      items={items}
                      setItems={setItems}
                      friends={friends}
                      currency={currency}
                      subtotal={itemizedSplit.subtotal}
                      showToast={showToast}
                      playTick={playTick}
                      playBlipDown={playBlipDown}
                      onOpenSmartPaste={() => setShowSmartPasteModal(true)}
                      onOpenSampleReceipts={() => setShowSampleModal(true)}
                    />
                  )}

                  {/* Adjustments: Discounts & Tax/GST */}
                  <TaxAndDiscount
                    discountVal={discountVal}
                    setDiscountVal={setDiscountVal}
                    discountType={discountType}
                    setDiscountType={setDiscountType}
                    taxPercent={taxPercent}
                    setTaxPercent={setTaxPercent}
                    currency={currency}
                    discountAmount={activeSplit.discountAmount}
                    taxAmount={activeSplit.taxAmount}
                    playTick={playTick}
                  />

                  {/* Tip Gratuity Selector */}
                  <TipSelector
                    tipPercent={tipPercent}
                    setTipPercent={setTipPercent}
                    isCustomTip={isCustomTip}
                    setIsCustomTip={setIsCustomTip}
                    customTipInput={customTipInput}
                    setCustomTipInput={setCustomTipInput}
                    activeTipRate={activeTipRate}
                    tipAmount={activeSplit.tipAmount}
                    currency={currency}
                    playTipChime={playTipChime}
                  />

                  {/* Group Management & Round-Up */}
                  <GroupManager
                    friends={friends}
                    setFriends={setFriends}
                    setItems={setItems}
                    roundUp={roundUp}
                    setRoundUp={setRoundUp}
                    showToast={showToast}
                    playTick={playTick}
                  />
                </div>

                {/* Right Digital Receipt Card (5 cols) */}
                <div className="lg:col-span-5">
                  <ReceiptCard
                    splitMode={splitMode}
                    activeSplit={activeSplit}
                    itemizedSplit={itemizedSplit}
                    currency={currency}
                    friends={friends}
                    items={items}
                    toggleFriendPaid={toggleFriendPaid}
                    onCopy={handleCopySummary}
                    onShare={handleShare}
                    onSave={() => handleSaveHistory(false)}
                    onPrint={handlePrint}
                    onReset={handleReset}
                    onOpenQR={() => setShowQRModal(true)}
                    onOpenSettlement={() => setCurrentTab("settle")}
                    onExportCSV={handleExportCSV}
                    onCopyShareableLink={handleShareLink}
                    showToast={showToast}
                    playTick={playTick}
                  />
                </div>
              </div>
            </div>
          )}

          {/* VIEW TAB 2: SETTLEMENT LEDGER */}
          {currentTab === "settle" && (
            <SettlementLedgerView
              friends={friends}
              setFriends={setFriends}
              itemizedSplit={itemizedSplit}
              activeSplit={activeSplit}
              splitMode={splitMode}
              currency={currency}
              onOpenQR={() => setShowQRModal(true)}
              showToast={showToast}
              playTick={playTick}
            />
          )}

          {/* VIEW TAB 3: ANALYTICS & AUDIT */}
          {currentTab === "analytics" && (
            <AnalyticsView
              friends={friends}
              items={items}
              itemizedSplit={itemizedSplit}
              activeSplit={activeSplit}
              splitMode={splitMode}
              currency={currency}
              onExportCSV={handleExportCSV}
              onPrint={handlePrint}
              playTick={playTick}
            />
          )}

          {/* VIEW TAB 4: HISTORY ARCHIVES */}
          {currentTab === "history" && (
            <HistoryView
              history={history}
              onRestoreSplit={handleRestoreHistory}
              onDeleteSplit={handleDeleteHistory}
              onClearHistory={handleClearAllHistory}
              currency={currency}
              showToast={showToast}
              playTick={playTick}
            />
          )}

        </main>
      </div>

      {/* Modern Clean Footer */}
      <Footer
        onSelectTab={(tabId) => setCurrentTab(tabId)}
        onOpenHelp={() => setShowHelpModal(true)}
        playTick={playTick}
      />

      {/* Floating Back to Top Button */}
      <BackToTop playTick={playTick} />

      {/* Modals & Dialogs */}
      <UpiModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        amount={splitMode === "itemized" ? itemizedSplit.total : activeSplit.total}
        currency={currency}
        showToast={showToast}
        playTick={playTick}
      />

      <SettlementModal
        isOpen={showSettlementModal}
        onClose={() => setShowSettlementModal(false)}
        friends={friends}
        setFriends={setFriends}
        totalCheck={splitMode === "itemized" ? itemizedSplit.total : activeSplit.total}
        currency={currency}
        showToast={showToast}
        playTick={playTick}
      />

      <SmartPasteModal
        isOpen={showSmartPasteModal}
        onClose={() => setShowSmartPasteModal(false)}
        onImportItems={handleImportParsedItems}
        defaultFriends={friends}
        currency={currency}
        showToast={showToast}
        playTick={playTick}
      />

      <SampleReceiptsModal
        isOpen={showSampleModal}
        onClose={() => setShowSampleModal(false)}
        onLoadSample={handleLoadSample}
        playTick={playTick}
      />

      <HelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />

    </div>
  );
}
