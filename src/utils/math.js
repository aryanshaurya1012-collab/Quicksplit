/**
 * Round a floating point currency number to 2 decimal places safely.
 */
export function roundCurrency(val) {
  if (!Number.isFinite(val)) return 0;
  return Math.round((val + Number.EPSILON) * 100) / 100;
}

/**
 * Mathematical engine for Equal Bill Splitting with Discounts and Taxes.
 */
export function calculateSplit(
  bill,
  tipPercent,
  peopleCount,
  roundUp = false,
  taxPercent = 0,
  discountVal = 0,
  discountType = "percent"
) {
  const validBill = Number.isFinite(bill) && bill >= 0 ? roundCurrency(bill) : 0;
  const validTip = Number.isFinite(tipPercent) && tipPercent >= 0 ? tipPercent : 0;
  const validTax = Number.isFinite(taxPercent) && taxPercent >= 0 ? taxPercent : 0;
  const validPeople = Number.isInteger(peopleCount) && peopleCount >= 1 ? peopleCount : 1;

  // Discount computation
  let discountAmount = 0;
  if (discountVal > 0) {
    if (discountType === "percent") {
      discountAmount = roundCurrency(validBill * (Math.min(100, discountVal) / 100));
    } else {
      discountAmount = roundCurrency(Math.min(validBill, discountVal));
    }
  }

  const discountedSubtotal = Math.max(0, roundCurrency(validBill - discountAmount));

  // Tax & Tip on discounted subtotal
  const taxAmount = roundCurrency(discountedSubtotal * (validTax / 100));
  const rawTipAmount = roundCurrency(discountedSubtotal * (validTip / 100));

  const total = roundCurrency(discountedSubtotal + taxAmount + rawTipAmount);
  const rawPerPerson = total / validPeople;

  let perPerson = rawPerPerson;
  let roundingDifference = 0;
  let isRounded = false;

  if (roundUp && total > 0) {
    const roundedPerPerson = Math.ceil(rawPerPerson);
    if (roundedPerPerson > rawPerPerson) {
      roundingDifference = roundCurrency((roundedPerPerson * validPeople) - total);
      perPerson = roundedPerPerson;
      isRounded = true;
    }
  }

  const adjustedTotal = roundCurrency(perPerson * validPeople);
  const adjustedTip = roundCurrency(rawTipAmount + roundingDifference);

  return {
    bill: validBill,
    discountVal,
    discountType,
    discountAmount,
    discountedSubtotal,
    taxPercent: validTax,
    taxAmount,
    tipPercent: validTip,
    tipAmount: adjustedTip,
    rawTipAmount,
    total: adjustedTotal,
    rawTotal: total,
    people: validPeople,
    perPerson: roundCurrency(perPerson),
    rawPerPerson: roundCurrency(rawPerPerson),
    roundingDifference: roundCurrency(roundingDifference),
    isRounded
  };
}

/**
 * Mathematical engine for Itemized Order Splitting with Discounts and Taxes.
 */
export function calculateItemizedSplit(
  items,
  tipPercent,
  friends,
  roundUp = false,
  taxPercent = 0,
  discountVal = 0,
  discountType = "percent"
) {
  const validTip = Number.isFinite(tipPercent) && tipPercent >= 0 ? tipPercent : 0;
  const validTax = Number.isFinite(taxPercent) && taxPercent >= 0 ? taxPercent : 0;
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

  subtotal = roundCurrency(subtotal);

  // Discount computation
  let discountAmount = 0;
  if (discountVal > 0) {
    if (discountType === "percent") {
      discountAmount = roundCurrency(subtotal * (Math.min(100, discountVal) / 100));
    } else {
      discountAmount = roundCurrency(Math.min(subtotal, discountVal));
    }
  }

  const discountedSubtotal = Math.max(0, roundCurrency(subtotal - discountAmount));
  const discountRatio = subtotal > 0 ? discountedSubtotal / subtotal : 1;

  // Tax & Tip rate multipliers
  const taxMultiplier = validTax / 100;
  const tipMultiplier = validTip / 100;
  const netRateMultiplier = 1 + taxMultiplier + tipMultiplier;

  let totalRoundingBonus = 0;
  const breakdown = friends.map((f) => {
    const baseAmount = roundCurrency(friendTotals[f.id] || 0);
    // Apply discount proportionally, then tax & tip
    const friendDiscountedBase = roundCurrency(baseAmount * discountRatio);
    const rawShare = roundCurrency(friendDiscountedBase * netRateMultiplier);
    let finalShare = rawShare;
    let roundedExtra = 0;

    if (roundUp && rawShare > 0) {
      finalShare = Math.ceil(rawShare);
      roundedExtra = roundCurrency(finalShare - rawShare);
      totalRoundingBonus += roundedExtra;
    }

    return {
      id: f.id,
      name: f.name,
      color: f.color,
      paid: f.paid,
      baseAmount,
      totalShare: roundCurrency(finalShare),
      rawShare,
      isRounded: roundUp && roundedExtra > 0
    };
  });

  const totalCalculated = roundCurrency(breakdown.reduce((acc, f) => acc + f.totalShare, 0));
  const taxAmount = roundCurrency(discountedSubtotal * taxMultiplier);
  const rawTipAmount = roundCurrency(discountedSubtotal * tipMultiplier);
  const tipAmount = roundCurrency(rawTipAmount + totalRoundingBonus);

  return {
    subtotal,
    discountVal,
    discountType,
    discountAmount,
    discountedSubtotal,
    taxPercent: validTax,
    taxAmount,
    tipPercent: validTip,
    tipAmount,
    rawTipAmount,
    total: totalCalculated,
    rawTotal: roundCurrency(discountedSubtotal + taxAmount + rawTipAmount),
    roundingDifference: roundCurrency(totalRoundingBonus),
    isRounded: roundUp && totalRoundingBonus > 0,
    breakdown
  };
}
