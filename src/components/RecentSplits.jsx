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
      <section id="recent" className="py-12 border-t border-[#ded8cb] dark:border-white/10 no-print scroll-mt-20">
        <div className="flex items-center justify-between mb-6">
          <div>
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#e05332] dark:text-[#f97316] block mb-1">
                04 / Local Ledger
              </span>
                <h2 className="text-xl sm:text-2xl font-black font-heading tracking-tight">Recent Splits</h2>
                <p className="text-xs sm:text-sm text-[#756f68] font-body">
                  Private calculations stored in your browser's localStorage with 1-click restore.
                </p>
              </div>
              {history.length > 0 && (
                <button
                  onClick={onClearAll}
                  className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400 px-3 py-1.5 rounded-lg border-2 border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer shadow-hard-sm active:translate-x-0.5 active:translate-y-0.5"
                >
                  Clear All
                </button>
              )}
          </div>

          {history.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-xl border-2 border-dashed border-[#ded8cb] dark:border-white/10 bg-white/40 dark:bg-white/5">
                <Calculator className="w-8 h-8 text-[#756f68] mx-auto mb-2 opacity-50" />
                <p className="text-sm font-bold font-heading text-[#1c1917] dark:text-[#f5f2eb]">No recorded splits yet</p>
                <p className="text-xs text-[#756f68] mt-0.5 font-mono">Calculate a check and tap "Save", "Copy", or "Share" to log it here.</p>
              </div>
              ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onRestore(item)}
                    className="bg-white dark:bg-[#15171c] p-4 rounded-xl border-2 border-[#1c1917] dark:border-[#2e323b] hover:border-[#e05332] dark:hover:border-[#e05332] cursor-pointer shadow-hard hover:shadow-hard-lg transition-all duration-150 group relative"
                  >
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-[11px] font-mono text-[#756f68]">
                          {new Date(item.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </span>
                        <button
                          onClick={(e) => onDelete(item.id, e)}
                          className="p-1 text-[#756f68] hover:text-rose-600 rounded transition-colors cursor-pointer"
                          title="Delete split"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    </div>

                      <div className="text-xl font-black font-mono text-[#e05332] dark:text-[#f97316]">
                        {item.mode === "itemized"
                          ? formatCurrency(item.total, item.currency)
                          : formatCurrency(item.perPerson, item.currency)}
                          <span className="text-xs font-normal text-[#756f68] ml-1">
                            {item.mode === "itemized" ? "total" : "/ person"}
                          </span>
                      </div>

                        <div className="mt-2 text-xs text-[#756f68] space-y-0.5 font-mono">
                          <div>
                            Mode: <span className="font-bold capitalize text-[#1c1917] dark:text-[#f5f2eb]">{item.mode || "equal"}</span>
                          </div>
                          <div>
                            {item.people} people · {item.tipPercent}% tip {item.isRounded ? "· Rounded" : ""}
                          </div>
                        </div>

                          <div className="mt-3 pt-2 border-t border-[#ded8cb] dark:border-white/10 text-[11px] font-mono font-bold text-[#e05332] dark:text-[#f97316] flex items-center gap-1 group-hover:underline">
                            <span>1-Click Restore</span>
                            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
          ))}
                      </div>
      )}
                    </section>
                    );
}
