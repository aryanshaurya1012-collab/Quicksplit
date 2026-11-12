/**
 * Pure calculation and formatting helpers for QuickSplit.
 * No DOM access — keep this module UI-agnostic.
 */
(function (global) {
  "use strict";

  var CURRENCIES = {
    INR: { code: "INR", locale: "en-IN", symbol: "₹", label: "INR (₹)" },
    USD: { code: "USD", locale: "en-US", symbol: "$", label: "USD ($)" },
    EUR: { code: "EUR", locale: "en-IE", symbol: "€", label: "EUR (€)" },
    GBP: { code: "GBP", locale: "en-GB", symbol: "£", label: "GBP (£)" }
  };

  var DEFAULT_CURRENCY = "INR";
  var DEFAULT_TIP = 15;
  var DEFAULT_PEOPLE = 1;
  var TIP_PRESETS = [5, 10, 15, 20];

  function getCurrencyConfig(code) {
    return CURRENCIES[code] || CURRENCIES[DEFAULT_CURRENCY];
  }

  function createCurrencyFormatter(currencyCode) {
    var config = getCurrencyConfig(currencyCode);
    return new Intl.NumberFormat(config.locale, {
      style: "currency",
      currency: config.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  function formatCurrency(value, currencyCode) {
    var formatter = createCurrencyFormatter(currencyCode);
    if (!Number.isFinite(value)) {
      return formatter.format(0);
    }
    return formatter.format(value);
  }

  function formatTipPercent(value) {
    if (!Number.isFinite(value)) return "0%";
    if (Number.isInteger(value)) return value + "%";
    return String(value) + "%";
  }

  /**
   * Parse a non-negative number from input text.
   * Returns: null (empty), NaN (invalid), or a finite number ≥ 0.
   */
  function parseNonNegativeNumber(raw) {
    if (raw === null || raw === undefined) return null;
    var trimmed = String(raw).trim();
    if (trimmed === "") return null;
    var value = Number(trimmed);
    if (!Number.isFinite(value) || value < 0) return NaN;
    return value;
  }

  /**
   * Parse a positive integer (≥ 1) from input text.
   * Returns: null (empty), NaN (invalid), or an integer ≥ 1.
   */
  function parsePositiveInteger(raw) {
    if (raw === null || raw === undefined) return null;
    var trimmed = String(raw).trim();
    if (trimmed === "") return null;
    if (!/^\d+$/.test(trimmed)) return NaN;
    var value = Number(trimmed);
    if (!Number.isFinite(value) || value < 1) return NaN;
    return value;
  }

  /**
   * Tip = bill * tipPercent / 100
   * Total = bill + tip
   * Per person = total / people
   */
  function calculateSplit(bill, tipPercent, people) {
    if (!Number.isFinite(bill) || bill < 0) {
      return { tipAmount: null, total: null, perPerson: null, valid: false };
    }
    if (!Number.isFinite(tipPercent) || tipPercent < 0) {
      return { tipAmount: null, total: null, perPerson: null, valid: false };
    }
    if (!Number.isFinite(people) || people < 1 || !Number.isInteger(people)) {
      return { tipAmount: null, total: null, perPerson: null, valid: false };
    }

    var tipAmount = bill * (tipPercent / 100);
    var total = bill + tipAmount;
    var perPerson = total / people;

    if (!Number.isFinite(tipAmount) || !Number.isFinite(total) || !Number.isFinite(perPerson)) {
      return { tipAmount: null, total: null, perPerson: null, valid: false };
    }

    return {
      tipAmount: tipAmount,
      total: total,
      perPerson: perPerson,
      valid: true
    };
  }

  function buildSplitSummary(split, currencyCode) {
    return [
      "QuickSplit - Bill Summary",
      "",
      "Bill Amount: " + formatCurrency(split.bill, currencyCode),
      "Tip Percentage: " + formatTipPercent(split.tipPercent),
      "Tip Amount: " + formatCurrency(split.tipAmount, currencyCode),
      "Total Bill: " + formatCurrency(split.total, currencyCode),
      "Number of People: " + split.people,
      "Amount Per Person: " + formatCurrency(split.perPerson, currencyCode)
    ].join("\n");
  }

  global.QuickSplitCalculator = {
    CURRENCIES: CURRENCIES,
    DEFAULT_CURRENCY: DEFAULT_CURRENCY,
    DEFAULT_TIP: DEFAULT_TIP,
    DEFAULT_PEOPLE: DEFAULT_PEOPLE,
    TIP_PRESETS: TIP_PRESETS,
    getCurrencyConfig: getCurrencyConfig,
    formatCurrency: formatCurrency,
    formatTipPercent: formatTipPercent,
    parseNonNegativeNumber: parseNonNegativeNumber,
    parsePositiveInteger: parsePositiveInteger,
    calculateSplit: calculateSplit,
    buildSplitSummary: buildSplitSummary
  };
})(window);
