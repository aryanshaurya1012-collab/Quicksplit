/**
 * QuickSplit UI wiring: calculator controls, theme, history, copy/share, navigation.
 */
(function () {
  "use strict";

  var Calc = window.QuickSplitCalculator;
  var Store = window.QuickSplitStorage;

  if (!Calc || !Store) {
    console.error("QuickSplit modules failed to load.");
    return;
  }

  var billInput = document.getElementById("bill");
  var customTipInput = document.getElementById("custom-tip");
  var peopleInput = document.getElementById("people");
  var currencySelect = document.getElementById("currency");
  var tipButtons = Array.prototype.slice.call(document.querySelectorAll(".tip-btn"));
  var resetBtn = document.getElementById("reset-btn");
  var copyBtn = document.getElementById("copy-btn");
  var shareBtn = document.getElementById("share-btn");
  var actionStatus = document.getElementById("action-status");
  var peopleMinusBtn = document.getElementById("people-minus");
  var peoplePlusBtn = document.getElementById("people-plus");

  var billShell = document.getElementById("bill-shell");
  var customTipShell = document.getElementById("custom-tip-shell");
  var peopleShell = document.getElementById("people-shell");
  var currencySymbolEl = document.getElementById("currency-symbol");

  var billHint = document.getElementById("bill-hint");
  var tipHint = document.getElementById("tip-hint");
  var peopleHint = document.getElementById("people-hint");

  var originalBillEl = document.getElementById("original-bill");
  var tipPercentEl = document.getElementById("tip-percent-display");
  var tipAmountEl = document.getElementById("tip-amount");
  var totalBillEl = document.getElementById("total-bill");
  var peopleCountEl = document.getElementById("people-count-display");
  var perPersonEl = document.getElementById("per-person");

  var historyList = document.getElementById("history-list");
  var historyEmpty = document.getElementById("history-empty");
  var clearHistoryBtn = document.getElementById("clear-history-btn");

  var themeToggle = document.getElementById("theme-toggle");
  var navToggle = document.getElementById("nav-toggle");
  var siteNav = document.getElementById("site-nav");
  var startSplitBtn = document.getElementById("start-split-btn");

  var selectedTip = Calc.DEFAULT_TIP;
  var usingCustomTip = false;
  var currentCurrency = Calc.DEFAULT_CURRENCY;
  var actionFeedbackTimer = null;
  var lastSavedSignature = "";
  var saveHistoryTimer = null;

  function getPreferredTheme() {
    var stored = Store.getTheme();
    if (stored) return stored;
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
    return "light";
  }

  function applyTheme(theme) {
    var next = theme === "dark" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    Store.setTheme(next);

    if (themeToggle) {
      var isDark = next === "dark";
      themeToggle.setAttribute("aria-pressed", isDark ? "true" : "false");
      themeToggle.setAttribute(
        "aria-label",
        isDark ? "Switch to light theme" : "Switch to dark theme"
      );
      var label = themeToggle.querySelector(".theme-toggle-label");
      if (label) label.textContent = isDark ? "Light" : "Dark";
    }
  }

  function setHint(el, shell, message) {
    if (!el) return;
    el.textContent = message || "";
    el.classList.toggle("visible", Boolean(message));
    if (shell) {
      shell.classList.toggle("invalid", Boolean(message));
    }
  }

  function setPressedStates() {
    tipButtons.forEach(function (btn) {
      var tip = Number(btn.getAttribute("data-tip"));
      var pressed = !usingCustomTip && tip === selectedTip;
      btn.setAttribute("aria-pressed", pressed ? "true" : "false");
    });

    if (customTipShell) {
      customTipShell.classList.toggle("is-active", usingCustomTip);
    }
  }

  function updateCurrencySymbol() {
    var config = Calc.getCurrencyConfig(currentCurrency);
    if (currencySymbolEl) {
      currencySymbolEl.textContent = config.symbol;
    }
  }

  function getTipPercent() {
    if (usingCustomTip) {
      var custom = Calc.parseNonNegativeNumber(customTipInput.value);
      if (custom === null) return { value: null, error: "Enter a tip %" };
      if (Number.isNaN(custom)) return { value: null, error: "Invalid tip %" };
      return { value: custom, error: "" };
    }
    return { value: selectedTip, error: "" };
  }

  function getValidatedInputs() {
    var billRaw = Calc.parseNonNegativeNumber(billInput.value);
    var peopleRaw = Calc.parsePositiveInteger(peopleInput.value);
    var tipInfo = getTipPercent();

    return {
      billRaw: billRaw,
      peopleRaw: peopleRaw,
      tipInfo: tipInfo,
      billEmpty: billRaw === null,
      billInvalid: billRaw !== null && Number.isNaN(billRaw),
      peopleInvalid: peopleRaw === null || Number.isNaN(peopleRaw),
      tipInvalid: Boolean(tipInfo.error)
    };
  }

  function getCopyableSplit() {
    var state = getValidatedInputs();

    if (state.billEmpty || state.billInvalid || state.peopleInvalid || state.tipInvalid) {
      return null;
    }

    var result = Calc.calculateSplit(state.billRaw, state.tipInfo.value, state.peopleRaw);
    if (!result.valid) return null;

    return {
      bill: state.billRaw,
      tipPercent: state.tipInfo.value,
      tipAmount: result.tipAmount,
      total: result.total,
      people: state.peopleRaw,
      perPerson: result.perPerson,
      currency: currentCurrency
    };
  }

  function clearActionFeedback() {
    if (actionFeedbackTimer) {
      clearTimeout(actionFeedbackTimer);
      actionFeedbackTimer = null;
    }
    if (copyBtn) copyBtn.classList.remove("is-success");
    if (shareBtn) shareBtn.classList.remove("is-success");
    if (actionStatus) {
      actionStatus.textContent = "";
      actionStatus.classList.remove("visible", "is-error");
    }
  }

  function showActionFeedback(message, options) {
    options = options || {};
    clearActionFeedback();

    if (options.successButton === "copy" && copyBtn) {
      copyBtn.classList.add("is-success");
    }
    if (options.successButton === "share" && shareBtn) {
      shareBtn.classList.add("is-success");
    }

    if (actionStatus) {
      actionStatus.textContent = message;
      actionStatus.classList.add("visible");
      actionStatus.classList.toggle("is-error", Boolean(options.error));
    }

    actionFeedbackTimer = setTimeout(function () {
      if (copyBtn) copyBtn.classList.remove("is-success");
      if (shareBtn) shareBtn.classList.remove("is-success");
      if (actionStatus) {
        actionStatus.classList.remove("visible", "is-error");
        actionStatus.textContent = "";
      }
      actionFeedbackTimer = null;
    }, 2200);
  }

  function copyTextFallback(text) {
    var textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.top = "0";
    textarea.style.left = "-9999px";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);

    var succeeded = false;
    try {
      succeeded = document.execCommand("copy");
    } catch (error) {
      succeeded = false;
    }

    document.body.removeChild(textarea);
    return succeeded;
  }

  function copyTextToClipboard(text) {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      return navigator.clipboard.writeText(text).then(function () {
        return true;
      }).catch(function () {
        return copyTextFallback(text);
      });
    }

    return Promise.resolve(copyTextFallback(text));
  }

  function updateActionButtons() {
    var canUse = getCopyableSplit() !== null;
    if (copyBtn) copyBtn.disabled = !canUse;
    if (shareBtn) shareBtn.disabled = !canUse;
  }

  function signatureForSplit(split) {
    return [
      split.currency,
      split.bill,
      split.tipPercent,
      split.people,
      split.total.toFixed(4),
      split.perPerson.toFixed(4)
    ].join("|");
  }

  function queueHistorySave(split) {
    if (!split) return;
    var signature = signatureForSplit(split);
    if (signature === lastSavedSignature) return;

    if (saveHistoryTimer) clearTimeout(saveHistoryTimer);
    saveHistoryTimer = setTimeout(function () {
      var list = Store.saveRecentSplit({
        id: String(Date.now()),
        bill: split.bill,
        tipPercent: split.tipPercent,
        tipAmount: split.tipAmount,
        total: split.total,
        people: split.people,
        perPerson: split.perPerson,
        currency: split.currency,
        savedAt: new Date().toISOString()
      });
      lastSavedSignature = signature;
      renderHistory(list);
      saveHistoryTimer = null;
    }, 650);
  }

  function renderHistory(list) {
    if (!historyList || !historyEmpty) return;

    var items = list || Store.getRecentSplits();
    historyList.innerHTML = "";

    if (!items.length) {
      historyEmpty.hidden = false;
      historyList.hidden = true;
      if (clearHistoryBtn) clearHistoryBtn.disabled = true;
      return;
    }

    historyEmpty.hidden = true;
    historyList.hidden = false;
    if (clearHistoryBtn) clearHistoryBtn.disabled = false;

    items.forEach(function (item) {
      var button = document.createElement("button");
      button.type = "button";
      button.className = "history-item";
      button.setAttribute(
        "aria-label",
        "Restore split of " +
          Calc.formatCurrency(item.bill, item.currency) +
          " for " +
          item.people +
          " people"
      );

      button.innerHTML =
        '<span class="history-item-main">' +
        '<span class="history-item-total">' +
        Calc.formatCurrency(item.total, item.currency) +
        "</span>" +
        '<span class="history-item-meta">' +
        Calc.formatTipPercent(item.tipPercent) +
        " tip · " +
        item.people +
        (item.people === 1 ? " person" : " people") +
        "</span>" +
        "</span>" +
        '<span class="history-item-per">' +
        Calc.formatCurrency(item.perPerson, item.currency) +
        "<small>/person</small></span>";

      button.addEventListener("click", function () {
        restoreSplit(item);
      });

      historyList.appendChild(button);
    });
  }

  function restoreSplit(item) {
    currentCurrency = item.currency || Calc.DEFAULT_CURRENCY;
    if (currencySelect) currencySelect.value = currentCurrency;
    updateCurrencySymbol();

    billInput.value = String(item.bill);

    if (Calc.TIP_PRESETS.indexOf(item.tipPercent) !== -1) {
      usingCustomTip = false;
      selectedTip = item.tipPercent;
      customTipInput.value = "";
    } else {
      usingCustomTip = true;
      selectedTip = Calc.DEFAULT_TIP;
      customTipInput.value = String(item.tipPercent);
    }

    peopleInput.value = String(item.people);
    setPressedStates();
    calculate();
    billInput.focus();

    var calculatorSection = document.getElementById("calculator");
    if (calculatorSection) {
      calculatorSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function calculate() {
    var state = getValidatedInputs();

    var billError = "";
    var peopleError = "";

    if (state.billInvalid) {
      billError = "Enter a valid amount";
    }

    if (state.peopleRaw !== null && Number.isNaN(state.peopleRaw)) {
      peopleError = "Whole number ≥ 1";
    } else if (state.peopleRaw === null) {
      peopleError = "Required";
    }

    setHint(billHint, billShell, billError);
    setHint(peopleHint, peopleShell, peopleError);
    setHint(tipHint, customTipShell, usingCustomTip ? state.tipInfo.error : "");

    var bill = state.billEmpty || state.billInvalid ? 0 : state.billRaw;
    var tipPercent = state.tipInfo.value === null ? 0 : state.tipInfo.value;
    var people = state.peopleInvalid ? null : state.peopleRaw;

    var tipAmount = 0;
    var total = 0;
    var perPerson = null;

    if (people !== null) {
      var result = Calc.calculateSplit(bill, tipPercent, people);
      tipAmount = result.tipAmount === null ? 0 : result.tipAmount;
      total = result.total === null ? 0 : result.total;
      perPerson = result.perPerson;
    } else {
      tipAmount = bill * (tipPercent / 100);
      total = bill + tipAmount;
      if (!Number.isFinite(tipAmount)) tipAmount = 0;
      if (!Number.isFinite(total)) total = 0;
    }

    if (originalBillEl) originalBillEl.textContent = Calc.formatCurrency(bill, currentCurrency);
    if (tipPercentEl) tipPercentEl.textContent = Calc.formatTipPercent(tipPercent);
    if (tipAmountEl) tipAmountEl.textContent = Calc.formatCurrency(tipAmount, currentCurrency);
    if (totalBillEl) totalBillEl.textContent = Calc.formatCurrency(total, currentCurrency);
    if (peopleCountEl) {
      peopleCountEl.textContent = people === null ? "—" : String(people);
    }

    var nextPerPerson = perPerson === null ? "—" : Calc.formatCurrency(perPerson, currentCurrency);
    if (perPersonEl && perPersonEl.textContent !== nextPerPerson) {
      perPersonEl.textContent = nextPerPerson;
      perPersonEl.classList.remove("tick");
      void perPersonEl.offsetWidth;
      perPersonEl.classList.add("tick");
    }

    clearActionFeedback();
    updateActionButtons();

    var completeSplit = getCopyableSplit();
    if (completeSplit && completeSplit.bill > 0) {
      queueHistorySave(completeSplit);
    }
  }

  function adjustPeople(delta) {
    var current = Calc.parsePositiveInteger(peopleInput.value);
    if (current === null || Number.isNaN(current)) {
      current = Calc.DEFAULT_PEOPLE;
    }
    var next = Math.max(1, current + delta);
    peopleInput.value = String(next);
    calculate();
  }

  function resetAll() {
    billInput.value = "";
    customTipInput.value = "";
    peopleInput.value = String(Calc.DEFAULT_PEOPLE);
    currentCurrency = Calc.DEFAULT_CURRENCY;
    if (currencySelect) currencySelect.value = currentCurrency;
    selectedTip = Calc.DEFAULT_TIP;
    usingCustomTip = false;
    lastSavedSignature = "";
    if (saveHistoryTimer) {
      clearTimeout(saveHistoryTimer);
      saveHistoryTimer = null;
    }
    updateCurrencySymbol();
    setPressedStates();
    setHint(billHint, billShell, "");
    setHint(tipHint, customTipShell, "");
    setHint(peopleHint, peopleShell, "");
    calculate();
    billInput.focus();
  }

  function closeMobileNav() {
    if (!siteNav || !navToggle) return;
    siteNav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("nav-open");
  }

  function setupNavigation() {
    if (navToggle && siteNav) {
      navToggle.addEventListener("click", function () {
        var open = !siteNav.classList.contains("is-open");
        siteNav.classList.toggle("is-open", open);
        navToggle.setAttribute("aria-expanded", open ? "true" : "false");
        document.body.classList.toggle("nav-open", open);
      });
    }

    document.querySelectorAll('[data-nav-link]').forEach(function (link) {
      link.addEventListener("click", function () {
        closeMobileNav();
      });
    });

    if (startSplitBtn) {
      startSplitBtn.addEventListener("click", function (event) {
        event.preventDefault();
        var target = document.getElementById("calculator");
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
          setTimeout(function () {
            billInput.focus();
          }, 350);
        }
      });
    }

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeMobileNav();
    });
  }

  function populateCurrencySelect() {
    if (!currencySelect) return;
    currencySelect.innerHTML = "";
    Object.keys(Calc.CURRENCIES).forEach(function (code) {
      var option = document.createElement("option");
      option.value = code;
      option.textContent = Calc.CURRENCIES[code].label;
      currencySelect.appendChild(option);
    });
    currencySelect.value = currentCurrency;
  }

  tipButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      usingCustomTip = false;
      selectedTip = Number(btn.getAttribute("data-tip"));
      customTipInput.value = "";
      setPressedStates();
      calculate();
    });
  });

  customTipInput.addEventListener("input", function () {
    var raw = customTipInput.value.trim();
    if (raw === "") {
      usingCustomTip = false;
      selectedTip = Calc.DEFAULT_TIP;
    } else {
      usingCustomTip = true;
    }
    setPressedStates();
    calculate();
  });

  billInput.addEventListener("input", calculate);
  peopleInput.addEventListener("input", calculate);

  if (currencySelect) {
    currencySelect.addEventListener("change", function () {
      currentCurrency = currencySelect.value || Calc.DEFAULT_CURRENCY;
      updateCurrencySymbol();
      calculate();
    });
  }

  if (peopleMinusBtn) {
    peopleMinusBtn.addEventListener("click", function () {
      adjustPeople(-1);
    });
  }

  if (peoplePlusBtn) {
    peoplePlusBtn.addEventListener("click", function () {
      adjustPeople(1);
    });
  }

  document.getElementById("split-form").addEventListener("submit", function (event) {
    event.preventDefault();
  });

  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      var split = getCopyableSplit();
      if (!split) {
        updateActionButtons();
        return;
      }

      var summary = Calc.buildSplitSummary(split, currentCurrency);
      copyTextToClipboard(summary).then(function (succeeded) {
        if (succeeded) {
          showActionFeedback("Summary copied successfully!", { successButton: "copy" });
        } else {
          showActionFeedback("Could not copy summary", { error: true });
        }
      });
    });
  }

  if (shareBtn) {
    shareBtn.addEventListener("click", function () {
      var split = getCopyableSplit();
      if (!split) {
        updateActionButtons();
        return;
      }

      var summary = Calc.buildSplitSummary(split, currentCurrency);

      if (navigator.share) {
        navigator
          .share({
            title: "QuickSplit Summary",
            text: summary
          })
          .then(function () {
            showActionFeedback("Summary shared!", { successButton: "share" });
          })
          .catch(function (error) {
            if (error && error.name === "AbortError") return;
            copyTextToClipboard(summary).then(function (succeeded) {
              if (succeeded) {
                showActionFeedback("Share unavailable — copied instead", {
                  successButton: "share"
                });
              } else {
                showActionFeedback("Could not share summary", { error: true });
              }
            });
          });
        return;
      }

      copyTextToClipboard(summary).then(function (succeeded) {
        if (succeeded) {
          showActionFeedback("Share unavailable — copied instead", {
            successButton: "share"
          });
        } else {
          showActionFeedback("Could not share summary", { error: true });
        }
      });
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", resetAll);
  }

  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener("click", function () {
      renderHistory(Store.clearRecentSplits());
      lastSavedSignature = "";
    });
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var current = document.documentElement.getAttribute("data-theme") || "light";
      applyTheme(current === "dark" ? "light" : "dark");
    });
  }

  applyTheme(getPreferredTheme());
  populateCurrencySelect();
  updateCurrencySymbol();
  setupNavigation();
  setPressedStates();
  renderHistory();
  calculate();
})();
