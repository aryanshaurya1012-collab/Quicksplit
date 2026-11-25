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
      <div className="bg-white dark:bg-[#11131a] w-full max-w-xl rounded-3xl p-6 border border-slate-200 dark:border-white/10 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
              QuickSplit Guide & Reference
            </h3>
            <p className="text-xs text-slate-400">
              Professional expense calculations with zero server telemetry.
            </p>
          </div>
        </div>

        <div className="space-y-6 pt-2 text-xs">
          {/* Keyboard Shortcuts */}
          <div>
            <h4 className="font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
              <Keyboard className="w-3.5 h-3.5 text-indigo-500" />
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
                  className="p-2 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/5 flex items-center justify-between"
                >
                  <span className="font-bold text-indigo-600 dark:text-indigo-400">
                    [{item.key}]
                  </span>
                  <span className="font-sans text-slate-600 dark:text-slate-300">
                    {item.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Mathematical Integrity */}
          <div>
            <h4 className="font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
              <Calculator className="w-3.5 h-3.5 text-teal-500" />
              Calculation Logic
            </h4>
            <div className="space-y-2 text-slate-600 dark:text-slate-300 leading-relaxed font-sans">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/5">
                <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                  Floating-Point Precision
                </span>
                Calculations execute via safe 2-decimal epsilon rounding to eliminate IEEE 754 precision inaccuracies (e.g. $220.00000000000003).
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/5">
                <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                  Round-Up Ceiling Policy
                </span>
                When Round-Up is enabled, per-person shares ceiling up to the nearest whole integer. Excess fractional difference is credited directly to the server's tip bonus.
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/5">
                <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                  Optimal Debt Minimization
                </span>
                The Settlement tab runs a greedy debt matching algorithm that calculates the absolute fewest direct bank transfers between participants.
              </div>
            </div>
          </div>

          {/* Privacy & Offline Architecture */}
          <div>
            <h4 className="font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              100% Offline & Private
            </h4>
            <p className="text-slate-600 dark:text-slate-300 font-sans leading-relaxed">
              QuickSplit operates entirely inside your local browser runtime. All calculations, state storage, QR generation, deep-link compression, and image rendering are performed client-side with zero telemetry or network calls.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/5 text-center">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
