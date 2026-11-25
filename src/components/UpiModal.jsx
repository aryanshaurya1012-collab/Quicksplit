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
    const note = encodeURIComponent("QuickSplit Pro bill share");
    return `upi://pay?pa=${encodeURIComponent(upiId)}&pn=QuickSplit&am=${formattedAmount}&cu=INR&tn=${note}`;
  }, [upiId, amount]);

  useEffect(() => {
    if (!isOpen) return;
    let isMounted = true;
    QRCode.toDataURL(upiPaymentUrl, {
      width: 220,
      margin: 2,
      color: {
        dark: "#1f1d1a",
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
      <div className="bg-[#ffffff] dark:bg-[#181a20] w-full max-w-sm rounded-2xl p-6 border border-[#e3ded4] dark:border-white/10 shadow-2xl relative text-center font-sans">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-[#f5f2eb] dark:bg-white/5 text-[#756f68] hover:text-[#1f1d1a] dark:hover:text-white cursor-pointer transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-10 h-10 rounded-xl bg-[#e05332]/10 text-[#e05332] flex items-center justify-center mx-auto mb-3 shadow-xs">
          <QrCode className="w-5 h-5" />
        </div>

        <h3 className="font-extrabold text-lg font-heading text-[#1f1d1a] dark:text-white">UPI Payment Request</h3>
        <p className="text-xs font-mono text-[#756f68] dark:text-[#a39cae] mb-4">
          Generated 100% offline. Scan with GPay, PhonePe, or Paytm to pay directly.
        </p>

        <div className="mb-4 text-left font-mono">
          <label className="text-[10px] font-bold uppercase text-[#756f68] block mb-1">
            VPA / UPI ID
          </label>
          <input
            type="text"
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            placeholder="e.g. mobile@upi or name@okaxis"
            className="w-full px-3 py-2 text-xs font-bold rounded-lg border border-[#e3ded4] dark:border-white/10 bg-[#f5f2eb] dark:bg-[#0f1115] focus:outline-none focus:border-[#e05332]"
          />
        </div>

        <div className="bg-white p-3 rounded-xl border border-[#e3ded4] inline-block shadow-xs mb-4">
          {offlineQrDataUrl ? (
            <img
              src={offlineQrDataUrl}
              alt="Offline UPI QR Code"
              className="w-44 h-44 mx-auto rounded-lg"
            />
          ) : (
            <div className="w-44 h-44 flex items-center justify-center text-xs font-mono text-[#756f68]">
              Rendering offline QR...
            </div>
          )}
        </div>

        <div className="text-xs font-mono font-bold text-[#1f1d1a] dark:text-[#f5f2eb] mb-4">
          Requesting {formatCurrency(Number(amount) || 0, "INR")} / person
        </div>

        <button
          onClick={() => {
            playTick();
            navigator.clipboard.writeText(upiPaymentUrl);
            showToast("UPI payment link copied!");
          }}
          className="w-full py-2.5 rounded-lg bg-[#e05332] hover:bg-[#c84324] active:scale-95 text-white font-mono font-bold text-xs transition-all cursor-pointer shadow-xs"
        >
          Copy UPI Deep Link
        </button>
      </div>
    </div>
  );
}
