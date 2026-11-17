import React, { useState, useMemo } from "react";
import { X, Handshake, ArrowRight, Copy, Check } from "lucide-react";
import { calculateSettlements } from "../utils/settlement.js";
import { formatCurrency } from "../utils/currency.js";

export default function SettlementModal({
  isOpen,
  onClose,
  friends,
  setFriends,
  totalCheck,
  currency,
  showToast,
  playTick
}) {
  const [payerMode, setPayerMode] = useState("single"); // "single" or "multiple"
  const [singlePayerId, setSinglePayerId] = useState(() => friends[0]?.id || "p1");
  const [customPaidAmounts, setCustomPaidAmounts] = useState({});

  // Prepare party with paidAmount
  const partyWithPaid = useMemo(() => {
    return friends.map((f) => {
      let paid = 0;
      if (payerMode === "single") {
        paid = f.id === singlePayerId ? totalCheck : 0;
      } else {
        paid = Number(customPaidAmounts[f.id]) || 0;
      }
      return {
        ...f,
        paidAmount: paid
      };
    });
  }, [friends, payerMode, singlePayerId, customPaidAmounts, totalCheck]);

  // Compute debt minimization transfers
  const settlements = useMemo(() => {
    return calculateSettlements(partyWithPaid, currency);
  }, [partyWithPaid, currency]);

  if (!isOpen) return null;

  const handleCopySettlements = () => {
    playTick();
    if (settlements.length === 0) {
      showToast("All balances are already settled!");
      return;
    }
    const lines = [
      `🤝 *QuickSplit — Who Owes Whom:*`,
      `Total Check: ${formatCurrency(totalCheck, currency)}`,
      `──────────────────────────`,
      ...settlements.map((s) => `• ${s.from} ➔ pays ${s.to}: ${s.formatted}`),
      `──────────────────────────`,
      `_Settle up smoothly with QuickSplit ✨_`
    ];
    navigator.clipboard.writeText(lines.join("\n"));
    showToast("Settlement plan copied to clipboard!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in no-print">
      <div className="bg-white dark:bg-[#141124] w-full max-w-md rounded-3xl p-6 border border-slate-200 dark:border-white/10 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3 shadow-xs">
          <Handshake className="w-6 h-6" />
        </div>

        <h3 className="font-extrabold text-lg text-center">Who Owes Whom?</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 text-center mb-4">
          Select who paid the bill to see exact debt settlements with zero confusion.
        </p>

        {/* Payer Mode Tabs */}
        <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 mb-4 text-xs font-bold">
          <button
            onClick={() => setPayerMode("single")}
            className={`flex-1 py-1.5 rounded-lg cursor-pointer transition-all ${payerMode === "single" ? "bg-white dark:bg-slate-800 text-indigo-600 shadow-xs" : "text-slate-400"}`}
          >
            One Person Paid Bill
          </button>
          <button
            onClick={() => setPayerMode("multiple")}
            className={`flex-1 py-1.5 rounded-lg cursor-pointer transition-all ${payerMode === "multiple" ? "bg-white dark:bg-slate-800 text-indigo-600 shadow-xs" : "text-slate-400"}`}
          >
            Multiple People Paid
          </button>
        </div>

        {/* Single Payer Dropdown */}
        {payerMode === "single" ? (
          <div className="mb-5 text-left">
            <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
              Who paid the entire check ({formatCurrency(totalCheck, currency)})?
            </label>
            <select
              value={singlePayerId}
              onChange={(e) => setSinglePayerId(e.target.value)}
              className="w-full px-3 py-2 text-sm font-semibold rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#181428] focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {friends.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} (Paid {formatCurrency(totalCheck, currency)})
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="mb-5 space-y-2 max-h-40 overflow-y-auto pr-1">
            <span className="text-[11px] font-bold uppercase text-slate-400 block">
              Enter how much each person paid upfront:
            </span>
            {friends.map((f) => (
              <div key={f.id} className="flex items-center justify-between gap-2 text-xs">
                <span className="font-medium truncate max-w-[120px]">{f.name}:</span>
                <input
                  type="number"
                  placeholder="0.00"
                  value={customPaidAmounts[f.id] || ""}
                  onChange={(e) =>
                    setCustomPaidAmounts({ ...customPaidAmounts, [f.id]: parseFloat(e.target.value) || 0 })
                  }
                  className="w-28 px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#181428] font-mono"
                />
              </div>
            ))}
          </div>
        )}

        {/* Settlement Transfers List */}
        <div className="space-y-2 mb-5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block text-left">
            Optimal Settlement Transfers ({settlements.length})
          </span>

          {settlements.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-dashed border-slate-200 dark:border-white/10 text-xs text-slate-400 text-center">
              All shares are balanced. Nobody owes anything!
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {settlements.map((s, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 text-xs"
                >
                  <div className="flex items-center gap-1.5 font-semibold">
                    <span className="text-slate-900 dark:text-white">{s.from}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="text-indigo-600 dark:text-indigo-400">{s.to}</span>
                  </div>
                  <span className="font-mono font-bold text-sm text-emerald-600 dark:text-emerald-400">
                    {s.formatted}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleCopySettlements}
          className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-indigo-500/25"
        >
          <Copy className="w-4 h-4" />
          <span>Copy Settlement Instructions</span>
        </button>
      </div>
    </div>
  );
}
