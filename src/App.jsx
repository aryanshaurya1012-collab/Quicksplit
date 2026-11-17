import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import confetti from "canvas-confetti";
import { Sparkles, Users, Receipt } from "lucide-react";

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
  buildReceiptSummary
} from "./utils";

// Custom Hooks
import { useTheme } from "./hooks/useTheme";
import { useAudioHaptics } from "./hooks/useAudioHaptics";

// Modular Components
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import HowItWorks from "./components/HowItWorks";
import EqualSplitForm from "./components/EqualSplitForm";
import ItemizedSplitForm from "./components/ItemizedSplitForm";
import TipSelector from "./components/TipSelector";
import GroupManager from "./components/GroupManager";
import ReceiptCard from "./components/ReceiptCard";
import RecentSplits from "./components/RecentSplits";
import FaqSection from "./components/FaqSection";
import AboutSection from "./components/AboutSection";
import UpiModal from "./components/UpiModal";
import Footer from "./components/Footer";
import BackToTop from "./components/BackToTop";

export default function App() {
  // Theme & Sound Custom Hooks
  const { theme, toggleTheme } = useTheme();
  const {
    soundEnabled,
    toggleSound,
    playTipChime,
    playSuccessChime,
    playTick,
    playBlipDown
  } = useAudioHaptics();

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
  const [history, setHistory] = useState(() => {
    try {
      const raw = localStorage.getItem("quicksplit-history");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const billInputRef = useRef(null);

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

  // Toast feedback helper
  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage("");
    }, 2800);
  }, []);

  // Smooth scroll handler
  const scrollToSection = useCallback((id) => {
    playTick();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [playTick]);

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

  // Mathematical Split Calculations
  const equalSplit = useMemo(() => {
    return calculateSplit(numericBill, activeTipRate, friends.length, roundUp);
  }, [numericBill, activeTipRate, friends.length, roundUp]);

  const itemizedSplit = useMemo(() => {
    return calculateItemizedSplit(items, activeTipRate, friends, roundUp);
  }, [items, activeTipRate, friends, roundUp]);

  // Unified active split depending on active mode
  const activeSplit = useMemo(() => {
    if (splitMode === "itemized") {
      return {
        bill: itemizedSplit.subtotal,
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

  // Save calculation to local history
  const handleSaveHistory = useCallback((silent = false) => {
    if (activeSplit.bill <= 0) {
      if (!silent) showToast("Enter a bill amount before saving");
      return;
    }

    const entry = {
      id: String(Date.now()),
      mode: splitMode,
      bill: activeSplit.bill,
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
      ...prev.filter((i) => i.bill !== entry.bill || i.total !== entry.total || i.mode !== entry.mode)
    ].slice(0, 10));

    if (!silent) {
      playSuccessChime();
      showToast("Split saved to Recent Splits! 💾");
    }
  }, [activeSplit, splitMode, friends, currency, items, showToast, playSuccessChime]);

  // Copy receipt summary to clipboard
  const handleCopySummary = useCallback(async () => {
    if (activeSplit.bill <= 0) {
      showToast("Please enter a bill amount first");
      return;
    }

    const isItemized = splitMode === "itemized";
    const friendData = isItemized ? itemizedSplit.breakdown : friends;
    const text = buildReceiptSummary(activeSplit, currency, friendData, items, isItemized);

    try {
      await navigator.clipboard.writeText(text);
      handleSaveHistory(true);
      playSuccessChime();
      confetti({
        particleCount: 85,
        spread: 60,
        origin: { y: 0.65 }
      });
      showToast("Receipt copied! Ready to paste in WhatsApp/chat ✨");
    } catch {
      showToast("Could not access clipboard");
    }
  }, [activeSplit, splitMode, itemizedSplit, friends, currency, items, handleSaveHistory, playSuccessChime, showToast]);

  // Share summary via Web Share API
  const handleShare = useCallback(async () => {
    if (activeSplit.bill <= 0) {
      showToast("Please enter a bill amount first");
      return;
    }

    const isItemized = splitMode === "itemized";
    const friendData = isItemized ? itemizedSplit.breakdown : friends;
    const text = buildReceiptSummary(activeSplit, currency, friendData, items, isItemized);

    if (navigator.share) {
      try {
        await navigator.share({
          title: "QuickSplit — Bill Summary",
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
  }, [activeSplit, splitMode, itemizedSplit, friends, currency, items, handleSaveHistory, handleCopySummary, showToast]);

  // Print formatted receipt
  const handlePrint = useCallback(() => {
    playTick();
    handleSaveHistory(true);
    window.print();
  }, [playTick, handleSaveHistory]);

  // Reset form
  const handleReset = useCallback(() => {
    playBlipDown();
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
    setCurrency(item.currency || DEFAULT_CURRENCY);
    setSplitMode(item.mode || "equal");

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

    showToast(`Restored split of ${formatCurrency(item.bill, item.currency)}`);
    const calcElement = document.getElementById("calculator");
    if (calcElement) calcElement.scrollIntoView({ behavior: "smooth" });
  }, [playTick, showToast]);

  // Delete history split
  const handleDeleteHistory = useCallback((id, e) => {
    e.stopPropagation();
    playBlipDown();
    setHistory((prev) => prev.filter((item) => item.id !== id));
    showToast("Split removed from history");
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

  // Keyboard Shortcuts (C, S, T, M, R)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger shortcuts if user is typing in an input or textarea
      if (["INPUT", "TEXTAREA", "SELECT"].includes(e.target.tagName)) {
        return;
      }

      const key = e.key.toLowerCase();
      if (key === "c") {
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
    <div className={`min-h-screen ${theme === "dark" ? "dark bg-[#0b0914] text-slate-100" : "bg-slate-50 text-slate-900"} font-sans transition-colors duration-200 selection:bg-indigo-500 selection:text-white`}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-2.5 rounded-full shadow-2xl bg-slate-900/95 text-white dark:bg-white dark:text-slate-900 text-xs sm:text-sm font-semibold backdrop-blur-md transition-all animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modern Sticky Navbar */}
      <Navbar
        theme={theme}
        toggleTheme={toggleTheme}
        soundEnabled={soundEnabled}
        toggleSound={toggleSound}
        currency={currency}
        setCurrency={setCurrency}
        splitMode={splitMode}
        setSplitMode={setSplitMode}
        onNavigate={scrollToSection}
        playTick={playTick}
      />

      {/* Main Content Sections */}
      <main id="top" className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Hero Section */}
        <Hero
          currency={currency}
          onStartSplitting={() => scrollToSection("calculator")}
          onSeeHowItWorks={() => scrollToSection("how-it-works")}
          playTipChime={playTipChime}
          playTick={playTick}
        />

        {/* How It Works Section */}
        <HowItWorks />

        {/* Live Interactive Calculator Section */}
        <section id="calculator" className="py-12 border-t border-slate-200/80 dark:border-white/5 scroll-mt-20">
          
          {/* Section Header with Mode Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 block mb-1">
                Live Calculator
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {splitMode === "equal" ? "Equal Bill Split" : "Itemized Order Split"}
              </h2>
            </div>

            {/* Mode Switcher Buttons */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 self-start sm:self-auto shadow-inner">
              <button
                onClick={() => {
                  playTick();
                  setSplitMode("equal");
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  splitMode === "equal"
                    ? "bg-white dark:bg-[#181428] text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                ⚡ Equal Split
              </button>
              <button
                onClick={() => {
                  playTick();
                  setSplitMode("itemized");
                }}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  splitMode === "itemized"
                    ? "bg-white dark:bg-[#181428] text-teal-600 dark:text-teal-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                🧾 Itemized Split
              </button>
            </div>
          </div>

          {/* 12-Column Responsive Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            
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
                />
              )}

              {/* Tip Rate Selector */}
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

              {/* Group & Friends Management */}
              <GroupManager
                friends={friends}
                setFriends={setFriends}
                setItems={setItems}
                roundUp={roundUp}
                setRoundUp={setRoundUp}
                showToast={showToast}
                playTick={playTick}
                playBlipDown={playBlipDown}
              />
            </div>

            {/* Right Sticky Receipt Card (5 cols) */}
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
              />
            </div>

          </div>
        </section>

        {/* Recent Splits Section */}
        <RecentSplits
          history={history}
          onRestore={handleRestoreHistory}
          onDelete={handleDeleteHistory}
          onClearAll={handleClearAllHistory}
        />

        {/* FAQ Accordion Section */}
        <FaqSection />

        {/* About QuickSplit Section */}
        <AboutSection />

      </main>

      {/* 100% Offline UPI QR Modal */}
      <UpiModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        amount={splitMode === "itemized" && friends.length > 0 ? (activeSplit.total / friends.length) : activeSplit.perPerson}
        showToast={showToast}
        playTick={playTick}
      />

      {/* Floating Back to Top Button */}
      <BackToTop playTick={playTick} />

      {/* Site Footer */}
      <Footer onNavigate={scrollToSection} />
    </div>
  );
}
