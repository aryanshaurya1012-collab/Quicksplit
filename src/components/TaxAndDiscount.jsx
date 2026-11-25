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
    <div className="bg-[#ffffff] dark:bg-[#15171c] rounded-xl border-2 border-[#1c1917] dark:border-[#2e323b] shadow-hard overflow-hidden transition-all">
      {/* Header Accordion Toggle */}
      <button
        type="button"
        onClick={() => {
          playTick();
          setIsOpen(!isOpen);
        }}
        className="w-full p-4 flex items-center justify-between text-left cursor-pointer hover:bg-[#f5f2eb]/60 dark:hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-[#0d9488]" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#1f1d1a] dark:text-[#f5f2eb]">
            Discounts &amp; Sales Tax / GST
          </span>
          {(discountAmount > 0 || taxAmount > 0) && (
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#0d9488]/10 text-[#0d9488] border border-[#0d9488]/30">
              Active
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-mono font-bold text-[#756f68] text-right hidden sm:block">
            {discountAmount > 0 && <span className="text-[#0d9488] mr-2">-{formatCurrency(discountAmount, currency)}</span>}
            {taxAmount > 0 && <span className="text-[#d97706]">+{formatCurrency(taxAmount, currency)}</span>}
          </div>
          <ChevronDown className={`w-4 h-4 text-[#756f68] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
        </div>
      </button>

      {/* Expanded Controls */}
      {isOpen && (
        <div className="p-4 sm:p-5 border-t border-[#e3ded4] dark:border-white/10 space-y-4 bg-[#f5f2eb]/50 dark:bg-black/10">
          
          {/* Discount Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono font-bold text-[#1f1d1a] dark:text-[#f5f2eb] flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#0d9488]" />
                Voucher / Promo Discount
              </span>
              <div className="flex items-center gap-1 bg-[#ffffff] dark:bg-[#181a20] p-0.5 rounded-lg border border-[#e3ded4] dark:border-white/10 text-[11px] font-mono font-bold">
                <button
                  type="button"
                  onClick={() => {
                    playTick();
                    setDiscountType("percent");
                  }}
                  className={`px-2 py-0.5 rounded cursor-pointer ${discountType === "percent" ? "bg-[#e05332] text-white shadow-xs" : "text-[#756f68]"}`}
                >
                  %
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playTick();
                    setDiscountType("amount");
                  }}
                  className={`px-2 py-0.5 rounded cursor-pointer ${discountType === "amount" ? "bg-[#e05332] text-white shadow-xs" : "text-[#756f68]"}`}
                >
                  Flat
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                step="any"
                placeholder={discountType === "percent" ? "Discount % (e.g. 10)" : "Discount amount"}
                value={discountVal || ""}
                onChange={(e) => setDiscountVal(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 text-xs font-mono font-bold rounded-lg bg-white dark:bg-[#181a20] border border-[#e3ded4] dark:border-white/10 focus:outline-none focus:border-[#e05332]"
              />
              <div className="flex gap-1">
                {discountPresets.map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => {
                      playTick();
                      setDiscountType("percent");
                      setDiscountVal(pct);
                    }}
                    className={`px-2 py-1 text-[11px] font-mono font-bold rounded-md border cursor-pointer transition-all ${
                      discountType === "percent" && discountVal === pct
                        ? "bg-[#e05332] text-white border-[#e05332]"
                        : "bg-white dark:bg-[#181a20] text-[#756f68] border-[#e3ded4] dark:border-white/10 hover:border-[#e05332]"
                    }`}
                  >
                    {pct}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tax Section */}
          <div className="space-y-2 pt-2 border-t border-[#e3ded4] dark:border-white/10">
            <div className="flex items-center justify-between text-xs">
              <span className="font-mono font-bold text-[#1f1d1a] dark:text-[#f5f2eb] flex items-center gap-1.5">
                <ReceiptText className="w-3.5 h-3.5 text-[#d97706]" />
                Sales Tax / GST / VAT
              </span>
              <span className="text-[11px] font-mono text-[#756f68]">
                {taxPercent}% (+{formatCurrency(taxAmount, currency)})
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                step="0.1"
                placeholder="Tax rate %"
                value={taxPercent || ""}
                onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-1.5 text-xs font-mono font-bold rounded-lg bg-white dark:bg-[#181a20] border border-[#e3ded4] dark:border-white/10 focus:outline-none focus:border-[#e05332]"
              />
              <div className="flex gap-1 flex-wrap">
                {taxPresets.map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => {
                      playTick();
                      setTaxPercent(rate);
                    }}
                    className={`px-2 py-1 text-[11px] font-mono font-bold rounded-md border cursor-pointer transition-all ${
                      taxPercent === rate
                        ? "bg-[#e05332] text-white border-[#e05332]"
                        : "bg-white dark:bg-[#181a20] text-[#756f68] border-[#e3ded4] dark:border-white/10 hover:border-[#e05332]"
                    }`}
                  >
                    {rate}%
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
