/**
 * QuickSplit Mathematical Engine & Features Automated Verification Suite
 * Run with: `npm test` or `node scripts/verify-math.js`
 */

import { calculateSplit, calculateItemizedSplit } from "../src/utils/math.js";
import { formatCurrency } from "../src/utils/currency.js";
import { buildReceiptSummary } from "../src/utils/receipt.js";
import { calculateSettlements } from "../src/utils/settlement.js";
import { parseReceiptText } from "../src/utils/parser.js";

let passes = 0;
let fails = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passes++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    fails++;
  }
}

console.log("\n==========================================");
console.log("  QuickSplit Math & Feature Verification  ");
console.log("==========================================\n");

// Test 1: Standard Equal Split
console.log("[Test Suite 1] Standard Equal Split Math:");
{
  const res = calculateSplit(1000, 10, 4, false);
  assert(res.bill === 1000, "Subtotal should be 1000");
  assert(res.tipAmount === 100, "Tip amount (10%) should be 100");
  assert(res.total === 1100, "Total check should be 1100");
  assert(res.perPerson === 275, "Per person share should be exactly 275");
  assert(!res.isRounded, "Should not be rounded");
}

// Test 2: Equal Split with Round-Up to Ceiling
console.log("\n[Test Suite 2] Smart Round-Up Ceiling Logic:");
{
  const res = calculateSplit(1000, 15, 3, true);
  assert(res.rawPerPerson >= 383.33 && res.rawPerPerson <= 383.34, "Raw per person should be ~383.33");
  assert(res.perPerson === 384, "Rounded per person must be 384");
  assert(res.total === 384 * 3, "Adjusted total should be 1152");
  assert(res.roundingDifference === 2, "Rounding bonus credited to tip should be exactly 2");
  assert(res.tipAmount === 150 + 2, "Adjusted tip should include the 2 rounding bonus");
  assert(res.isRounded === true, "isRounded flag must be true");
}

// Test 3: Discounts and Tax Engine
console.log("\n[Test Suite 3] Discounts and Taxes Engine:");
{
  // 1000 bill, 10% discount = 900 discounted subtotal.
  // 5% tax on 900 = 45.
  // 10% tip on 900 = 90.
  // Total = 900 + 45 + 90 = 1035.
  // 3 people -> 1035 / 3 = 345 each.
  const res = calculateSplit(1000, 10, 3, false, 5, 10, "percent");
  assert(res.discountAmount === 100, "10% discount on 1000 should be 100");
  assert(res.discountedSubtotal === 900, "Discounted subtotal should be 900");
  assert(res.taxAmount === 45, "5% tax on 900 should be 45");
  assert(res.tipAmount === 90, "10% tip on 900 should be 90");
  assert(res.total === 1035, "Total check should be 1035");
  assert(res.perPerson === 345, "Each person pays 345");
}

// Test 4: Itemized Split with Consumer Subsets
console.log("\n[Test Suite 4] Itemized Split with Consumer Subsets:");
{
  const friends = [
    { id: "p1", name: "Alice", paid: true },
    { id: "p2", name: "Bob", paid: false },
    { id: "p3", name: "Charlie", paid: false }
  ];

  const items = [
    { id: "i1", name: "Nachos", price: "300", sharedBy: ["p1", "p2", "p3"] },
    { id: "i2", name: "Pizza", price: "200", sharedBy: ["p1", "p2"] },
    { id: "i3", name: "Dessert", price: "100", sharedBy: ["p3"] }
  ];

  const res = calculateItemizedSplit(items, 10, friends, false);
  assert(res.subtotal === 600, "Subtotal is 600");
  assert(res.tipAmount === 60, "Tip amount is 60");
  assert(res.total === 660, "Total is 660");

  const alice = res.breakdown.find((f) => f.id === "p1");
  const charlie = res.breakdown.find((f) => f.id === "p3");
  assert(alice.totalShare === 220, "Alice's share with 10% tip should be 220");
  assert(charlie.totalShare === 220, "Charlie's share with 10% tip should be 220");
}

// Test 5: Multi-Payer Debt Settlement Engine
console.log("\n[Test Suite 5] Multi-Payer Debt Settlement Minimizer:");
{
  // Total check = 1000. Each owes 250.
  // Alice paid 1000 upfront. Bob, Charlie, David paid 0.
  const party = [
    { id: "p1", name: "Alice", paidAmount: 1000, totalShare: 250 },
    { id: "p2", name: "Bob", paidAmount: 0, totalShare: 250 },
    { id: "p3", name: "Charlie", paidAmount: 0, totalShare: 250 },
    { id: "p4", name: "David", paidAmount: 0, totalShare: 250 }
  ];

  const transfers = calculateSettlements(party, "INR");
  assert(transfers.length === 3, "Exactly 3 transfers required");
  assert(transfers.every((t) => t.to === "Alice" && t.amount === 250), "All 3 friends pay Alice 250 directly");
}

// Test 6: Smart Receipt Text Parser
console.log("\n[Test Suite 6] Smart Receipt Text Parser:");
{
  const receiptSample = `
    THE BISTRO
    2x Margherita Pizza 450
    Garlic Bread $180
    2 Craft Beers 600
    Subtotal 1230
    Thank you visit again!
  `;

  const parsed = parseReceiptText(receiptSample, [{ id: "p1" }, { id: "p2" }]);
  assert(parsed.length === 3, "Parsed exactly 3 food/drink items");
  assert(parsed[0].name.includes("Margherita Pizza"), "Item 1 is Margherita Pizza");
  assert(parsed[0].price === "450", "Item 1 price is 450");
  assert(parsed[1].name === "Garlic Bread", "Item 2 is Garlic Bread");
  assert(parsed[1].price === "180", "Item 2 price is 180");
}

console.log("\n==========================================");
if (fails === 0) {
  console.log(`  🎉 ALL ${passes} TESTS PASSED CLEANLY! `);
  console.log("==========================================\n");
  process.exit(0);
} else {
  console.error(`  ❌ ${fails} TESTS FAILED! `);
  console.log("==========================================\n");
  process.exit(1);
}
