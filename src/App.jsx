import React, { useState, useEffect, useMemo, useRef } from "react";
import confetti from "canvas-confetti";
import {
  Calculator,
  Moon,
  Sun,
  Share2,
  Copy,
  RotateCcw,
  Sparkles,
  Users,
  Check,
  Trash2,
  ChevronDown,
  QrCode,
  ArrowRight,
  Plus,
  Minus,
  X,
  CreditCard,
  DollarSign,
  HeartHandshake,
  ShieldCheck,
  Zap,
  Info
} from "lucide-react";
import {
  CURRENCIES,
  DEFAULT_CURRENCY,
  TIP_PRESETS,
  QUICK_ADD_AMOUNTS,
  DEFAULT_FRIENDS,
  AVATAR_COLORS
} from "./constants";
import {
  formatCurrency,
  formatTip,
  calculateSplit,
  playSoftClick,
  buildReceiptSummary
} from "./utils";

export default function App() {
  // Theme state
  const [theme, setTheme] = useState(() => {
    try {
      const stored = localStorage.getItem("quicksplit-theme");
      if (stored === "dark" || stored === "light") return stored;
      return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    } catch (e) {
      return "light";
    }
  });

  // Currency state
  const [currency, setCurrency] = useState(() => {
    try {
      const stored = localStorage.getItem("quicksplit-currency");
      return CURRENCIES[stored] ? stored : DEFAULT_CURRENCY;
    } catch (e) {
      return DEFAULT_CURRENCY;
    }
  });

  // Bill & Tip state
  const [billInput, setBillInput] = useState("2400");
  const [tipPercent, setTipPercent] = useState(15);
  const [isCustomTip, setIsCustomTip] = useState(false);
  const [customTipInput, setCustomTipInput] = useState("");
  const [roundUp, setRoundUp] = useState(false);

  // Group / Friends state
  const [friends, setFriends] = useState(DEFAULT_FRIENDS);
  const [editingFriendId, setEditingFriendId] = useState(null);

  // Toast & Modal state
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [showQRModal, setShowQRModal] = useState(false);
  const [upiId, setUpiId] = useState("yourname@upi");

  // History state
  const [history, setHistory] = useState(() => {
    try {
      const raw = localStorage.getItem("quicksplit-history");
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });

  const billInputRef = useRef(null);

  // Apply theme class to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    try {
      localStorage.setItem("quicksplit-theme", theme);
    } catch (e) {}
  }, [theme]);

  // Persist currency
  useEffect(() => {
    try {
      localStorage.setItem("quicksplit-currency", currency);
    } catch (e) {}
  }, [currency]);

  // Persist history
  useEffect(() => {
    try {
      localStorage.setItem("quicksplit-history", JSON.stringify(history));
    } catch (e) {}
  }, [history]);

  // Parse numerical bill
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

  // Calculate split
  const split = useMemo(() => {
    return calculateSplit(numericBill, activeTipRate, friends.length, roundUp);
  }, [numericBill, activeTipRate, friends.length, roundUp]);

  // Toast feedback helper
  const showToast = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage("");
    }, 2800);
  };

  // Adjust friends count
  const handleSetPeopleCount = (count) => {
    playSoftClick(480);
    const target = Math.max(1, Math.min(20, count));
    if (target === friends.length) return;

    if (target > friends.length) {
      const newFriends = [...friends];
      for (let i = friends.length; i < target; i++) {
        const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
        newFriends.push({
          id: `p_${Date.now()}_${i}`,
          name: `Person ${i + 1}`,
          color,
          paid: false
        });
      }
      setFriends(newFriends);
    } else {
      setFriends(friends.slice(0, target));
    }
  };

  // Toggle friend paid status
  const toggleFriendPaid = (id) => {
    playSoftClick(720);
    setFriends((prev) =>
      prev.map((f) => (f.id === id ? { ...f, paid: !f.paid } : f))
    );
  };

  // Update friend name
  const handleUpdateFriendName = (id, newName) => {
    setFriends((prev) =>
      prev.map((f) => (f.id === id ? { ...f, name: newName.trim() || f.name } : f))
    );
    setEditingFriendId(null);
  };

  // Quick add bill amounts
  const handleQuickAdd = (amount) => {
    playSoftClick(650);
    const next = numericBill + amount;
    setBillInput(String(next));
  };

  // Reset form
  const handleReset = () => {
    playSoftClick(400);
    setBillInput("");
    setTipPercent(15);
    setIsCustomTip(false);
    setCustomTipInput("");
    setRoundUp(false);
    setFriends(DEFAULT_FRIENDS);
    showToast("Form reset to defaults", "info");
    if (billInputRef.current) billInputRef.current.focus();
  };

  // Save to History
  const saveToHistory = () => {
    if (split.bill <= 0) return;
    const entry = {
      id: String(Date.now()),
      bill: split.bill,
      tipPercent: split.tipPercent,
      tipAmount: split.tipAmount,
      total: split.total,
      people: split.people,
      perPerson: split.perPerson,
      isRounded: split.isRounded,
      currency,
      timestamp: new Date().toISOString()
    };
    setHistory((prev) => [entry, ...prev.filter((item) => item.bill !== entry.bill || item.people !== entry.people)].slice(0, 8));
  };

  // Copy summary
  const handleCopySummary = async () => {
    playSoftClick(880);
    if (split.bill <= 0) {
      showToast("Please enter a bill amount first", "error");
      return;
    }

    const text = buildReceiptSummary(split, currency, friends);
    try {
      await navigator.clipboard.writeText(text);
      saveToHistory();
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 }
      });
      showToast("Receipt copied! Ready to paste in chat ✨");
    } catch (e) {
      showToast("Could not access clipboard", "error");
    }
  };

  // Share summary
  const handleShare = async () => {
    playSoftClick(800);
    if (split.bill <= 0) {
      showToast("Please enter a bill amount first", "error");
      return;
    }

    const text = buildReceiptSummary(split, currency, friends);
    if (navigator.share) {
      try {
        await navigator.share({
          title: "QuickSplit — Bill Summary",
          text
        });
        saveToHistory();
        showToast("Shared successfully!");
      } catch (e) {
        if (e.name !== "AbortError") {
          handleCopySummary();
        }
      }
    } else {
      handleCopySummary();
    }
  };

  // Restore history split
  const handleRestoreHistory = (item) => {
    playSoftClick(550);
    setCurrency(item.currency || DEFAULT_CURRENCY);
    setBillInput(String(item.bill));
    setTipPercent(item.tipPercent);
    setIsCustomTip(!TIP_PRESETS.includes(item.tipPercent));
    if (!TIP_PRESETS.includes(item.tipPercent)) {
      setCustomTipInput(String(item.tipPercent));
    }
    setRoundUp(Boolean(item.isRounded));
    handleSetPeopleCount(item.people);
    showToast(`Restored split of ${formatCurrency(item.bill, item.currency)}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Delete history split
  const handleDeleteHistory = (id, e) => {
    e.stopPropagation();
    playSoftClick(300);
    setHistory((prev) => prev.filter((item) => item.id !== id));
    showToast("Split removed from history", "info");
  };

  // Clear all history
  const handleClearAllHistory = () => {
    playSoftClick(300);
    setHistory([]);
    showToast("History cleared", "info");
  };

  // Generate UPI payment URL
  const upiPaymentUrl = useMemo(() => {
    const amount = split.perPerson.toFixed(2);
    const note = encodeURIComponent("QuickSplit bill share");
    return `upi://pay?pa=${encodeURIComponent(upiId)}&pn=QuickSplit&am=${amount}&cu=INR&tn=${note}`;
  }, [upiId, split.perPerson]);

  const quickAmounts = QUICK_ADD_AMOUNTS[currency] || QUICK_ADD_AMOUNTS.USD;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0914] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full shadow-2xl bg-slate-900/90 text-white dark:bg-white/95 dark:text-slate-900 text-sm font-medium backdrop-blur-md transition-all animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-[#0e0c1a]/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-600 to-teal-500 dark:from-indigo-400 dark:to-teal-300 bg-clip-text text-transparent">
                QuickSplit
              </span>
              <span className="ml-1.5 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                2.0
              </span>
            </div>
          </div>

          {/* Header Controls */}
          <div className="flex items-center gap-2.5">
            {/* Currency Picker */}
            <div className="relative">
              <select
                value={currency}
                onChange={(e) => {
                  playSoftClick(500);
                  setCurrency(e.target.value);
                }}
                className="appearance-none bg-slate-100 hover:bg-slate-200/70 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold pl-3 pr-8 py-2 rounded-xl border border-slate-200 dark:border-slate-700/80 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                aria-label="Select currency"
              >
                {Object.values(CURRENCIES).map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => {
                playSoftClick(600);
                setTheme(theme === "dark" ? "light" : "dark");
              }}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200/70 dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Studio Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Left Column: Bill Inputs & Controls (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* 1. Bill Input Card */}
            <div className="bg-white dark:bg-[#141124] rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <label htmlFor="bill-amount" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-indigo-500" />
                  Bill Amount (Subtotal)
                </label>
                {billInput && (
                  <button
                    onClick={() => {
                      playSoftClick(300);
                      setBillInput("");
                    }}
                    className="text-xs text-rose-500 hover:text-rose-600 font-semibold flex items-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" /> Clear
                  </button>
                )}
              </div>

              {/* Big Currency + Amount Shell */}
              <div className="flex items-center gap-2 p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-[#1a162e] border-2 border-slate-200 dark:border-slate-700/60 focus-within:border-indigo-500 dark:focus-within:border-indigo-400 transition-colors">
                <span className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                  {CURRENCIES[currency]?.symbol || "$"}
                </span>
                <input
                  id="bill-amount"
                  ref={billInputRef}
                  type="number"
                  inputMode="decimal"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={billInput}
                  onChange={(e) => setBillInput(e.target.value)}
                  className="w-full bg-transparent text-2xl sm:text-4xl font-extrabold tracking-tight focus:outline-none font-mono"
                />
              </div>

              {/* Quick Add Chips */}
              <div className="mt-3.5 flex items-center flex-wrap gap-2">
                <span className="text-xs text-slate-400 font-medium">Quick add:</span>
                {quickAmounts.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => handleQuickAdd(amt)}
                    className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800/60 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 transition-all active:scale-95"
                  >
                    +{amt}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Tip Selector Card */}
            <div className="bg-white dark:bg-[#141124] rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <HeartHandshake className="w-3.5 h-3.5 text-pink-500" />
                  Select Tip Rate
                </label>
                <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                  {formatTip(activeTipRate)} = {formatCurrency(split.tipAmount, currency)}
                </span>
              </div>

              {/* Presets Grid */}
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {TIP_PRESETS.map((pct) => {
                  const isActive = !isCustomTip && tipPercent === pct;
                  return (
                    <button
                      key={pct}
                      onClick={() => {
                        playSoftClick(550);
                        setIsCustomTip(false);
                        setTipPercent(pct);
                      }}
                      className={`py-2.5 rounded-xl font-bold text-sm border transition-all active:scale-95 ${
                        isActive
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/25 scale-[1.02]"
                          : "bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {pct}%
                    </button>
                  );
                })}
              </div>

              {/* Custom Tip Input */}
              <div className="mt-3.5 flex items-center gap-3">
                <div className="relative flex-1">
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="Custom tip percentage"
                    min="0"
                    max="1000"
                    value={customTipInput}
                    onChange={(e) => {
                      setIsCustomTip(true);
                      setCustomTipInput(e.target.value);
                    }}
                    onFocus={() => setIsCustomTip(true)}
                    className={`w-full py-2 pl-3 pr-8 rounded-xl text-sm font-semibold border ${
                      isCustomTip
                        ? "border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-50/20 dark:bg-indigo-950/20"
                        : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40"
                    } focus:outline-none`}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">%</span>
                </div>
              </div>
            </div>

            {/* 3. Group Splitting (Friends & Avatars) */}
            <div className="bg-white dark:bg-[#141124] rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-teal-500" />
                  Split With ({friends.length} {friends.length === 1 ? "Person" : "People"})
                </label>
                <div className="flex items-center gap-2">
                  <button
                    disabled={friends.length <= 1}
                    onClick={() => handleSetPeopleCount(friends.length - 1)}
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 transition-colors"
                    aria-label="Decrease group size"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-extrabold text-lg w-8 text-center font-mono">
                    {friends.length}
                  </span>
                  <button
                    disabled={friends.length >= 20}
                    onClick={() => handleSetPeopleCount(friends.length + 1)}
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 transition-colors"
                    aria-label="Increase group size"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Quick Group Presets */}
              <div className="flex items-center flex-wrap gap-2 mb-4">
                <span className="text-xs text-slate-400 font-medium">Quick sizes:</span>
                {[1, 2, 3, 4, 5, 6, 8, 10].map((size) => (
                  <button
                    key={size}
                    onClick={() => handleSetPeopleCount(size)}
                    className={`px-3 py-1 text-xs font-bold rounded-lg border transition-all ${
                      friends.length === size
                        ? "bg-teal-500 text-white border-teal-500 shadow-sm"
                        : "bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>

              {/* Friend Avatar Badges (Editable Names!) */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60">
                <span className="text-xs text-slate-400 font-medium block mb-2.5">
                  Click name to edit or mark paid/pending:
                </span>
                <div className="flex flex-wrap gap-2">
                  {friends.map((friend) => {
                    const isEditing = editingFriendId === friend.id;
                    return (
                      <div
                        key={friend.id}
                        className={`flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-full border text-xs font-semibold transition-all ${
                          friend.paid
                            ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300"
                            : "bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <span
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white font-bold"
                          style={{ backgroundColor: friend.color }}
                        >
                          {friend.name.charAt(0).toUpperCase()}
                        </span>

                        {isEditing ? (
                          <input
                            type="text"
                            defaultValue={friend.name}
                            autoFocus
                            onBlur={(e) => handleUpdateFriendName(friend.id, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleUpdateFriendName(friend.id, e.target.value);
                            }}
                            className="w-20 bg-white dark:bg-slate-900 px-1 py-0.5 rounded border border-indigo-400 text-xs focus:outline-none"
                          />
                        ) : (
                          <span
                            onClick={() => setEditingFriendId(friend.id)}
                            className="cursor-pointer hover:underline"
                            title="Click to rename"
                          >
                            {friend.name}
                          </span>
                        )}

                        <button
                          onClick={() => toggleFriendPaid(friend.id)}
                          className="ml-1 p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                          title={friend.paid ? "Mark pending" : "Mark paid"}
                        >
                          {friend.paid ? (
                            <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <span className="w-2 h-2 rounded-full bg-amber-400 block" />
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Round Up Toggle Switch */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-bold text-sm text-slate-800 dark:text-slate-200">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Round up per person
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Rounds each share to whole currency; extra goes to the server's tip.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    playSoftClick(600);
                    setRoundUp(!roundUp);
                  }}
                  className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                    roundUp ? "bg-indigo-600 justify-end" : "bg-slate-300 dark:bg-slate-700 justify-start"
                  }`}
                  aria-pressed={roundUp}
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-md transform transition-transform" />
                </button>
              </div>
            </div>

          </div>

          {/* Right Column: Live Interactive Receipt Card (5 cols) */}
          <div className="lg:col-span-5 sticky top-20 space-y-4">
            <div className="bg-white dark:bg-[#141124] rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xl overflow-hidden relative">
              
              {/* Receipt Header Badge */}
              <div className="bg-gradient-to-r from-indigo-600 to-teal-500 p-4 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-indigo-200" />
                  <span className="font-extrabold tracking-tight text-sm uppercase">QuickSplit Receipt</span>
                </div>
                <span className="text-xs font-mono bg-white/20 px-2 py-0.5 rounded-full font-medium">
                  {new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </span>
              </div>

              <div className="p-6 space-y-5">
                {/* Hero Per-Person Highlight Card */}
                <div className="bg-gradient-to-br from-indigo-50/80 via-indigo-50/40 to-teal-50/60 dark:from-indigo-950/40 dark:via-indigo-950/20 dark:to-teal-950/30 border border-indigo-200/80 dark:border-indigo-800/60 rounded-2xl p-5 text-center shadow-inner relative overflow-hidden">
                  <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 block mb-1">
                    Each Person Pays
                  </span>
                  <div className="text-4xl sm:text-5xl font-black font-sans tracking-tight text-slate-900 dark:text-white animate-pop">
                    {formatCurrency(split.perPerson, currency)}
                  </div>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2 block">
                    {split.isRounded ? (
                      <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center justify-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> Rounded up (includes +{formatCurrency(split.roundingDifference, currency)} tip bonus)
                      </span>
                    ) : (
                      `Split equally across ${friends.length} ${friends.length === 1 ? "person" : "people"}`
                    )}
                  </span>
                </div>

                {/* Line Items Breakdown */}
                <div className="space-y-2.5 text-sm pt-2">
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                    <span>Original Check</span>
                    <span className="font-mono font-semibold">{formatCurrency(split.bill, currency)}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                    <span>Tip Amount ({formatTip(split.tipPercent)})</span>
                    <span className="font-mono font-semibold">{formatCurrency(split.tipAmount, currency)}</span>
                  </div>
                  {split.isRounded && split.roundingDifference > 0 && (
                    <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-medium">
                      <span className="flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> Rounding Extra
                      </span>
                      <span className="font-mono font-semibold">+{formatCurrency(split.roundingDifference, currency)}</span>
                    </div>
                  )}
                  <div className="h-px bg-slate-200 dark:bg-slate-800 border-dashed border-t my-2" />
                  <div className="flex justify-between items-center font-bold text-base text-slate-900 dark:text-white">
                    <span>Total Check</span>
                    <span className="font-mono text-lg">{formatCurrency(split.total, currency)}</span>
                  </div>
                </div>

                {/* Friend Payment Tracker Summary */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
                    <span>Payment status:</span>
                    <span>
                      {friends.filter((f) => f.paid).length} of {friends.length} settled
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {friends.map((f) => (
                      <div
                        key={f.id}
                        onClick={() => toggleFriendPaid(f.id)}
                        className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer border transition-colors ${
                          f.paid
                            ? "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300"
                            : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        <span className="truncate max-w-[80px] font-medium">{f.name}</span>
                        <span className="font-bold font-mono">
                          {f.paid ? "Paid" : "Pending"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Primary Actions */}
                <div className="pt-2 grid grid-cols-3 gap-2">
                  <button
                    onClick={handleCopySummary}
                    className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white shadow-md shadow-indigo-500/25 transition-all"
                  >
                    <Copy className="w-4 h-4" />
                    <span>Copy</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm bg-teal-500 hover:bg-teal-600 active:scale-95 text-white shadow-md shadow-teal-500/25 transition-all"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>

                  <button
                    onClick={handleReset}
                    className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl font-bold text-xs sm:text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Reset</span>
                  </button>
                </div>

                {/* UPI QR Code Trigger (for INR or quick digital settlements) */}
                {currency === "INR" && (
                  <button
                    onClick={() => setShowQRModal(true)}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2 transition-colors border border-slate-200 dark:border-slate-700/60"
                  >
                    <QrCode className="w-4 h-4 text-indigo-500" />
                    <span>Generate Instant UPI Payment QR</span>
                  </button>
                )}
              </div>
            </div>

            {/* Quick Settle Note */}
            <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/40 text-xs text-indigo-800 dark:text-indigo-300 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
              <span>
                100% client-side calculation. Zero data leaves this device. All splits are calculated with double-precision floating math.
              </span>
            </div>
          </div>

        </div>

        {/* Recent Splits Section */}
        <section className="mt-14 pt-10 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Recent Splits</h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Calculations preserved in this browser for quick restoration.
              </p>
            </div>
            {history.length > 0 && (
              <button
                onClick={handleClearAllHistory}
                className="text-xs font-bold text-rose-500 hover:text-rose-600 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="text-center py-10 px-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40">
              <Calculator className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">No recent splits yet</p>
              <p className="text-xs text-slate-400">Calculate a bill and tap "Copy" or "Share" to automatically save it here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleRestoreHistory(item)}
                  className="bg-white dark:bg-[#141124] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 cursor-pointer shadow-sm hover:shadow-md transition-all group relative"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono text-slate-400">
                      {new Date(item.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </span>
                    <button
                      onClick={(e) => handleDeleteHistory(item.id, e)}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded-md transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-xl font-extrabold font-mono text-indigo-600 dark:text-indigo-400">
                    {formatCurrency(item.perPerson, item.currency)}
                    <span className="text-xs font-normal text-slate-400 ml-1">/ person</span>
                  </div>
                  <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
                    <div>Total: {formatCurrency(item.total, item.currency)}</div>
                    <div>{item.people} people · {item.tipPercent}% tip {item.isRounded ? "· Rounded" : ""}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* FAQ Section */}
        <section className="mt-14 pt-10 border-t border-slate-200 dark:border-slate-800 max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-extrabold tracking-tight">Frequently Asked Questions</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Clear answers to your bill splitting math.</p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "How does the 'Round up per person' work?",
                a: "When you turn on round-up, each person's share is rounded up to the nearest whole integer (e.g. ₹458.33 becomes ₹459.00 or $17.40 becomes $18.00). The accumulated spare cents from everyone are passed directly to your server as an extra tip bonus!"
              },
              {
                q: "Does changing currency convert rates?",
                a: "No. QuickSplit formats numbers strictly according to your chosen currency symbol and formatting locale. It does not perform dynamic foreign exchange conversion, so it works completely offline without network latency."
              },
              {
                q: "Where is my data stored?",
                a: "All calculation histories, theme settings, and currency preferences reside purely in your browser's localStorage. No financial data is ever collected, transmitted, or stored on external servers."
              }
            ].map((faq, i) => (
              <details
                key={i}
                className="group bg-white dark:bg-[#141124] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 transition-all"
              >
                <summary className="font-bold text-sm sm:text-base cursor-pointer list-none flex justify-between items-center text-slate-800 dark:text-slate-200">
                  <span>{faq.q}</span>
                  <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform" />
                </summary>
                <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </section>

      </main>

      {/* UPI QR Modal (India) */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#141124] w-full max-w-sm rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl relative text-center">
            <button
              onClick={() => setShowQRModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-lg">UPI Payment Request</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Enter your UPI ID so friends can scan and pay their share directly.
            </p>

            <div className="mb-4 text-left">
              <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">Your VPA / UPI ID</label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="e.g. mobile@upi or name@okaxis"
                className="w-full px-3 py-2 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Generated QR Code via QuickChart / QR API */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 inline-block shadow-sm mb-4">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(upiPaymentUrl)}`}
                alt="UPI QR Code"
                className="w-44 h-44 mx-auto"
              />
            </div>

            <div className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-4">
              Requesting {formatCurrency(split.perPerson, "INR")} / person
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(upiPaymentUrl);
                showToast("UPI payment link copied!");
              }}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors"
            >
              Copy UPI Deep Link
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-20 border-t border-slate-200 dark:border-slate-800/80 py-8 text-center text-xs text-slate-400">
        <p className="font-medium">
          QuickSplit 2.0 • Built with React &amp; Tailwind CSS • 100% Private &amp; Open Source
        </p>
      </footer>
    </div>
  );
}
