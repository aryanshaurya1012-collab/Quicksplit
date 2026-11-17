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
    <div className="bg-white dark:bg-[#141124] rounded-2xl p-5 sm:p-6 border border-slate-200/90 dark:border-white/5 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-2.5">
        <label
          htmlFor="bill-amount"
          className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5"
        >
          <CreditCard className="w-3.5 h-3.5 text-indigo-500" />
          Bill Amount (Subtotal)
        </label>
        {billInput && (
          <button
            onClick={handleClear}
            className="text-xs text-rose-500 hover:text-rose-600 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <X className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </div>

      {/* Big Currency + Amount Box */}
      <div className="flex items-center gap-2 p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-[#181428] border-2 border-slate-200 dark:border-white/10 focus-within:border-indigo-500 dark:focus-within:border-indigo-400 transition-colors shadow-inner">
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
          className="w-full bg-transparent text-2xl sm:text-4xl font-extrabold tracking-tight focus:outline-none font-mono placeholder:text-slate-300 dark:placeholder:text-slate-700"
        />
      </div>

      {/* Quick Add Chips */}
      <div className="mt-3.5 flex items-center flex-wrap gap-2">
        <span className="text-xs text-slate-400 font-medium">Quick add:</span>
        {quickAmounts.map((amt) => (
          <button
            key={amt}
            onClick={() => handleQuickAdd(amt)}
            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 hover:bg-indigo-50 dark:bg-white/5 dark:hover:bg-indigo-950/60 text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-white/10 transition-all active:scale-95 cursor-pointer"
          >
            +{amt}
          </button>
        ))}
      </div>
    </div>
  );
}
