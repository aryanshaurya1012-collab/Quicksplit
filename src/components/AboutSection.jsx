import React from "react";
import { Calculator } from "lucide-react";

export default function AboutSection() {
  const stats = [
    { label: "Ad Trackers", val: "0", color: "text-indigo-600 dark:text-indigo-400" },
    { label: "Currencies", val: "9", color: "text-teal-600 dark:text-teal-400" },
    { label: "Client-Side", val: "100%", color: "text-purple-600 dark:text-purple-400" },
    { label: "Server Lag", val: "0ms", color: "text-emerald-600 dark:text-emerald-400" }
  ];

  return (
    <section id="about" className="py-12 border-t border-slate-200/80 dark:border-white/5 scroll-mt-20">
      <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-indigo-50/60 via-purple-50/30 to-teal-50/50 dark:from-[#141124] dark:via-[#16122a] dark:to-[#0f0c1d] border border-slate-200/90 dark:border-white/10 shadow-lg">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 block">
              About QuickSplit
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Built for dinner tables, not spreadsheets
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl">
              QuickSplit was crafted to make ending meals with friends effortless. No sign-ups, no downloading bulky apps, no intrusive ads — just clean math, fair splits, and clear digital receipts you can share instantly.
            </p>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="p-3.5 rounded-xl bg-white/80 dark:bg-white/5 border border-slate-200/80 dark:border-white/5 text-center shadow-xs"
                >
                  <span className={`text-2xl font-black font-mono ${s.color} block`}>
                    {s.val}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-4 flex justify-center">
            <div className="w-32 h-32 rounded-3xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-teal-400 flex items-center justify-center text-white shadow-2xl shadow-indigo-500/30">
              <Calculator className="w-16 h-16 animate-pulse-glow" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
