import React, { useState } from "react";
import { Tag, Percent, ReceiptText, ChevronDown, Check } from "lucide-react";
import { formatCurrency } from "../utils/currency.js";

export default function TaxAndDiscount({
  discountVal,
  setDiscountVal,
  discountType,
  setDiscountType,
  taxPercent,
  setTaxPercent,
  currency,
  discountAmount,
  taxAmount,
  playTick
}) {
  const [isOpen, setIsOpen] = useState(false);

  const discountPresets = [5, 10, 15, 20];
  const taxPresets = [0, 5, 8.25, 12, 18];

  return (
    <div className="bg-white dark:bg-[#141124] rounded-2xl border border-slate-200/90 dark:border-white/5 shadow-sm overflow-hidden transition-all">
      {/* Header Accordion Toggle */}
      <button
        type="button"
        onClick={() => {
          playTick();
          setIsOpen(!isOpen);
        }}
        className="w-full p-4 flex items-center justify-between text-left cursor-pointer hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-emerald-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Discounts &amp; Sales Tax / GST
          </span>
          {(discountAmount > 0 || taxAmount > 0) && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
              Active
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-mono font-bold text-slate-500 text-right hidden sm:block">
            {discountAmount > 0 && <span className="text-emerald-600 dark:text-emerald-400 mr-2">-{formatCurrency(discountAmount, currency)}</span>}
            {taxAmount > 0 && <span className="text-amber-600 dark:text-amber-400">+{formatCurrency(taxAmount, currency)}</span>}
          </div>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </div>
      </button>

      {/* Expanded Controls */}
      {isOpen && (
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-white/5 space-y-4 bg-slate-50/50 dark:bg-black/10">
          
          {/* Discount Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-emerald-500" />
                Voucher / Promo Discount
              </span>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/5 p-0.5 rounded-lg border border-slate-200 dark:border-white/10 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => {
                    playTick();
                    setDiscountType("percent");
                  }}
                  className={`px-2 py-0.5 rounded cursor-pointer ${discountType === "percent" ? "bg-white dark:bg-slate-800 text-emerald-600 shadow-xs" : "text-slate-400"}`}
                >
                  %
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playTick();
                    setDiscountType("amount");
                  }}
                  className={`px-2 py-0.5 rounded cursor-pointer ${discountType === "amount" ? "bg-white dark:bg-slate-800 text-emerald-600 shadow-xs" : "text-slate-400"}`}
                >
                  Flat
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder={discountType === "percent" ? "Discount % (e.g. 10)" : "Discount amount"}
                value={discountVal || ""}
                onChange={(e) => setDiscountVal(parseFloat(e.target.value) || 0)}
                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#181428] font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              {discountPresets.map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => {
                    playTick();
                    setDiscountType("percent");
                    setDiscountVal(pct);
                  }}
                  className="px-2 py-1.5 text-[11px] font-bold rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-emerald-50 text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  {pct}%
                </button>
              ))}
              {discountVal > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    playTick();
                    setDiscountVal(0);
                  }}
                  className="text-xs text-rose-500 font-bold px-1.5 cursor-pointer hover:underline"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Tax / GST Section */}
          <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-white/5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span className="flex items-center gap-1.5">
                <ReceiptText className="w-3.5 h-3.5 text-amber-500" />
                Sales Tax / GST / VAT Rate (%)
              </span>
              {taxAmount > 0 && (
                <span className="font-mono text-amber-600 dark:text-amber-400">
                  +{formatCurrency(taxAmount, currency)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="number"
                min="0"
                max="100"
                step="0.01"
                placeholder="Tax %"
                value={taxPercent || ""}
                onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)}
                className="w-24 px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#181428] font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              {taxPresets.map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => {
                    playTick();
                    setTaxPercent(pct);
                  }}
                  className={`px-2.5 py-1.5 text-[11px] font-bold rounded-lg border cursor-pointer ${
                    taxPercent === pct
                      ? "bg-amber-500 text-white border-amber-500 shadow-xs"
                      : "bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                  }`}
                >
                  {pct === 0 ? "0% (No Tax)" : `${pct}%`}
                </button>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
