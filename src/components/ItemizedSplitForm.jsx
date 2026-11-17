import React, { useState } from "react";
import { Receipt, Plus, Trash2 } from "lucide-react";
import { CURRENCIES, QUICK_ADD_AMOUNTS } from "../constants";
import { formatCurrency } from "../utils/currency";

export default function ItemizedSplitForm({
  items,
  setItems,
  friends,
  currency,
  subtotal,
  showToast,
  playTick,
  playBlipDown
}) {
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");

  const quickAmounts = QUICK_ADD_AMOUNTS[currency] || QUICK_ADD_AMOUNTS.USD;

  // Add Item
  const handleAddItem = (e) => {
    e.preventDefault();
    const priceNum = parseFloat(itemPrice);
    if (!itemName.trim() || isNaN(priceNum) || priceNum <= 0) {
      showToast("Please enter an item name and valid price");
      return;
    }

    playTick();
    const newItem = {
      id: `item_${Date.now()}`,
      name: itemName.trim(),
      price: String(priceNum),
      sharedBy: friends.map((f) => f.id)
    };
    setItems((prev) => [...prev, newItem]);
    setItemName("");
    setItemPrice("");
  };

  // Toggle consumer on dish
  const handleToggleConsumer = (itemId, friendId) => {
    playTick();
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        const current = item.sharedBy || [];
        const exists = current.includes(friendId);
        if (exists && current.length === 1) {
          showToast("At least one person must be assigned to this item");
          return item;
        }
        const updated = exists ? current.filter((id) => id !== friendId) : [...current, friendId];
        return { ...item, sharedBy: updated };
      })
    );
  };

  // Delete item
  const handleDeleteItem = (itemId) => {
    playBlipDown();
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  // Quick price helper
  const handleQuickPrice = (amt) => {
    playTick();
    const current = parseFloat(itemPrice) || 0;
    setItemPrice(String(current + amt));
  };

  return (
    <div className="bg-white dark:bg-[#141124] rounded-2xl p-5 sm:p-6 border border-slate-200/90 dark:border-white/5 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-center justify-between mb-3">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Receipt className="w-3.5 h-3.5 text-teal-500" />
          Itemized Order List
        </label>
        <span className="text-xs font-bold text-teal-600 dark:text-teal-400">
          Subtotal: {formatCurrency(subtotal, currency)}
        </span>
      </div>

      {/* Add Item Form */}
      <form onSubmit={handleAddItem} className="space-y-3 mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. Pizza, Pasta, Cocktails"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            className="flex-1 px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#181428] focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <div className="relative w-28 sm:w-36">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-slate-400 select-none">
              {CURRENCIES[currency]?.symbol}
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={itemPrice}
              onChange={(e) => setItemPrice(e.target.value)}
              className="w-full pl-6 pr-2.5 py-2 text-sm font-mono rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#181428] focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 active:scale-95 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-all shadow-md shadow-teal-500/25"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>

        {/* Quick Price Increment Chips */}
        <div className="flex items-center flex-wrap gap-1.5 pt-0.5">
          <span className="text-[11px] text-slate-400 font-medium">Quick price:</span>
          {quickAmounts.slice(0, 4).map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => handleQuickPrice(amt)}
              className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-slate-100 hover:bg-teal-50 dark:bg-white/5 dark:hover:bg-teal-950/40 text-slate-600 dark:text-slate-300 hover:text-teal-600 border border-slate-200 dark:border-white/10 cursor-pointer active:scale-95 transition-all"
            >
              +{amt}
            </button>
          ))}
        </div>
      </form>

      {/* Items List */}
      {items.length === 0 ? (
        <div className="p-6 text-center border border-dashed border-slate-200 dark:border-white/10 rounded-xl text-slate-400 text-xs">
          No items added yet. Type a dish/drink name and price above to start itemizing!
        </div>
      ) : (
        <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
          {items.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/5 text-xs space-y-2"
            >
              <div className="flex items-center justify-between font-semibold">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{item.name}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-extrabold text-teal-600 dark:text-teal-400">
                    {formatCurrency(Number(item.price), currency)}
                  </span>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1 text-slate-400 hover:text-rose-500 rounded cursor-pointer transition-colors"
                    title="Delete item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Consumer Selection Chips */}
              <div className="flex items-center flex-wrap gap-1.5 pt-1">
                <span className="text-[11px] text-slate-400 font-medium">Shared by:</span>
                {friends.map((f) => {
                  const isShared = (item.sharedBy || []).includes(f.id);
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => handleToggleConsumer(item.id, f.id)}
                      className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                        isShared
                          ? "bg-teal-500 text-white border-teal-500 shadow-xs"
                          : "bg-white dark:bg-slate-900 border-slate-200 dark:border-white/10 text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                      }`}
                    >
                      {f.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
