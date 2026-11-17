import React from "react";
import { formatCurrency } from "../utils/currency";

/**
 * Fintech-grade segmented visualizer bar illustrating each friend's share of the bill.
 */
export default function SplitVisualizer({ breakdown = [], total = 0, currency = "INR" }) {
  if (!breakdown || breakdown.length === 0 || total <= 0) {
    return null;
  }

  return (
    <div className="space-y-2 pt-2">
      <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        <span>Split Proportions</span>
        <span>{breakdown.length} Shares</span>
      </div>

      {/* Multi-segment Progress Bar */}
      <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800/80 overflow-hidden flex p-0.5 gap-0.5 shadow-inner">
        {breakdown.map((friend) => {
          const share = friend.totalShare || 0;
          const percentage = total > 0 ? (share / total) * 100 : 0;
          if (percentage <= 0) return null;

          return (
            <div
              key={friend.id}
              className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-300 relative group cursor-pointer"
              style={{
                width: `${Math.max(percentage, 2)}%`,
                backgroundColor: friend.color || "#6366f1"
              }}
              title={`${friend.name}: ${formatCurrency(share, currency)} (${percentage.toFixed(1)}%)`}
            />
          );
        })}
      </div>

      {/* Legend Chips */}
      <div className="flex items-center flex-wrap gap-2 pt-0.5">
        {breakdown.map((friend) => {
          const share = friend.totalShare || 0;
          const percentage = total > 0 ? (share / total) * 100 : 0;

          return (
            <div
              key={friend.id}
              className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-slate-100/70 dark:bg-slate-800/60 px-2 py-0.5 rounded-md"
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: friend.color }}
              />
              <span className="truncate max-w-[75px]">{friend.name}</span>
              <span className="font-mono text-[10px] text-slate-400 font-bold">
                {percentage.toFixed(0)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
