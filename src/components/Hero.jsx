import React, { useState } from "react";
import {
  Calculator,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Globe
} from "lucide-react";
import { formatCurrency } from "../utils/currency";

export default function Hero({ currency, onStartSplitting, onSeeHowItWorks, playTipChime, playTick }) {
  // Interactive mini playground state inside the hero preview card
  const [heroBill] = useState(2400);
  const [heroTip, setHeroTip] = useState(15);
  const [heroFriends] = useState(4);
  const [heroRoundUp, setHeroRoundUp] = useState(false);

  // Live calculation for hero preview
  const tipAmount = heroBill * (heroTip / 100);
  const rawTotal = heroBill + tipAmount;
  const rawPerPerson = rawTotal / heroFriends;
  const perPerson = heroRoundUp ? Math.ceil(rawPerPerson) : rawPerPerson;

  return (
    <section className="py-10 sm:py-16 lg:py-20 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/15 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 right-10 w-80 h-80 bg-teal-500/15 dark:bg-teal-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        
        {/* Left Content */}
        <div className="lg:col-span-7 space-y-6 text-left">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-indigo-50/90 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800/80 shadow-xs hover:border-indigo-400 transition-colors">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            <span>QUICKSPLIT • FAIR BILL SPLITTING</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-slate-900 dark:text-white">
            Good food.
            <br />
            Great company.
            <br />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
              No awkward math.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
            Calculate tips, split checks down to the cent or round up, and share clean receipts with your group in seconds.
          </p>

          {/* Feature Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 shadow-xs hover:scale-105 transition-transform cursor-default">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Live Math
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 shadow-xs hover:scale-105 transition-transform cursor-default">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              100% Private
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 shadow-xs hover:scale-105 transition-transform cursor-default">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              Offline Ready
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 shadow-xs hover:scale-105 transition-transform cursor-default">
              <Globe className="w-3.5 h-3.5 text-teal-500" />
              9 Currencies
            </span>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={onStartSplitting}
              className="px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-extrabold text-sm shadow-xl shadow-indigo-500/25 flex items-center gap-2 cursor-pointer transition-all hover:shadow-indigo-500/40"
            >
              <Calculator className="w-4 h-4" />
              <span>Start splitting</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onSeeHowItWorks}
              className="px-5 py-3.5 rounded-xl bg-white hover:bg-slate-100 dark:bg-white/5 dark:hover:bg-white/10 active:scale-95 text-slate-800 dark:text-slate-200 font-bold text-sm border border-slate-200 dark:border-white/10 cursor-pointer transition-all"
            >
              See how it works
            </button>
          </div>
        </div>

        {/* Right Side: Interactive Hero Preview Card */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <div className="w-full max-w-sm rounded-3xl p-6 bg-white/90 dark:bg-[#141124]/90 backdrop-blur-xl border border-slate-200/90 dark:border-white/10 shadow-2xl relative animate-float">
            
            {/* Header of preview card */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">🍕</span>
                <span className="font-extrabold text-base text-slate-900 dark:text-white">Friday Dinner</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 border border-teal-200/80 dark:border-teal-800/60">
                {heroFriends} friends
              </span>
            </div>

            {/* Subtotals */}
            <div className="space-y-2 text-xs font-medium text-slate-500 dark:text-slate-400 pb-3 border-b border-slate-100 dark:border-white/5">
              <div className="flex justify-between items-center">
                <span>Bill subtotal</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {formatCurrency(heroBill, currency)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Tip ({heroTip}%)</span>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  +{formatCurrency(tipAmount, currency)}
                </span>
              </div>
            </div>

            {/* Interactive Hero Tip Switcher (Instant Playground!) */}
            <div className="py-2.5 flex items-center justify-between gap-1 border-b border-slate-100 dark:border-white/5">
              <span className="text-[11px] font-bold text-slate-400">Tip:</span>
              {[10, 15, 20].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    playTipChime(t);
                    setHeroTip(t);
                  }}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    heroTip === t
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                      : "bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10"
                  }`}
                >
                  {t}%
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  playTick();
                  setHeroRoundUp(!heroRoundUp);
                }}
                className={`px-2 py-1 text-[11px] font-bold rounded-lg border transition-all cursor-pointer ${
                  heroRoundUp
                    ? "bg-amber-500 text-white border-amber-500"
                    : "bg-slate-50 dark:bg-white/5 text-slate-500 border-slate-200 dark:border-white/10"
                }`}
              >
                {heroRoundUp ? "Rounded ✓" : "Round up"}
              </button>
            </div>

            {/* Each Pays Highlight Box */}
            <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-indigo-50/90 to-teal-50/70 dark:from-indigo-950/50 dark:to-teal-950/40 border border-indigo-200/80 dark:border-indigo-800/60 flex items-center justify-between shadow-inner">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
                EACH PAYS
              </span>
              <span className="text-2xl sm:text-3xl font-black font-sans tracking-tight text-indigo-600 dark:text-indigo-400 animate-pop">
                {formatCurrency(perPerson, currency)}
              </span>
            </div>

            {/* Friend Avatar Stack */}
            <div className="mt-4 flex items-center justify-between pt-1">
              <div className="flex -space-x-1.5 overflow-hidden">
                {["#6366f1", "#ec4899", "#14b8a6", "#f59e0b"].map((bg, idx) => (
                  <div
                    key={idx}
                    className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-[#141124] text-[10px] text-white font-bold flex items-center justify-center shadow-xs"
                    style={{ backgroundColor: bg }}
                  >
                    {["Y", "A", "R", "P"][idx]}
                  </div>
                ))}
              </div>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> All settled
              </span>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
