import React, { useState, useMemo } from "react";
import { X, Sparkles, Plus, Check, FileText } from "lucide-react";
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
      <div className="bg-[#ffffff] dark:bg-[#181a20] w-full max-w-lg rounded-2xl p-6 border border-[#e3ded4] dark:border-white/10 shadow-2xl relative font-sans">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-[#f5f2eb] dark:bg-white/5 text-[#756f68] hover:text-[#1f1d1a] dark:hover:text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-10 h-10 rounded-xl bg-[#0d9488]/10 text-[#0d9488] flex items-center justify-center mx-auto mb-3 shadow-xs">
          <FileText className="w-5 h-5" />
        </div>

        <h3 className="font-extrabold text-lg font-heading text-center text-[#1f1d1a] dark:text-white">Smart Receipt Text Parser</h3>
        <p className="text-xs font-mono text-[#756f68] dark:text-[#a39cae] text-center mb-4">
          Paste text from an SMS, email, Swiggy, Zomato, or UberEats receipt to auto-import line items.
        </p>

        <textarea
          rows={5}
          value={rawText}
          onChange={(e) => setRawText(e.target.value)}
          placeholder={`Paste receipt text here, e.g.:\n2x Margherita Pizza 450\n1 Garlic Bread 180\n2 Craft Beers 600`}
          className="w-full p-3 text-xs font-mono rounded-xl border border-[#e3ded4] dark:border-white/10 bg-[#f5f2eb] dark:bg-[#0f1115] focus:outline-none focus:border-[#e05332] mb-3"
        />

        {/* Live Detected Preview */}
        {parsedItems.length > 0 && (
          <div className="mb-4 space-y-1.5 max-h-40 overflow-y-auto pr-1 font-mono">
            <span className="text-[11px] font-bold uppercase text-[#0d9488] block">
              Detected ({parsedItems.length} items):
            </span>
            {parsedItems.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-lg bg-[#0d9488]/10 border border-[#0d9488]/20 text-xs"
              >
                <span className="font-semibold truncate text-[#1f1d1a] dark:text-[#f5f2eb]">{item.name}</span>
                <span className="font-black text-[#0d9488]">
                  {formatCurrency(Number(item.price), currency)}
                </span>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={handleApply}
          disabled={parsedItems.length === 0}
          className="w-full py-2.5 rounded-lg bg-[#e05332] hover:bg-[#c84324] active:scale-95 disabled:opacity-40 disabled:pointer-events-none text-white font-mono font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Import {parsedItems.length > 0 ? `${parsedItems.length} Items` : "Items"} into Order</span>
        </button>
      </div>
    </div>
  );
}
