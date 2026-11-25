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
  ChevronDown,
  Divide
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
    { id: "calc", label: "01 Calculator", icon: Calculator },
    { id: "settle", label: "02 Settlements", icon: Handshake },
    { id: "analytics", label: "03 Analytics", icon: BarChart3 },
    { id: "history", label: "04 Saved Bills", icon: History }
  ];

  const handleTabSelect = (tabId) => {
    playTick();
    setCurrentTab(tabId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#f5f2eb]/95 dark:bg-[#0f1115]/95 backdrop-blur-md border-b-2 border-[#1c1917] dark:border-[#2e323b] transition-colors no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Link */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 select-none cursor-pointer" onClick={() => handleTabSelect("calc")}>
            <div className="w-8 h-8 rounded-md bg-[#e05332] border-2 border-[#1c1917] dark:border-[#2e323b] flex items-center justify-center text-white shadow-hard-sm">
              <Divide className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-black text-xl tracking-tight font-heading text-[#1c1917] dark:text-[#f5f2eb]">
                QuickSplit
              </span>
              <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#e05332]/10 dark:bg-[#e05332]/20 text-[#e05332] border border-[#e05332]/40">
                PRO
              </span>
            </div>
          </div>
        </div>

        {/* Center: Segmented Dock */}
        <nav className="hidden md:flex items-center p-1 rounded-lg bg-[#ede7dc] dark:bg-[#15171c] border-2 border-[#1c1917] dark:border-[#2e323b] shadow-hard-sm">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabSelect(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-mono font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#ffffff] dark:bg-[#1e2129] text-[#e05332] dark:text-[#f97316] shadow-hard-sm"
                    : "text-[#756f68] hover:text-[#1c1917] dark:hover:text-white"
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
              className="appearance-none text-xs font-mono font-bold px-2.5 py-1.5 rounded-lg bg-[#ffffff] dark:bg-[#181a20] text-[#1f1d1a] dark:text-[#f5f2eb] border border-[#e3ded4] dark:border-white/10 cursor-pointer pr-6 focus:outline-none shadow-xs"
            >
              {Object.values(CURRENCIES).map((c) => (
                <option key={c.code} value={c.code} className="dark:bg-[#181a20] text-slate-900 dark:text-slate-100 font-mono">
                  {c.code} ({c.symbol})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-[#756f68] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Share Link Button */}
          <button
            onClick={() => {
              playTick();
              onShareLink();
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#e05332] hover:bg-[#c84324] text-white text-xs font-mono font-bold transition-colors cursor-pointer shadow-xs active:scale-95"
            title="Copy shareable link"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-2 rounded-lg bg-[#ffffff] hover:bg-[#e9e4d8] dark:bg-[#181a20] dark:hover:bg-white/10 text-[#645f57] dark:text-[#a39cae] border border-[#e3ded4] dark:border-white/10 transition-colors cursor-pointer shadow-xs"
            title={soundEnabled ? "Mute audio" : "Enable audio"}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-[#e05332]" /> : <VolumeX className="w-4 h-4 text-[#a39cae]" />}
          </button>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-[#ffffff] hover:bg-[#e9e4d8] dark:bg-[#181a20] dark:hover:bg-white/10 text-[#645f57] dark:text-[#a39cae] border border-[#e3ded4] dark:border-white/10 transition-colors cursor-pointer shadow-xs"
            title={theme === "dark" ? "Switch to warm light mode" : "Switch to obsidian dark mode"}
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-[#fbbf24]" /> : <Moon className="w-4 h-4 text-[#e05332]" />}
          </button>

          {/* Help / Shortcuts Button */}
          <button
            onClick={() => {
              playTick();
              onOpenHelp();
            }}
            className="p-2 rounded-lg bg-[#ffffff] hover:bg-[#e9e4d8] dark:bg-[#181a20] dark:hover:bg-white/10 text-[#645f57] dark:text-[#a39cae] border border-[#e3ded4] dark:border-white/10 transition-colors cursor-pointer shadow-xs"
            title="Shortcuts & Docs"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-[#ffffff] dark:bg-[#181a20] text-[#645f57] dark:text-slate-300 border border-[#e3ded4] dark:border-white/10 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#e3ded4] dark:border-white/10 bg-[#f5f2eb] dark:bg-[#0f1115] px-4 py-3 space-y-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabSelect(tab.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-mono font-bold transition-all text-left ${
                  isActive
                    ? "bg-[#e05332] text-white shadow-xs"
                    : "text-[#645f57] dark:text-[#a39cae] hover:bg-[#e9e4d8] dark:hover:bg-white/5"
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
