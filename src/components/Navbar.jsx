import React, { useState } from "react";
import {
  Calculator,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  ChevronDown,
  Menu,
  X,
  Users,
  Receipt
} from "lucide-react";
import { CURRENCIES } from "../constants";

export default function Navbar({
  theme,
  toggleTheme,
  soundEnabled,
  toggleSound,
  currency,
  setCurrency,
  splitMode,
  setSplitMode,
  onNavigate,
  playTick
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (sectionId) => {
    playTick();
    setMobileMenuOpen(false);
    onNavigate(sectionId);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/85 dark:bg-[#0b0914]/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/5 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Link */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick("top");
          }}
          className="flex items-center gap-2.5 group cursor-pointer select-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 group-hover:shadow-indigo-500/40 transition-all duration-200">
            <Calculator className="w-5 h-5 transition-transform group-hover:rotate-6" />
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-indigo-600 to-teal-500 dark:from-indigo-400 dark:to-teal-300 bg-clip-text text-transparent">
            QuickSplit
          </span>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 text-xs font-semibold text-slate-600 dark:text-slate-300">
          {[
            { id: "calculator", label: "Calculator" },
            { id: "how-it-works", label: "How it works" },
            { id: "recent", label: "Recent splits" },
            { id: "faq", label: "FAQ" },
            { id: "about", label: "About" }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className="px-3 py-1.5 rounded-lg hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100/80 dark:hover:bg-white/5 transition-all cursor-pointer"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Controls: Mode Switcher, Audio, Currency, Theme, Mobile Hamburger */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Mode Switcher Tabs (Desktop) */}
          <div className="hidden lg:flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-white/5 shadow-inner">
            <button
              onClick={() => {
                playTick();
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
                playTick();
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
            onClick={toggleSound}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200/70 dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            aria-label={soundEnabled ? "Mute sounds" : "Enable sounds"}
            title={soundEnabled ? "Mute sounds" : "Enable sounds"}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-indigo-500" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* Currency Dropdown */}
          <div className="relative">
            <select
              value={currency}
              onChange={(e) => {
                playTick();
                setCurrency(e.target.value);
              }}
              className="appearance-none bg-slate-100 hover:bg-slate-200/70 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-xs sm:text-sm font-bold pl-2.5 pr-7 py-2 rounded-xl border border-slate-200 dark:border-white/5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
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
              playTick();
              toggleTheme();
            }}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200/70 dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            aria-label="Toggle theme"
            title="Toggle theme (Shortcut: T)"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4 text-amber-400 animate-pop" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600 animate-pop" />
            )}
          </button>

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => {
              playTick();
              setMobileMenuOpen(!mobileMenuOpen);
            }}
            className="md:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-white/5 bg-white/95 dark:bg-[#0b0914]/95 backdrop-blur-2xl px-4 py-4 space-y-3 animate-fade-in">
          {/* Mode Switcher in Mobile Drawer */}
          <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-white/5">
            <button
              onClick={() => {
                playTick();
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
                playTick();
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

          {/* Links Grid */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => handleNavClick("calculator")}
              className="p-2.5 rounded-xl text-left text-xs font-bold bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/5"
            >
              🧮 Calculator
            </button>
            <button
              onClick={() => handleNavClick("how-it-works")}
              className="p-2.5 rounded-xl text-left text-xs font-bold bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/5"
            >
              💡 How it works
            </button>
            <button
              onClick={() => handleNavClick("recent")}
              className="p-2.5 rounded-xl text-left text-xs font-bold bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/5"
            >
              🕒 Recent splits
            </button>
            <button
              onClick={() => handleNavClick("faq")}
              className="p-2.5 rounded-xl text-left text-xs font-bold bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/5"
            >
              ❓ FAQ
            </button>
            <button
              onClick={() => handleNavClick("about")}
              className="col-span-2 p-2.5 rounded-xl text-left text-xs font-bold bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/5"
            >
              ✨ About QuickSplit
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
