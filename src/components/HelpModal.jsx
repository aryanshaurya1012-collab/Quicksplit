import React from "react";
import {
  X,
  Keyboard,
  ShieldCheck,
  Calculator,
  HelpCircle,
  CheckCircle2,
  FileText
} from "lucide-react";

export default function HelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in no-print">
      <div className="bg-[#ffffff] dark:bg-[#181a20] w-full max-w-xl rounded-2xl p-6 border border-[#e3ded4] dark:border-white/10 shadow-2xl relative max-h-[90vh] overflow-y-auto font-sans">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-[#f5f2eb] dark:bg-white/5 text-[#756f68] hover:text-[#1f1d1a] dark:hover:text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-lg bg-[#e05332]/10 text-[#e05332] flex items-center justify-center">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg font-heading text-[#1f1d1a] dark:text-white">
              QuickSplit Pro Reference
            </h3>
            <p className="text-xs font-mono text-[#756f68] dark:text-[#a39cae]">
              High-precision expense suite with zero server telemetry.
            </p>
          </div>
        </div>

        <div className="space-y-6 pt-2 text-xs">
          {/* Keyboard Shortcuts */}
          <div>
            <h4 className="font-mono font-bold uppercase tracking-wider text-[#756f68] mb-2.5 flex items-center gap-1.5">
              <Keyboard className="w-3.5 h-3.5 text-[#e05332]" />
              Keyboard Shortcuts
            </h4>
            <div className="grid grid-cols-2 gap-2 font-mono">
              {[
                { key: "1 - 4", desc: "Switch view tabs" },
                { key: "M", desc: "Toggle Equal / Itemized mode" },
                { key: "C", desc: "Copy receipt summary" },
                { key: "S", desc: "Save to local history" },
                { key: "T", desc: "Toggle Dark / Light mode" },
                { key: "R", desc: "Reset active workspace" }
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-lg bg-[#f5f2eb] dark:bg-white/5 border border-[#e3ded4] dark:border-white/5 flex items-center justify-between"
                >
                  <span className="font-bold text-[#e05332] dark:text-[#f97316]">
                    [{item.key}]
                  </span>
                  <span className="font-sans text-[#1f1d1a] dark:text-[#f5f2eb]">
                    {item.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Mathematical Integrity */}
          <div>
            <h4 className="font-mono font-bold uppercase tracking-wider text-[#756f68] mb-2.5 flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-[#0d9488]" />
              Calculation Logic
            </h4>
            <div className="space-y-2 text-[#645f57] dark:text-[#a39cae] leading-relaxed font-sans">
              <div className="p-3 rounded-xl bg-[#f5f2eb] dark:bg-white/5 border border-[#e3ded4] dark:border-white/5">
                <span className="font-bold text-[#1f1d1a] dark:text-white block mb-0.5">
                  Floating-Point Precision
                </span>
                Calculations execute via safe 2-decimal epsilon rounding to eliminate IEEE 754 precision inaccuracies (e.g. $220.00000000000003).
              </div>
              <div className="p-3 rounded-xl bg-[#f5f2eb] dark:bg-white/5 border border-[#e3ded4] dark:border-white/5">
                <span className="font-bold text-[#1f1d1a] dark:text-white block mb-0.5">
                  Round-Up Ceiling Policy
                </span>
                When Round-Up is enabled, per-person shares ceiling up to the nearest whole integer. Excess fractional difference is credited directly to the server's tip bonus.
              </div>
              <div className="p-3 rounded-xl bg-[#f5f2eb] dark:bg-white/5 border border-[#e3ded4] dark:border-white/5">
                <span className="font-bold text-[#1f1d1a] dark:text-white block mb-0.5">
                  Optimal Debt Minimization
                </span>
                The Settlement tab runs a greedy debt matching algorithm that calculates the absolute fewest direct bank transfers between participants.
              </div>
            </div>
          </div>

          {/* Privacy & Offline Architecture */}
          <div>
            <h4 className="font-mono font-bold uppercase tracking-wider text-[#756f68] mb-2.5 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#0d9488]" />
              100% Offline &amp; Private
            </h4>
            <p className="text-[#645f57] dark:text-[#a39cae] font-sans leading-relaxed">
              QuickSplit Pro operates entirely inside your local browser runtime. All calculations, state storage, QR generation, deep-link compression, and image rendering are performed client-side with zero telemetry or network calls.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-[#e3ded4] dark:border-white/10 text-center">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-[#e05332] hover:bg-[#c84324] text-white font-mono font-bold text-xs transition-colors cursor-pointer shadow-xs"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
