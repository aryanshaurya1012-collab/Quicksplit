import React from "react";
import { HeartHandshake } from "lucide-react";
import { TIP_PRESETS } from "../constants";
import { formatCurrency, formatTip } from "../utils/currency";

export default function TipSelector({
  tipPercent,
  setTipPercent,
  isCustomTip,
  setIsCustomTip,
  customTipInput,
  setCustomTipInput,
  activeTipRate,
  tipAmount,
  currency,
  playTipChime
}) {
  return (
    <div className="bg-white dark:bg-[#141124] rounded-2xl p-5 sm:p-6 border border-slate-200/90 dark:border-white/5 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <HeartHandshake className="w-3.5 h-3.5 text-pink-500" />
          Select Tip Rate
        </label>
        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
          {formatTip(activeTipRate)} = {formatCurrency(tipAmount, currency)}
        </span>
      </div>

      {/* Tip Presets with Musical Pentatonic Chimes */}
      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
        {TIP_PRESETS.map((pct) => {
          const isActive = !isCustomTip && tipPercent === pct;
          return (
            <button
              key={pct}
              onClick={() => {
                playTipChime(pct);
                setIsCustomTip(false);
                setTipPercent(pct);
              }}
              className={`py-2.5 rounded-xl font-bold text-sm border transition-all active:scale-95 cursor-pointer ${
                isActive
                  ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/25 scale-[1.02]"
                  : "bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300"
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
                : "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#181428]"
            } focus:outline-none transition-all`}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400 select-none">
            %
          </span>
        </div>
      </div>
    </div>
  );
}
