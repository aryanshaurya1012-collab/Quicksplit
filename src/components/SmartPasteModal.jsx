import React, { useState, useMemo } from "react";
import { X, Sparkles, Plus, Check } from "lucide-react";
import { parseReceiptText } from "../utils/parser.js";
import { formatCurrency } from "../utils/currency.js";

export default function SmartPasteModal({
  isOpen,
  onClose,
  friends,
  currency,
  onImportItems,
  showToast,
  playTick
}) {
  const [rawText, setRawText] = useState("");

  const parsedItems = useMemo(() => {
    return parseReceiptText(rawText, friends);
  }, [rawText, friends]);

  if (!isOpen) return null;

  const handleApply = () => {
    if (parsedItems.length === 0) {
      showToast("No valid line items detected. Check format: e.g. 'Pizza 450'");
      return;
    }
    playTick();
    onImportItems(parsedItems);
    setRawText("");
    onClose();
    showToast(`Imported ${parsedItems.length} items into Itemized Order! ✨`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in no-print">
      <div className="bg-white dark:bg-[#141124] w-full max-w-lg rounded-3xl p-6 border border-slate-200 dark:border-white/10 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mx-auto mb-3 shadow-xs">
          <Sparkles className="w-6 h-6" />
        </div>

        <h3 className="font-extrabold text-lg text-center">Smart Receipt Text Parser</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center mb-4">
          Paste text from an SMS, email, Swiggy, Zomato, or UberEats receipt to auto-import line items.
        </p>

        <textarea
          rows={5}
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder={`Paste receipt text here, e.g.:\n2x Margherita Pizza 450\n1 Garlic Bread 180\n2 Craft Beers 600`}
          className="w-full p-3 text-xs font-mono rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#181428] focus:outline-none focus:ring-2 focus:ring-teal-500 mb-3"
        />

        {/* Live Detected Preview */}
        {parsedItems.length > 0 && (
          <div className="mb-4 space-y-1.5 max-h-40 overflow-y-auto pr-1">
            <span className="text-[11px] font-bold uppercase text-teal-600 dark:text-teal-400 block">
              Detected ({parsedItems.length} items):
            </span>
            {parsedItems.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-lg bg-teal-50/50 dark:bg-teal-950/20 border border-teal-200/60 dark:border-teal-900/40 text-xs"
              >
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{item.name}</span>
                <span className="font-mono font-bold text-teal-600 dark:text-teal-400">
                  {formatCurrency(Number(item.price), currency)}
                </span>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleApply}
          disabled={parsedItems.length === 0}
          className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-600 active:scale-95 disabled:opacity-40 disabled:pointer-events-none text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-teal-500/25"
        >
          <Plus className="w-4 h-4" />
          <span>Import {parsedItems.length > 0 ? `${parsedItems.length} Items` : "Items"} into Order</span>
        </button>
      </div>
    </div>
  );
}
