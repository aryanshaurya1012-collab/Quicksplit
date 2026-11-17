/**
 * Pure calculation and formatting helpers for QuickSplit.
 * UI-agnostic and unit-testable across Browser and Node environments.
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

  function roundCurrency(val) {
    if (!Number.isFinite(val)) return 0;
    return Math.round((val + Number.EPSILON) * 100) / 100;
  }

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
    var rounded = Math.round(value * 100) / 100;
    return String(rounded) + "%";
  }

  function parseNonNegativeNumber(raw) {
    if (raw === null || raw === undefined) return null;
    var trimmed = String(raw).trim();
    if (trimmed === "") return null;
    var value = Number(trimmed);
    if (!Number.isFinite(value) || value < 0) return NaN;
    if (value > 100000000000) return NaN;
    return value;
  }

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
   * Calculates bill split with optional discount, sales tax, and round-up ceiling.
   */
  function calculateSplit(bill, tipPercent, people, roundUp, taxPercent, discountVal, discountType) {
    var validBill = Number.isFinite(bill) && bill >= 0 ? roundCurrency(bill) : 0;
    var validTip = Number.isFinite(tipPercent) && tipPercent >= 0 ? tipPercent : 0;
    var validTax = Number.isFinite(taxPercent) && taxPercent >= 0 ? taxPercent : 0;
    var validPeople = Number.isInteger(people) && people >= 1 ? people : 1;
    var dVal = Number(discountVal) || 0;
    var dType = discountType === "flat" ? "flat" : "percent";

    var discountAmount = 0;
    if (dVal > 0) {
      if (dType === "percent") {
        discountAmount = roundCurrency(validBill * (Math.min(100, dVal) / 100));
      } else {
        discountAmount = roundCurrency(Math.min(validBill, dVal));
      }
    }

    var discountedSubtotal = Math.max(0, roundCurrency(validBill - discountAmount));
    var taxAmount = roundCurrency(discountedSubtotal * (validTax / 100));
    var rawTipAmount = roundCurrency(discountedSubtotal * (validTip / 100));
    var total = roundCurrency(discountedSubtotal + taxAmount + rawTipAmount);
    var rawPerPerson = total / validPeople;

    var perPerson = rawPerPerson;
    var roundingDifference = 0;
    var isRounded = false;

    if (Boolean(roundUp) && total > 0) {
      var roundedPerPerson = Math.ceil(rawPerPerson);
      if (roundedPerPerson > rawPerPerson) {
        roundingDifference = roundCurrency((roundedPerPerson * validPeople) - total);
        perPerson = roundedPerPerson;
        isRounded = true;
      }
    }

    var adjustedTotal = roundCurrency(perPerson * validPeople);
    var adjustedTip = roundCurrency(rawTipAmount + roundingDifference);

    return {
      bill: validBill,
      discountVal: dVal,
      discountType: dType,
      discountAmount: discountAmount,
      discountedSubtotal: discountedSubtotal,
      taxPercent: validTax,
      taxAmount: taxAmount,
      tipPercent: validTip,
      tipAmount: adjustedTip,
      rawTipAmount: rawTipAmount,
      total: adjustedTotal,
      rawTotal: total,
      people: validPeople,
      perPerson: roundCurrency(perPerson),
      rawPerPerson: roundCurrency(rawPerPerson),
      roundingDifference: roundCurrency(roundingDifference),
      isRounded: isRounded,
      valid: validBill > 0 || total > 0
    };
  }

  /**
   * Calculates itemized bill split with item sharing, discounts, and taxes.
   */
  function calculateItemizedSplit(items, tipPercent, friends, roundUp, taxPercent, discountVal, discountType) {
    var validTip = Number.isFinite(tipPercent) && tipPercent >= 0 ? tipPercent : 0;
    var validTax = Number.isFinite(taxPercent) && taxPercent >= 0 ? taxPercent : 0;
    var dVal = Number(discountVal) || 0;
    var dType = discountType === "flat" ? "flat" : "percent";

    var friendTotals = {};
    friends.forEach(function (f) {
      friendTotals[f.id] = 0;
    });

    var subtotal = 0;
    items.forEach(function (item) {
      var price = parseFloat(item.price) || 0;
      if (price > 0 && Array.isArray(item.sharedBy) && item.sharedBy.length > 0) {
        subtotal += price;
        var splitPrice = price / item.sharedBy.length;
        item.sharedBy.forEach(function (fId) {
          if (friendTotals[fId] !== undefined) {
            friendTotals[fId] += splitPrice;
          }
        });
      }
    });

    subtotal = roundCurrency(subtotal);

    var discountAmount = 0;
    if (dVal > 0 && subtotal > 0) {
      if (dType === "percent") {
        discountAmount = roundCurrency(subtotal * (Math.min(100, dVal) / 100));
      } else {
        discountAmount = roundCurrency(Math.min(subtotal, dVal));
      }
    }

    var discountedSubtotal = Math.max(0, roundCurrency(subtotal - discountAmount));
    var discountRatio = subtotal > 0 ? discountedSubtotal / subtotal : 1;
    var taxAmount = roundCurrency(discountedSubtotal * (validTax / 100));
    var rawTipAmount = roundCurrency(discountedSubtotal * (validTip / 100));
    var rawTotal = roundCurrency(discountedSubtotal + taxAmount + rawTipAmount);

    var effectiveMultiplier = subtotal > 0 ? (discountedSubtotal + taxAmount + rawTipAmount) / subtotal : 1;

    var breakdown = friends.map(function (f) {
      var itemShare = friendTotals[f.id] || 0;
      var discountedShare = roundCurrency(itemShare * discountRatio);
      var shareTotal = roundCurrency(itemShare * effectiveMultiplier);

      return {
        id: f.id,
        name: f.name,
        rawShare: roundCurrency(itemShare),
        discountedShare: discountedShare,
        totalShare: shareTotal,
        tipShare: roundCurrency(shareTotal - discountedShare)
      };
    });

    var totalCalculated = breakdown.reduce(function (sum, f) {
      return sum + f.totalShare;
    }, 0);
    totalCalculated = roundCurrency(totalCalculated);

    var roundingDifference = 0;
    var isRounded = false;

    if (roundUp && totalCalculated > 0) {
      breakdown = breakdown.map(function (f) {
        var rounded = Math.ceil(f.totalShare);
        if (rounded > f.totalShare) {
          isRounded = true;
        }
        return Object.assign({}, f, { totalShare: rounded });
      });

      var newTotal = breakdown.reduce(function (sum, f) {
        return sum + f.totalShare;
      }, 0);
      roundingDifference = roundCurrency(newTotal - totalCalculated);
      totalCalculated = newTotal;
    }

    return {
      subtotal: subtotal,
      discountVal: dVal,
      discountType: dType,
      discountAmount: discountAmount,
      discountedSubtotal: discountedSubtotal,
      taxPercent: validTax,
      taxAmount: taxAmount,
      tipPercent: validTip,
      tipAmount: roundCurrency(rawTipAmount + roundingDifference),
      rawTipAmount: rawTipAmount,
      total: totalCalculated,
      breakdown: breakdown,
      roundingDifference: roundingDifference,
      isRounded: isRounded
    };
  }

  /**
   * Debt Minimizer: Computes optimal settlements ("Who Owes Whom").
   */
  function calculateSettlements(friends, currencyCode) {
    if (!Array.isArray(friends) || friends.length <= 1) {
      return [];
    }

    var balances = friends.map(function (f) {
      var paid = Number(f.paidAmount) || 0;
      var share = Number(f.totalShare) || 0;
      var net = roundCurrency(paid - share);
      return { id: f.id, name: f.name, net: net };
    });

    var creditors = [];
    var debtors = [];

    balances.forEach(function (b) {
      if (b.net > 0.01) {
        creditors.push(Object.assign({}, b));
      } else if (b.net < -0.01) {
        debtors.push(Object.assign({}, b, { net: Math.abs(b.net) }));
      }
    });

    creditors.sort(function (a, b) { return b.net - a.net; });
    debtors.sort(function (a, b) { return b.net - a.net; });

    var transactions = [];
    var cIdx = 0;
    var dIdx = 0;

    while (cIdx < creditors.length && dIdx < debtors.length) {
      var creditor = creditors[cIdx];
      var debtor = debtors[dIdx];
      var amount = roundCurrency(Math.min(creditor.net, debtor.net));

      if (amount > 0.01) {
        transactions.push({
          from: debtor.name,
          to: creditor.name,
          fromId: debtor.id,
          toId: creditor.id,
          amount: amount,
          formatted: formatCurrency(amount, currencyCode || DEFAULT_CURRENCY)
        });
      }

      creditor.net = roundCurrency(creditor.net - amount);
      debtor.net = roundCurrency(debtor.net - amount);

      if (creditor.net <= 0.01) cIdx++;
      if (debtor.net <= 0.01) dIdx++;
    }

    return transactions;
  }

  /**
   * Smart Receipt Parser.
   */
  function parseReceiptText(rawText, defaultFriends) {
    if (!rawText || typeof rawText !== "string") return [];
    var lines = rawText.split(/\r?\n/).map(function (l) { return l.trim(); }).filter(Boolean);
    var parsedItems = [];
    var friendIds = (defaultFriends || []).map(function (f) { return f.id; });

    lines.forEach(function (line, index) {
      var lower = line.toLowerCase();
      if (
        lower.indexOf("subtotal") !== -1 ||
        lower.indexOf("grand total") !== -1 ||
        lower.indexOf("total amount") !== -1 ||
        lower.indexOf("tax invoice") !== -1 ||
        lower.indexOf("thank you") !== -1 ||
        lower.indexOf("gstin") !== -1 ||
        lower.indexOf("visit again") !== -1 ||
        /^[=-_#*]{3,}$/.test(line)
      ) {
        return;
      }

      var priceMatch = line.match(/(?:[$₹€£]\s*)?(\d+(?:[.,]\d{1,2})?)\s*(?:[$₹€£])?$/);
      if (priceMatch) {
        var priceRaw = priceMatch[1].replace(",", ".");
        var priceNum = parseFloat(priceRaw);

        if (!isNaN(priceNum) && priceNum > 0) {
          var textPart = line.slice(0, priceMatch.index).trim().replace(/[-.:_]+$/, "").trim();
          var qtyMatch = textPart.match(/^(\d+)\s*(?:[xX*]|\b)\s*(.+)/);
          var name = textPart;
          var qty = 1;

          if (qtyMatch) {
            var parsedQty = parseInt(qtyMatch[1], 10);
            if (parsedQty > 0 && parsedQty <= 20) {
              qty = parsedQty;
              name = qtyMatch[2].trim();
            }
          }

          name = name.replace(/^[-*•>#]\s*/, "").trim();

          if (name.length > 0) {
            parsedItems.push({
              id: "item_parsed_" + Date.now() + "_" + index,
              name: qty > 1 ? name + " (x" + qty + ")" : name,
              price: String(priceNum),
              sharedBy: friendIds.slice()
            });
          }
        }
      }
    });

    return parsedItems;
  }

  function buildSplitSummary(split, currencyCode) {
    var lines = [
      "🧾 QuickSplit — Bill Summary",
      "────────────────────────────",
      "Bill Subtotal:      " + formatCurrency(split.bill || split.subtotal, currencyCode)
    ];

    if (split.discountAmount > 0) {
      lines.push("Discount Applied:  -" + formatCurrency(split.discountAmount, currencyCode));
    }
    if (split.taxAmount > 0) {
      lines.push("Tax / GST (" + split.taxPercent + "%):   +" + formatCurrency(split.taxAmount, currencyCode));
    }

    lines.push(
      "Tip (" + formatTipPercent(split.tipPercent) + "):         " + formatCurrency(split.tipAmount, currencyCode)
    );

    if (split.isRounded && split.roundingDifference > 0) {
      lines.push("Rounding Bonus:     +" + formatCurrency(split.roundingDifference, currencyCode));
    }

    lines.push(
      "Total Check:        " + formatCurrency(split.total, currencyCode),
      "Number of People:   " + (split.people || (split.breakdown ? split.breakdown.length : 1)),
      "────────────────────────────"
    );

    if (split.perPerson) {
      lines.push("👉 Amount Per Person: " + formatCurrency(split.perPerson, currencyCode) + (split.isRounded ? " (Rounded)" : ""));
    }

    lines.push(
      "────────────────────────────",
      "Calculated with QuickSplit ✨"
    );

    return lines.join("\n");
  }

  var api = {
    CURRENCIES: CURRENCIES,
    DEFAULT_CURRENCY: DEFAULT_CURRENCY,
    DEFAULT_TIP: DEFAULT_TIP,
    DEFAULT_PEOPLE: DEFAULT_PEOPLE,
    TIP_PRESETS: TIP_PRESETS,
    roundCurrency: roundCurrency,
    getCurrencyConfig: getCurrencyConfig,
    createCurrencyFormatter: createCurrencyFormatter,
    formatCurrency: formatCurrency,
    formatTipPercent: formatTipPercent,
    parseNonNegativeNumber: parseNonNegativeNumber,
    parsePositiveInteger: parsePositiveInteger,
    calculateSplit: calculateSplit,
    calculateItemizedSplit: calculateItemizedSplit,
    calculateSettlements: calculateSettlements,
    parseReceiptText: parseReceiptText,
    buildSplitSummary: buildSplitSummary
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }
  global.QuickSplitCalculator = api;
})(typeof window !== "undefined" ? window : this);
