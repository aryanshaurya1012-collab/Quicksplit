export const CURRENCIES = {
  INR: { code: "INR", symbol: "₹", label: "INR (₹) — India", locale: "en-IN", decimals: 2, flag: "🇮🇳" },
  USD: { code: "USD", symbol: "$", label: "USD ($) — United States", locale: "en-US", decimals: 2, flag: "🇺🇸" },
  EUR: { code: "EUR", symbol: "€", label: "EUR (€) — Eurozone", locale: "en-IE", decimals: 2, flag: "🇪🇺" },
  GBP: { code: "GBP", symbol: "£", label: "GBP (£) — United Kingdom", locale: "en-GB", decimals: 2, flag: "🇬🇧" },
  CAD: { code: "CAD", symbol: "CA$", label: "CAD (CA$) — Canada", locale: "en-CA", decimals: 2, flag: "🇨🇦" },
  AUD: { code: "AUD", symbol: "A$", label: "AUD (A$) — Australia", locale: "en-AU", decimals: 2, flag: "🇦🇺" },
  JPY: { code: "JPY", symbol: "¥", label: "JPY (¥) — Japan", locale: "ja-JP", decimals: 0, flag: "🇯🇵" },
  SGD: { code: "SGD", symbol: "S$", label: "SGD (S$) — Singapore", locale: "en-SG", decimals: 2, flag: "🇸🇬" },
  AED: { code: "AED", symbol: "AED", label: "AED (د.إ) — UAE", locale: "en-AE", decimals: 2, flag: "🇦🇪" }
};

export const DEFAULT_CURRENCY = "INR";

export const TIP_PRESETS = [0, 5, 10, 15, 18, 20, 25];

export const QUICK_ADD_AMOUNTS = {
  INR: [50, 100, 200, 500, 1000],
  USD: [5, 10, 20, 50, 100],
  EUR: [5, 10, 20, 50, 100],
  GBP: [5, 10, 20, 50, 100],
  CAD: [5, 10, 20, 50, 100],
  AUD: [5, 10, 20, 50, 100],
  JPY: [500, 1000, 2000, 5000],
  SGD: [5, 10, 20, 50, 100],
  AED: [20, 50, 100, 200]
};

export const DEFAULT_FRIENDS = [
  { id: "p1", name: "You", color: "#6366f1", paid: true },
  { id: "p2", name: "Aryan", color: "#ec4899", paid: false },
  { id: "p3", name: "Rakesh", color: "#14b8a6", paid: false },
  { id: "p4", name: "Priya", color: "#f59e0b", paid: false }
];

export const AVATAR_COLORS = [
  "#6366f1", // Indigo
  "#ec4899", // Pink
  "#14b8a6", // Teal
  "#f59e0b", // Amber
  "#8b5cf6", // Purple
  "#06b6d4", // Cyan
  "#10b981", // Emerald
  "#f97316", // Orange
  "#3b82f6", // Blue
  "#e11d48"  // Rose
];
