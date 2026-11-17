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
 * Core mathematical engine for bill splitting with optional round-up logic.
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
 * Synthesize a modern, subtle haptic-style audio click via Web Audio API.
 * Silent if audio is unavailable or blocked.
 */
let audioCtx = null;
export function playSoftClick(freq = 600, duration = 0.04) {
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
    // Gracefully ignore audio errors
  }
}

/**
 * Build a WhatsApp/SMS/Slack ready text summary.
 */
export function buildReceiptSummary(split, currencyCode = DEFAULT_CURRENCY, friendList = []) {
  const config = CURRENCIES[currencyCode] || CURRENCIES[DEFAULT_CURRENCY];
  const dateStr = new Date().toLocaleDateString(config.locale, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  const lines = [
    `🧾 *QuickSplit — Bill Summary*`,
    `📅 ${dateStr}`,
    `──────────────────────────`,
    `Subtotal:        ${formatCurrency(split.bill, currencyCode)}`,
    `Tip (${formatTip(split.tipPercent)}):      ${formatCurrency(split.tipAmount, currencyCode)}`
  ];

  if (split.isRounded && split.roundingDifference > 0) {
    lines.push(`Rounding Bonus:  +${formatCurrency(split.roundingDifference, currencyCode)}`);
  }

  lines.push(
    `Total Check:     ${formatCurrency(split.total, currencyCode)}`,
    `Split Between:   ${split.people} ${split.people === 1 ? "person" : "people"}`,
    `──────────────────────────`,
    `👉 *Each Person Pays: ${formatCurrency(split.perPerson, currencyCode)}*`
  );

  if (split.isRounded) {
    lines.push(`_(Rounded up to next whole currency unit)_`);
  }

  if (friendList && friendList.length > 0) {
    lines.push(`──────────────────────────`, `👥 *Breakdown:*`);
    friendList.forEach(f => {
      lines.push(`• ${f.name}: ${formatCurrency(split.perPerson, currencyCode)} ${f.paid ? "✅ (Paid)" : "⏳ (Pending)"}`);
    });
  }

  lines.push(`──────────────────────────`, `_Calculated with QuickSplit ✨_`);

  return lines.join("\n");
}
