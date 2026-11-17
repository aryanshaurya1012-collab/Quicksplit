import React, { useState, useEffect, useMemo, useRef } from "react";
import confetti from "canvas-confetti";
import QRCode from "qrcode";
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
  Plus,
  Minus,
  X,
  CreditCard,
  HeartHandshake,
  ShieldCheck,
  Volume2,
  VolumeX,
  Printer,
  Receipt,
  Menu,
  ArrowUp,
  ArrowRight,
  ExternalLink,
  BookmarkPlus,
  CheckCircle2,
  Clock,
  Utensils,
  HelpCircle,
  UserPlus
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
  calculateItemizedSplit,
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

  // Sound preference
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      return localStorage.getItem("quicksplit-sound") !== "false";
    } catch (e) {
      return true;
    }
  });

  // Mobile menu open/close
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Back to top visibility
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Split mode: 'equal' or 'itemized'
  const [splitMode, setSplitMode] = useState("equal");

  // Currency state
  const [currency, setCurrency] = useState(() => {
    try {
      const stored = localStorage.getItem("quicksplit-currency");
      return CURRENCIES[stored] ? stored : DEFAULT_CURRENCY;
    } catch (e) {
      return DEFAULT_CURRENCY;
    }
  });

  // Equal Mode State
  const [billInput, setBillInput] = useState("2400");
  const [tipPercent, setTipPercent] = useState(15);
  const [isCustomTip, setIsCustomTip] = useState(false);
  const [customTipInput, setCustomTipInput] = useState("");
  const [roundUp, setRoundUp] = useState(false);

  // Group / Friends state
  const [friends, setFriends] = useState(DEFAULT_FRIENDS);
  const [newFriendName, setNewFriendName] = useState("");
  const [showAddFriendInput, setShowAddFriendInput] = useState(false);
  const [editingFriendId, setEditingFriendId] = useState(null);

  // Itemized Mode State
  const [items, setItems] = useState([
    { id: "item_1", name: "Starters & Appetizers", price: "600", sharedBy: ["p1", "p2", "p3", "p4"] },
    { id: "item_2", name: "Main Course Platters", price: "1200", sharedBy: ["p1", "p2", "p3", "p4"] },
    { id: "item_3", name: "Cocktails & Drinks", price: "600", sharedBy: ["p1", "p2"] }
  ]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");

  // Toast & Modal state
  const [toastMessage, setToastMessage] = useState("");
  const [showQRModal, setShowQRModal] = useState(false);
  const [upiId, setUpiId] = useState("yourname@upi");
  const [offlineQrDataUrl, setOfflineQrDataUrl] = useState("");

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
  const newFriendInputRef = useRef(null);

  // Sound wrapper
  const triggerSound = (freq = 600, duration = 0.04) => {
    playSoftClick(freq, duration, soundEnabled);
  };

  // Toggle sound
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    try {
      localStorage.setItem("quicksplit-sound", String(next));
    } catch (e) {}
    if (next) playSoftClick(700, 0.05, true);
  };

  // Scroll listener for back to top button
  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 350) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Theme Synchronization
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (theme === "dark") {
      root.classList.add("dark");
      body.classList.add("dark");
    } else {
      root.classList.remove("dark");
      body.classList.remove("dark");
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

  // Equal Mode Split calculation
  const equalSplit = useMemo(() => {
    return calculateSplit(numericBill, activeTipRate, friends.length, roundUp);
  }, [numericBill, activeTipRate, friends.length, roundUp]);

  // Itemized Mode Split calculation
  const itemizedSplit = useMemo(() => {
    return calculateItemizedSplit(items, activeTipRate, friends, roundUp);
  }, [items, activeTipRate, friends, roundUp]);

  // Unified active split depending on mode
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

  // Toast feedback helper
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage("");
    }, 2800);
  };

  // Adjust friends count with stepper / presets
  const handleSetPeopleCount = (count) => {
    triggerSound(480);
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

  // Add individual friend by custom name
  const handleAddCustomFriend = (e) => {
    if (e) e.preventDefault();
    const name = newFriendName.trim() || `Person ${friends.length + 1}`;
    if (friends.length >= 20) {
      showToast("Maximum 20 people allowed");
      return;
    }

    triggerSound(580);
    const color = AVATAR_COLORS[friends.length % AVATAR_COLORS.length];
    const newFriend = {
      id: `p_${Date.now()}`,
      name,
      color,
      paid: false
    };

    setFriends((prev) => [...prev, newFriend]);
    setNewFriendName("");
    setShowAddFriendInput(false);
    showToast(`Added ${name} to group`);
  };

  // Remove a specific friend by ID
  const handleRemoveFriend = (friendId, e) => {
    if (e) e.stopPropagation();
    if (friends.length <= 1) {
      showToast("Group must have at least 1 person");
      return;
    }

    triggerSound(350);
    const friendToRemove = friends.find((f) => f.id === friendId);
    setFriends((prev) => prev.filter((f) => f.id !== friendId));

    // Also remove from any itemized items
    setItems((prev) =>
      prev.map((item) => {
        const remaining = (item.sharedBy || []).filter((id) => id !== friendId);
        return {
          ...item,
          sharedBy: remaining.length > 0 ? remaining : friends.filter((f) => f.id !== friendId).map((f) => f.id)
        };
      })
    );

    showToast(`Removed ${friendToRemove?.name || "person"}`);
  };

  // Toggle friend paid status
  const toggleFriendPaid = (id) => {
    triggerSound(720);
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
    triggerSound(650);
    const next = numericBill + amount;
    setBillInput(String(next));
  };

  // Quick add for Itemized item price
  const handleItemQuickAdd = (amount) => {
    triggerSound(650);
    const current = parseFloat(newItemPrice) || 0;
    setNewItemPrice(String(current + amount));
  };

  // Itemized: Add new item
  const handleAddItem = (e) => {
    e.preventDefault();
    const priceNum = parseFloat(newItemPrice);
    if (!newItemName.trim() || isNaN(priceNum) || priceNum <= 0) {
      showToast("Please enter an item name and valid price");
      return;
    }

    triggerSound(600);
    const newItem = {
      id: `item_${Date.now()}`,
      name: newItemName.trim(),
      price: String(priceNum),
      sharedBy: friends.map((f) => f.id)
    };
    setItems((prev) => [...prev, newItem]);
    setNewItemName("");
    setNewItemPrice("");
  };

  // Itemized: Toggle friend on item
  const handleToggleItemConsumer = (itemId, friendId) => {
    triggerSound(550);
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const current = item.sharedBy || [];
        const exists = current.includes(friendId);
        if (exists && current.length === 1) {
          showToast("At least one person must be assigned to this item");
          return item;
        }
        const updated = exists ? current.filter((id) => id !== friendId) : [...current, friendId];
        return { ...item, sharedBy: updated };
      })
    );
  };

  // Itemized: Delete item
  const handleDeleteItem = (itemId) => {
    triggerSound(350);
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  // Reset form
  const handleReset = () => {
    triggerSound(400);
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
      setNewItemName("");
      setNewItemPrice("");
      setTipPercent(15);
      setIsCustomTip(false);
      setCustomTipInput("");
      setRoundUp(false);
      showToast("Itemized order list cleared");
    }
  };

  // Save to History (supports both Equal and Itemized splits)
  const saveToHistory = (silent = false) => {
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
      ...prev.filter((item) => item.bill !== entry.bill || item.total !== entry.total || item.mode !== entry.mode)
    ].slice(0, 10));

    if (!silent) {
      triggerSound(700);
      showToast("Split saved to Recent Splits! 💾");
    }
  };

  // Copy summary
  const handleCopySummary = async () => {
    triggerSound(880);
    if (activeSplit.bill <= 0) {
      showToast("Please enter a bill amount first");
      return;
    }

    const isItemized = splitMode === "itemized";
    const friendData = isItemized ? itemizedSplit.breakdown : friends;
    const text = buildReceiptSummary(activeSplit, currency, friendData, items, isItemized);

    try {
      await navigator.clipboard.writeText(text);
      saveToHistory(true);
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.65 }
      });
      showToast("Receipt copied! Ready to paste in WhatsApp/chat ✨");
    } catch (e) {
      showToast("Could not access clipboard");
    }
  };

  // Share summary
  const handleShare = async () => {
    triggerSound(800);
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
        saveToHistory(true);
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

  // Print Receipt
  const handlePrintReceipt = () => {
    triggerSound(500);
    saveToHistory(true);
    window.print();
  };

  // Restore history split
  const handleRestoreHistory = (item) => {
    triggerSound(550);
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
    } else {
      handleSetPeopleCount(item.people || 4);
    }

    showToast(`Restored split of ${formatCurrency(item.bill, item.currency)}`);
    const calcElement = document.getElementById("calculator");
    if (calcElement) calcElement.scrollIntoView({ behavior: "smooth" });
  };

  // Delete history split
  const handleDeleteHistory = (id, e) => {
    e.stopPropagation();
    triggerSound(300);
    setHistory((prev) => prev.filter((item) => item.id !== id));
    showToast("Split removed from history");
  };

  // Clear all history
  const handleClearAllHistory = () => {
    triggerSound(300);
    setHistory([]);
    showToast("History cleared");
  };

  // Generate UPI payment URL
  const upiPaymentUrl = useMemo(() => {
    const amount = (splitMode === "itemized" && friends.length > 0 ? (activeSplit.total / friends.length) : activeSplit.perPerson).toFixed(2);
    const note = encodeURIComponent("QuickSplit bill share");
    return `upi://pay?pa=${encodeURIComponent(upiId)}&pn=QuickSplit&am=${amount}&cu=INR&tn=${note}`;
  }, [upiId, activeSplit.perPerson, activeSplit.total, splitMode, friends.length]);

  // Generate offline QR Code data URL whenever upiPaymentUrl or showQRModal changes
  useEffect(() => {
    if (!showQRModal) return;
    let isMounted = true;
    QRCode.toDataURL(upiPaymentUrl, {
      width: 220,
      margin: 2,
      color: {
        dark: "#1e1b4b",
        light: "#ffffff"
      }
    })
      .then((url) => {
        if (isMounted) setOfflineQrDataUrl(url);
      })
      .catch(() => {
        if (isMounted) setOfflineQrDataUrl("");
      });

    return () => {
      isMounted = false;
    };
  }, [upiPaymentUrl, showQRModal]);

  const quickAmounts = QUICK_ADD_AMOUNTS[currency] || QUICK_ADD_AMOUNTS.USD;

  // Smooth scroll handler
  const scrollToSection = (id) => {
    triggerSound(500);
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className={`min-h-screen ${theme === "dark" ? "dark bg-[#0b0914] text-slate-100" : "bg-slate-50 text-slate-900"} font-sans transition-colors duration-200 selection:bg-indigo-500 selection:text-white`}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-2.5 rounded-full shadow-2xl bg-slate-900/95 text-white dark:bg-white dark:text-slate-900 text-xs sm:text-sm font-semibold backdrop-blur-md transition-all animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-white/85 dark:bg-[#0e0c1a]/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Brand */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center gap-2.5 group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Calculator className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-600 to-teal-500 dark:from-indigo-400 dark:to-teal-300 bg-clip-text text-transparent">
              QuickSplit
            </span>
          </a>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 lg:gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
            <button
              onClick={() => scrollToSection("calculator")}
              className="px-3 py-1.5 rounded-lg hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
            >
              Calculator
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="px-3 py-1.5 rounded-lg hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
            >
              How it works
            </button>
            <button
              onClick={() => scrollToSection("recent")}
              className="px-3 py-1.5 rounded-lg hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
            >
              Recent splits
            </button>
            <button
              onClick={() => scrollToSection("faq")}
              className="px-3 py-1.5 rounded-lg hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
            >
              FAQ
            </button>
            <button
              onClick={() => scrollToSection("about")}
              className="px-3 py-1.5 rounded-lg hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
            >
              About
            </button>
          </nav>

          {/* Controls: Mode, Sound, Currency, Theme & Mobile Menu */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Mode Switcher Tabs (Desktop) */}
            <div className="hidden lg:flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
              <button
                onClick={() => {
                  triggerSound(500);
                  setSplitMode("equal");
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  splitMode === "equal"
                    ? "bg-white dark:bg-[#181428] text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Equal
              </button>
              <button
                onClick={() => {
                  triggerSound(500);
                  setSplitMode("itemized");
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  splitMode === "itemized"
                    ? "bg-white dark:bg-[#181428] text-teal-600 dark:text-teal-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <Receipt className="w-3.5 h-3.5" />
                Itemized
              </button>
            </div>

            {/* Sound Toggle */}
            <button
              onClick={handleToggleSound}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200/70 dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              aria-label={soundEnabled ? "Mute sounds" : "Enable sounds"}
              title={soundEnabled ? "Mute sounds" : "Enable sounds"}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-500" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>

            {/* Currency Dropdown */}
            <div className="relative">
              <select
                value={currency}
                onChange={(e) => {
                  triggerSound(500);
                  setCurrency(e.target.value);
                }}
                className="appearance-none bg-slate-100 hover:bg-slate-200/70 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-xs sm:text-sm font-bold pl-2.5 pr-7 py-2 rounded-xl border border-slate-200 dark:border-slate-700/80 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                aria-label="Select currency"
              >
                {Object.values(CURRENCIES).map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={() => {
                triggerSound(600);
                setTheme((prev) => (prev === "dark" ? "light" : "dark"));
              }}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200/70 dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
              aria-label="Toggle theme"
              title="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400 animate-pop" /> : <Moon className="w-4 h-4 text-indigo-600 animate-pop" />}
            </button>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => {
                triggerSound(450);
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              className="md:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0e0c1a]/95 backdrop-blur-lg px-4 py-4 space-y-3 animate-fade-in">
            {/* Split Mode Toggle in Mobile Drawer */}
            <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => {
                  triggerSound(500);
                  setSplitMode("equal");
                  setMobileMenuOpen(false);
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold text-center cursor-pointer transition-all ${
                  splitMode === "equal"
                    ? "bg-white dark:bg-[#181428] text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                ⚡ Equal Split
              </button>
              <button
                onClick={() => {
                  triggerSound(500);
                  setSplitMode("itemized");
                  setMobileMenuOpen(false);
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold text-center cursor-pointer transition-all ${
                  splitMode === "itemized"
                    ? "bg-white dark:bg-[#181428] text-teal-600 dark:text-teal-400 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                🧾 Itemized Split
              </button>
            </div>

            {/* Mobile Navigation Links */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => scrollToSection("calculator")}
                className="p-2.5 rounded-xl text-left text-xs font-bold bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80"
              >
                🧮 Calculator
              </button>
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="p-2.5 rounded-xl text-left text-xs font-bold bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80"
              >
                💡 How it works
              </button>
              <button
                onClick={() => scrollToSection("recent")}
                className="p-2.5 rounded-xl text-left text-xs font-bold bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80"
              >
                🕒 Recent splits
              </button>
              <button
                onClick={() => scrollToSection("faq")}
                className="p-2.5 rounded-xl text-left text-xs font-bold bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80"
              >
                ❓ FAQ
              </button>
              <button
                onClick={() => scrollToSection("about")}
                className="col-span-2 p-2.5 rounded-xl text-left text-xs font-bold bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80"
              >
                ✨ About QuickSplit
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Container */}
      <main id="top" className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* ========================================================
            HERO SECTION: Product Showcase & Floating Card
           ======================================================== */}
        <section className="py-10 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              {/* Pill Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800/80 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                <span>QUICKSPLIT • FAIR BILL SPLITTING</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-slate-900 dark:text-white">
                Good food.
                <br />
                Great company.
                <br />
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                  No awkward math.
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
                Calculate tips, split checks down to the cent or round up, and share clean receipts with your group in seconds.
              </p>

              {/* Feature Tags */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-xs">
                  ⚡ Live Math
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-xs">
                  🔒 100% Private
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-xs">
                  📱 Offline Ready
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-xs">
                  🌐 9 Currencies
                </span>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => scrollToSection("calculator")}
                  className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-extrabold text-sm shadow-lg shadow-indigo-500/25 flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Calculator className="w-4 h-4" />
                  <span>Start splitting</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => scrollToSection("how-it-works")}
                  className="px-5 py-3 rounded-xl bg-white hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 active:scale-95 text-slate-800 dark:text-slate-200 font-bold text-sm border border-slate-200 dark:border-slate-700 cursor-pointer transition-all"
                >
                  See how it works
                </button>
              </div>
            </div>

            {/* Hero Right: Floating Interactive Preview Card */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="w-full max-w-sm rounded-3xl p-6 bg-white dark:bg-[#141124] border border-slate-200/90 dark:border-slate-800/90 shadow-2xl relative animate-float overflow-hidden">
                {/* Decorative glow */}
                <div className="absolute -top-16 -right-16 w-40 h-40 bg-gradient-to-br from-indigo-500/20 to-teal-400/20 rounded-full blur-3xl pointer-events-none" />
                
                {/* Header of preview card */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🍕</span>
                    <span className="font-extrabold text-base text-slate-900 dark:text-white">Friday Dinner</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-200/80 dark:border-teal-800/60">
                    4 friends
                  </span>
                </div>

                {/* Subtotals */}
                <div className="space-y-2 text-xs font-medium text-slate-500 dark:text-slate-400 pb-4 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex justify-between items-center">
                    <span>Bill total</span>
                    <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                      {formatCurrency(2400, currency)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Tip (15%)</span>
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      +{formatCurrency(360, currency)}
                    </span>
                  </div>
                </div>

                {/* Each pays callout */}
                <div className="mt-4 p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/70 dark:border-indigo-800/60 flex items-center justify-between">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                    EACH PAYS
                  </span>
                  <span className="text-2xl font-black font-sans tracking-tight text-indigo-600 dark:text-indigo-400">
                    {formatCurrency(690, currency)}
                  </span>
                </div>

                {/* Micro friend avatar bubbles */}
                <div className="mt-4 flex items-center justify-between pt-1">
                  <div className="flex -space-x-1.5 overflow-hidden">
                    {["#6366f1", "#ec4899", "#14b8a6", "#f59e0b"].map((bg, idx) => (
                      <div
                        key={idx}
                        className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-[#141124] text-[10px] text-white font-bold flex items-center justify-center"
                        style={{ backgroundColor: bg }}
                      >
                        {["Y", "A", "R", "P"][idx]}
                      </div>
                    ))}
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> All settled
                  </span>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================
            HOW IT WORKS: 3 Step Cards
           ======================================================== */}
        <section id="how-it-works" className="py-12 border-t border-slate-200/80 dark:border-slate-800/80">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 block mb-1">
              Effortless Math
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">How QuickSplit Works</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Three simple steps to settle any check with your friends without awkward calculations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#141124] border border-slate-200/90 dark:border-slate-800/90 shadow-sm hover:shadow-md transition-shadow relative space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-sm">
                1
              </div>
              <h3 className="text-lg font-bold">Enter Bill &amp; Currency</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Type the subtotal or tap quick-add chips (+50, +100, +500). Switch between 9 global currencies with standard formatting.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#141124] border border-slate-200/90 dark:border-slate-800/90 shadow-sm hover:shadow-md transition-shadow relative space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950 text-teal-600 dark:text-teal-400 flex items-center justify-center font-black text-sm">
                2
              </div>
              <h3 className="text-lg font-bold">Pick Tip &amp; Friends</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Choose 0%–25% tip or enter a custom rate. Add party members, tap to rename friends, or switch to itemized dishes.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#141124] border border-slate-200/90 dark:border-slate-800/90 shadow-sm hover:shadow-md transition-shadow relative space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black text-sm">
                3
              </div>
              <h3 className="text-lg font-bold">Share Instant Receipt</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Copy formatted WhatsApp text with confetti, use native Mobile Share, print or save PDF, or generate an Indian UPI QR code.
              </p>
            </div>
          </div>
        </section>

        {/* ========================================================
            CALCULATOR SECTION: Interactive Split Engine
           ======================================================== */}
        <section id="calculator" className="py-12 border-t border-slate-200/80 dark:border-slate-800/80 scroll-mt-20">
          
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 block mb-1">
                Live Calculator
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {splitMode === "equal" ? "Equal Bill Split" : "Itemized Order Split"}
              </h2>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 self-start sm:self-auto">
              <button
                onClick={() => {
                  triggerSound(500);
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
                  triggerSound(500);
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

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            
            {/* Left Column: Calculator Inputs (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* MODE 1: Equal Split Bill Input */}
              {splitMode === "equal" ? (
                <div className="bg-white dark:bg-[#141124] rounded-2xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800/90 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2.5">
                    <label htmlFor="bill-amount" className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-indigo-500" />
                      Bill Amount (Subtotal)
                    </label>
                    {billInput && (
                      <button
                        onClick={() => {
                          triggerSound(300);
                          setBillInput("");
                        }}
                        className="text-xs text-rose-500 hover:text-rose-600 font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" /> Clear
                      </button>
                    )}
                  </div>

                  {/* Big Currency + Amount Box */}
                  <div className="flex items-center gap-2 p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-[#1a162e] border-2 border-slate-200 dark:border-slate-700/60 focus-within:border-indigo-500 dark:focus-within:border-indigo-400 transition-colors">
                    <span className="text-2xl sm:text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono select-none">
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
                        className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800/60 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 transition-all active:scale-95 cursor-pointer"
                      >
                        +{amt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                /* MODE 2: Itemized Dishes & Drinks Input */
                <div className="bg-white dark:bg-[#141124] rounded-2xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800/90 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Receipt className="w-3.5 h-3.5 text-teal-500" />
                      Itemized Order List
                    </label>
                    <span className="text-xs font-bold text-teal-600 dark:text-teal-400">
                      Subtotal: {formatCurrency(itemizedSplit.subtotal, currency)}
                    </span>
                  </div>

                  {/* Add Item Form */}
                  <form onSubmit={handleAddItem} className="space-y-3 mb-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. Pizza, Pasta, Drinks"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        className="flex-1 px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1a162e] focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      <div className="relative w-28 sm:w-36">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-slate-400">
                          {CURRENCIES[currency]?.symbol}
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={newItemPrice}
                          onChange={(e) => setNewItemPrice(e.target.value)}
                          className="w-full pl-6 pr-2.5 py-2 text-sm font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1a162e] focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add
                      </button>
                    </div>

                    {/* Quick Add Chips for Item Price */}
                    <div className="flex items-center flex-wrap gap-1.5 pt-1">
                      <span className="text-[11px] text-slate-400 font-medium">Quick price:</span>
                      {quickAmounts.slice(0, 4).map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => handleItemQuickAdd(amt)}
                          className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-slate-100 hover:bg-teal-50 dark:bg-slate-800 dark:hover:bg-teal-950/40 text-slate-600 dark:text-slate-300 hover:text-teal-600 border border-slate-200 dark:border-slate-700 cursor-pointer"
                        >
                          +{amt}
                        </button>
                      ))}
                    </div>
                  </form>

                  {/* Items List */}
                  {items.length === 0 ? (
                    <div className="p-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 text-xs">
                      No items added yet. Enter a dish or drink name and price above to start itemizing!
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 text-xs space-y-2"
                        >
                          <div className="flex items-center justify-between font-semibold">
                            <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{item.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-extrabold text-teal-600 dark:text-teal-400">
                                {formatCurrency(Number(item.price), currency)}
                              </span>
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="p-1 text-slate-400 hover:text-rose-500 rounded cursor-pointer transition-colors"
                                title="Delete item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Who shared this item? */}
                          <div className="flex items-center flex-wrap gap-1.5 pt-1">
                            <span className="text-[11px] text-slate-400 font-medium">Shared by:</span>
                            {friends.map((f) => {
                              const isShared = (item.sharedBy || []).includes(f.id);
                              return (
                                <button
                                  key={f.id}
                                  type="button"
                                  onClick={() => handleToggleItemConsumer(item.id, f.id)}
                                  className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                                    isShared
                                      ? "bg-teal-500 text-white border-teal-500 shadow-xs"
                                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700"
                                  }`}
                                >
                                  {f.name}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Tip Selector Card */}
              <div className="bg-white dark:bg-[#141124] rounded-2xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800/90 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <HeartHandshake className="w-3.5 h-3.5 text-pink-500" />
                    Select Tip Rate
                  </label>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                    {formatTip(activeTipRate)} = {formatCurrency(activeSplit.tipAmount, currency)}
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
                          triggerSound(550);
                          setIsCustomTip(false);
                          setTipPercent(pct);
                        }}
                        className={`py-2.5 rounded-xl font-bold text-sm border transition-all active:scale-95 cursor-pointer ${
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

              {/* Group Members (Friends, Names & Stepper & Direct Add/Remove) */}
              <div className="bg-white dark:bg-[#141124] rounded-2xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800/90 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-teal-500" />
                    Split With ({friends.length} {friends.length === 1 ? "Person" : "People"})
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      disabled={friends.length <= 1}
                      onClick={() => handleSetPeopleCount(friends.length - 1)}
                      className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
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
                      className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                      aria-label="Increase group size"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Quick Group Presets & Add Friend Toggle */}
                <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
                  <div className="flex items-center flex-wrap gap-1.5">
                    <span className="text-xs text-slate-400 font-medium">Quick sizes:</span>
                    {[1, 2, 3, 4, 5, 6, 8, 10].map((size) => (
                      <button
                        key={size}
                        onClick={() => handleSetPeopleCount(size)}
                        className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                          friends.length === size
                            ? "bg-teal-500 text-white border-teal-500 shadow-xs"
                            : "bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowAddFriendInput(!showAddFriendInput);
                      setTimeout(() => {
                        if (newFriendInputRef.current) newFriendInputRef.current.focus();
                      }, 50);
                    }}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    {showAddFriendInput ? "Cancel" : "+ Add Person"}
                  </button>
                </div>

                {/* Inline Add Friend Form */}
                {showAddFriendInput && (
                  <form onSubmit={handleAddCustomFriend} className="flex gap-2 mb-4 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <input
                      ref={newFriendInputRef}
                      type="text"
                      placeholder="Enter friend's name (e.g. Maya)"
                      value={newFriendName}
                      onChange={(e) => setNewFriendName(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 cursor-pointer"
                    >
                      Add
                    </button>
                  </form>
                )}

                {/* Friend Avatar Badges (Editable Names & Individual Remove!) */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60">
                  <span className="text-xs text-slate-400 font-medium block mb-2.5">
                    Tap name to rename, checkmark to toggle paid, or (×) to remove:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {friends.map((friend) => {
                      const isEditing = editingFriendId === friend.id;
                      return (
                        <div
                          key={friend.id}
                          className={`flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-full border text-xs font-semibold transition-all ${
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

                          {/* Paid/Pending Toggle */}
                          <button
                            type="button"
                            onClick={() => toggleFriendPaid(friend.id)}
                            className="ml-1 p-0.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors cursor-pointer"
                            title={friend.paid ? "Mark pending" : "Mark paid"}
                          >
                            {friend.paid ? (
                              <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <span className="w-2 h-2 rounded-full bg-amber-400 block" />
                            )}
                          </button>

                          {/* Individual Remove Friend Button */}
                          {friends.length > 1 && (
                            <button
                              type="button"
                              onClick={(e) => handleRemoveFriend(friend.id, e)}
                              className="p-0.5 hover:text-rose-500 rounded-full transition-colors cursor-pointer text-slate-400 ml-0.5"
                              title={`Remove ${friend.name}`}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
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
                      Rounds shares to whole currency; spare cents go to the tip bonus.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      triggerSound(600);
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

            {/* Right Column: Digital Receipt Card (5 cols) */}
            <div className="lg:col-span-5 sticky top-20 space-y-4 receipt-card">
              <div className="bg-white dark:bg-[#141124] rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xl overflow-hidden relative">
                
                {/* Receipt Header Ribbon */}
                <div className="bg-gradient-to-r from-indigo-600 to-teal-500 p-4 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-5 h-5 text-indigo-200" />
                    <span className="font-extrabold tracking-tight text-sm uppercase">
                      {splitMode === "itemized" ? "Itemized Check" : "QuickSplit Receipt"}
                    </span>
                  </div>
                  <span className="text-xs font-mono bg-white/20 px-2 py-0.5 rounded-full font-medium">
                    {new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </span>
                </div>

                <div className="p-5 sm:p-6 space-y-5">
                  {/* Hero Highlight Card */}
                  <div className="bg-gradient-to-br from-indigo-50/80 via-indigo-50/40 to-teal-50/60 dark:from-indigo-950/40 dark:via-indigo-950/20 dark:to-teal-950/30 border border-indigo-200/80 dark:border-indigo-800/60 rounded-2xl p-5 text-center shadow-inner relative overflow-hidden">
                    <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 block mb-1">
                      {splitMode === "itemized" ? "Total Check (With Tip)" : "Each Person Pays"}
                    </span>
                    <div className="text-4xl sm:text-5xl font-black font-sans tracking-tight text-slate-900 dark:text-white animate-pop">
                      {splitMode === "itemized" ? formatCurrency(activeSplit.total, currency) : formatCurrency(activeSplit.perPerson, currency)}
                    </div>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2 block">
                      {splitMode === "itemized" ? (
                        `${items.length} items shared between ${friends.length} friends`
                      ) : activeSplit.isRounded ? (
                        <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center justify-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" /> Rounded up (+{formatCurrency(activeSplit.roundingDifference || 0, currency)} tip bonus)
                        </span>
                      ) : (
                        `Split evenly between ${friends.length} ${friends.length === 1 ? "person" : "people"}`
                      )}
                    </span>
                  </div>

                  {/* Line Items Breakdown */}
                  <div className="space-y-2.5 text-sm pt-1">
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                      <span>Subtotal</span>
                      <span className="font-mono font-semibold">{formatCurrency(activeSplit.bill, currency)}</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                      <span>Tip ({formatTip(activeSplit.tipPercent)})</span>
                      <span className="font-mono font-semibold">{formatCurrency(activeSplit.tipAmount, currency)}</span>
                    </div>
                    {activeSplit.isRounded && activeSplit.roundingDifference > 0 && (
                      <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-medium">
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5" /> Rounding Extra
                        </span>
                        <span className="font-mono font-semibold">+{formatCurrency(activeSplit.roundingDifference, currency)}</span>
                      </div>
                    )}
                    <div className="h-px bg-slate-200 dark:bg-slate-800 border-dashed border-t my-2" />
                    <div className="flex justify-between items-center font-bold text-base text-slate-900 dark:text-white">
                      <span>Total Check</span>
                      <span className="font-mono text-lg">{formatCurrency(activeSplit.total, currency)}</span>
                    </div>
                  </div>

                  {/* Friend Payment Tracker Summary */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
                      <span>{splitMode === "itemized" ? "Individual Shares:" : "Group Members:"}</span>
                      <span>
                        {friends.filter((f) => f.paid).length} of {friends.length} paid
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                      {(splitMode === "itemized" ? itemizedSplit.breakdown : friends.map(f => ({ ...f, totalShare: activeSplit.perPerson }))).map((f) => (
                        <div
                          key={f.id}
                          onClick={() => toggleFriendPaid(f.id)}
                          className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer border transition-colors ${
                            f.paid
                              ? "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300"
                              : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                          }`}
                        >
                          <span className="truncate max-w-[70px] font-medium">{f.name}</span>
                          <span className="font-bold font-mono">
                            {formatCurrency(f.totalShare, currency)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Primary Actions: Copy, Share, Print, Save, Reset */}
                  <div className="pt-2 grid grid-cols-5 gap-1.5 no-print">
                    <button
                      onClick={handleCopySummary}
                      className="flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl font-bold text-[11px] bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white shadow-md shadow-indigo-500/25 transition-all cursor-pointer"
                      title="Copy receipt summary to clipboard"
                    >
                      <Copy className="w-4 h-4" />
                      <span>Copy</span>
                    </button>

                    <button
                      onClick={handleShare}
                      className="flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl font-bold text-[11px] bg-teal-500 hover:bg-teal-600 active:scale-95 text-white shadow-md shadow-teal-500/25 transition-all cursor-pointer"
                      title="Share to WhatsApp, Messages, etc."
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </button>

                    <button
                      onClick={() => saveToHistory(false)}
                      className="flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl font-bold text-[11px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                      title="Save this calculation to local history"
                    >
                      <BookmarkPlus className="w-4 h-4 text-indigo-500" />
                      <span>Save</span>
                    </button>

                    <button
                      onClick={handlePrintReceipt}
                      className="flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl font-bold text-[11px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                      title="Print or save as PDF receipt"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Print</span>
                    </button>

                    <button
                      onClick={handleReset}
                      className="flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl font-bold text-[11px] bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                      title="Reset calculator"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Reset</span>
                    </button>
                  </div>

                  {/* UPI QR Trigger (Works offline!) */}
                  <button
                    onClick={() => setShowQRModal(true)}
                    className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800/60 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2 transition-colors border border-slate-200 dark:border-slate-700/60 cursor-pointer no-print"
                  >
                    <QrCode className="w-4 h-4 text-indigo-500" />
                    <span>Generate Instant UPI Payment QR Code</span>
                  </button>
                </div>
              </div>

              {/* Offline Privacy Guarantee Pill */}
              <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/40 text-xs text-indigo-800 dark:text-indigo-300 flex items-start gap-2.5 no-print">
                <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <span>
                  100% private &amp; offline. All calculations and QR codes are generated directly in your browser with zero network tracking.
                </span>
              </div>
            </div>

          </div>
        </section>

        {/* ========================================================
            RECENT SPLITS SECTION
           ======================================================== */}
        <section id="recent" className="py-12 border-t border-slate-200/80 dark:border-slate-800/80 no-print scroll-mt-20">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 block mb-1">
                Saved Locally
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Recent Splits</h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Calculations saved in your browser's localStorage with one-click Restore or Delete.
              </p>
            </div>
            {history.length > 0 && (
              <button
                onClick={handleClearAllHistory}
                className="text-xs font-bold text-rose-500 hover:text-rose-600 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
              >
                Clear All
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="text-center py-10 px-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/40">
              <Calculator className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">No recent splits yet</p>
              <p className="text-xs text-slate-400">Calculate a bill and tap "Save", "Copy", or "Share" to store it here.</p>
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
                      className="p-1 text-slate-400 hover:text-rose-500 rounded-md transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-xl font-extrabold font-mono text-indigo-600 dark:text-indigo-400">
                    {item.mode === "itemized" ? formatCurrency(item.total, item.currency) : formatCurrency(item.perPerson, item.currency)}
                    <span className="text-xs font-normal text-slate-400 ml-1">
                      {item.mode === "itemized" ? "total" : "/ person"}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
                    <div>Mode: <span className="font-semibold capitalize">{item.mode || "equal"}</span></div>
                    <div>{item.people} people · {item.tipPercent}% tip {item.isRounded ? "· Rounded" : ""}</div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:underline">
                    <span>Click to Restore</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ========================================================
            FAQ ACCORDION SECTION
           ======================================================== */}
        <section id="faq" className="py-12 border-t border-slate-200/80 dark:border-slate-800/80 max-w-3xl mx-auto no-print scroll-mt-20">
          <div className="text-center mb-8">
            <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 block mb-1">
              Got Questions?
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Frequently Asked Questions</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Clear details about rounding formulas, itemized shares, offline capability, and client privacy.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "How does the 'Round up per person' work?",
                a: "When you turn on round-up, each person's share is rounded up to the nearest whole integer (e.g. ₹458.33 becomes ₹459.00 or $17.40 becomes $18.00). The accumulated spare cents from everyone are passed directly to your server as an extra tip bonus!"
              },
              {
                q: "What is the difference between Equal Split and Itemized Split?",
                a: "Equal Split divides the entire check and tip evenly across all party members. Itemized Split allows you to add specific dishes or drinks and assign them only to the people who consumed them, with tip added proportionally."
              },
              {
                q: "Does changing currency convert live exchange rates?",
                a: "No. QuickSplit formats numbers strictly according to your chosen currency symbol and formatting locale. It does not perform dynamic foreign exchange conversion, so it works completely offline without network latency."
              },
              {
                q: "Where is my data stored and is it private?",
                a: "100% private. All calculation histories, theme settings, and currency preferences reside purely in your browser's localStorage. No financial data is ever collected, transmitted, or stored on external servers."
              },
              {
                q: "Does QuickSplit work on any device?",
                a: "Yes! QuickSplit is engineered to be fully responsive and optimized for desktop PCs, laptops, tablets, and smartphones alike."
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

        {/* ========================================================
            ABOUT SECTION: Project Values & Key Stats
           ======================================================== */}
        <section id="about" className="py-12 border-t border-slate-200/80 dark:border-slate-800/80 scroll-mt-20">
          <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-indigo-50/60 via-purple-50/30 to-teal-50/50 dark:from-[#141124] dark:via-[#16122a] dark:to-[#111827] border border-slate-200/90 dark:border-slate-800/90">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-4">
                <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 block">
                  About QuickSplit
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  Built for dinner tables, not spreadsheets
                </h2>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
                  QuickSplit was crafted to make ending meals with friends effortless. No sign-ups, no downloading bulky apps, no intrusive ads — just clean math, fair splits, and clear digital receipts you can share instantly.
                </p>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
                  <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-center">
                    <span className="text-2xl font-black font-mono text-indigo-600 dark:text-indigo-400 block">0</span>
                    <span className="text-xs text-slate-500 font-medium">Ad Trackers</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-center">
                    <span className="text-2xl font-black font-mono text-teal-600 dark:text-teal-400 block">9</span>
                    <span className="text-xs text-slate-500 font-medium">Currencies</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-center">
                    <span className="text-2xl font-black font-mono text-purple-600 dark:text-purple-400 block">100%</span>
                    <span className="text-xs text-slate-500 font-medium">Client-Side</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-center">
                    <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 block">0ms</span>
                    <span className="text-xs text-slate-500 font-medium">Server Lag</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 flex justify-center">
                <div className="w-32 h-32 rounded-3xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-teal-400 flex items-center justify-center text-white shadow-xl shadow-indigo-500/25">
                  <Calculator className="w-16 h-16" />
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* 100% OFFLINE UPI QR Modal */}
      {showQRModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in no-print">
          <div className="bg-white dark:bg-[#141124] w-full max-w-sm rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl relative text-center">
            <button
              onClick={() => setShowQRModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
              <QrCode className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-lg">UPI Payment Request</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Generated 100% offline. Friends can scan with GPay, PhonePe, or Paytm to pay their share directly.
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

            <div className="bg-white p-3 rounded-2xl border border-slate-200 inline-block shadow-sm mb-4">
              {offlineQrDataUrl ? (
                <img
                  src={offlineQrDataUrl}
                  alt="Offline UPI QR Code"
                  className="w-44 h-44 mx-auto rounded-lg"
                />
              ) : (
                <div className="w-44 h-44 flex items-center justify-center text-xs text-slate-400">
                  Generating QR...
                </div>
              )}
            </div>

            <div className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-4">
              Requesting {formatCurrency(splitMode === "itemized" ? (activeSplit.total / friends.length) : activeSplit.perPerson, "INR")} / person
            </div>

            <button
              onClick={() => {
                navigator.clipboard.writeText(upiPaymentUrl);
                showToast("UPI payment link copied!");
              }}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              Copy UPI Deep Link
            </button>
          </div>
        </div>
      )}

      {/* Floating Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={() => {
            triggerSound(500);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          className="fixed bottom-6 right-6 z-40 p-3 rounded-full bg-indigo-600 text-white shadow-xl hover:bg-indigo-700 active:scale-95 transition-all cursor-pointer no-print"
          aria-label="Back to top"
          title="Back to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}

      {/* Footer */}
      <footer className="mt-20 border-t border-slate-200 dark:border-slate-800/80 py-10 bg-white/50 dark:bg-[#0e0c1a]/50 text-xs text-slate-500 dark:text-slate-400 no-print">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
              Q
            </div>
            <span className="font-bold text-sm text-slate-800 dark:text-slate-200">QuickSplit</span>
            <span>— Split the bill, share the smiles.</span>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => scrollToSection("calculator")} className="hover:underline cursor-pointer">Calculator</button>
            <button onClick={() => scrollToSection("how-it-works")} className="hover:underline cursor-pointer">How it works</button>
            <button onClick={() => scrollToSection("recent")} className="hover:underline cursor-pointer">Recent</button>
            <button onClick={() => scrollToSection("faq")} className="hover:underline cursor-pointer">FAQ</button>
            <button onClick={() => scrollToSection("about")} className="hover:underline cursor-pointer">About</button>
            <a
              href="https://github.com/aryanshaurya1012-collab/Quicksplit"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              GitHub <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-6 pt-6 border-t border-slate-200/60 dark:border-slate-800/60 text-center text-[11px] text-slate-400">
          &copy; {new Date().getFullYear()} QuickSplit. 100% Client-Side, Open Source under MIT License.
        </div>
      </footer>
    </div>
  );
}