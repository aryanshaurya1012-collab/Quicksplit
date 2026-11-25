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
      `Generated with QuickSplit Pro • 100% Fair & Accurate`
    ];

    navigator.clipboard.writeText(lines.join("\n"));
    showToast("Settlement plan copied for chat! ✨");
  };

  const totalPaidSum = partyWithShares.reduce((sum, f) => sum + f.paidAmount, 0);
  const isPaidSumMatching = Math.abs(totalPaidSum - totalCheck) < 0.05;

  return (
    <div className="space-y-6">
      {/* Top Banner & Overview */}
      <div className="bg-[#ffffff] dark:bg-[#15171c] rounded-xl border-2 border-[#1c1917] dark:border-[#2e323b] p-5 sm:p-6 shadow-hard">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#e05332] dark:text-[#f97316] block mb-1">
              Debt Minimization Ledger
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-heading tracking-tight">Who Owes Whom</h2>
            <p className="text-xs text-[#756f68] dark:text-[#a39cae] mt-1">
              Audit upfront card and cash payments to compute the absolute fewest direct peer-to-peer transfers.
            </p>
          </div>

          {/* Single vs Multiple Payers Toggle */}
          <div className="flex p-1 rounded-xl bg-[#f5f2eb] dark:bg-white/5 border border-[#e3ded4] dark:border-white/10 text-xs font-mono font-bold self-start sm:self-auto">
            <button
              onClick={() => {
                playTick();
                setPayerMode("single");
              }}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                payerMode === "single"
                  ? "bg-[#ffffff] dark:bg-[#181a20] text-[#e05332] dark:text-[#f97316] shadow-xs"
                  : "text-[#756f68] hover:text-[#1f1d1a] dark:hover:text-white"
              }`}
            >
              1 Person Paid
            </button>
            <button
              onClick={() => {
                playTick();
                setPayerMode("multiple");
              }}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-all ${
                payerMode === "multiple"
                  ? "bg-[#ffffff] dark:bg-[#181a20] text-[#e05332] dark:text-[#f97316] shadow-xs"
                  : "text-[#756f68] hover:text-[#1f1d1a] dark:hover:text-white"
              }`}
            >
              Multiple Payers
            </button>
          </div>
        </div>

        {/* Single Payer Dropdown */}
        {payerMode === "single" ? (
          <div className="mt-5 p-4 rounded-xl bg-[#f5f2eb] dark:bg-[#0f1115] border border-[#e3ded4] dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-[#e05332]" />
              <span className="text-xs font-mono font-bold text-[#1f1d1a] dark:text-[#f5f2eb]">
                Primary Payer:
              </span>
            </div>
            <select
              value={singlePayerId}
              onChange={(e) => {
                setSinglePayerId(e.target.value);
                playTick();
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold bg-white dark:bg-[#181a20] border border-[#e3ded4] dark:border-white/10 text-[#e05332] dark:text-[#f97316] cursor-pointer focus:outline-none"
            >
              {friends.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} (Paid full check: {formatCurrency(totalCheck, currency)})
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="mt-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#756f68]">
                Enter Paid Amount Per Person
              </span>
              {!isPaidSumMatching && (
                <span className="text-xs font-mono font-bold text-[#d97706] flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" />
                  Sum paid ({formatCurrency(totalPaidSum, currency)}) ≠ Check total ({formatCurrency(totalCheck, currency)})
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {friends.map((f) => (
                <div
                  key={f.id}
                  className="p-3 rounded-xl bg-[#f5f2eb] dark:bg-white/5 border border-[#e3ded4] dark:border-white/10 flex items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: f.color }}
                    />
                    <span className="text-xs font-mono font-bold truncate">{f.name}</span>
                  </div>
                  <div className="flex items-center gap-1 w-28">
                    <span className="text-xs font-mono text-[#756f68]">{currency}</span>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="0.00"
                      value={paidInputs[f.id] || ""}
                      onChange={(e) => handlePaidInputChange(f.id, e.target.value)}
                      className="w-full text-xs font-mono font-bold px-2 py-1 rounded bg-white dark:bg-[#181a20] border border-[#e3ded4] dark:border-white/10 focus:outline-none focus:border-[#e05332]"
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
        <div className="lg:col-span-7 bg-[#ffffff] dark:bg-[#181a20] rounded-2xl border border-[#e3ded4] dark:border-white/10 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#e3ded4] dark:border-white/10 pb-3">
            <h3 className="font-extrabold text-base font-heading flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-[#e05332]" />
              Individual Net Balances
            </h3>
            <span className="text-[11px] font-mono text-[#756f68]">
              Fair Share vs Upfront Paid
            </span>
          </div>

          <div className="divide-y divide-[#e3ded4] dark:divide-white/5">
            {partyWithShares.map((friend) => {
              const isCreditor = friend.netBalance > 0.01;
              const isDebtor = friend.netBalance < -0.01;
              const isEven = !isCreditor && !isDebtor;

              return (
                <div key={friend.id} className="py-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-mono font-bold flex-shrink-0 shadow-xs"
                      style={{ backgroundColor: friend.color }}
                    >
                      {friend.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-sm truncate">{friend.name}</div>
                      <div className="text-[11px] font-mono text-[#756f68] dark:text-[#a39cae]">
                        Share: {formatCurrency(friend.totalShare, currency)} • Paid: {formatCurrency(friend.paidAmount, currency)}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    {isCreditor && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-[#0d9488]/10 text-[#0d9488] border border-[#0d9488]/30">
                        <TrendingUp className="w-3 h-3" />
                        Receives +{formatCurrency(friend.netBalance, currency)}
                      </span>
                    )}
                    {isDebtor && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-[#e05332]/10 text-[#e05332] dark:text-[#f97316] border border-[#e05332]/30">
                        <TrendingDown className="w-3 h-3" />
                        Owes -{formatCurrency(Math.abs(friend.netBalance), currency)}
                      </span>
                    )}
                    {isEven && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-[#f5f2eb] dark:bg-white/5 text-[#756f68] border border-[#e3ded4] dark:border-white/10">
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
        <div className="lg:col-span-5 bg-[#ffffff] dark:bg-[#181a20] rounded-2xl border border-[#e3ded4] dark:border-white/10 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#e3ded4] dark:border-white/10 pb-3">
            <h3 className="font-extrabold text-base font-heading flex items-center gap-2">
              <Handshake className="w-4 h-4 text-[#0d9488]" />
              Optimal Settlement Plan
            </h3>
            <span className="text-[11px] font-mono text-[#0d9488] font-bold">
              {settlements.length} {settlements.length === 1 ? "Transfer" : "Transfers"}
            </span>
          </div>

          {settlements.length === 0 ? (
            <div className="text-center py-8 px-4 rounded-xl border border-dashed border-[#e3ded4] dark:border-white/10 font-mono">
              <CheckCircle2 className="w-8 h-8 text-[#0d9488] mx-auto mb-2" />
              <p className="font-bold text-sm">Everyone is all square!</p>
              <p className="text-xs text-[#756f68] mt-1">
                No debts or transfers are required for this check.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 font-mono">
              {settlements.map((s, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#f5f2eb] dark:bg-[#0f1115] border border-[#e3ded4] dark:border-white/10 flex items-center justify-between gap-3 shadow-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-bold text-xs truncate">
                      {s.from}
                    </span>
                    <ArrowRight className="w-3 h-3 text-[#e05332] flex-shrink-0" />
                    <span className="font-bold text-xs truncate">
                      {s.to}
                    </span>
                  </div>

                  <span className="font-black text-sm text-[#0d9488] flex-shrink-0">
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
              className="w-full py-2.5 px-3 rounded-lg bg-[#e05332] hover:bg-[#c84324] text-white text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs active:scale-95"
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
                className="w-full py-2.5 px-3 rounded-lg bg-[#f5f2eb] hover:bg-[#e9e4d8] dark:bg-white/5 dark:hover:bg-white/10 text-[#1f1d1a] dark:text-[#f5f2eb] text-xs font-mono font-bold border border-[#e3ded4] dark:border-white/10 transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
              >
                <QrCode className="w-3.5 h-3.5 text-[#e05332]" />
                Generate UPI Payment QR Code
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
