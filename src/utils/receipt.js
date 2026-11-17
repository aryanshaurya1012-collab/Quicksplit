import { CURRENCIES, DEFAULT_CURRENCY } from "../constants/index.js";
import { formatCurrency, formatTip } from "./currency.js";

/**
 * Builds a formatted receipt text for sharing to WhatsApp, Messages, Slack, or Clipboard.
 */
export function buildReceiptSummary(
  split,
  currencyCode = DEFAULT_CURRENCY,
  friendList = [],
  items = [],
  isItemized = false,
  settlements = []
) {
  const config = CURRENCIES[currencyCode] || CURRENCIES[DEFAULT_CURRENCY];
  const dateStr = new Date().toLocaleDateString(config.locale, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  const title = isItemized ? `🧾 *QuickSplit — Itemized Receipt*` : `🧾 *QuickSplit — Bill Summary*`;

  const lines = [title, `📅 ${dateStr}`, `──────────────────────────`];

  if (isItemized && items.length > 0) {
    lines.push(`📋 *Ordered Items:*`);
    const friendMap = {};
    friendList.forEach((f) => {
      friendMap[f.id] = f.name;
    });

    items.forEach((item) => {
      const consumers = (item.sharedBy || []).map((id) => friendMap[id] || "Someone").join(", ");
      lines.push(`• ${item.name}: ${formatCurrency(Number(item.price), currencyCode)} (${consumers || "All"})`);
    });
    lines.push(`──────────────────────────`);
  }

  lines.push(`Subtotal:        ${formatCurrency(split.bill, currencyCode)}`);

  if (split.discountAmount > 0) {
    const discLabel = split.discountType === "percent" ? `-${split.discountVal}%` : `Flat`;
    lines.push(`Discount (${discLabel}):   -${formatCurrency(split.discountAmount, currencyCode)}`);
  }

  if (split.taxAmount > 0) {
    lines.push(`Tax (${split.taxPercent}%):        +${formatCurrency(split.taxAmount, currencyCode)}`);
  }

  lines.push(`Tip (${formatTip(split.tipPercent)}):      +${formatCurrency(split.tipAmount, currencyCode)}`);

  if (split.isRounded && split.roundingDifference > 0) {
    lines.push(`Rounding Bonus:  +${formatCurrency(split.roundingDifference, currencyCode)}`);
  }

  lines.push(`Total Check:     ${formatCurrency(split.total, currencyCode)}`, `──────────────────────────`);

  if (!isItemized) {
    lines.push(
      `Split Between:   ${split.people} ${split.people === 1 ? "person" : "people"}`,
      `👉 *Each Person Pays: ${formatCurrency(split.perPerson, currencyCode)}*`
    );
  } else {
    lines.push(`👥 *Individual Breakdown (with Tax & Tip):*`);
  }

  if (split.isRounded) {
    lines.push(`_(Rounded up to next whole currency unit)_`);
  }

  if (friendList && friendList.length > 0) {
    if (!isItemized) {
      lines.push(`──────────────────────────`, `👥 *Who has paid:*`);
    }
    friendList.forEach((f) => {
      const amount = typeof f.totalShare === "number" ? f.totalShare : split.perPerson;
      lines.push(`• ${f.name}: ${formatCurrency(amount, currencyCode)} ${f.paid ? "✅ (Paid)" : "⏳ (Pending)"}`);
    });
  }

  // Who owes whom settlement instructions
  if (settlements && settlements.length > 0) {
    lines.push(`──────────────────────────`, `🤝 *Settlement Plan (Who owes whom):*`);
    settlements.forEach((s) => {
      lines.push(`• ${s.from} pays ${s.to}: ${s.formatted}`);
    });
  }

  lines.push(`──────────────────────────`, `_Calculated with QuickSplit ✨_`);

  return lines.join("\n");
}
