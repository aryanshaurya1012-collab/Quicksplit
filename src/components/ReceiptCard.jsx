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
  Tag,
  CheckCircle2,
  Clock
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
        backgroundColor: document.documentElement.classList.contains("dark") ? "#0f1115" : "#f5f2eb"
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

  const allPaid = friends.every((f) => f.paid);
  const paidCount = friends.filter((f) => f.paid).length;

  return (
    <div className="sticky top-20 space-y-4 receipt-card">
      {/* Capturable Authentic Thermal Receipt Ticket */}
      <div
        ref={receiptCardRef}
        className="bg-[#fffdf9] dark:bg-[#15171c] rounded-t-xl border-t-2 border-x-2 border-[#1c1917] dark:border-[#2e323b] shadow-hard relative font-mono text-[#1c1917] dark:text-[#f5f2eb] overflow-hidden receipt-tear-bottom pb-8"
      >
        {/* Ticket Header & Register Metadata */}
        <div className="p-5 pb-3 text-center border-b border-dashed border-[#dcd4c5] dark:border-white/10">
          <div className="flex items-center justify-between text-[10px] text-[#756f68] dark:text-[#a39cae] uppercase tracking-wider mb-2">
            <span>REG #04</span>
            <span className="flex items-center gap-1">
              <Clock className="w-2.5 h-2.5" />
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span>TABLE 07</span>
          </div>

          <div className="inline-block px-3 py-1 bg-[#1f1d1a] text-white dark:bg-[#f5f2eb] dark:text-[#0f1115] text-xs font-black uppercase tracking-widest rounded-sm mb-1">
            QUICKSPLIT CHECKOUT
          </div>
          <div className="text-[10px] text-[#756f68] dark:text-[#a39cae] tracking-tight">
            HIGH-PRECISION BILL SPLIT VOUCHER
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Main Key Figures Callout */}
          <div className="bg-[#f5f2eb] dark:bg-[#0f1115] border border-[#e3ded4] dark:border-white/5 rounded-xl p-4 text-center">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#756f68] dark:text-[#a39cae] block mb-1">
              {isItemized ? "Total Check" : "Amount Each Pays"}
            </span>
            <div className="text-3xl sm:text-4xl font-black font-mono text-[#e05332] dark:text-[#f97316] tracking-tight">
              {formatCurrency(isItemized ? itemizedSplit.total : activeSplit.perPerson, currency)}
            </div>
            <div className="text-[11px] font-medium text-[#756f68] dark:text-[#a39cae] mt-1">
              {isItemized ? (
                <span>Includes prorated discounts, tax &amp; tip</span>
              ) : (
                <span>
                  Split evenly between {friends.length} {friends.length === 1 ? "person" : "people"}
                  {activeSplit.isRounded && (
                    <span className="ml-1 text-[#d97706] font-bold">
                      (Rounded up)
                    </span>
                  )}
                </span>
              )}
            </div>
          </div>

          {/* Itemized Order Breakdown or Line Summary */}
          {isItemized && items.length > 0 && (
            <div className="space-y-2 border-b border-dashed border-[#dcd4c5] dark:border-white/10 pb-4">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-[#756f68]">
                <span>ITEMS / DISHES</span>
                <span>AMOUNT</span>
              </div>
              <div className="space-y-1.5 text-xs">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start gap-2">
                    <div className="truncate">
                      <span className="font-bold">{item.name || "Untitled Item"}</span>
                      <div className="text-[10px] text-[#756f68] flex gap-1">
                        Shared by {item.sharedBy?.length || 0}
                      </div>
                    </div>
                    <span className="font-bold whitespace-nowrap">
                      {formatCurrency(parseFloat(item.price) || 0, currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Financial Calculation Breakdown Table */}
          <div className="space-y-2 text-xs border-b border-dashed border-[#dcd4c5] dark:border-white/10 pb-4">
            <div className="flex justify-between">
              <span className="text-[#756f68] dark:text-[#a39cae]">Subtotal</span>
              <span className="font-bold">{formatCurrency(activeSplit.bill, currency)}</span>
            </div>

            {activeSplit.discountAmount > 0 && (
              <div className="flex justify-between text-[#0d9488]">
                <span>Discount Voucher</span>
                <span className="font-bold">-{formatCurrency(activeSplit.discountAmount, currency)}</span>
              </div>
            )}

            {activeSplit.taxAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-[#756f68] dark:text-[#a39cae]">Sales Tax / GST ({activeSplit.taxPercent}%)</span>
                <span className="font-bold">+{formatCurrency(activeSplit.taxAmount, currency)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span className="text-[#756f68] dark:text-[#a39cae]">
                Tip ({formatTip(activeSplit.tipPercent)})
              </span>
              <span className="font-bold">+{formatCurrency(activeSplit.tipAmount, currency)}</span>
            </div>

            {activeSplit.isRounded && activeSplit.roundingDifference > 0 && (
              <div className="flex justify-between text-[#d97706] text-[11px]">
                <span>Round-Up Tip Bonus</span>
                <span>+{formatCurrency(activeSplit.roundingDifference, currency)}</span>
              </div>
            )}

            <div className="flex justify-between pt-2 border-t border-[#e3ded4] dark:border-white/10 text-sm font-black">
              <span>TOTAL CHECK</span>
              <span className="text-[#e05332] dark:text-[#f97316]">
                {formatCurrency(activeSplit.total, currency)}
              </span>
            </div>
          </div>

          {/* Group Members & Paid Status */}
          <div className="space-y-2.5">
            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider text-[#756f68]">
              <span>MEMBER SHARES</span>
              <span>
                {paidCount} of {friends.length} PAID
              </span>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {breakdownList.map((friend) => {
                const fData = friends.find((f) => f.id === friend.id) || friend;
                return (
                  <div
                    key={friend.id}
                    onClick={() => toggleFriendPaid(friend.id)}
                    className={`flex items-center justify-between p-2 rounded-lg border text-xs cursor-pointer transition-all ${
                      fData.paid
                        ? "bg-[#0d9488]/10 border-[#0d9488]/30 text-[#0d9488]"
                        : "bg-[#f5f2eb]/60 dark:bg-white/5 border-[#e3ded4] dark:border-white/10 hover:border-[#e05332]"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: fData.color }}
                      />
                      <span className="font-bold truncate">{friend.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-bold">
                        {formatCurrency(friend.totalShare || 0, currency)}
                      </span>
                      <span
                        className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${
                          fData.paid
                            ? "bg-[#0d9488] text-white"
                            : "bg-[#756f68]/20 text-[#756f68]"
                        }`}
                      >
                        {fData.paid ? "PAID" : "DUE"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Authentic Stylized Barcode Graphic */}
          <div className="pt-2 text-center border-t border-dashed border-[#dcd4c5] dark:border-white/10">
            <div className="flex items-center justify-center gap-1 h-8 opacity-75">
              {[2,4,1,3,2,5,1,4,2,3,1,5,3,2,4,1,3,2,4,1,5,2,3,1,4,2,3,1,5,2].map((w, i) => (
                <div
                  key={i}
                  style={{ width: `${w * 1.5}px` }}
                  className="h-full bg-[#1f1d1a] dark:bg-[#f5f2eb]"
                />
              ))}
            </div>
            <div className="text-[9px] font-mono tracking-widest text-[#756f68] mt-1 uppercase">
              * QS-{Date.now().toString().slice(-6)} *
            </div>
          </div>
        </div>
      </div>

      {/* Tactile Action Buttons Deck */}
      <div className="bg-[#ffffff] dark:bg-[#15171c] rounded-xl border-2 border-[#1c1917] dark:border-[#2e323b] p-3 shadow-hard space-y-2 no-print">
        {/* Primary Action Row */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onCopy}
            className="py-2.5 px-3 rounded-lg bg-[#e05332] hover:bg-[#c84324] text-white text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-hard-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            <Copy className="w-3.5 h-3.5" />
            Copy Receipt
          </button>
          <button
            onClick={onShare}
            className="py-2.5 px-3 rounded-lg bg-[#ffffff] hover:bg-[#f5f2eb] dark:bg-[#1e2129] dark:hover:bg-white/10 text-[#1c1917] dark:text-[#f5f2eb] border-2 border-[#1c1917] dark:border-[#2e323b] text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-hard-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            <Share2 className="w-3.5 h-3.5 text-[#e05332]" />
            Share Web
          </button>
        </div>

        {/* Secondary Action Row: PNG, CSV, Print */}
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          <button
            onClick={handleDownloadImage}
            disabled={isExportingImage}
            className="py-2 px-1 rounded-md bg-[#f5f2eb] hover:bg-[#ede7dc] dark:bg-[#1e2129] dark:hover:bg-white/10 text-[11px] font-mono font-bold text-[#1c1917] dark:text-[#f5f2eb] border-2 border-[#1c1917] dark:border-[#2e323b] transition-all cursor-pointer flex items-center justify-center gap-1 shadow-hard-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            title="Download PNG image card"
          >
            <Download className="w-3 h-3 text-[#e05332]" />
            PNG Image
          </button>
          <button
            onClick={onExportCSV}
            className="py-2 px-1 rounded-md bg-[#f5f2eb] hover:bg-[#ede7dc] dark:bg-[#1e2129] dark:hover:bg-white/10 text-[11px] font-mono font-bold text-[#1c1917] dark:text-[#f5f2eb] border-2 border-[#1c1917] dark:border-[#2e323b] transition-all cursor-pointer flex items-center justify-center gap-1 shadow-hard-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            title="Export CSV spreadsheet"
          >
            <FileSpreadsheet className="w-3 h-3 text-[#0d9488]" />
            CSV Sheet
          </button>
          <button
            onClick={onPrint}
            className="py-2 px-1 rounded-md bg-[#f5f2eb] hover:bg-[#ede7dc] dark:bg-[#1e2129] dark:hover:bg-white/10 text-[11px] font-mono font-bold text-[#1c1917] dark:text-[#f5f2eb] border-2 border-[#1c1917] dark:border-[#2e323b] transition-all cursor-pointer flex items-center justify-center gap-1 shadow-hard-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
            title="Print or save as PDF"
          >
            <Printer className="w-3 h-3 text-[#756f68]" />
            Print PDF
          </button>
        </div>

        {/* Quick Settle & UPI Trigger */}
        <div className="pt-1 flex gap-2">
          <button
            onClick={onOpenSettlement}
            className="flex-1 py-2 px-3 rounded-md bg-[#0d9488]/10 hover:bg-[#0d9488]/20 text-[#0d9488] border-2 border-[#0d9488]/40 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-hard-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
          >
            <Handshake className="w-3.5 h-3.5" />
            Settle Balances
          </button>
          {currency === "INR" && (
            <button
              onClick={onOpenQR}
              className="py-2 px-3 rounded-md bg-[#f5f2eb] hover:bg-[#ede7dc] dark:bg-[#1e2129] dark:hover:bg-white/10 text-xs font-mono font-bold border-2 border-[#1c1917] dark:border-[#2e323b] shadow-hard-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer flex items-center justify-center gap-1"
              title="UPI Payment QR"
            >
              <QrCode className="w-3.5 h-3.5 text-[#e05332]" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
