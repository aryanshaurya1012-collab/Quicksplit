import React from "react";
import { CreditCard, X } from "lucide-react";
import { CURRENCIES, QUICK_ADD_AMOUNTS } from "../constants";

export default function EqualSplitForm({
  billInput,
  setBillInput,
  currency,
  billInputRef,
  playTick,
  playBlipDown
}) {
  const quickAmounts = QUICK_ADD_AMOUNTS[currency] || QUICK_ADD_AMOUNTS.USD;
  const numericBill = parseFloat(billInput) || 0;

  const handleQuickAdd = (amt) => {
    playTick();
    setBillInput(String(numericBill + amt));
  };

  const handleClear = () => {
    playBlipDown();
    setBillInput("");
    if (billInputRef.current) {
      billInputRef.current.focus();
    }
  };

  return (
    <div className="bg-[#ffffff] dark:bg-[#15171c] rounded-xl p-5 border-2 border-[#1c1917] dark:border-[#2e323b] shadow-hard transition-all">
      <div className="flex items-center justify-between mb-3">
        <label
          htmlFor="bill-amount"
          className="text-xs font-mono font-bold uppercase tracking-wider text-[#756f68] dark:text-[#a39cae] flex items-center gap-1.5"
        >
          <CreditCard className="w-3.5 h-3.5 text-[#e05332]" />
          Bill Subtotal
        </label>
        {billInput && (
          <button
            onClick={handleClear}
            className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </div>

      {/* Financial Terminal Display Box */}
      <div className="flex items-center gap-3 p-4 sm:p-5 rounded-lg bg-[#f5f2eb] dark:bg-[#0f1115] border-2 border-[#1c1917] dark:border-[#2e323b] focus-within:border-[#e05332] dark:focus-within:border-[#e05332] transition-colors shadow-inner">
        <span className="text-3xl sm:text-4xl font-black text-[#e05332] dark:text-[#f97316] font-mono select-none">
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
          className="w-full bg-transparent text-3xl sm:text-5xl font-black font-mono tracking-tight focus:outline-none placeholder:text-[#dcd4c5] dark:placeholder:text-[#333742]"
        />
      </div>

      {/* Quick Add Mechanical Chips */}
      <div className="mt-4 flex items-center flex-wrap gap-2">
        <span className="text-xs font-mono text-[#756f68] font-medium">Quick Add:</span>
        {quickAmounts.map((amt) => (
          <button
            key={amt}
            onClick={() => handleQuickAdd(amt)}
            className="px-2.5 py-1 text-xs font-mono font-bold rounded-md bg-[#ffffff] hover:bg-[#e05332] hover:text-white dark:bg-[#1e2129] dark:hover:bg-[#e05332] text-[#1c1917] dark:text-[#f5f2eb] border-2 border-[#1c1917] dark:border-[#2e323b] shadow-hard-sm transition-all active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer"
          >
            +{amt}
          </button>
        ))}
      </div>
    </div>
  );
}
