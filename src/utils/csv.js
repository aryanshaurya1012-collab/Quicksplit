import { formatCurrency } from "./currency.js";

/**
 * Generates and downloads a CSV spreadsheet of the split.
 */
export function exportToCSV(splitData, currencyCode = "INR", friends = [], items = []) {
  const rows = [];

  // Header
  rows.push(["QuickSplit - Dining Check & Expense Summary"]);
  rows.push(["Generated on", new Date().toLocaleString()]);
  rows.push(["Currency", currencyCode]);
  rows.push([]);

  // Itemized breakdown if items exist
  if (items && items.length > 0) {
    rows.push(["--- ITEM BREAKDOWN ---"]);
    rows.push(["Item Name", "Price", "Shared By", "Cost Per Consumer"]);
    items.forEach((item) => {
      const consumers = (item.sharedBy || [])
        .map((id) => friends.find((f) => f.id === id)?.name || id)
        .join("; ");
      const perConsumer = (item.sharedBy && item.sharedBy.length > 0)
        ? (Number(item.price) / item.sharedBy.length).toFixed(2)
        : item.price;
      rows.push([`"${item.name}"`, item.price, `"${consumers}"`, perConsumer]);
    });
    rows.push([]);
  }

  // Check Totals
  rows.push(["--- TOTALS ---"]);
  rows.push(["Subtotal", splitData.bill]);
  if (splitData.discountAmount > 0) {
    rows.push(["Discount", `-${splitData.discountAmount}`]);
  }
  if (splitData.taxAmount > 0) {
    rows.push(["Tax", `+${splitData.taxAmount}`]);
  }
  rows.push(["Tip", `+${splitData.tipAmount}`]);
  rows.push(["Total Check", splitData.total]);
  rows.push([]);

  // Friend Shares
  rows.push(["--- INDIVIDUAL SHARES ---"]);
  rows.push(["Person Name", "Amount Due", "Paid Status"]);
  friends.forEach((f) => {
    const amount = typeof f.totalShare === "number" ? f.totalShare : splitData.perPerson;
    rows.push([`"${f.name}"`, amount, f.paid ? "Paid" : "Pending"]);
  });

  // Convert array to CSV string
  const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `QuickSplit-Summary-${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
