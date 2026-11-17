import { CURRENCIES, DEFAULT_CURRENCY } from "./constants";

/**
 * Format a numeric value into a localized currency string.
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
 */
export function formatTip(percent) {
  if (!Number.isFinite(percent)) return "0%";
  const rounded = Math.round(percent * 100) / 100;
  return `${rounded}%`;
}

/**
 * Core mathematical engine for equal bill splitting with optional round-up logic.
 */
export function calculateSplit(bill, tipPercent, peopleCount, roundUp = false) {
  const validBill = Number.isFinite(bill) && bill >= 0 ? bill : 0;
  const validTip = Number.isFinite(tipPercent) && tipPercent >= 0 ? tipPercent : 0;
  const validPeople = Number.isInteger(peopleCount) && peopleCount >= 1 ? peopleCount : 1;

  const tipAmount = validBill * (validTip / 100);
  const total = validBill + tipAmount;
  const rawPerPerson = total / validPeople;

  let perPerson = rawPerPerson;
  let roundingDifference = 0;
  let isRounded = false;

  if (roundUp && total > 0) {
    const roundedPerPerson = Math.ceil(rawPerPerson);
    if (roundedPerPerson > rawPerPerson) {
      roundingDifference = (roundedPerPerson * validPeople) - total;
      perPerson = roundedPerPerson;
      isRounded = true;
    }
  }

  const adjustedTotal = perPerson * validPeople;
  const adjustedTip = tipAmount + roundingDifference;

  return {
    bill: validBill,
    tipPercent: validTip,
    tipAmount: adjustedTip,
    total: adjustedTotal,
    rawTotal: total,
    people: validPeople,
    perPerson,
    rawPerPerson,
    roundingDifference,
    isRounded
  };
}

/**
 * Itemized split calculation helper.
 * Calculates individual totals for each friend based on the items they shared.
 */
export function calculateItemizedSplit(items, tipPercent, friends, roundUp = false) {
  const validTip = Number.isFinite(tipPercent) && tipPercent >= 0 ? tipPercent : 0;
  const friendTotals = {};

  friends.forEach(f => {
    friendTotals[f.id] = 0;
  });

  let subtotal = 0;

  items.forEach(item => {
    const price = Number(item.price) || 0;
    subtotal += price;
    const consumers = item.sharedBy && item.sharedBy.length > 0 ? item.sharedBy : friends.map(f => f.id);
    const perItemShare = consumers.length > 0 ? price / consumers.length : 0;

    consumers.forEach(fId => {
      if (friendTotals[fId] !== undefined) {
        friendTotals[fId] += perItemShare;
      }
    });
  });

  const tipMultiplier = 1 + (validTip / 100);
  const rawTotal = subtotal * tipMultiplier;

  // Add tip to each friend proportionally
  let totalRoundingBonus = 0;
  const breakdown = friends.map(f => {
    const rawShare = (friendTotals[f.id] || 0) * tipMultiplier;
    let finalShare = rawShare;
    let roundedExtra = 0;
    if (roundUp && rawShare > 0) {
      finalShare = Math.ceil(rawShare);
      roundedExtra = finalShare - rawShare;
      totalRoundingBonus += roundedExtra;
    }
    return {
      id: f.id,
      name: f.name,
      color: f.color,
      paid: f.paid,
      baseAmount: friendTotals[f.id] || 0,
      totalShare: finalShare,
      rawShare,
      isRounded: roundUp && roundedExtra > 0
    };
  });

  const totalCalculated = breakdown.reduce((acc, f) => acc + f.totalShare, 0);

  return {
    subtotal,
    tipPercent: validTip,
    tipAmount: (subtotal * (validTip / 100)) + totalRoundingBonus,
    rawTipAmount: subtotal * (validTip / 100),
    total: totalCalculated,
    rawTotal,
    roundingDifference: totalRoundingBonus,
    isRounded: roundUp && totalRoundingBonus > 0,
    breakdown
  };
}

/**
 * Web Audio API tactile click sound.
 */
let audioCtx = null;
export function playSoftClick(freq = 600, duration = 0.04, enabled = true) {
  if (!enabled) return;
  try {
    if (typeof window === "undefined") return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    if (!audioCtx) audioCtx = new AudioContext();
    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + duration);

    gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    // Ignore audio errors
  }
}

/**
 * Build WhatsApp / SMS / Slack text summary.
 */
export function buildReceiptSummary(split, currencyCode = DEFAULT_CURRENCY, friendList = [], items = [], isItemized = false) {
  const config = CURRENCIES[currencyCode] || CURRENCIES[DEFAULT_CURRENCY];
  const dateStr = new Date().toLocaleDateString(config.locale, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  const title = isItemized ? `🧾 *QuickSplit — Itemized Receipt*` : `🧾 *QuickSplit — Bill Summary*`;

  const lines = [
    title,
    `📅 ${dateStr}`,
    `──────────────────────────`
  ];

  if (isItemized && items.length > 0) {
    lines.push(`📋 *Ordered Items:*`);
    const friendMap = {};
    friendList.forEach(f => {
      friendMap[f.id] = f.name;
    });

    items.forEach(item => {
      const consumers = (item.sharedBy || []).map(id => friendMap[id] || "Someone").join(", ");
      lines.push(`• ${item.name}: ${formatCurrency(Number(item.price), currencyCode)} (${consumers || "All"})`);
    });
    lines.push(`──────────────────────────`);
  }

  lines.push(
    `Subtotal:        ${formatCurrency(split.bill, currencyCode)}`,
    `Tip (${formatTip(split.tipPercent)}):      ${formatCurrency(split.tipAmount, currencyCode)}`
  );

  if (split.isRounded && split.roundingDifference > 0) {
    lines.push(`Rounding Bonus:  +${formatCurrency(split.roundingDifference, currencyCode)}`);
  }

  lines.push(
    `Total Check:     ${formatCurrency(split.total, currencyCode)}`,
    `──────────────────────────`
  );

  if (!isItemized) {
    lines.push(
      `Split Between:   ${split.people} ${split.people === 1 ? "person" : "people"}`,
      `👉 *Each Person Pays: ${formatCurrency(split.perPerson, currencyCode)}*`
    );
  } else {
    lines.push(`👥 *Individual Breakdown (with Tip):*`);
  }

  if (split.isRounded) {
    lines.push(`_(Rounded up to next whole currency unit)_`);
  }

  if (friendList && friendList.length > 0) {
    if (!isItemized) {
      lines.push(`──────────────────────────`, `👥 *Who has paid:*`);
    }
    friendList.forEach(f => {
      const amount = typeof f.totalShare === "number" ? f.totalShare : split.perPerson;
      lines.push(`• ${f.name}: ${formatCurrency(amount, currencyCode)} ${f.paid ? "✅ (Paid)" : "⏳ (Pending)"}`);
    });
  }

  lines.push(`──────────────────────────`, `_Calculated with QuickSplit ✨_`);

  return lines.join("\n");
}