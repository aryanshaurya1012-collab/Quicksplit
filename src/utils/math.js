/**
 * Mathematical engine for Equal Bill Splitting.
 * Computes tip, total, per-person share, and optional ceiling round-up.
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
 * Mathematical engine for Itemized Order Splitting.
 * Computes individual consumed shares, assigns proportional tip, and optional ceiling round-up.
 */
export function calculateItemizedSplit(items, tipPercent, friends, roundUp = false) {
  const validTip = Number.isFinite(tipPercent) && tipPercent >= 0 ? tipPercent : 0;
  const friendTotals = {};

  friends.forEach((f) => {
    friendTotals[f.id] = 0;
  });

  let subtotal = 0;

  items.forEach((item) => {
    const price = Number(item.price) || 0;
    subtotal += price;
    const consumers = item.sharedBy && item.sharedBy.length > 0 ? item.sharedBy : friends.map((f) => f.id);
    const perItemShare = consumers.length > 0 ? price / consumers.length : 0;

    consumers.forEach((fId) => {
      if (friendTotals[fId] !== undefined) {
        friendTotals[fId] += perItemShare;
      }
    });
  });

  const tipMultiplier = 1 + (validTip / 100);
  const rawTotal = subtotal * tipMultiplier;

  let totalRoundingBonus = 0;
  const breakdown = friends.map((f) => {
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
