/**
 * Utilities to encode and decode QuickSplit session state into a shareable deep-link.
 * Zero-backend, client-side URL compression using URI-safe Base64.
 */

export function encodeSessionState(state) {
  try {
    const payload = {
      t: state.title || "Bill Split",
      cat: state.category || "Dining",
      cur: state.currency || "INR",
      m: state.splitMode || "equal",
      b: state.billInput || "",
      tip: state.tipPercent ?? 15,
      ru: Boolean(state.roundUp),
      dVal: state.discountVal || 0,
      dType: state.discountType || "percent",
      tax: state.taxPercent || 0,
      fr: (state.friends || []).map((f) => ({
        id: f.id,
        n: f.name,
        c: f.color,
        p: Boolean(f.paid),
        pa: Number(f.paidAmount) || 0
      })),
      it: (state.items || []).map((i) => ({
        id: i.id,
        n: i.name,
        pr: i.price,
        s: i.sharedBy || []
      }))
    };

    const jsonStr = JSON.stringify(payload);
    const encoded = btoa(encodeURIComponent(jsonStr));
    return encoded;
  } catch (err) {
    console.error("Failed to encode session state", err);
    return null;
  }
}

export function decodeSessionState(encodedStr) {
  try {
    if (!encodedStr || typeof encodedStr !== "string") return null;
    const jsonStr = decodeURIComponent(atob(encodedStr));
    const payload = JSON.parse(jsonStr);

    return {
      title: payload.t || "Bill Split",
      category: payload.cat || "Dining",
      currency: payload.cur || "INR",
      splitMode: payload.m || "equal",
      billInput: String(payload.b || ""),
      tipPercent: Number(payload.tip) || 0,
      roundUp: Boolean(payload.ru),
      discountVal: Number(payload.dVal) || 0,
      discountType: payload.dType || "percent",
      taxPercent: Number(payload.tax) || 0,
      friends: Array.isArray(payload.fr)
        ? payload.fr.map((f, idx) => ({
            id: f.id || `p_${idx + 1}`,
            name: f.n || `Friend ${idx + 1}`,
            color: f.c || "#6366f1",
            paid: Boolean(f.p),
            paidAmount: Number(f.pa) || 0
          }))
        : undefined,
      items: Array.isArray(payload.it)
        ? payload.it.map((i, idx) => ({
            id: i.id || `item_${idx + 1}`,
            name: i.n || `Item ${idx + 1}`,
            price: String(i.pr || "0"),
            sharedBy: Array.isArray(i.s) ? i.s : []
          }))
        : undefined
    };
  } catch (err) {
    console.warn("Failed to decode session state", err);
    return null;
  }
}

export function getShareableUrl(state) {
  const code = encodeSessionState(state);
  if (!code) return window.location.href;
  const url = new URL(window.location.href);
  url.hash = `share=${code}`;
  return url.toString();
}
