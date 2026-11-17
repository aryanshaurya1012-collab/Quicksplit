/**
 * QuickSplit 2.0 UI Wiring
 * Handles calculator logic, themes, history, copy/share, round-up, and accessibility.
 */
(function () {
  "use strict";

  var Calc = window.QuickSplitCalculator;
  var Store = window.QuickSplitStorage;

  if (!Calc || !Store) {
    console.error("QuickSplit core modules failed to load.");
    return;
  }

  // DOM Elements - Inputs
  var billInput = document.getElementById("bill");
  var billClearBtn = document.getElementById("bill-clear");
  var billShell = document.getElementById("bill-shell");
  var billHint = document.getElementById("bill-hint");
  var currencySymbolEl = document.getElementById("currency-symbol");
  var currencySelect = document.getElementById("currency");
  var quickAddChips = Array.prototype.slice.call(document.querySelectorAll(".chip-btn[data-add]"));

  var customTipInput = document.getElementById("custom-tip");
  var customTipShell = document.getElementById("custom-tip-shell");
  var tipHint = document.getElementById("tip-hint");
  var tipButtons = Array.prototype.slice.call(document.querySelectorAll(".tip-btn"));

  var peopleInput = document.getElementById("people");
  var peopleShell = document.getElementById("people-shell");
  var peopleHint = document.getElementById("people-hint");
  var peopleMinusBtn = document.getElementById("people-minus");
  var peoplePlusBtn = document.getElementById("people-plus");
  var peopleChips = Array.prototype.slice.call(document.querySelectorAll(".chip-btn.people-chip"));

  var roundUpCheckbox = document.getElementById("round-up");

  // DOM Elements - Receipt
  var receiptDateEl = document.getElementById("receipt-date");
  var originalBillEl = document.getElementById("original-bill");
  var tipPercentEl = document.getElementById("tip-percent-display");
  var tipAmountEl = document.getElementById("tip-amount");
  var roundingRowEl = document.getElementById("rounding-row");
  var roundingAmountEl = document.getElementById("rounding-amount");
  var totalBillEl = document.getElementById("total-bill");
  var peopleCountEl = document.getElementById("people-count-display");
  var perPersonEl = document.getElementById("per-person");
  var perPersonNoteEl = document.getElementById("per-person-note");

  // DOM Elements - Actions
  var copyBtn = document.getElementById("copy-btn");
  var shareBtn = document.getElementById("share-btn");
  var resetBtn = document.getElementById("reset-btn");
  var actionStatus = document.getElementById("action-status");

  // DOM Elements - History
  var historyList = document.getElementById("history-list");
  var historyEmpty = document.getElementById("history-empty");
  var clearHistoryBtn = document.getElementById("clear-history-btn");

  // DOM Elements - Nav & Global
  var themeToggle = document.getElementById("theme-toggle");
  var navToggle = document.getElementById("nav-toggle");
  var siteNav = document.getElementById("site-nav");
  var navBackdrop = document.getElementById("nav-backdrop");
  var startSplitBtn = document.getElementById("start-split-btn");
  var backToTopBtn = document.getElementById("back-to-top");
  var currentYearEl = document.getElementById("current-year");

  // App State
  var selectedTip = Calc.DEFAULT_TIP;
  var usingCustomTip = false;
  var currentCurrency = Store.getCurrency() || Calc.DEFAULT_CURRENCY;
  var isRoundUpActive = Store.getRoundUp();
  var actionFeedbackTimer = null;
  var lastSavedSignature = "";
  var saveHistoryTimer = null;

  /* ==========================================================================
     Theme Management
     ========================================================================== */

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

    // Update theme meta color
    var metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute("content", next === "dark" ? "#0e0c13" : "#6d4aff");
    }

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

  /* ==========================================================================
     Currency & Symbols
     ========================================================================== */

  function updateCurrencySymbol() {
    var config = Calc.getCurrencyConfig(currentCurrency);
    if (currencySymbolEl) {
      currencySymbolEl.textContent = config.symbol;
    }
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

  /* ==========================================================================
     Receipt Date & Form Hints
     ========================================================================== */

  function updateReceiptDate() {
    if (!receiptDateEl) return;
    var now = new Date();
    var timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    receiptDateEl.textContent = "Today at " + timeStr;
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

    // Update people preset chips
    var currentPeople = Calc.parsePositiveInteger(peopleInput.value);
    peopleChips.forEach(function (chip) {
      var count = Number(chip.getAttribute("data-people"));
      chip.classList.toggle("is-active", count === currentPeople);
    });
  }

  /* ==========================================================================
     Input Parsing & Validation
     ========================================================================== */

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

    // A valid bill to copy must be > 0
    if (state.billRaw <= 0) {
      return null;
    }

    var result = Calc.calculateSplit(
      state.billRaw,
      state.tipInfo.value,
      state.peopleRaw,
      isRoundUpActive
    );

    if (!result.valid) return null;

    return {
      bill: state.billRaw,
      tipPercent: state.tipInfo.value,
      tipAmount: result.tipAmount,
      total: result.total,
      people: state.peopleRaw,
      perPerson: result.perPerson,
      rawPerPerson: result.perPersonRaw,
      roundingDifference: result.roundingDifference,
      isRounded: result.isRounded,
      currency: currentCurrency
    };
  }

  /* ==========================================================================
     Calculator Engine
     ========================================================================== */

  function calculate() {
    var state = getValidatedInputs();

    var billError = "";
    var peopleError = "";

    if (state.billInvalid) {
      billError = "Enter a valid amount";
    }

    if (state.peopleRaw !== null && Number.isNaN(state.peopleRaw)) {
      peopleError = "Whole number 1 to 1000";
    } else if (state.peopleRaw === null) {
      peopleError = "Required";
    }

    setHint(billHint, billShell, billError);
    setHint(peopleHint, peopleShell, peopleError);
    setHint(tipHint, customTipShell, usingCustomTip ? state.tipInfo.error : "");

    // Clear button visibility
    if (billClearBtn) {
      billClearBtn.hidden = !(billInput.value && billInput.value.trim().length > 0);
    }

    // Stepper minus button disabled state
    if (peopleMinusBtn) {
      var curPeople = state.peopleRaw;
      peopleMinusBtn.disabled = curPeople === null || curPeople <= 1;
    }

    var bill = state.billEmpty || state.billInvalid ? 0 : state.billRaw;
    var tipPercent = state.tipInfo.value === null ? 0 : state.tipInfo.value;
    var people = state.peopleInvalid ? 1 : state.peopleRaw;

    var result = Calc.calculateSplit(bill, tipPercent, people, isRoundUpActive);

    var tipAmount = result.tipAmount !== null ? result.tipAmount : 0;
    var total = result.total !== null ? result.total : 0;
    var perPerson = result.perPerson;
    var isRounded = result.isRounded && result.roundingDifference > 0;

    // Update receipt rows
    if (originalBillEl) originalBillEl.textContent = Calc.formatCurrency(bill, currentCurrency);
    if (tipPercentEl) tipPercentEl.textContent = Calc.formatTipPercent(tipPercent);
    if (tipAmountEl) tipAmountEl.textContent = Calc.formatCurrency(tipAmount, currentCurrency);
    if (totalBillEl) totalBillEl.textContent = Calc.formatCurrency(total, currentCurrency);

    // Rounding adjustment row
    if (roundingRowEl && roundingAmountEl) {
      if (isRounded) {
        roundingRowEl.hidden = false;
        roundingAmountEl.textContent = "+" + Calc.formatCurrency(result.roundingDifference, currentCurrency);
      } else {
        roundingRowEl.hidden = true;
      }
    }

    if (peopleCountEl) {
      if (state.peopleInvalid) {
        peopleCountEl.textContent = "—";
      } else {
        peopleCountEl.textContent = people + (people === 1 ? " person" : " people");
      }
    }

    // Update Per Person Hero Display
    var nextPerPerson = (perPerson === null || state.billEmpty)
      ? Calc.formatCurrency(0, currentCurrency)
      : Calc.formatCurrency(perPerson, currentCurrency);

    if (perPersonEl && perPersonEl.textContent !== nextPerPerson) {
      perPersonEl.textContent = nextPerPerson;
      perPersonEl.classList.remove("tick");
      void perPersonEl.offsetWidth; // trigger reflow
      perPersonEl.classList.add("tick");
    }

    if (perPersonNoteEl) {
      if (isRounded) {
        perPersonNoteEl.textContent = "Rounded up to next whole currency unit (extra adds to tip)";
      } else if (people > 1) {
        perPersonNoteEl.textContent = "Evenly split between " + people + " people";
      } else {
        perPersonNoteEl.textContent = "Single person check";
      }
    }

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
    var next = Math.max(1, Math.min(1000, current + delta));
    peopleInput.value = String(next);
    setPressedStates();
    calculate();
  }

  function resetAll() {
    billInput.value = "";
    customTipInput.value = "";
    peopleInput.value = String(Calc.DEFAULT_PEOPLE);
    selectedTip = Calc.DEFAULT_TIP;
    usingCustomTip = false;
    lastSavedSignature = "";

    if (saveHistoryTimer) {
      clearTimeout(saveHistoryTimer);
      saveHistoryTimer = null;
    }

    if (billClearBtn) billClearBtn.hidden = true;

    setPressedStates();
    setHint(billHint, billShell, "");
    setHint(tipHint, customTipShell, "");
    setHint(peopleHint, peopleShell, "");
    updateReceiptDate();
    calculate();
    billInput.focus();
    showActionFeedback("Form reset to defaults");
  }

  /* ==========================================================================
     Action Feedback & Copy / Share
     ========================================================================== */

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
    }, 2600);
  }

  function updateActionButtons() {
    var canUse = getCopyableSplit() !== null;
    if (copyBtn) copyBtn.disabled = !canUse;
    if (shareBtn) shareBtn.disabled = !canUse;
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

  /* ==========================================================================
     History Storage & Rendering
     ========================================================================== */

  function signatureForSplit(split) {
    return [
      split.currency,
      split.bill,
      split.tipPercent,
      split.people,
      split.isRounded ? "round" : "raw",
      split.total.toFixed(2),
      split.perPerson.toFixed(2)
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
        isRounded: split.isRounded,
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
      var card = document.createElement("div");
      card.className = "history-card";

      var timeAgo = "Recently";
      if (item.savedAt) {
        var d = new Date(item.savedAt);
        if (!isNaN(d.getTime())) {
          timeAgo = d.toLocaleDateString([], { month: "short", day: "numeric" });
        }
      }

      var peopleText = item.people + (item.people === 1 ? " person" : " people");
      var roundedBadge = item.isRounded ? " · Rounded" : "";

      card.innerHTML =
        '<div class="history-card-top">' +
          '<div class="history-card-per">' +
            Calc.formatCurrency(item.perPerson, item.currency) +
            '<small>per person</small>' +
          '</div>' +
          '<span class="history-card-badge">' + timeAgo + '</span>' +
        '</div>' +
        '<div class="history-card-details">' +
          '<span><strong>Total:</strong> ' + Calc.formatCurrency(item.total, item.currency) + '</span>' +
          '<span>' + Calc.formatTipPercent(item.tipPercent) + ' tip · ' + peopleText + roundedBadge + '</span>' +
        '</div>' +
        '<div class="history-card-bottom">' +
          '<button type="button" class="history-restore-btn" data-id="' + item.id + '">Restore</button>' +
          '<button type="button" class="history-delete-btn" data-id="' + item.id + '" aria-label="Delete this split">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
              '<polyline points="3 6 5 6 21 6"></polyline>' +
              '<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>' +
            '</svg>' +
          '</button>' +
        '</div>';

      var restoreBtn = card.querySelector(".history-restore-btn");
      restoreBtn.addEventListener("click", function () {
        restoreSplit(item);
      });

      var deleteBtn = card.querySelector(".history-delete-btn");
      deleteBtn.addEventListener("click", function () {
        var updated = Store.deleteRecentSplit(item.id);
        renderHistory(updated);
        showActionFeedback("Split removed from history");
      });

      historyList.appendChild(card);
    });
  }

  function restoreSplit(item) {
    currentCurrency = item.currency || Calc.DEFAULT_CURRENCY;
    if (currencySelect) currencySelect.value = currentCurrency;
    Store.setCurrency(currentCurrency);
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
    isRoundUpActive = Boolean(item.isRounded);
    if (roundUpCheckbox) roundUpCheckbox.checked = isRoundUpActive;
    Store.setRoundUp(isRoundUpActive);

    setPressedStates();
    calculate();
    billInput.focus();

    var calcEl = document.getElementById("calculator");
    if (calcEl) {
      calcEl.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    showActionFeedback("Restored split of " + Calc.formatCurrency(item.bill, item.currency));
  }

  /* ==========================================================================
     Navigation, Back-To-Top & Mobile Menu
     ========================================================================== */

  function closeMobileNav() {
    if (!siteNav || !navToggle) return;
    siteNav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("nav-open");
    if (navBackdrop) navBackdrop.classList.remove("is-active");
  }

  function setupNavigation() {
    if (navToggle && siteNav) {
      navToggle.addEventListener("click", function () {
        var open = !siteNav.classList.contains("is-open");
        siteNav.classList.toggle("is-open", open);
        navToggle.setAttribute("aria-expanded", open ? "true" : "false");
        document.body.classList.toggle("nav-open", open);
        if (navBackdrop) navBackdrop.classList.toggle("is-active", open);
      });
    }

    if (navBackdrop) {
      navBackdrop.addEventListener("click", closeMobileNav);
    }

    document.querySelectorAll("[data-nav-link]").forEach(function (link) {
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

    // Scrollspy for active nav link
    var sections = document.querySelectorAll("section[id]");
    var navLinks = document.querySelectorAll(".site-nav a");

    window.addEventListener("scroll", function () {
      var scrollY = window.pageYOffset;

      // Back to top button visibility
      if (backToTopBtn) {
        if (scrollY > 350) {
          backToTopBtn.hidden = false;
        } else {
          backToTopBtn.hidden = true;
        }
      }

      sections.forEach(function (sec) {
        var top = sec.offsetTop - 120;
        var height = sec.offsetHeight;
        var id = sec.getAttribute("id");

        if (scrollY >= top && scrollY < top + height) {
          navLinks.forEach(function (link) {
            link.classList.remove("is-active");
            if (link.getAttribute("href") === "#" + id) {
              link.classList.add("is-active");
            }
          });
        }
      });
    }, { passive: true });

    if (backToTopBtn) {
      backToTopBtn.addEventListener("click", function () {
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
  }

  /* ==========================================================================
     Event Listeners
     ========================================================================== */

  // Clear bill input button
  if (billClearBtn) {
    billClearBtn.addEventListener("click", function () {
      billInput.value = "";
      billClearBtn.hidden = true;
      calculate();
      billInput.focus();
    });
  }

  // Quick addition chips (+10, +50, +100, +500)
  quickAddChips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var addVal = Number(chip.getAttribute("data-add"));
      var current = Calc.parseNonNegativeNumber(billInput.value) || 0;
      var next = Math.round((current + addVal) * 100) / 100;
      billInput.value = String(next);
      calculate();
      billInput.focus();
    });
  });

  // People chips (1, 2, 3, 4, 5, 6, 8)
  peopleChips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      var count = Number(chip.getAttribute("data-people"));
      peopleInput.value = String(count);
      setPressedStates();
      calculate();
    });
  });

  // Tip Preset Buttons
  tipButtons.forEach(function (btn) {
    btn.addEventListener("click", function () {
      usingCustomTip = false;
      selectedTip = Number(btn.getAttribute("data-tip"));
      customTipInput.value = "";
      setPressedStates();
      calculate();
    });
  });

  // Custom Tip Input
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

  // Number input listeners
  billInput.addEventListener("input", calculate);
  peopleInput.addEventListener("input", function () {
    setPressedStates();
    calculate();
  });

  // Prevent accidental mouse wheel scroll changes on number inputs
  [billInput, customTipInput, peopleInput].forEach(function (input) {
    if (input) {
      input.addEventListener("wheel", function (e) {
        if (document.activeElement === input) {
          e.preventDefault();
        }
      }, { passive: false });
    }
  });

  // Round Up toggle
  if (roundUpCheckbox) {
    roundUpCheckbox.checked = isRoundUpActive;
    roundUpCheckbox.addEventListener("change", function () {
      isRoundUpActive = roundUpCheckbox.checked;
      Store.setRoundUp(isRoundUpActive);
      calculate();
    });
  }

  // Currency select
  if (currencySelect) {
    currencySelect.addEventListener("change", function () {
      currentCurrency = currencySelect.value || Calc.DEFAULT_CURRENCY;
      Store.setCurrency(currentCurrency);
      updateCurrencySymbol();
      calculate();
      renderHistory(); // Re-render history cards to match current format
    });
  }

  // Stepper buttons
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

  // Form submit prevent
  var splitForm = document.getElementById("split-form");
  if (splitForm) {
    splitForm.addEventListener("submit", function (event) {
      event.preventDefault();
    });
  }

  // Copy button
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
          showActionFeedback("Summary copied to clipboard!", { successButton: "copy" });
        } else {
          showActionFeedback("Could not copy summary", { error: true });
        }
      });
    });
  }

  // Share button
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
            showActionFeedback("Shared successfully!", { successButton: "share" });
          })
          .catch(function (error) {
            if (error && error.name === "AbortError") return;
            copyTextToClipboard(summary).then(function (succeeded) {
              if (succeeded) {
                showActionFeedback("Share unavailable — copied instead!", {
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
          showActionFeedback("Share unavailable — copied instead!", {
            successButton: "share"
          });
        } else {
          showActionFeedback("Could not share summary", { error: true });
        }
      });
    });
  }

  // Reset button
  if (resetBtn) {
    resetBtn.addEventListener("click", resetAll);
  }

  // Clear history button
  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener("click", function () {
      var cleared = Store.clearRecentSplits();
      renderHistory(cleared);
      lastSavedSignature = "";
      showActionFeedback("Calculation history cleared");
    });
  }

  // Theme toggle button
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var current = document.documentElement.getAttribute("data-theme") || "light";
      applyTheme(current === "dark" ? "light" : "dark");
    });
  }

  // Set current year in footer
  if (currentYearEl) {
    currentYearEl.textContent = String(new Date().getFullYear());
  }

  /* ==========================================================================
     Initialization
     ========================================================================== */

  applyTheme(getPreferredTheme());
  populateCurrencySelect();
  updateCurrencySymbol();
  updateReceiptDate();
  setupNavigation();
  setPressedStates();
  renderHistory();
  calculate();
})();
