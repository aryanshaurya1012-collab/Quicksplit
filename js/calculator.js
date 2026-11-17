/**
 * Pure calculation and formatting helpers for QuickSplit.
 * No DOM access — keep this module UI-agnostic and unit-testable.
 */
(function (global) {
  "use strict";

  var CURRENCIES = {
    INR: { code: "INR", locale: "en-IN", symbol: "₹", label: "INR (₹) — Indian Rupee", decimals: 2 },
    USD: { code: "USD", locale: "en-US", symbol: "$", label: "USD ($) — US Dollar", decimals: 2 },
    EUR: { code: "EUR", locale: "en-IE", symbol: "€", label: "EUR (€) — Euro", decimals: 2 },
    GBP: { code: "GBP", locale: "en-GB", symbol: "£", label: "GBP (£) — British Pound", decimals: 2 },
    CAD: { code: "CAD", locale: "en-CA", symbol: "CA$", label: "CAD (CA$) — Canadian Dollar", decimals: 2 },
    AUD: { code: "AUD", locale: "en-AU", symbol: "A$", label: "AUD (A$) — Australian Dollar", decimals: 2 },
    JPY: { code: "JPY", locale: "ja-JP", symbol: "¥", label: "JPY (¥) — Japanese Yen", decimals: 0 },
    SGD: { code: "SGD", locale: "en-SG", symbol: "S$", label: "SGD (S$) — Singapore Dollar", decimals: 2 },
    AED: { code: "AED", locale: "en-AE", symbol: "AED", label: "AED (د.إ) — UAE Dirham", decimals: 2 }
  };

  var DEFAULT_CURRENCY = "INR";
  var DEFAULT_TIP = 15;
  var DEFAULT_PEOPLE = 1;
  var TIP_PRESETS = [0, 5, 10, 15, 18, 20, 25];

  function getCurrencyConfig(code) {
    return CURRENCIES[code] || CURRENCIES[DEFAULT_CURRENCY];
  }

  function createCurrencyFormatter(currencyCode) {
    var config = getCurrencyConfig(currencyCode);
    var decimals = typeof config.decimals === "number" ? config.decimals : 2;
    return new Intl.NumberFormat(config.locale, {
      style: "currency",
      currency: config.code,
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
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
    // Format to max 2 decimal places to avoid floating point ugliness like 15.3333333%
    var rounded = Math.round(value * 100) / 100;
    return String(rounded) + "%";
  }

  /**
   * Parse a non-negative number from input text.
   * Returns: null (empty), NaN (invalid), or a finite number >= 0.
   */
  function parseNonNegativeNumber(raw) {
    if (raw === null || raw === undefined) return null;
    var trimmed = String(raw).trim();
    if (trimmed === "") return null;
    var value = Number(trimmed);
    if (!Number.isFinite(value) || value < 0) return NaN;
    // Cap at 100 billion to prevent number overflow
    if (value > 100000000000) return NaN;
    return value;
  }

  /**
   * Parse a positive integer (>= 1) from input text.
   * Returns: null (empty), NaN (invalid), or an integer >= 1.
   */
  function parsePositiveInteger(raw) {
    if (raw === null || raw === undefined) return null;
    var trimmed = String(raw).trim();
    if (trimmed === "") return null;
    if (!/^\d+$/.test(trimmed)) return NaN;
    var value = Number(trimmed);
    if (!Number.isFinite(value) || value < 1 || value > 1000) return NaN;
    return value;
  }

  /**
   * Calculates bill split with optional round up to next whole currency unit.
   *
   * @param {number} bill - Raw bill amount
   * @param {number} tipPercent - Tip percentage (0..1000)
   * @param {number} people - Positive whole number of people
   * @param {boolean} [roundUp=false] - If true, rounds per-person share up to next whole currency unit
   * @returns {Object} Calculation result
   */
  function calculateSplit(bill, tipPercent, people, roundUp) {
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
    var perPersonRaw = total / people;
    var perPerson = perPersonRaw;
    var roundingDifference = 0;
    var isRounded = false;

    if (Boolean(roundUp) && total > 0) {
      // Round per person up to the next integer
      var roundedPerPerson = Math.ceil(perPersonRaw);
      if (roundedPerPerson > perPersonRaw) {
        var roundedTotal = roundedPerPerson * people;
        roundingDifference = roundedTotal - total;
        perPerson = roundedPerPerson;
        total = roundedTotal;
        tipAmount = tipAmount + roundingDifference;
        isRounded = true;
      }
    }

    if (!Number.isFinite(tipAmount) || !Number.isFinite(total) || !Number.isFinite(perPerson)) {
      return { tipAmount: null, total: null, perPerson: null, valid: false };
    }

    return {
      bill: bill,
      tipPercent: tipPercent,
      tipAmount: tipAmount,
      total: total,
      people: people,
      perPerson: perPerson,
      perPersonRaw: perPersonRaw,
      roundingDifference: roundingDifference,
      isRounded: isRounded,
      valid: true
    };
  }

  /**
   * Builds an attractive, formatted plain-text summary suitable for clipboard & messaging.
   */
  function buildSplitSummary(split, currencyCode) {
    var lines = [
      "🧾 QuickSplit — Bill Summary",
      "────────────────────────────",
      "Bill Amount:        " + formatCurrency(split.bill, currencyCode),
      "Tip Percentage:     " + formatTipPercent(split.tipPercent),
      "Tip Amount:         " + formatCurrency(split.tipAmount, currencyCode)
    ];

    if (split.isRounded && split.roundingDifference > 0) {
      lines.push("Rounding Bonus:     +" + formatCurrency(split.roundingDifference, currencyCode));
    }

    lines.push(
      "Total Bill:         " + formatCurrency(split.total, currencyCode),
      "Number of People:   " + split.people + (split.people === 1 ? " person" : " people"),
      "────────────────────────────",
      "👉 Amount Per Person: " + formatCurrency(split.perPerson, currencyCode) + (split.isRounded ? " (Rounded up)" : ""),
      "────────────────────────────",
      "Calculated with QuickSplit ✨"
    );

    return lines.join("\n");
  }

  global.QuickSplitCalculator = {
    CURRENCIES: CURRENCIES,
    DEFAULT_CURRENCY: DEFAULT_CURRENCY,
    DEFAULT_TIP: DEFAULT_TIP,
    DEFAULT_PEOPLE: DEFAULT_PEOPLE,
    TIP_PRESETS: TIP_PRESETS,
    getCurrencyConfig: getCurrencyConfig,
    createCurrencyFormatter: createCurrencyFormatter,
    formatCurrency: formatCurrency,
    formatTipPercent: formatTipPercent,
    parseNonNegativeNumber: parseNonNegativeNumber,
    parsePositiveInteger: parsePositiveInteger,
    calculateSplit: calculateSplit,
    buildSplitSummary: buildSplitSummary
  };
})(typeof window !== "undefined" ? window : this);
