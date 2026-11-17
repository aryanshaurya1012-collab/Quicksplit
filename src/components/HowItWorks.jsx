import React from "react";
import { CreditCard, Users, Share2 } from "lucide-react";

export default function HowItWorks() {
  const steps = [
    {
      num: "1",
      icon: CreditCard,
      title: "Enter Bill & Currency",
      desc: "Type your subtotal or tap quick chips (+50, +100, +500). Choose between 9 world currencies with localized formatting.",
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-50 dark:bg-indigo-950/60"
    },
    {
      num: "2",
      icon: Users,
      title: "Pick Tip & Friends",
      desc: "Select tip presets (0%–25%) or custom rates. Add party members, tap to rename friends, or switch to itemized orders.",
      color: "text-teal-600 dark:text-teal-400",
      bg: "bg-teal-50 dark:bg-teal-950/60"
    },
    {
      num: "3",
      icon: Share2,
      title: "Share Instant Receipt",
      desc: "Copy formatted WhatsApp text with confetti, share via mobile, print clean PDF checks, or generate an offline UPI QR code.",
      color: "text-purple-600 dark:text-purple-400",
      bg: "bg-purple-50 dark:bg-purple-950/60"
    }
  ];

  return (
    <section id="how-it-works" className="py-12 border-t border-slate-200/80 dark:border-white/5 scroll-mt-20">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 block mb-1">
          Effortless Math
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">How QuickSplit Works</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Three simple steps to settle any check with your friends without awkward calculations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.num}
              className="p-6 rounded-2xl bg-white dark:bg-[#141124] border border-slate-200/90 dark:border-white/5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-200 relative space-y-3 group"
            >
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-xl ${step.bg} ${step.color} flex items-center justify-center font-black text-sm shadow-xs`}>
                  {step.num}
                </div>
                <Icon className={`w-5 h-5 ${step.color} opacity-70 group-hover:opacity-100 transition-opacity`} />
              </div>
              <h3 className="text-lg font-bold">{step.title}</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {step.desc}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
