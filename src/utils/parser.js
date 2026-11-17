/**
 * Smart Receipt & Bill Text Parser.
 * Automatically extracts line items, quantities, and prices from pasted receipt text.
 */
export function parseReceiptText(rawText, defaultFriends = []) {
  if (!rawText || typeof rawText !== "string") {
    return [];
  }

  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const parsedItems = [];
  const friendIds = defaultFriends.map((f) => f.id);

  lines.forEach((line, index) => {
    // Skip common non-item lines like total, tax, tip, header, date, divider
    const lower = line.toLowerCase();
    if (
      lower.includes("subtotal") ||
      lower.includes("grand total") ||
      lower.includes("total amount") ||
      lower.includes("tax invoice") ||
      lower.includes("thank you") ||
      lower.includes("gstin") ||
      lower.includes("visit again") ||
      /^[=-_#*]{3,}$/.test(line)
    ) {
      return;
    }

    // Match price at the end or preceded by currency symbol
    // Examples: "Pizza 450", "Garlic Bread $12.50", "1x Beer - 150.00", "Pasta .... 24.00"
    const priceMatch = line.match(/(?:[$₹€£]\s*)?(\d+(?:[.,]\d{1,2})?)\s*(?:[$₹€£])?$/);

    if (priceMatch) {
      const priceRaw = priceMatch[1].replace(",", ".");
      const priceNum = parseFloat(priceRaw);

      if (!isNaN(priceNum) && priceNum > 0) {
        // Text before the price is the item description
        let textPart = line.slice(0, priceMatch.index).trim();
        // Remove trailing dashes, dots, or colons
        textPart = textPart.replace(/[-.:_]+$/, "").trim();

        // Check if there is a quantity prefix (e.g., "2x", "2 x", "2 *", "2 ")
        const qtyMatch = textPart.match(/^(\d+)\s*(?:[xX*]|\b)\s*(.+)/);
        let name = textPart;
        let qty = 1;

        if (qtyMatch) {
          const parsedQty = parseInt(qtyMatch[1], 10);
          if (parsedQty > 0 && parsedQty <= 20) {
            qty = parsedQty;
            name = qtyMatch[2].trim();
          }
        }

        // Clean up leading bullet points or symbols
        name = name.replace(/^[-*•>#]\s*/, "").trim();

        if (name.length > 0) {
          parsedItems.push({
            id: `item_parsed_${Date.now()}_${index}`,
            name: qty > 1 ? `${name} (x${qty})` : name,
            price: String(priceNum),
            sharedBy: [...friendIds]
          });
        }
      }
    }
  });

  return parsedItems;
}
