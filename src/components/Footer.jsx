import React from "react";
import { ExternalLink } from "lucide-react";

export default function Footer({ onNavigate }) {
  return (
    <footer className="mt-20 border-t border-slate-200 dark:border-white/5 py-10 bg-white/50 dark:bg-[#0b0914]/50 text-xs text-slate-500 dark:text-slate-400 no-print transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Keyboard Shortcuts Helper Pill */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center flex-wrap justify-center gap-2 sm:gap-4 px-4 py-2 rounded-full bg-slate-100/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/5 text-[11px] font-medium text-slate-600 dark:text-slate-400 shadow-xs">
            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Shortcuts:</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 font-mono font-bold text-slate-800 dark:text-slate-200">C</kbd> Copy</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 font-mono font-bold text-slate-800 dark:text-slate-200">S</kbd> Save</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 font-mono font-bold text-slate-800 dark:text-slate-200">T</kbd> Theme</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 font-mono font-bold text-slate-800 dark:text-slate-200">M</kbd> Mode</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 font-mono font-bold text-slate-800 dark:text-slate-200">R</kbd> Reset</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
              Q
            </div>
            <span className="font-bold text-sm text-slate-800 dark:text-slate-200">QuickSplit</span>
            <span>— Split the bill, share the smiles.</span>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => onNavigate("calculator")} className="hover:underline cursor-pointer">Calculator</button>
            <button onClick={() => onNavigate("how-it-works")} className="hover:underline cursor-pointer">How it works</button>
            <button onClick={() => onNavigate("recent")} className="hover:underline cursor-pointer">Recent</button>
            <button onClick={() => onNavigate("faq")} className="hover:underline cursor-pointer">FAQ</button>
            <button onClick={() => onNavigate("about")} className="hover:underline cursor-pointer">About</button>
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

        <div className="mt-6 pt-6 border-t border-slate-200/60 dark:border-white/5 text-center text-[11px] text-slate-400">
          &copy; {new Date().getFullYear()} QuickSplit. 100% Client-Side &amp; Offline Ready. Open Source under MIT License.
        </div>
      </div>
    </footer>
  );
}
