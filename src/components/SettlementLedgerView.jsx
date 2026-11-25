import React, { useState, useMemo } from "react";
import {
  Handshake,
  ArrowRight,
  Copy,
  CheckCircle2,
  DollarSign,
  QrCode,
  Users,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Info
} from "lucide-react";
import { calculateSettlements } from "../utils/settlement.js";
import { formatCurrency } from "../utils/currency.js";

export default function SettlementLedgerView({
  friends,
  setFriends,
  itemizedSplit,
  activeSplit,
  splitMode,
  currency,
  onOpenQR,
  showToast,
  playTick
}) {
  const [payerMode, setPayerMode] = useState("single"); // "single" | "multiple"
  const [singlePayerId, setSinglePayerId] = useState(() => friends[0]?.id || "p1");
  const [paidInputs, setPaidInputs] = useState(() => {
    const initial = {};
    friends.forEach((f) => {
      initial[f.id] = f.paidAmount !== undefined ? String(f.paidAmount) : "";
    });
    return initial;
  });

  const isItemized = splitMode === "itemized";
  const totalCheck = isItemized ? itemizedSplit.total : activeSplit.total;

  // Participant breakdown: each person's calculated fair share
  const partyWithShares = useMemo(() => {
    return friends.map((f) => {
      let fairShare = 0;
      if (isItemized) {
        const itemFriend = (itemizedSplit.breakdown || []).find((b) => b.id === f.id);
        fairShare = itemFriend ? itemFriend.totalShare : 0;
      } else {
        fairShare = activeSplit.perPerson || 0;
      }

      let paid = 0;
      if (payerMode === "single") {
        paid = f.id === singlePayerId ? totalCheck : 0;
      } else {
        paid = parseFloat(paidInputs[f.id]) || 0;
      }

      const netBalance = Math.round(((paid - fairShare) + Number.EPSILON) * 100) / 100;

      return {
        ...f,
        totalShare: fairShare,
        paidAmount: paid,
        netBalance
      };
    });
  }, [friends, isItemized, itemizedSplit, activeSplit, payerMode, singlePayerId, paidInputs, totalCheck]);

  // Compute minimal transactions
  const settlements = useMemo(() => {
    return calculateSettlements(partyWithShares, currency);
  }, [partyWithShares, currency]);

  // Handle updating paid amount for multiple payers
  const handlePaidInputChange = (friendId, val) => {
    setPaidInputs((prev) => ({
      ...prev,
      [friendId]: val
    }));
  };

  // Copy clean formatted settlement plan
  const handleCopyPlan = () => {
    playTick();
    if (settlements.length === 0) {
      showToast("All balances are already even!");
      return;
    }

    const lines = [
      `🤝 QuickSplit — Final Settlement Plan`,
      `Total Check: ${formatCurrency(totalCheck, currency)}`,
      `──────────────────────────────`,
      ...settlements.map((s, idx) => `${idx + 1}. ${s.from} ➔ pays ${s.to}: ${s.formatted}`),
      `──────────────────────────────`,
      `Generated with QuickSplit • 100% Fair & Accurate`
    ];

    navigator.clipboard.writeText(lines.join("\n"));
    showToast("Settlement plan copied for chat! ✨");
  };

  const totalPaidSum = partyWithShares.reduce((sum, f) => sum + f.paidAmount, 0);
  const isPaidSumMatching = Math.abs(totalPaidSum - totalCheck) < 0.05;

  return (
    <div className="space-y-6">
      {/* Top Banner & Overview */}
      <div className="bg-white dark:bg-[#11131a] rounded-2xl border border-slate-200/90 dark:border-white/5 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 block mb-1">
              Debt Minimization Ledger
            </span>
            <h2 className="text-2xl font-extrabold tracking-tight">Who Owes Whom</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Record who put down payment cards or cash upfront to calculate the absolute minimum direct transfers needed.
            </p>
          </div>

          {/* Single vs Multiple Payers Toggle */}
          <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-xs font-bold self-start sm:self-auto">
            <button
              onClick={() => {
                playTick();
                setPayerMode("single");
              }}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                payerMode === "single"
                  ? "bg-white dark:bg-[#181428] text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              1 Person Paid All
            </button>
            <button
              onClick={() => {
                playTick();
                setPayerMode("multiple");
              }}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                payerMode === "multiple"
                  ? "bg-white dark:bg-[#181428] text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              }`}
            >
              Multiple People Paid
            </button>
          </div>
        </div>

        {/* Single Payer Dropdown */}
        {payerMode === "single" ? (
          <div className="mt-5 p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Primary Payer:
              </span>
            </div>
            <select
              value={singlePayerId}
              onChange={(e) => {
                setSinglePayerId(e.target.value);
                playTick();
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-[#181428] border border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300 cursor-pointer focus:outline-none"
            >
              {friends.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} (Paid full {formatCurrency(totalCheck, currency)})
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="mt-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Enter Paid Amount Per Person
              </span>
              {!isPaidSumMatching && (
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" />
                  Sum paid ({formatCurrency(totalPaidSum, currency)}) ≠ Check total ({formatCurrency(totalCheck, currency)})
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {friends.map((f) => (
                <div
                  key={f.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: f.color }}
                    />
                    <span className="text-xs font-bold truncate">{f.name}</span>
                  </div>
                  <div className="flex items-center gap-1 w-28">
                    <span className="text-xs text-slate-400">{currency}</span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="0.00"
                      value={paidInputs[f.id] || ""}
                      onChange={(e) => handlePaidInputChange(f.id, e.target.value)}
                      className="w-full text-xs font-mono font-bold px-2 py-1 rounded bg-white dark:bg-[#181428] border border-slate-300 dark:border-white/10 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Grid: Balances Matrix (Left) & Minimized Payments (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Net Balances Card (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#11131a] rounded-2xl border border-slate-200/90 dark:border-white/5 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
            <h3 className="font-extrabold text-base flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-indigo-500" />
              Individual Net Balances
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">
              Fair Share vs Upfront Paid
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {partyWithShares.map((friend) => {
              const isCreditor = friend.netBalance > 0.01;
              const isDebtor = friend.netBalance < -0.01;
              const isEven = !isCreditor && !isDebtor;

              return (
                <div key={friend.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-xs"
                      style={{ backgroundColor: friend.color }}
                    >
                      {friend.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sm truncate">{friend.name}</div>
                      <div className="text-[11px] text-slate-400">
                        Share: {formatCurrency(friend.totalShare, currency)} • Paid: {formatCurrency(friend.paidAmount, currency)}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    {isCreditor && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        <TrendingUp className="w-3 h-3" />
                        Gets back {formatCurrency(friend.netBalance, currency)}
                      </span>
                    )}
                    {isDebtor && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800">
                        <TrendingDown className="w-3 h-3" />
                        Owes {formatCurrency(Math.abs(friend.netBalance), currency)}
                      </span>
                    )}
                    {isEven && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-white/5 text-slate-500">
                        <CheckCircle2 className="w-3 h-3" />
                        Settled
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Minimized Payment Transactions (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#11131a] rounded-2xl border border-slate-200/90 dark:border-white/5 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
            <h3 className="font-extrabold text-base flex items-center gap-2">
              <Handshake className="w-4 h-4 text-emerald-500" />
              Optimal Payment Plan
            </h3>
            <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
              {settlements.length} {settlements.length === 1 ? "Transfer" : "Transfers"}
            </span>
          </div>

          {settlements.length === 0 ? (
            <div className="text-center py-8 px-4 rounded-xl border border-dashed border-slate-200 dark:border-white/10">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="font-bold text-sm">Everyone is all square!</p>
              <p className="text-xs text-slate-400 mt-1">
                No debts or transfers are required for this check.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {settlements.map((s, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 flex items-center justify-between gap-3 shadow-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                      {s.from}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                      {s.to}
                    </span>
                  </div>

                  <span className="font-mono font-extrabold text-sm text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                    {s.formatted}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={handleCopyPlan}
              className="w-full py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm active:scale-95"
            >
              <Copy className="w-3.5 h-3.5" />
              Copy Settlement Plan for Chat
            </button>

            {currency === "INR" && (
              <button
                onClick={() => {
                  playTick();
                  onOpenQR();
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 text-xs font-bold border border-slate-200 dark:border-white/10 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
              >
                <QrCode className="w-3.5 h-3.5 text-indigo-500" />
                Generate UPI Payment QR Code
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
