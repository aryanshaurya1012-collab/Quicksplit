import React, { useRef, useState } from "react";
import * as htmlToImage from "html-to-image";
import {
  Receipt,
  Copy,
  Share2,
  BookmarkPlus,
  Printer,
  RotateCcw,
  QrCode,
  ShieldCheck,
  Sparkles,
  Download,
  FileSpreadsheet,
  Handshake,
  Link,
  Tag
} from "lucide-react";
import { formatCurrency, formatTip } from "../utils/currency.js";
import SplitVisualizer from "./SplitVisualizer.jsx";

export default function ReceiptCard({
  splitMode,
  activeSplit,
  itemizedSplit,
  currency,
  friends,
  items,
  toggleFriendPaid,
  onCopy,
  onShare,
  onSave,
  onPrint,
  onReset,
  onOpenQR,
  onOpenSettlement,
  onExportCSV,
  onCopyShareableLink,
  showToast,
  playTick
}) {
  const receiptCardRef = useRef(null);
  const [isExportingImage, setIsExportingImage] = useState(false);

  const isItemized = splitMode === "itemized";
  const breakdownList = isItemized
    ? itemizedSplit.breakdown
    : friends.map((f) => ({ ...f, totalShare: activeSplit.perPerson }));

  // Handle PNG Image Download
  const handleDownloadImage = async () => {
    if (!receiptCardRef.current) return;
    playTick();
    setIsExportingImage(true);
    showToast("Rendering receipt card image...");

    try {
      const dataUrl = await htmlToImage.toPng(receiptCardRef.current, {
        pixelRatio: 2,
        backgroundColor: document.documentElement.classList.contains("dark") ? "#141124" : "#ffffff"
      });

      const link = document.createElement("a");
      link.download = `QuickSplit-Receipt-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      showToast("Receipt PNG image downloaded! 🖼️");
    } catch {
      showToast("Could not export image. Try browser screenshot.");
    } finally {
      setIsExportingImage(false);
    }
  };

  return (
    <div className="sticky top-20 space-y-4 receipt-card">
      {/* Capturable Receipt Card */}
      <div
        ref={receiptCardRef}
        className="bg-white dark:bg-[#141124] rounded-3xl border border-slate-200/90 dark:border-white/10 shadow-xl overflow-hidden relative backdrop-blur-xl"
      >
        {/* Receipt Header Ribbon */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-500 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-indigo-100" />
            <span className="font-extrabold tracking-tight text-sm uppercase">
              {isItemized ? "Itemized Check" : "QuickSplit Receipt"}
            </span>
          </div>
          <span className="text-xs font-mono bg-white/20 px-2.5 py-0.5 rounded-full font-medium">
            {new Date().toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          </span>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          {/* Hero Callout Card */}
          <div className="bg-gradient-to-br from-indigo-50/90 via-indigo-50/40 to-teal-50/60 dark:from-indigo-950/40 dark:via-indigo-950/20 dark:to-teal-950/30 border border-indigo-200/80 dark:border-indigo-800/60 rounded-2xl p-5 text-center shadow-inner relative overflow-hidden">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 block mb-1">
              {isItemized ? "Total Check (With Tax & Tip)" : "Each Person Pays"}
            </span>
            <div className="text-4xl sm:text-5xl font-black font-sans tracking-tight text-slate-900 dark:text-white animate-pop">
              {isItemized
                ? formatCurrency(activeSplit.total, currency)
                : formatCurrency(activeSplit.perPerson, currency)}
            </div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2 block">
              {isItemized ? (
                `${items.length} items shared between ${friends.length} friends`
              ) : activeSplit.isRounded ? (
                <span className="text-amber-600 dark:text-amber-400 font-semibold flex items-center justify-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Rounded up (+{formatCurrency(activeSplit.roundingDifference || 0, currency)} tip bonus)
                </span>
              ) : (
                `Split evenly between ${friends.length} ${friends.length === 1 ? "person" : "people"}`
              )}
            </span>
          </div>

          {/* Fintech Segmented Split Visualizer Bar */}
          <SplitVisualizer
            breakdown={breakdownList}
            total={activeSplit.total}
            currency={currency}
          />

          {/* Line Items Breakdown */}
          <div className="space-y-2 text-xs sm:text-sm pt-1 border-t border-slate-100 dark:border-white/5">
            <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
              <span>Subtotal</span>
              <span className="font-mono font-semibold">{formatCurrency(activeSplit.bill, currency)}</span>
            </div>

            {/* Discount line if present */}
            {activeSplit.discountAmount > 0 && (
              <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="flex items-center gap-1">
                  <Tag className="w-3 h-3" /> Discount ({activeSplit.discountType === "percent" ? `${activeSplit.discountVal}%` : "Flat"})
                </span>
                <span className="font-mono font-semibold">-{formatCurrency(activeSplit.discountAmount, currency)}</span>
              </div>
            )}

            {/* Tax line if present */}
            {activeSplit.taxAmount > 0 && (
              <div className="flex justify-between items-center text-amber-600 dark:text-amber-400 font-medium">
                <span>Tax ({activeSplit.taxPercent}%)</span>
                <span className="font-mono font-semibold">+{formatCurrency(activeSplit.taxAmount, currency)}</span>
              </div>
            )}

            {/* Tip line */}
            <div className="flex justify-between items-center text-slate-600 dark:text-slate-300">
              <span>Tip ({formatTip(activeSplit.tipPercent)})</span>
              <span className="font-mono font-semibold">+{formatCurrency(activeSplit.tipAmount, currency)}</span>
            </div>

            {/* Rounding bonus if present */}
            {activeSplit.isRounded && activeSplit.roundingDifference > 0 && (
              <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-medium">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Rounding Extra
                </span>
                <span className="font-mono font-semibold">+{formatCurrency(activeSplit.roundingDifference, currency)}</span>
              </div>
            )}

            <div className="h-px bg-slate-200 dark:bg-white/10 border-dashed border-t my-2" />
            <div className="flex justify-between items-center font-bold text-base text-slate-900 dark:text-white">
              <span>Total Check</span>
              <span className="font-mono text-lg">{formatCurrency(activeSplit.total, currency)}</span>
            </div>
          </div>

          {/* Friend Payment Tracker Summary */}
          <div className="pt-2 border-t border-slate-100 dark:border-white/5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-2">
              <span>{isItemized ? "Individual Shares:" : "Group Members:"}</span>
              <span>
                {friends.filter((f) => f.paid).length} of {friends.length} paid
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-44 overflow-y-auto pr-1">
              {breakdownList.map((f) => (
                <div
                  key={f.id}
                  onClick={() => toggleFriendPaid(f.id)}
                  className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer border transition-all hover:scale-[1.01] ${
                    f.paid
                      ? "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300"
                      : "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: f.color }}
                    />
                    <span className="truncate max-w-[70px] font-medium">{f.name}</span>
                  </div>
                  <span className="font-bold font-mono">
                    {formatCurrency(f.totalShare, currency)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Primary Quick Action Buttons (5 Columns) */}
          <div className="pt-2 grid grid-cols-5 gap-1.5 no-print">
            <button
              onClick={onCopy}
              className="flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl font-bold text-[11px] bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white shadow-md shadow-indigo-500/25 transition-all cursor-pointer"
              title="Copy receipt summary to clipboard (Shortcut: C)"
            >
              <Copy className="w-4 h-4" />
              <span>Copy</span>
            </button>

            <button
              onClick={onShare}
              className="flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl font-bold text-[11px] bg-teal-500 hover:bg-teal-600 active:scale-95 text-white shadow-md shadow-teal-500/25 transition-all cursor-pointer"
              title="Share to WhatsApp, Messages, etc."
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>

            <button
              onClick={onSave}
              className="flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl font-bold text-[11px] bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
              title="Save this calculation to local history (Shortcut: S)"
            >
              <BookmarkPlus className="w-4 h-4 text-indigo-500" />
              <span>Save</span>
            </button>

            <button
              onClick={onPrint}
              className="flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl font-bold text-[11px] bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
              title="Print or save as PDF receipt"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>

            <button
              onClick={onReset}
              className="flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-xl font-bold text-[11px] bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 transition-all cursor-pointer"
              title="Reset calculator (Shortcut: R)"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>

          {/* Secondary Pro Actions: Image Download, CSV Export, Who Owes Whom, Link */}
          <div className="pt-1 grid grid-cols-3 gap-2 no-print">
            <button
              onClick={handleDownloadImage}
              disabled={isExportingImage}
              className="py-2 px-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-white/5 dark:hover:bg-white/10 text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 transition-all border border-slate-200 dark:border-white/10 cursor-pointer active:scale-95"
              title="Download high-res receipt card as PNG image"
            >
              <Download className="w-3.5 h-3.5 text-purple-500" />
              <span>PNG Image</span>
            </button>

            <button
              onClick={onExportCSV}
              className="py-2 px-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-white/5 dark:hover:bg-white/10 text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 transition-all border border-slate-200 dark:border-white/10 cursor-pointer active:scale-95"
              title="Export complete breakdown to CSV spreadsheet"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
              <span>CSV Sheet</span>
            </button>

            <button
              onClick={onOpenSettlement}
              className="py-2 px-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-white/5 dark:hover:bg-white/10 text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 transition-all border border-slate-200 dark:border-white/10 cursor-pointer active:scale-95"
              title="Multi-payer debt minimizer (Who owes whom)"
            >
              <Handshake className="w-3.5 h-3.5 text-indigo-500" />
              <span>Settle Up</span>
            </button>
          </div>

          {/* Offline UPI QR Code Button */}
          <button
            onClick={onOpenQR}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200/80 dark:bg-white/5 dark:hover:bg-white/10 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-2 transition-all border border-slate-200 dark:border-white/10 cursor-pointer no-print active:scale-[0.99]"
          >
            <QrCode className="w-4 h-4 text-indigo-500" />
            <span>Generate Instant UPI Payment QR Code</span>
          </button>
        </div>
      </div>

      {/* Offline Privacy Guarantee Pill */}
      <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/40 text-xs text-indigo-800 dark:text-indigo-300 flex items-start gap-2.5 no-print shadow-xs">
        <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
        <span>
          100% private &amp; offline. All math, QR codes, and image downloads run on your local device with zero server tracking.
        </span>
      </div>
    </div>
  );
}
