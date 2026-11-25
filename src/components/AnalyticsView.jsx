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
      <div className="bg-white dark:bg-[#11131a] rounded-2xl border border-slate-200/90 dark:border-white/5 p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 block mb-1">
            Financial Audit & Analytics
          </span>
          <h2 className="text-2xl font-extrabold tracking-tight">Expense Distribution</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Detailed breakdown of individual consumption, adjustments, taxes, and group averages.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              playTick();
              onExportCSV();
            }}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-white/5 dark:hover:bg-white/10 text-xs font-bold border border-slate-200 dark:border-white/10 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-indigo-500" />
            Export CSV
          </button>
          <button
            onClick={() => {
              playTick();
              onPrint();
            }}
            className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-white/5 dark:hover:bg-white/10 text-xs font-bold border border-slate-200 dark:border-white/10 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            Print Check
          </button>
        </div>
      </div>

      {/* KPI 4-Card Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Check */}
        <div className="bg-white dark:bg-[#11131a] rounded-2xl border border-slate-200/90 dark:border-white/5 p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Check</span>
            <DollarSign className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold font-mono text-slate-900 dark:text-white">
            {formatCurrency(totalCheck, currency)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Subtotal: {formatCurrency(subtotal, currency)}
          </span>
        </div>

        {/* Average per Head */}
        <div className="bg-white dark:bg-[#11131a] rounded-2xl border border-slate-200/90 dark:border-white/5 p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Per Person Avg</span>
            <Users className="w-4 h-4 text-teal-500" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold font-mono text-teal-600 dark:text-teal-400">
            {formatCurrency(avgShare, currency)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Across {friends.length} participants
          </span>
        </div>

        {/* Highest Individual */}
        <div className="bg-white dark:bg-[#11131a] rounded-2xl border border-slate-200/90 dark:border-white/5 p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Peak Consumer</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold font-mono text-amber-600 dark:text-amber-400 truncate">
            {highestSpender ? formatCurrency(highestSpender.totalShare, currency) : "0"}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block truncate">
            {highestSpender ? highestSpender.name : "N/A"}
          </span>
        </div>

        {/* Tax & Tip Ratio */}
        <div className="bg-white dark:bg-[#11131a] rounded-2xl border border-slate-200/90 dark:border-white/5 p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Tax & Tip Ratio</span>
            <Percent className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold font-mono text-purple-600 dark:text-purple-400">
            {Math.round(taxTipRatio * 10) / 10}%
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {formatCurrency(taxAmount + tipAmount, currency)} total fees
          </span>
        </div>
      </div>

      {/* Segmented Visual Proportion Bar */}
      <div className="bg-white dark:bg-[#11131a] rounded-2xl border border-slate-200/90 dark:border-white/5 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-indigo-500" />
            Contribution Proportions
          </h3>
          <span className="text-xs font-mono text-slate-400">100% of Check</span>
        </div>

        {/* Multi-colored segmented bar */}
        <div className="h-4 w-full rounded-full bg-slate-100 dark:bg-white/5 overflow-hidden flex shadow-inner">
          {breakdown.map((b) => {
            const pct = totalCheck > 0 ? (b.totalShare / totalCheck) * 100 : 0;
            const friendColor = (friends.find((f) => f.id === b.id)?.color) || "#6366f1";
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
        <div className="flex flex-wrap gap-2 pt-1">
          {breakdown.map((b) => {
            const pct = totalCheck > 0 ? (b.totalShare / totalCheck) * 100 : 0;
            const friendColor = (friends.find((f) => f.id === b.id)?.color) || "#6366f1";
            return (
              <div
                key={b.id}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-xs font-semibold"
              >
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: friendColor }} />
                <span>{b.name}</span>
                <span className="font-mono text-slate-400 font-bold ml-1">
                  {Math.round(pct)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Complete Audit Table */}
      <div className="bg-white dark:bg-[#11131a] rounded-2xl border border-slate-200/90 dark:border-white/5 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
          <h3 className="font-extrabold text-sm flex items-center gap-2">
            <Receipt className="w-4 h-4 text-teal-500" />
            Audit Ledger Table
          </h3>
          <span className="text-[11px] text-slate-400">Itemized Math Breakdown</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200/80 dark:border-white/10">
              <tr>
                <th className="py-3 px-4">Participant</th>
                <th className="py-3 px-4">Base Share</th>
                <th className="py-3 px-4">Tip Share</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">% of Check</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 font-mono">
              {breakdown.map((b) => {
                const pct = totalCheck > 0 ? (b.totalShare / totalCheck) * 100 : 0;
                const friendColor = (friends.find((f) => f.id === b.id)?.color) || "#6366f1";
                return (
                  <tr key={b.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 font-sans font-bold flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: friendColor }} />
                      <span className="text-slate-900 dark:text-slate-100">{b.name}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {formatCurrency(b.rawShare || b.discountedShare || 0, currency)}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      +{formatCurrency(b.tipShare || 0, currency)}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {formatCurrency(b.totalShare, currency)}
                    </td>
                    <td className="py-3 px-4 text-indigo-600 dark:text-indigo-400 font-bold">
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
