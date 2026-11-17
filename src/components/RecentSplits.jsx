import React from "react";
import { Calculator, Trash2, ArrowRight } from "lucide-react";
import { formatCurrency } from "../utils/currency";

export default function RecentSplits({
  history,
  onRestore,
  onDelete,
  onClearAll
}) {
  return (
    <section id="recent" className="py-12 border-t border-slate-200/80 dark:border-white/5 no-print scroll-mt-20">
      <div className="flex items-center justify-between mb-6">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 block mb-1">
            Saved Locally
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">Recent Splits</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Calculations saved in your browser's localStorage with one-click Restore or Delete.
          </p>
        </div>
        {history.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-xs font-bold text-rose-500 hover:text-rose-600 px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
          >
            Clear All
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5">
          <Calculator className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">No recent splits yet</p>
          <p className="text-xs text-slate-400 mt-0.5">Calculate a bill and tap "Save", "Copy", or "Share" to store it here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {history.map((item) => (
            <div
              key={item.id}
              onClick={() => onRestore(item)}
              className="bg-white dark:bg-[#141124] p-4 rounded-2xl border border-slate-200 dark:border-white/10 hover:border-indigo-400 dark:hover:border-indigo-500 cursor-pointer shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group relative"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-mono text-slate-400">
                  {new Date(item.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </span>
                <button
                  onClick={(e) => onDelete(item.id, e)}
                  className="p-1 text-slate-400 hover:text-rose-500 rounded-md transition-colors cursor-pointer"
                  title="Delete split"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="text-xl font-extrabold font-mono text-indigo-600 dark:text-indigo-400">
                {item.mode === "itemized"
                  ? formatCurrency(item.total, item.currency)
                  : formatCurrency(item.perPerson, item.currency)}
                <span className="text-xs font-normal text-slate-400 ml-1">
                  {item.mode === "itemized" ? "total" : "/ person"}
                </span>
              </div>

              <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
                <div>
                  Mode: <span className="font-semibold capitalize text-slate-700 dark:text-slate-300">{item.mode || "equal"}</span>
                </div>
                <div>
                  {item.people} people · {item.tipPercent}% tip {item.isRounded ? "· Rounded" : ""}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 dark:border-white/5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:underline">
                <span>Click to Restore</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
