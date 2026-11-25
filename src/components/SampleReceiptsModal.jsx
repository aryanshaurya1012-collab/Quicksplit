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
      <div className="bg-[#ffffff] dark:bg-[#181a20] w-full max-w-md rounded-2xl p-6 border border-[#e3ded4] dark:border-white/10 shadow-2xl relative font-sans">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-[#f5f2eb] dark:bg-white/5 text-[#756f68] hover:text-[#1f1d1a] dark:hover:text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-10 h-10 rounded-xl bg-[#e05332]/10 text-[#e05332] flex items-center justify-center mx-auto mb-3 shadow-xs">
          <Utensils className="w-5 h-5" />
        </div>

        <h3 className="font-extrabold text-lg font-heading text-center text-[#1f1d1a] dark:text-white">Load Preset Dining Check</h3>
        <p className="text-xs font-mono text-[#756f68] dark:text-[#a39cae] text-center mb-4">
          Select a realistic scenario to explore QuickSplit Pro's itemized math and tax engines.
        </p>

        <div className="space-y-3 font-mono">
          {sampleData.map((sample) => (
            <div
              key={sample.id}
              onClick={() => {
                playTick();
                onLoadSample(sample);
                onClose();
              }}
              className="p-3.5 rounded-xl border border-[#e3ded4] dark:border-white/10 hover:border-[#e05332] bg-[#f5f2eb]/60 dark:bg-white/5 cursor-pointer transition-all hover:scale-[1.01] group shadow-xs"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm font-heading text-[#1f1d1a] dark:text-white">{sample.title}</span>
                <span className="text-[11px] font-mono font-bold text-[#e05332]">{sample.currency}</span>
              </div>
              <p className="text-xs text-[#756f68] dark:text-[#a39cae]">
                {sample.items.length} items · {sample.taxPercent}% tax · {sample.tipPercent}% tip
                {sample.discount > 0 ? ` · ${sample.discount}${sample.discountType === "percent" ? "%" : ""} off` : ""}
              </p>
              <div className="mt-2 text-[11px] font-bold text-[#e05332] flex items-center gap-1 group-hover:underline">
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
