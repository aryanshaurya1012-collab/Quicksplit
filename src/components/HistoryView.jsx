import React, { useState } from "react";
import {
  History,
  Trash2,
  RotateCcw,
  Download,
  Search,
  Calendar,
  Users,
  FolderOpen
} from "lucide-react";
import { formatCurrency } from "../utils/currency.js";
import { exportToCSV } from "../utils/csv.js";

export default function HistoryView({
  history,
  onRestoreSplit,
  onDeleteSplit,
  onClearHistory,
  currency,
  showToast,
  playTick
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredHistory = history.filter((item) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const titleMatch = (item.title || "Bill Split").toLowerCase().includes(query);
    const catMatch = (item.category || "").toLowerCase().includes(query);
    return titleMatch || catMatch;
  });

  const handleExportSavedCSV = (item) => {
    playTick();
    const splitData = {
      bill: item.bill,
      discountAmount: item.discountAmount || 0,
      taxPercent: item.taxPercent || 0,
      taxAmount: item.taxAmount || 0,
      tipPercent: item.tipPercent,
      tipAmount: item.tipAmount,
      total: item.total,
      people: item.peopleCount || item.friends?.length || 1,
      perPerson: item.perPerson || item.total / (item.friends?.length || 1),
      isRounded: item.isRounded,
      roundingDifference: item.roundingDifference || 0
    };

    exportToCSV(
      splitData,
      item.currency || currency,
      item.friends || [],
      item.items || []
    );
    showToast("CSV exported from history! 📊");
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-[#ffffff] dark:bg-[#15171c] rounded-xl border-2 border-[#1c1917] dark:border-[#2e323b] p-5 sm:p-6 shadow-hard flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#e05332] dark:text-[#f97316] block mb-1">
            Local Archives &amp; Records
          </span>
          <h2 className="text-2xl sm:text-3xl font-black font-heading tracking-tight">Saved Checks History</h2>
          <p className="text-xs text-[#756f68] dark:text-[#a39cae] mt-1">
            Previous splits saved securely in your browser's private local storage.
          </p>
        </div>

        {history.length > 0 && (
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to delete all saved bill history?")) {
                playTick();
                onClearHistory();
              }
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-rose-600 hover:text-rose-700 border-2 border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer self-start sm:self-auto flex items-center gap-1.5 shadow-hard-sm active:translate-x-0.5 active:translate-y-0.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear All History
          </button>
        )}
      </div>

      {/* Search Input Bar */}
      {history.length > 0 && (
        <div className="relative">
          <Search className="w-4 h-4 text-[#756f68] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search saved bills by title or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#15171c] border-2 border-[#1c1917] dark:border-[#2e323b] text-xs font-mono font-bold focus:outline-none focus:border-[#e05332] shadow-hard-sm"
          />
        </div>
      )}

      {/* Grid of Past Splits */}
      {filteredHistory.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-xl border-2 border-dashed border-[#ded8cb] dark:border-white/10 bg-white/50 dark:bg-white/[0.02] font-mono">
          <FolderOpen className="w-10 h-10 text-[#756f68] mx-auto mb-3" />
          <h3 className="font-extrabold text-base mb-1">No Saved Bills Yet</h3>
          <p className="text-xs text-[#756f68] max-w-sm mx-auto">
            Bills you calculate and save will appear here for 1-click restore.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHistory.map((item) => (
            <div
              key={item.id}
              className="bg-[#ffffff] dark:bg-[#15171c] rounded-xl border-2 border-[#1c1917] dark:border-[#2e323b] p-4 shadow-hard hover:shadow-hard-lg transition-all flex flex-col justify-between group font-mono"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#e05332]/10 text-[#e05332] border border-[#e05332]/30">
                    {item.category || "Dining"}
                  </span>
                  <span className="text-[11px] text-[#756f68] flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(item.timestamp).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    })}
                  </span>
                </div>

                <div>
                  <h4 className="font-extrabold text-base font-heading text-[#1f1d1a] dark:text-white truncate">
                    {item.title || "Bill Split"}
                  </h4>
                  <div className="text-xl font-black font-mono text-[#e05332] dark:text-[#f97316] mt-1">
                    {formatCurrency(item.total, item.currency || currency)}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-[#756f68] pt-1 border-t border-[#e3ded4] dark:border-white/10">
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3 text-[#756f68]" />
                    {item.friends?.length || item.peopleCount || 1} people
                  </span>
                  <span>•</span>
                  <span className="capitalize">{item.splitMode || "Equal"} Mode</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1.5 pt-4 mt-3 border-t border-[#e3ded4] dark:border-white/10">
                <button
                  onClick={() => {
                    playTick();
                    onRestoreSplit(item);
                  }}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-[#e05332]/10 hover:bg-[#e05332]/20 text-[#e05332] dark:text-[#f97316] font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Restore
                </button>
                <button
                  onClick={() => handleExportSavedCSV(item)}
                  className="p-1.5 rounded-lg bg-[#f5f2eb] hover:bg-[#e9e4d8] dark:bg-white/5 dark:hover:bg-white/10 text-[#756f68] transition-colors cursor-pointer border border-[#e3ded4] dark:border-white/10"
                  title="Export CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    playTick();
                    onDeleteSplit(item.id);
                  }}
                  className="p-1.5 rounded-lg bg-[#f5f2eb] hover:bg-rose-50 hover:text-rose-600 dark:bg-white/5 dark:hover:bg-rose-950/40 text-[#756f68] transition-colors cursor-pointer border border-[#e3ded4] dark:border-white/10"
                  title="Delete record"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
