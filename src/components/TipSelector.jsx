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
    <div className="bg-[#ffffff] dark:bg-[#15171c] rounded-xl p-5 border-2 border-[#1c1917] dark:border-[#2e323b] shadow-hard transition-all">
      <div className="flex items-center justify-between mb-3">
        <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#756f68] dark:text-[#a39cae] flex items-center gap-1.5">
          <HeartHandshake className="w-3.5 h-3.5 text-[#e05332]" />
          Tip &amp; Gratuity Rate
        </label>
        <span className="text-xs font-mono font-bold text-[#e05332] dark:text-[#f97316]">
          {formatTip(activeTipRate)} = +{formatCurrency(tipAmount, currency)}
        </span>
      </div>

      {/* Tip Presets Buttons */}
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
              className={`py-2 rounded-md font-mono font-bold text-xs border-2 border-[#1c1917] dark:border-[#2e323b] transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer ${
                isActive
                  ? "bg-[#e05332] text-white shadow-hard-sm"
                  : "bg-[#f5f2eb] dark:bg-[#1e2129] hover:bg-[#ede7dc] dark:hover:bg-[#252934] text-[#1c1917] dark:text-[#f5f2eb]"
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
            className={`w-full py-2 pl-3 pr-8 rounded-md text-xs font-mono font-bold border-2 ${
              isCustomTip
                ? "border-[#e05332] bg-white dark:bg-[#1e2129]"
                : "border-[#1c1917] dark:border-[#2e323b] bg-[#f5f2eb] dark:bg-[#0f1115]"
            } focus:outline-none transition-all`}
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-[#756f68] select-none">
            %
          </span>
        </div>
      </div>
    </div>
  );
}
