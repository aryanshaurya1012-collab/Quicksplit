import React, { useMemo } from "react";
import {
  PieChart,
  BarChart3,
  DollarSign,
  Users,
  Percent,
  Download,
  Printer,
  Award,
  Receipt
} from "lucide-react";
import { formatCurrency } from "../utils/currency.js";

export default function AnalyticsView({
  friends,
  items,
  itemizedSplit,
  activeSplit,
  splitMode,
  currency,
  onExportCSV,
  onPrint,
  playTick
}) {
  const isItemized = splitMode === "itemized";
  const totalCheck = isItemized ? itemizedSplit.total : activeSplit.total;
  const subtotal = isItemized ? itemizedSplit.subtotal : activeSplit.bill;
  const discountAmount = isItemized ? itemizedSplit.discountAmount : activeSplit.discountAmount;
  const taxAmount = isItemized ? itemizedSplit.taxAmount : activeSplit.taxAmount;
  const tipAmount = isItemized ? itemizedSplit.tipAmount : activeSplit.tipAmount;

  // Breakdown per friend
  const breakdown = useMemo(() => {
    if (isItemized && itemizedSplit.breakdown) {
      return itemizedSplit.breakdown;
    }
    const perHead = activeSplit.perPerson || 0;
    return friends.map((f) => ({
      id: f.id,
      name: f.name,
      color: f.color,
      rawShare: activeSplit.bill / (friends.length || 1),
      discountedShare: activeSplit.discountedSubtotal / (friends.length || 1),
      totalShare: perHead,
      tipShare: (activeSplit.tipAmount || 0) / (friends.length || 1)
    }));
  }, [isItemized, itemizedSplit, activeSplit, friends]);

  // Find highest spender
  const highestSpender = useMemo(() => {
    if (!breakdown || breakdown.length === 0) return null;
    let max = breakdown[0];
    breakdown.forEach((b) => {
      if (b.totalShare > max.totalShare) max = b;
    });
    return max;
  }, [breakdown]);

  const avgShare = friends.length > 0 ? totalCheck / friends.length : 0;
  const taxTipRatio = totalCheck > 0 ? ((taxAmount + tipAmount) / totalCheck) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-[#ffffff] dark:bg-[#15171c] rounded-xl border-2 border-[#1c1917] dark:border-[#2e323b] p-5 sm:p-6 shadow-hard flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#e05332] dark:text-[#f97316] block mb-1">
            Financial Audit &amp; Analytics
          </span>
          <h2 className="text-2xl sm:text-3xl font-black font-heading tracking-tight">Expense Distribution</h2>
          <p className="text-xs text-[#756f68] dark:text-[#a39cae] mt-1">
            Auditing individual consumption, prorated adjustments, and group proportions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              playTick();
              onExportCSV();
            }}
            className="px-3 py-2 rounded-lg bg-[#ffffff] hover:bg-[#f5f2eb] dark:bg-[#1e2129] dark:hover:bg-white/10 text-xs font-mono font-bold border-2 border-[#1c1917] dark:border-[#2e323b] shadow-hard-sm transition-all cursor-pointer flex items-center gap-1.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            <Download className="w-3.5 h-3.5 text-[#0d9488]" />
            Export CSV
          </button>
          <button
            onClick={() => {
              playTick();
              onPrint();
            }}
            className="px-3 py-2 rounded-lg bg-[#ffffff] hover:bg-[#f5f2eb] dark:bg-[#1e2129] dark:hover:bg-white/10 text-xs font-mono font-bold border-2 border-[#1c1917] dark:border-[#2e323b] shadow-hard-sm transition-all cursor-pointer flex items-center gap-1.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            <Printer className="w-3.5 h-3.5 text-[#756f68]" />
            Print Check
          </button>
        </div>
      </div>

      {/* KPI 4-Card Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Check */}
        <div className="bg-[#ffffff] dark:bg-[#15171c] rounded-xl border-2 border-[#1c1917] dark:border-[#2e323b] p-4 shadow-hard">
          <div className="flex items-center justify-between text-[#756f68] mb-2 font-mono">
            <span className="text-[10px] font-bold uppercase tracking-wider">Total Check</span>
            <DollarSign className="w-4 h-4 text-[#e05332]" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-[#e05332] dark:text-[#f97316]">
            {formatCurrency(totalCheck, currency)}
          </div>
          <span className="text-[10px] font-mono text-[#756f68] mt-1 block">
            Subtotal: {formatCurrency(subtotal, currency)}
          </span>
        </div>

        {/* Average per Head */}
        <div className="bg-[#ffffff] dark:bg-[#15171c] rounded-xl border-2 border-[#1c1917] dark:border-[#2e323b] p-4 shadow-hard">
          <div className="flex items-center justify-between text-[#756f68] mb-2 font-mono">
            <span className="text-[10px] font-bold uppercase tracking-wider">Average / Head</span>
            <Users className="w-4 h-4 text-[#0d9488]" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-[#0d9488]">
            {formatCurrency(avgShare, currency)}
          </div>
          <span className="text-[10px] font-mono text-[#756f68] mt-1 block">
            {friends.length} participants
          </span>
        </div>

        {/* Highest Individual */}
        <div className="bg-[#ffffff] dark:bg-[#15171c] rounded-xl border-2 border-[#1c1917] dark:border-[#2e323b] p-4 shadow-hard">
          <div className="flex items-center justify-between text-[#756f68] mb-2 font-mono">
            <span className="text-[10px] font-bold uppercase tracking-wider">Peak Consumer</span>
            <Award className="w-4 h-4 text-[#d97706]" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-[#d97706] truncate">
            {highestSpender ? formatCurrency(highestSpender.totalShare, currency) : "0"}
          </div>
          <span className="text-[10px] font-mono text-[#756f68] mt-1 block truncate">
            {highestSpender ? highestSpender.name : "N/A"}
          </span>
        </div>

        {/* Tax & Tip Ratio */}
        <div className="bg-[#ffffff] dark:bg-[#15171c] rounded-xl border-2 border-[#1c1917] dark:border-[#2e323b] p-4 shadow-hard">
          <div className="flex items-center justify-between text-[#756f68] mb-2 font-mono">
            <span className="text-[10px] font-bold uppercase tracking-wider">Tax &amp; Tip Ratio</span>
            <Percent className="w-4 h-4 text-[#2563eb]" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-[#2563eb] dark:text-[#3b82f6]">
            {Math.round(taxTipRatio * 10) / 10}%
          </div>
          <span className="text-[10px] font-mono text-[#756f68] mt-1 block">
            {formatCurrency(taxAmount + tipAmount, currency)} total fees
          </span>
        </div>
      </div>

      {/* Segmented Visual Proportion Bar */}
      <div className="bg-[#ffffff] dark:bg-[#15171c] rounded-xl border-2 border-[#1c1917] dark:border-[#2e323b] p-5 shadow-hard space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm font-heading flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#e05332]" />
            Contribution Proportions
          </h3>
          <span className="text-xs font-mono text-[#756f68]">100% of Check</span>
        </div>

        {/* Segmented bar */}
        <div className="h-4 w-full rounded-full bg-[#f5f2eb] dark:bg-white/5 overflow-hidden flex shadow-inner">
          {breakdown.map((b) => {
            const pct = totalCheck > 0 ? (b.totalShare / totalCheck) * 100 : 0;
            const friendColor = (friends.find((f) => f.id === b.id)?.color) || "#e05332";
            return (
              <div
                key={b.id}
                style={{ width: `${pct}%`, backgroundColor: friendColor }}
                className="h-full transition-all duration-300 relative group"
                title={`${b.name}: ${formatCurrency(b.totalShare, currency)} (${Math.round(pct)}%)`}
              />
            );
          })}
        </div>

        {/* Member tags with percentages */}
        <div className="flex flex-wrap gap-2 pt-1 font-mono">
          {breakdown.map((b) => {
            const pct = totalCheck > 0 ? (b.totalShare / totalCheck) * 100 : 0;
            const friendColor = (friends.find((f) => f.id === b.id)?.color) || "#e05332";
            return (
              <div
                key={b.id}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#f5f2eb] dark:bg-white/5 border border-[#e3ded4] dark:border-white/10 text-xs font-bold"
              >
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: friendColor }} />
                <span>{b.name}</span>
                <span className="text-[#e05332] dark:text-[#f97316] font-black ml-1">
                  {Math.round(pct)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Complete Audit Table */}
      <div className="bg-[#ffffff] dark:bg-[#181a20] rounded-2xl border border-[#e3ded4] dark:border-white/10 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#e3ded4] dark:border-white/10 flex items-center justify-between">
          <h3 className="font-extrabold text-sm font-heading flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#0d9488]" />
            Itemized Audit Ledger Table
          </h3>
          <span className="text-[11px] font-mono text-[#756f68]">Audited Breakdown</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#f5f2eb] dark:bg-white/5 text-[#756f68] font-bold uppercase tracking-wider text-[10px] border-b border-[#e3ded4] dark:border-white/10">
              <tr>
                <th className="py-3 px-4">Participant</th>
                <th className="py-3 px-4">Base Share</th>
                <th className="py-3 px-4">Tip Share</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">% of Check</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e3ded4] dark:divide-white/5">
              {breakdown.map((b) => {
                const pct = totalCheck > 0 ? (b.totalShare / totalCheck) * 100 : 0;
                const friendColor = (friends.find((f) => f.id === b.id)?.color) || "#e05332";
                return (
                  <tr key={b.id} className="hover:bg-[#f5f2eb]/50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 font-bold flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: friendColor }} />
                      <span className="text-[#1f1d1a] dark:text-[#f5f2eb]">{b.name}</span>
                    </td>
                    <td className="py-3 px-4 text-[#756f68]">
                      {formatCurrency(b.rawShare || b.discountedShare || 0, currency)}
                    </td>
                    <td className="py-3 px-4 text-[#756f68]">
                      +{formatCurrency(b.tipShare || 0, currency)}
                    </td>
                    <td className="py-3 px-4 font-black text-[#e05332] dark:text-[#f97316]">
                      {formatCurrency(b.totalShare, currency)}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#0d9488]">
                      {Math.round(pct * 10) / 10}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
