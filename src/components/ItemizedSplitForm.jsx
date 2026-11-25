import React, { useState } from "react";
import { Receipt, Plus, Trash2, FileText, Sparkles } from "lucide-react";
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
  playBlipDown,
  onOpenSmartPaste,
  onOpenSampleReceipts
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
    <div className="bg-[#ffffff] dark:bg-[#15171c] rounded-xl p-5 border-2 border-[#1c1917] dark:border-[#2e323b] shadow-hard transition-all">
      <div className="flex items-center justify-between mb-3">
        <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#756f68] dark:text-[#a39cae] flex items-center gap-1.5">
          <Receipt className="w-3.5 h-3.5 text-[#0d9488]" />
          Itemized Dishes &amp; Expenses
        </label>
        <div className="flex items-center gap-2">
          {onOpenSmartPaste && (
            <button
              type="button"
              onClick={onOpenSmartPaste}
              className="text-[11px] font-mono font-bold text-[#0d9488] hover:underline flex items-center gap-1 cursor-pointer"
              title="Auto-detect dishes and prices from pasted text"
            >
              <FileText className="w-3 h-3" /> Smart Paste
            </button>
          )}
          {onOpenSampleReceipts && (
            <button
              type="button"
              onClick={onOpenSampleReceipts}
              className="text-[11px] font-mono font-bold text-[#d97706] hover:underline flex items-center gap-1 cursor-pointer"
              title="Load example restaurant checks"
            >
              <Sparkles className="w-3 h-3" /> Templates
            </button>
          )}
        </div>
      </div>

      {/* Add New Line Item Form */}
      <form onSubmit={handleAddItem} className="space-y-3 p-4 rounded-xl bg-[#f5f2eb] dark:bg-[#0f1115] border border-[#e3ded4] dark:border-white/5 mb-4 shadow-inner">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
          <input
            type="text"
            placeholder="Item / Dish name (e.g. Woodfired Pizza)"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            className="sm:col-span-7 px-3 py-2 text-xs font-medium rounded-lg bg-white dark:bg-[#181a20] border border-[#e3ded4] dark:border-white/10 focus:outline-none focus:border-[#e05332]"
          />
          <div className="sm:col-span-3 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#181a20] border border-[#e3ded4] dark:border-white/10">
            <span className="text-xs font-mono font-bold text-[#756f68]">
              {CURRENCIES[currency]?.symbol || "$"}
            </span>
            <input
              type="number"
              step="any"
              min="0"
              placeholder="0.00"
              value={itemPrice}
              onChange={(e) => setItemPrice(e.target.value)}
              className="w-full text-xs font-mono font-bold bg-transparent focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="sm:col-span-2 py-2 px-3 rounded-lg bg-[#e05332] hover:bg-[#c84324] text-white text-xs font-mono font-bold flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        </div>

        {/* Quick Price Buttons */}
        <div className="flex items-center flex-wrap gap-1.5 pt-1">
          <span className="text-[10px] font-mono text-[#756f68]">Price:</span>
          {quickAmounts.slice(0, 4).map((amt) => (
            <button
              key={amt}
              type="button"
              onClick={() => handleQuickPrice(amt)}
              className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-white hover:bg-[#e05332]/10 dark:bg-[#181a20] dark:hover:bg-white/10 text-[#1f1d1a] dark:text-[#f5f2eb] hover:text-[#e05332] border border-[#e3ded4] dark:border-white/10 transition-colors cursor-pointer"
            >
              +{amt}
            </button>
          ))}
        </div>
      </form>

      {/* Line Items List */}
      <div className="space-y-2">
        {items.length === 0 ? (
          <div className="text-center py-8 px-4 rounded-xl border border-dashed border-[#e3ded4] dark:border-white/10 text-xs text-[#756f68] font-mono">
            No dishes added yet. Use form above or tap "Smart Paste" to extract from bill text.
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl bg-white dark:bg-[#181a20] border border-[#e3ded4] dark:border-white/10 hover:border-[#e05332]/50 transition-all shadow-xs"
            >
              <div className="flex items-center justify-between gap-3 mb-2.5">
                <span className="font-bold text-xs truncate text-[#1f1d1a] dark:text-white">
                  {item.name}
                </span>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-black text-sm text-[#e05332] dark:text-[#f97316]">
                    {formatCurrency(parseFloat(item.price) || 0, currency)}
                  </span>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1 text-[#756f68] hover:text-rose-600 transition-colors cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Consumer Selection Chips */}
              <div className="flex items-center flex-wrap gap-1.5 pt-1 border-t border-dashed border-[#e3ded4] dark:border-white/10">
                <span className="text-[10px] font-mono uppercase text-[#756f68] mr-1">Shared by:</span>
                {friends.map((friend) => {
                  const isAssigned = (item.sharedBy || []).includes(friend.id);
                  return (
                    <button
                      key={friend.id}
                      type="button"
                      onClick={() => handleToggleConsumer(item.id, friend.id)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                        isAssigned
                          ? "bg-[#e05332]/10 text-[#e05332] dark:bg-[#e05332]/20 dark:text-[#f97316] border border-[#e05332]/30"
                          : "bg-[#f5f2eb] text-[#756f68] dark:bg-white/5 dark:text-[#a39cae] border border-transparent hover:border-[#e3ded4]"
                      }`}
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: friend.color }}
                      />
                      <span>{friend.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
