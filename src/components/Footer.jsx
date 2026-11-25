import React from "react";
import { ExternalLink, ShieldCheck, HelpCircle } from "lucide-react";

export default function Footer({ onSelectTab, onOpenHelp, playTick }) {
  return (
    <footer className="mt-16 border-t border-slate-200/90 dark:border-white/5 py-8 bg-white/40 dark:bg-[#0c0d12]/40 text-xs text-slate-500 dark:text-slate-400 no-print transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Keyboard Shortcuts Helper Pill */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center flex-wrap justify-center gap-2 sm:gap-4 px-4 py-2 rounded-full bg-slate-100/90 dark:bg-white/5 border border-slate-200/80 dark:border-white/5 text-[11px] font-medium text-slate-600 dark:text-slate-400 shadow-xs">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Shortcuts:</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 font-mono font-bold text-slate-800 dark:text-slate-200">1-4</kbd> Views</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 font-mono font-bold text-slate-800 dark:text-slate-200">C</kbd> Copy</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 font-mono font-bold text-slate-800 dark:text-slate-200">S</kbd> Save</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 font-mono font-bold text-slate-800 dark:text-slate-200">T</kbd> Theme</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 font-mono font-bold text-slate-800 dark:text-slate-200">M</kbd> Mode</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 font-mono font-bold text-slate-800 dark:text-slate-200">R</kbd> Reset</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-extrabold text-[10px]">
              Q
            </div>
            <span className="font-extrabold text-sm text-slate-900 dark:text-white">QuickSplit Pro</span>
            <span className="text-slate-400">• High-precision fintech expense suite</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <button
              onClick={() => {
                playTick?.();
                onSelectTab("calc");
              }}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
            >
              Calculator
            </button>
            <button
              onClick={() => {
                playTick?.();
                onSelectTab("settle");
              }}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
            >
              Settlements
            </button>
            <button
              onClick={() => {
                playTick?.();
                onSelectTab("analytics");
              }}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
            >
              Analytics
            </button>
            <button
              onClick={() => {
                playTick?.();
                onSelectTab("history");
              }}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
            >
              Saved
            </button>
            <button
              onClick={() => {
                playTick?.();
                onOpenHelp();
              }}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
              Docs
            </button>
            <a
              href="https://github.com/aryanshaurya1012-collab/Quicksplit"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400"
            >
              GitHub <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200/60 dark:border-white/5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-400">
          <div>
            &copy; {new Date().getFullYear()} QuickSplit. Open Source under MIT License.
          </div>
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            100% Client-Side • Zero Telemetry &bull; Safe Math
          </div>
        </div>
      </div>
    </footer>
  );
}
