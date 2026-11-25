import React, { useState } from "react";
import {
  Calendar,
  Tag,
  Share2,
  RotateCcw,
  Sparkles,
  FileText,
  Edit2,
  Check,
  Users
} from "lucide-react";
import { formatCurrency } from "../utils/currency.js";

const CATEGORIES = [
  { id: "Dining", label: "Dining & Drinks" },
  { id: "Travel", label: "Travel & Vacation" },
  { id: "Groceries", label: "Groceries & Supplies" },
  { id: "Office", label: "Office & Team" },
  { id: "Utilities", label: "Rent & Utilities" },
  { id: "Event", label: "Party & Event" }
];

export default function SessionHeader({
  sessionTitle,
  setSessionTitle,
  sessionCategory,
  setSessionCategory,
  currency,
  totalCheck,
  peopleCount,
  onOpenSmartPaste,
  onOpenSampleReceipts,
  onShareLink,
  onReset,
  playTick
}) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(sessionTitle);

  const handleSaveTitle = () => {
    if (tempTitle.trim()) {
      setSessionTitle(tempTitle.trim());
    } else {
      setTempTitle(sessionTitle);
    }
    setIsEditingTitle(false);
    playTick();
  };

  return (
    <div className="bg-[#ffffff] dark:bg-[#15171c] rounded-xl border-2 border-[#1c1917] dark:border-[#2e323b] p-4 sm:p-5 shadow-hard transition-all mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Left: Title & Category */}
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Category Dropdown */}
            <div className="relative inline-block">
              <select
                value={sessionCategory}
                onChange={(e) => {
                  setSessionCategory(e.target.value);
                  playTick();
                }}
                className="appearance-none text-[11px] font-mono font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-[#e05332]/10 dark:bg-[#e05332]/20 text-[#e05332] border border-[#e05332]/30 cursor-pointer pr-6 focus:outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id} className="dark:bg-[#181a20] text-[#1f1d1a] dark:text-[#f5f2eb] font-sans normal-case">
                    {cat.label}
                  </option>
                ))}
              </select>
              <Tag className="w-3 h-3 text-[#e05332] absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Date Tag */}
            <span className="flex items-center gap-1 text-[11px] font-mono text-[#756f68] dark:text-[#a39cae]">
              <Calendar className="w-3 h-3" />
              {new Date().toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>

          {/* Editable Session Title */}
          <div className="flex items-center gap-2">
            {isEditingTitle ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={tempTitle}
                  onChange={(e) => setTempTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveTitle();
                    if (e.key === "Escape") setIsEditingTitle(false);
                  }}
                  autoFocus
                  className="text-xl sm:text-2xl font-extrabold font-heading bg-[#f5f2eb] dark:bg-[#0f1115] border border-[#e05332] rounded-lg px-2.5 py-0.5 text-[#1f1d1a] dark:text-white focus:outline-none"
                />
                <button
                  onClick={handleSaveTitle}
                  className="p-1.5 rounded-lg bg-[#e05332] text-white hover:bg-[#c84324] cursor-pointer"
                  title="Save title"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group">
                <h1 className="text-xl sm:text-2xl font-extrabold font-heading tracking-tight text-[#1f1d1a] dark:text-white truncate">
                  {sessionTitle}
                </h1>
                <button
                  onClick={() => {
                    setTempTitle(sessionTitle);
                    setIsEditingTitle(true);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-[#756f68] hover:text-[#e05332] transition-opacity cursor-pointer"
                  title="Rename session"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right: Quick KPI badges & Toolbar */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap justify-between md:justify-end">
          {/* Total & People KPI */}
          <div className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-[#f5f2eb] dark:bg-[#0f1115] border border-[#e3ded4] dark:border-white/5 shadow-inner">
            <div>
              <span className="text-[10px] uppercase font-mono font-bold text-[#756f68] block tracking-wider">Total</span>
              <span className="font-extrabold text-base font-mono text-[#e05332] dark:text-[#f97316]">
                {formatCurrency(totalCheck, currency)}
              </span>
            </div>
            <div className="h-6 w-px bg-[#e3ded4] dark:bg-white/10" />
            <div>
              <span className="text-[10px] uppercase font-mono font-bold text-[#756f68] block tracking-wider">Group</span>
              <span className="font-bold text-xs text-[#1f1d1a] dark:text-slate-200 flex items-center gap-1 font-mono">
                <Users className="w-3 h-3 text-[#756f68]" />
                {peopleCount} {peopleCount === 1 ? "Person" : "People"}
              </span>
            </div>
          </div>

          {/* Action Stamp Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                playTick();
                onOpenSampleReceipts();
              }}
              className="px-2.5 py-2 rounded-lg bg-[#ffffff] hover:bg-[#f5f2eb] dark:bg-[#181a20] dark:hover:bg-white/10 text-xs font-mono font-bold text-[#1f1d1a] dark:text-[#f5f2eb] border border-[#e3ded4] dark:border-white/10 transition-all cursor-pointer flex items-center gap-1 active:scale-95 shadow-xs"
              title="Load pre-built dining scenario"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#d97706]" />
              <span className="hidden sm:inline">Templates</span>
            </button>

            <button
              onClick={() => {
                playTick();
                onOpenSmartPaste();
              }}
              className="px-2.5 py-2 rounded-lg bg-[#ffffff] hover:bg-[#f5f2eb] dark:bg-[#181a20] dark:hover:bg-white/10 text-xs font-mono font-bold text-[#1f1d1a] dark:text-[#f5f2eb] border border-[#e3ded4] dark:border-white/10 transition-all cursor-pointer flex items-center gap-1 active:scale-95 shadow-xs"
              title="Paste bill text from SMS/Swiggy/UberEats"
            >
              <FileText className="w-3.5 h-3.5 text-[#0d9488]" />
              <span className="hidden sm:inline">Smart Paste</span>
            </button>

            <button
              onClick={() => {
                playTick();
                onShareLink();
              }}
              className="px-3 py-2 rounded-lg bg-[#e05332] hover:bg-[#c84324] text-white text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs active:scale-95"
              title="Generate shareable URL"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share Link</span>
            </button>

            <button
              onClick={() => {
                playTick();
                onReset();
              }}
              className="p-2 rounded-lg bg-[#ffffff] hover:bg-rose-50 hover:text-rose-600 dark:bg-[#181a20] dark:hover:bg-rose-950/40 dark:hover:text-rose-400 text-[#756f68] border border-[#e3ded4] dark:border-white/10 transition-all cursor-pointer active:scale-95 shadow-xs"
              title="Reset workspace"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
