import React from "react";
import { X, Utensils, ArrowRight } from "lucide-react";
import sampleData from "../../assets/sample-receipts.json";

export default function SampleReceiptsModal({
  isOpen,
  onClose,
  onLoadSample,
  playTick
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in no-print">
      <div className="bg-white dark:bg-[#141124] w-full max-w-md rounded-3xl p-6 border border-slate-200 dark:border-white/10 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3 shadow-xs">
          <Utensils className="w-6 h-6" />
        </div>

        <h3 className="font-extrabold text-lg text-center">Load Preset Dining Check</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center mb-4">
          Pick an example check to explore QuickSplit's itemized math, taxes, and discounts immediately.
        </p>

        <div className="space-y-3">
          {sampleData.map((sample) => (
            <div
              key={sample.id}
              onClick={() => {
                playTick();
                onLoadSample(sample);
                onClose();
              }}
              className="p-3.5 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-amber-400 dark:hover:border-amber-500 bg-slate-50/50 dark:bg-white/5 cursor-pointer transition-all hover:scale-[1.01] group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm text-slate-900 dark:text-white">{sample.title}</span>
                <span className="text-[11px] font-mono font-bold text-slate-400">{sample.currency}</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {sample.items.length} items · {sample.taxPercent}% tax · {sample.tipPercent}% tip
                {sample.discount > 0 ? ` · ${sample.discount}${sample.discountType === "percent" ? "%" : ""} off` : ""}
              </p>
              <div className="mt-2 text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 group-hover:underline">
                <span>Load this check</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
