import { roundCurrency } from "./math.js";
import { formatCurrency } from "./currency.js";

/**
 * Computes optimal debt settlement ("Who owes whom") among friends.
 * Given each person's actual share and how much they paid upfront.
 *
 * @param {Array} friends - Array of { id, name, paidAmount, totalShare }
 * @param {string} currencyCode
 * @returns {Array} Array of { from: string, to: string, amount: number, formatted: string }
 */
export function calculateSettlements(friends, currencyCode = "INR") {
  if (!Array.isArray(friends) || friends.length <= 1) {
    return [];
  }

  // Calculate net balances: paidUpfront - fairShare
  // Positive = creditor (is owed money), Negative = debtor (owes money)
  const balances = friends.map((f) => {
    const paid = Number(f.paidAmount) || 0;
    const share = Number(f.totalShare) || 0;
    const net = roundCurrency(paid - share);
    return {
      id: f.id,
      name: f.name,
      net
    };
  });

  const creditors = [];
  const debtors = [];

  balances.forEach((b) => {
    if (b.net > 0.01) {
      creditors.push({ ...b });
    } else if (b.net < -0.01) {
      debtors.push({ ...b, net: Math.abs(b.net) });
    }
  });

  // Sort descending by amount to minimize total number of transactions
  creditors.sort((a, b) => b.net - a.net);
  debtors.sort((a, b) => b.net - a.net);

  const transactions = [];

  let cIdx = 0;
  let dIdx = 0;

  while (cIdx < creditors.length && dIdx < debtors.length) {
    const creditor = creditors[cIdx];
    const debtor = debtors[dIdx];

    const amount = roundCurrency(Math.min(creditor.net, debtor.net));

    if (amount > 0.01) {
      transactions.push({
        from: debtor.name,
        to: creditor.name,
        fromId: debtor.id,
        toId: creditor.id,
        amount,
        formatted: formatCurrency(amount, currencyCode)
      });
    }

    creditor.net = roundCurrency(creditor.net - amount);
    debtor.net = roundCurrency(debtor.net - amount);

    if (creditor.net <= 0.01) cIdx++;
    if (debtor.net <= 0.01) dIdx++;
  }

  return transactions;
}
