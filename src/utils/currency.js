import { CURRENCIES, DEFAULT_CURRENCY } from "../constants/index.js";

/**
 * Format a numeric value into a localized currency string.
 * @param {number} value
 * @param {string} currencyCode
 * @returns {string}
 */
export function formatCurrency(value, currencyCode = DEFAULT_CURRENCY) {
  const config = CURRENCIES[currencyCode] || CURRENCIES[DEFAULT_CURRENCY];
  const num = Number.isFinite(value) ? value : 0;
  const decimals = typeof config.decimals === "number" ? config.decimals : 2;

  try {
    return new Intl.NumberFormat(config.locale, {
      style: "currency",
      currency: config.code,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num);
  } catch (e) {
    return `${config.symbol}${num.toFixed(decimals)}`;
  }
}

/**
 * Format a tip percentage cleanly.
 * @param {number} percent
 * @returns {string}
 */
export function formatTip(percent) {
  if (!Number.isFinite(percent)) return "0%";
  const rounded = Math.round(percent * 100) / 100;
  return `${rounded}%`;
}
