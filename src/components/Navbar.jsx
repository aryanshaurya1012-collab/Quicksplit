import React, { useState } from "react";
import {
  Calculator,
  Handshake,
  BarChart3,
  History,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Share2,
  HelpCircle,
  Menu,
  X,
  ChevronDown
} from "lucide-react";
import { CURRENCIES } from "../constants";

export default function Navbar({
  currentTab,
  setCurrentTab,
  currency,
  setCurrency,
  theme,
  toggleTheme,
  soundEnabled,
  toggleSound,
  onShareLink,
  onOpenHelp,
  playTick
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const TABS = [
    { id: "calc", label: "Calculator", icon: Calculator },
    { id: "settle", label: "Settlements", icon: Handshake },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
    { id: "history", label: "Saved Bills", icon: History }
  ];

  const handleTabSelect = (tabId) => {
    playTick();
    setCurrentTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#0c0d12]/90 backdrop-blur-xl border-b border-slate-200/90 dark:border-white/5 transition-colors no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Link */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 select-none">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-500/25">
              <Calculator className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                QuickSplit
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/50">
                PRO
              </span>
            </div>
          </div>
        </div>

        {/* Center: Desktop Segmented View Tabs */}
        <nav className="hidden md:flex items-center p-1 rounded-xl bg-slate-100/90 dark:bg-white/5 border border-slate-200/80 dark:border-white/5 shadow-inner">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabSelect(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-white dark:bg-[#181a24] text-indigo-600 dark:text-indigo-400 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Toolbar Controls */}
        <div className="flex items-center gap-2">
          {/* Currency Dropdown */}
          <div className="relative">
            <select
              value={currency}
              onChange={(e) => {
                setCurrency(e.target.value);
                playTick();
              }}
              className="appearance-none text-xs font-bold px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-white/10 cursor-pointer pr-6 focus:outline-none transition-colors"
            >
              {Object.values(CURRENCIES).map((c) => (
                <option key={c.code} value={c.code} className="dark:bg-[#181a24] text-slate-900 dark:text-slate-100">
                  {c.code} ({c.symbol})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Share Link Button (Header) */}
          <button
            onClick={() => {
              playTick();
              onShareLink();
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800/60 text-xs font-bold transition-colors cursor-pointer"
            title="Copy shareable link"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-white/10 transition-colors cursor-pointer"
            title={soundEnabled ? "Mute audio" : "Enable audio"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-indigo-500" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-white/5 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-white/10 transition-colors cursor-pointer"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          {/* Help / Shortcuts Button */}
          <button
            onClick={() => {
              playTick();
              onOpenHelp();
            }}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-white/5 dark:hover:bg-white/10 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 border border-slate-200/80 dark:border-white/10 transition-colors cursor-pointer"
            title="Shortcuts & Docs"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200/80 dark:border-white/5 bg-white dark:bg-[#0c0d12] px-4 py-3 space-y-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabSelect(tab.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all text-left ${
                  isActive
                    ? "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
