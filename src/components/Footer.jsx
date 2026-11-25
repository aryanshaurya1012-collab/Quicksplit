import React from "react";
import { ExternalLink, ShieldCheck, HelpCircle } from "lucide-react";

export default function Footer({ onSelectTab, onOpenHelp, playTick }) {
  return (
    <footer className="mt-16 border-t border-[#e3ded4] dark:border-white/10 py-8 bg-[#ffffff]/60 dark:bg-[#181a20]/60 text-xs text-[#756f68] dark:text-[#a39cae] no-print transition-colors font-mono">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* Keyboard Shortcuts Helper Pill */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center flex-wrap justify-center gap-2 sm:gap-4 px-4 py-2 rounded-full bg-[#f5f2eb] dark:bg-white/5 border border-[#e3ded4] dark:border-white/5 text-[11px] font-bold text-[#645f57] dark:text-[#a39cae] shadow-xs">
            <span className="text-[#e05332] uppercase tracking-wider text-[10px]">Shortcuts:</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-[#181a20] border border-[#e3ded4] dark:border-white/10 text-[#1f1d1a] dark:text-[#f5f2eb]">1-4</kbd> Views</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-[#181a20] border border-[#e3ded4] dark:border-white/10 text-[#1f1d1a] dark:text-[#f5f2eb]">C</kbd> Copy</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-[#181a20] border border-[#e3ded4] dark:border-white/10 text-[#1f1d1a] dark:text-[#f5f2eb]">S</kbd> Save</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-[#181a20] border border-[#e3ded4] dark:border-white/10 text-[#1f1d1a] dark:text-[#f5f2eb]">T</kbd> Theme</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-[#181a20] border border-[#e3ded4] dark:border-white/10 text-[#1f1d1a] dark:text-[#f5f2eb]">M</kbd> Mode</span>
            <span><kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-[#181a20] border border-[#e3ded4] dark:border-white/10 text-[#1f1d1a] dark:text-[#f5f2eb]">R</kbd> Reset</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-md bg-[#e05332] flex items-center justify-center text-white font-extrabold text-[10px]">
              Q
            </div>
            <span className="font-extrabold font-heading text-sm text-[#1f1d1a] dark:text-white">QuickSplit Pro</span>
            <span className="text-[#756f68]">• High-precision expense suite</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold">
            <button
              onClick={() => {
                playTick?.();
                onSelectTab("calc");
              }}
              className="hover:text-[#e05332] dark:hover:text-[#f97316] cursor-pointer transition-colors"
            >
              Calculator
            </button>
            <button
              onClick={() => {
                playTick?.();
                onSelectTab("settle");
              }}
              className="hover:text-[#e05332] dark:hover:text-[#f97316] cursor-pointer transition-colors"
            >
              Settlements
            </button>
            <button
              onClick={() => {
                playTick?.();
                onSelectTab("analytics");
              }}
              className="hover:text-[#e05332] dark:hover:text-[#f97316] cursor-pointer transition-colors"
            >
              Analytics
            </button>
            <button
              onClick={() => {
                playTick?.();
                onSelectTab("history");
              }}
              className="hover:text-[#e05332] dark:hover:text-[#f97316] cursor-pointer transition-colors"
            >
              Saved
            </button>
            <button
              onClick={() => {
                playTick?.();
                onOpenHelp();
              }}
              className="hover:text-[#e05332] dark:hover:text-[#f97316] cursor-pointer transition-colors flex items-center gap-1"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#e05332]" />
              Docs
            </button>
            <a
              href="https://github.com/aryanshaurya1012-collab/Quicksplit"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-[#e05332] dark:hover:text-[#f97316]"
            >
              GitHub <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-[#e3ded4] dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#756f68]">
          <div>
            &copy; {new Date().getFullYear()} QuickSplit Pro. Open Source under MIT License.
          </div>
          <div className="flex items-center gap-1.5 text-[#0d9488] font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            100% Client-Side • Zero Telemetry &bull; Safe Math
          </div>
        </div>
      </div>
    </footer>
  );
}
