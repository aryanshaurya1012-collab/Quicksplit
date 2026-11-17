/**
 * Safe localStorage helpers for theme preference, currency choice,
 * round-up preference, and recent splits history.
 */
(function (global) {
  "use strict";

  var THEME_KEY = "quicksplit-theme";
  var CURRENCY_KEY = "quicksplit-currency";
  var ROUND_KEY = "quicksplit-round";
  var HISTORY_KEY = "quicksplit-recent";
  var MAX_HISTORY = 8;

  var ALLOWED_CURRENCIES = {
    INR: true,
    USD: true,
    EUR: true,
    GBP: true,
    CAD: true,
    AUD: true,
    JPY: true,
    SGD: true,
    AED: true
  };

  function isStorageAvailable() {
    try {
      if (typeof window === "undefined" || !window.localStorage) return false;
      var testKey = "__quicksplit_test__";
      window.localStorage.setItem(testKey, "1");
      window.localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  }

  var storageAvailable = isStorageAvailable();

  function readRaw(key) {
    if (!storageAvailable) return null;
    try {
      return window.localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function writeRaw(key, value) {
    if (!storageAvailable) return false;
    try {
      window.localStorage.setItem(key, value);
      return true;
    } catch (error) {
      return false;
    }
  }

  function removeRaw(key) {
    if (!storageAvailable) return false;
    try {
      window.localStorage.removeItem(key);
      return true;
    } catch (error) {
      return false;
    }
  }

  function getTheme() {
    var value = readRaw(THEME_KEY);
    if (value === "light" || value === "dark") return value;
    return null;
  }

  function setTheme(theme) {
    if (theme !== "light" && theme !== "dark") return false;
    return writeRaw(THEME_KEY, theme);
  }

  function getCurrency() {
    var value = readRaw(CURRENCY_KEY);
    if (value && ALLOWED_CURRENCIES[value]) return value;
    return null;
  }

  function setCurrency(code) {
    if (!ALLOWED_CURRENCIES[code]) return false;
    return writeRaw(CURRENCY_KEY, code);
  }

  function getRoundUp() {
    var value = readRaw(ROUND_KEY);
    return value === "true";
  }

  function setRoundUp(flag) {
    return writeRaw(ROUND_KEY, flag ? "true" : "false");
  }

  function sanitizeHistoryEntry(entry) {
    if (!entry || typeof entry !== "object") return null;

    var bill = Number(entry.bill);
    var tipPercent = Number(entry.tipPercent);
    var tipAmount = Number(entry.tipAmount);
    var total = Number(entry.total);
    var people = Number(entry.people);
    var perPerson = Number(entry.perPerson);
    var isRounded = Boolean(entry.isRounded);
    var currency = typeof entry.currency === "string" ? entry.currency : "INR";
    var id = typeof entry.id === "string" && entry.id.length > 0 ? entry.id : String(Date.now());
    var savedAt = typeof entry.savedAt === "string" ? entry.savedAt : new Date().toISOString();

    if (
      !Number.isFinite(bill) ||
      bill <= 0 ||
      !Number.isFinite(tipPercent) ||
      tipPercent < 0 ||
      !Number.isFinite(tipAmount) ||
      !Number.isFinite(total) ||
      !Number.isFinite(people) ||
      people < 1 ||
      !Number.isInteger(people) ||
      !Number.isFinite(perPerson)
    ) {
      return null;
    }

    if (!ALLOWED_CURRENCIES[currency]) currency = "INR";

    return {
      id: id,
      bill: bill,
      tipPercent: tipPercent,
      tipAmount: tipAmount,
      total: total,
      people: people,
      perPerson: perPerson,
      isRounded: isRounded,
      currency: currency,
      savedAt: savedAt
    };
  }

  function getRecentSplits() {
    var raw = readRaw(HISTORY_KEY);
    if (!raw) return [];

    try {
      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];

      return parsed
        .map(sanitizeHistoryEntry)
        .filter(Boolean)
        .slice(0, MAX_HISTORY);
    } catch (error) {
      removeRaw(HISTORY_KEY);
      return [];
    }
  }

  function saveRecentSplit(entry) {
    var clean = sanitizeHistoryEntry(entry);
    if (!clean) return getRecentSplits();

    var list = getRecentSplits().filter(function (item) {
      return !(
        item.bill === clean.bill &&
        item.tipPercent === clean.tipPercent &&
        item.people === clean.people &&
        item.currency === clean.currency &&
        Boolean(item.isRounded) === Boolean(clean.isRounded)
      );
    });

    list.unshift(clean);
    list = list.slice(0, MAX_HISTORY);

    writeRaw(HISTORY_KEY, JSON.stringify(list));
    return list;
  }

  function deleteRecentSplit(id) {
    if (!id) return getRecentSplits();
    var list = getRecentSplits().filter(function (item) {
      return item.id !== id;
    });
    writeRaw(HISTORY_KEY, JSON.stringify(list));
    return list;
  }

  function clearRecentSplits() {
    removeRaw(HISTORY_KEY);
    return [];
  }

  global.QuickSplitStorage = {
    MAX_HISTORY: MAX_HISTORY,
    ALLOWED_CURRENCIES: ALLOWED_CURRENCIES,
    isAvailable: function () {
      return storageAvailable;
    },
    getTheme: getTheme,
    setTheme: setTheme,
    getCurrency: getCurrency,
    setCurrency: setCurrency,
    getRoundUp: getRoundUp,
    setRoundUp: setRoundUp,
    getRecentSplits: getRecentSplits,
    saveRecentSplit: saveRecentSplit,
    deleteRecentSplit: deleteRecentSplit,
    clearRecentSplits: clearRecentSplits
  };
})(typeof window !== "undefined" ? window : this);
