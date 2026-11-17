import React from "react";
import { ChevronDown } from "lucide-react";

export default function FaqSection() {
  const faqs = [
    {
      q: "How does the 'Round up per person' work?",
      a: "When you turn on round-up, each person's share is rounded up to the nearest whole integer (e.g. ₹458.33 becomes ₹459.00 or $17.40 becomes $18.00). The accumulated spare cents from everyone are passed directly to your server as an extra tip bonus!"
    },
    {
      q: "What is the difference between Equal Split and Itemized Split?",
      a: "Equal Split divides the entire check and tip evenly across all party members. Itemized Split allows you to add specific dishes or drinks and assign them only to the people who consumed them, with tip added proportionally."
    },
    {
      q: "Does changing currency convert live exchange rates?",
      a: "No. QuickSplit formats numbers strictly according to your chosen currency symbol and formatting locale. It does not perform dynamic foreign exchange conversion, so it works completely offline without network latency."
    },
    {
      q: "Where is my data stored and is it private?",
      a: "100% private. All calculation histories, theme settings, and currency preferences reside purely in your browser's localStorage. No financial data is ever collected, transmitted, or stored on external servers."
    },
    {
      q: "Does QuickSplit work on any device?",
      a: "Yes! QuickSplit is engineered to be fully responsive and optimized for desktop PCs, laptops, tablets, and smartphones alike with 60fps animations."
    }
  ];

  return (
    <section id="faq" className="py-12 border-t border-slate-200/80 dark:border-white/5 max-w-3xl mx-auto no-print scroll-mt-20">
      <div className="text-center mb-8">
        <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 block mb-1">
          Got Questions?
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Frequently Asked Questions</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Clear details about rounding formulas, itemized shares, offline capability, and client privacy.
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <details
            key={i}
            className="group bg-white dark:bg-[#141124] rounded-2xl border border-slate-200 dark:border-white/10 p-4 transition-all shadow-xs"
          >
            <summary className="font-bold text-sm sm:text-base cursor-pointer list-none flex justify-between items-center text-slate-800 dark:text-slate-200 select-none">
              <span>{faq.q}</span>
              <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform duration-200" />
            </summary>
            <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {faq.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
