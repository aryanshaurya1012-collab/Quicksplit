import React, { useState, useEffect, useMemo } from "react";
import QRCode from "qrcode";
import { X, QrCode } from "lucide-react";
import { formatCurrency } from "../utils/currency";

export default function UpiModal({
  isOpen,
  onClose,
  amount,
  showToast,
  playTick
}) {
  const [upiId, setUpiId] = useState("yourname@upi");
  const [offlineQrDataUrl, setOfflineQrDataUrl] = useState("");

  const upiPaymentUrl = useMemo(() => {
    const formattedAmount = (Number(amount) || 0).toFixed(2);
    const note = encodeURIComponent("QuickSplit bill share");
    return `upi://pay?pa=${encodeURIComponent(upiId)}&pn=QuickSplit&am=${formattedAmount}&cu=INR&tn=${note}`;
  }, [upiId, amount]);

  // Generate offline QR Code data URL whenever upiPaymentUrl or isOpen changes
  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    QRCode.toDataURL(upiPaymentUrl, {
      width: 220,
      margin: 2,
      color: {
        dark: "#1e1b4b",
        light: "#ffffff"
      }
    })
      .then((url) => {
        if (isMounted) setOfflineQrDataUrl(url);
      })
      .catch(() => {
        if (isMounted) setOfflineQrDataUrl("");
      });

    return () => {
      isMounted = false;
    };
  }, [upiPaymentUrl, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in no-print">
      <div className="bg-white dark:bg-[#141124] w-full max-w-sm rounded-3xl p-6 border border-slate-200 dark:border-white/10 shadow-2xl relative text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3 shadow-sm">
          <QrCode className="w-6 h-6" />
        </div>

        <h3 className="font-extrabold text-lg">UPI Payment Request</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Generated 100% offline. Friends can scan with GPay, PhonePe, or Paytm to pay their share directly.
        </p>

        <div className="mb-4 text-left">
          <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
            Your VPA / UPI ID
          </label>
          <input
            type="text"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            placeholder="e.g. mobile@upi or name@okaxis"
            className="w-full px-3 py-2 text-sm font-semibold rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#181428] focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="bg-white p-3 rounded-2xl border border-slate-200 inline-block shadow-sm mb-4">
          {offlineQrDataUrl ? (
            <img
              src={offlineQrDataUrl}
              alt="Offline UPI QR Code"
              className="w-44 h-44 mx-auto rounded-lg"
            />
          ) : (
            <div className="w-44 h-44 flex items-center justify-center text-xs text-slate-400">
              Generating offline QR...
            </div>
          )}
        </div>

        <div className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 mb-4">
          Requesting {formatCurrency(Number(amount) || 0, "INR")} / person
        </div>

        <button
          onClick={() => {
            playTick();
            navigator.clipboard.writeText(upiPaymentUrl);
            showToast("UPI payment link copied!");
          }}
          className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs transition-all cursor-pointer shadow-md shadow-indigo-500/25"
        >
          Copy UPI Deep Link
        </button>
      </div>
    </div>
  );
}
