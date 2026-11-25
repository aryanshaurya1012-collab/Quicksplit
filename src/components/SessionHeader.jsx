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
  Download,
  Users
} from "lucide-react";
import { formatCurrency } from "../utils/currency.js";

const CATEGORIES = [
  { id: "Dining", label: "🍽️ Dining & Drinks" },
  { id: "Travel", label: "✈️ Travel & Vacation" },
  { id: "Groceries", label: "🛒 Groceries & Supplies" },
  { id: "Office", label: "💼 Office & Team" },
  { id: "Utilities", label: "⚡ Rent & Utilities" },
  { id: "Event", label: "🎉 Party & Event" }
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
    <div className="bg-white dark:bg-[#11131a] rounded-2xl border border-slate-200/90 dark:border-white/5 p-4 sm:p-5 shadow-sm transition-all mb-6">
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
                className="appearance-none text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/50 cursor-pointer pr-6 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id} className="dark:bg-[#181428] text-slate-800 dark:text-slate-100 normal-case">
                    {cat.label}
                  </option>
                ))}
              </select>
              <Tag className="w-3 h-3 text-indigo-500 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Date Tag */}
            <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
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
                  className="text-xl sm:text-2xl font-extrabold bg-slate-50 dark:bg-[#181428] border border-indigo-400 rounded-lg px-2 py-0.5 text-slate-900 dark:text-white focus:outline-none"
                />
                <button
                  onClick={handleSaveTitle}
                  className="p-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 cursor-pointer"
                  title="Save title"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 group">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white truncate">
                  {sessionTitle}
                </h1>
                <button
                  onClick={() => {
                    setTempTitle(sessionTitle);
                    setIsEditingTitle(true);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-indigo-600 transition-opacity cursor-pointer"
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
          <div className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/5">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Total</span>
              <span className="font-extrabold text-base font-mono text-indigo-600 dark:text-indigo-400">
                {formatCurrency(totalCheck, currency)}
              </span>
            </div>
            <div className="h-6 w-px bg-slate-200 dark:bg-white/10" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Group</span>
              <span className="font-bold text-xs text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Users className="w-3 h-3 text-slate-400" />
                {peopleCount} {peopleCount === 1 ? "Person" : "People"}
              </span>
            </div>
          </div>

          {/* Action Chips */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                playTick();
                onOpenSampleReceipts();
              }}
              className="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-white/5 dark:hover:bg-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 transition-all cursor-pointer flex items-center gap-1 active:scale-95"
              title="Load pre-built dining scenario"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Templates</span>
            </button>

            <button
              onClick={() => {
                playTick();
                onOpenSmartPaste();
              }}
              className="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-white/5 dark:hover:bg-white/10 text-xs font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 transition-all cursor-pointer flex items-center gap-1 active:scale-95"
              title="Paste bill text from SMS/Swiggy/UberEats"
            >
              <FileText className="w-3.5 h-3.5 text-teal-500" />
              <span className="hidden sm:inline">Smart Paste</span>
            </button>

            <button
              onClick={() => {
                playTick();
                onShareLink();
              }}
              className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
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
              className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 dark:bg-white/5 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 text-slate-500 border border-slate-200 dark:border-white/10 transition-all cursor-pointer active:scale-95"
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
