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
  const [payerMode, setPayerMode] = useState("single");
  const [singlePayerId, setSinglePayerId] = useState(() => friends[0]?.id || "p1");
  const [customPaidAmounts, setCustomPaidAmounts] = useState({});

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
      `🤝 QuickSplit — Who Owes Whom:`,
      `Total Check: ${formatCurrency(totalCheck, currency)}`,
      `──────────────────────────`,
      ...settlements.map((s) => `• ${s.from} ➔ pays ${s.to}: ${s.formatted}`),
      `──────────────────────────`,
      `Settle up smoothly with QuickSplit Pro ✨`
    ];
    navigator.clipboard.writeText(lines.join("\n"));
    showToast("Settlement plan copied to clipboard!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in no-print">
      <div className="bg-[#ffffff] dark:bg-[#181a20] w-full max-w-md rounded-2xl p-6 border border-[#e3ded4] dark:border-white/10 shadow-2xl relative font-sans">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-[#f5f2eb] dark:bg-white/5 text-[#756f68] hover:text-[#1f1d1a] dark:hover:text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-10 h-10 rounded-xl bg-[#e05332]/10 text-[#e05332] flex items-center justify-center mx-auto mb-3 shadow-xs">
          <Handshake className="w-5 h-5" />
        </div>

        <h3 className="font-extrabold text-lg font-heading text-center text-[#1f1d1a] dark:text-white">Who Owes Whom?</h3>
        <p className="text-xs font-mono text-[#756f68] dark:text-[#a39cae] text-center mb-4">
          Select who paid to compute minimal peer-to-peer transfers.
        </p>

        {/* Payer Mode Tabs */}
        <div className="flex p-1 rounded-xl bg-[#f5f2eb] dark:bg-white/5 border border-[#e3ded4] dark:border-white/10 mb-4 text-xs font-mono font-bold">
          <button
            onClick={() => setPayerMode("single")}
            className={`flex-1 py-1.5 rounded-lg cursor-pointer transition-all ${payerMode === "single" ? "bg-white dark:bg-[#181a20] text-[#e05332] shadow-xs" : "text-[#756f68]"}`}
          >
            One Person Paid
          </button>
          <button
            onClick={() => setPayerMode("multiple")}
            className={`flex-1 py-1.5 rounded-lg cursor-pointer transition-all ${payerMode === "multiple" ? "bg-white dark:bg-[#181a20] text-[#e05332] shadow-xs" : "text-[#756f68]"}`}
          >
            Multiple Payers
          </button>
        </div>

        {/* Single Payer Dropdown */}
        {payerMode === "single" ? (
          <div className="mb-5 text-left font-mono">
            <label className="text-[10px] font-bold uppercase text-[#756f68] block mb-1">
              Who paid the entire check ({formatCurrency(totalCheck, currency)})?
            </label>
            <select
              value={singlePayerId}
              onChange={(e) => setSinglePayerId(e.target.value)}
              className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-[#e3ded4] dark:border-white/10 bg-[#f5f2eb] dark:bg-[#0f1115] text-[#e05332] focus:outline-none"
            >
              {friends.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.id === singlePayerId ? "Full Payer" : "Member"})
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="mb-5 space-y-2 max-h-44 overflow-y-auto pr-1 font-mono">
            {friends.map((f) => (
              <div key={f.id} className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[#f5f2eb] dark:bg-white/5 border border-[#e3ded4] dark:border-white/10 text-xs">
                <span className="font-bold truncate">{f.name}</span>
                <div className="flex items-center gap-1 w-28">
                  <span className="text-xs text-[#756f68]">{currency}</span>
                  <input
                    type="number"
                    step="any"
                    placeholder="0.00"
                    value={customPaidAmounts[f.id] || ""}
                    onChange={(e) =>
                      setCustomPaidAmounts((prev) => ({
                        ...prev,
                        [f.id]: e.target.value
                      }))
                    }
                    className="w-full text-xs font-mono font-bold px-2 py-0.5 rounded bg-white dark:bg-[#181a20] border border-[#e3ded4] dark:border-white/10 focus:outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Calculated Settlement Transfers */}
        <div className="space-y-2 mb-4 font-mono">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#756f68] block">
            Calculated Transfers ({settlements.length}):
          </span>

          {settlements.length === 0 ? (
            <div className="p-3 text-center text-xs text-[#0d9488] font-bold bg-[#0d9488]/10 rounded-lg">
              ✓ All shares are already settled!
            </div>
          ) : (
            settlements.map((s, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-lg bg-[#f5f2eb] dark:bg-white/5 border border-[#e3ded4] dark:border-white/10 text-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="font-bold text-[#1f1d1a] dark:text-[#f5f2eb]">{s.from}</span>
                  <ArrowRight className="w-3 h-3 text-[#e05332]" />
                  <span className="font-bold text-[#1f1d1a] dark:text-[#f5f2eb]">{s.to}</span>
                </div>
                <span className="font-black text-[#0d9488] shrink-0 ml-2">
                  {s.formatted}
                </span>
              </div>
            ))
          )}
        </div>

        <button
          onClick={handleCopySettlements}
          className="w-full py-2.5 rounded-lg bg-[#e05332] hover:bg-[#c84324] text-white font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>Copy Settlement Plan</span>
        </button>
      </div>
    </div>
  );
}
