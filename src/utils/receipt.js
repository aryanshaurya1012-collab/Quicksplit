import { CURRENCIES, DEFAULT_CURRENCY } from "../constants";
import { formatCurrency, formatTip } from "./currency";

/**
 * Builds a formatted receipt text for sharing to WhatsApp, Messages, Slack, or Clipboard.
 */
export function buildReceiptSummary(
  split,
  currencyCode = DEFAULT_CURRENCY,
  friendList = [],
  items = [],
  isItemized = false
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

  lines.push(
    `Subtotal:        ${formatCurrency(split.bill, currencyCode)}`,
    `Tip (${formatTip(split.tipPercent)}):      ${formatCurrency(split.tipAmount, currencyCode)}`
  );

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
    lines.push(`👥 *Individual Breakdown (with Tip):*`);
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

  lines.push(`──────────────────────────`, `_Calculated with QuickSplit ✨_`);

  return lines.join("\n");
}
