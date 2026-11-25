import React, { useState, useRef } from "react";
import { Users, Minus, Plus, UserPlus, Check, X, Sparkles } from "lucide-react";
import { AVATAR_COLORS } from "../constants";

export default function GroupManager({
  friends,
  setFriends,
  setItems,
  roundUp,
  setRoundUp,
  showToast,
  playTick,
  playBlipDown
}) {
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [newFriendName, setNewFriendName] = useState("");
  const [editingFriendId, setEditingFriendId] = useState(null);
  const addFriendInputRef = useRef(null);

  // Set group count via stepper / presets
  const handleSetPeopleCount = (count) => {
    playTick();
    const target = Math.max(1, Math.min(20, count));
    if (target === friends.length) return;

    if (target > friends.length) {
      const newFriends = [...friends];
      for (let i = friends.length; i < target; i++) {
        const color = AVATAR_COLORS[i % AVATAR_COLORS.length];
        newFriends.push({
          id: `p_${Date.now()}_${i}`,
          name: `Person ${i + 1}`,
          color,
          paid: false
        });
      }
      setFriends(newFriends);
    } else {
      setFriends(friends.slice(0, target));
    }
  };

  // Add individual friend by custom name
  const handleAddCustomFriend = (e) => {
    e.preventDefault();
    const name = newFriendName.trim() || `Person ${friends.length + 1}`;
    if (friends.length >= 20) {
      showToast("Maximum 20 people allowed");
      return;
    }

    playTick();
    const color = AVATAR_COLORS[friends.length % AVATAR_COLORS.length];
    const newFriend = {
      id: `p_${Date.now()}`,
      name,
      color,
      paid: false
    };

    setFriends((prev) => [...prev, newFriend]);
    setNewFriendName("");
    setShowAddFriend(false);
    showToast(`Added ${name} to group`);
  };

  // Remove a specific friend by ID
  const handleRemoveFriend = (friendId, e) => {
    if (e) e.stopPropagation();
    if (friends.length <= 1) {
      showToast("Group must have at least 1 person");
      return;
    }

    playBlipDown();
    const friendToRemove = friends.find((f) => f.id === friendId);
    setFriends((prev) => prev.filter((f) => f.id !== friendId));

    // Also remove from any itemized items
    if (setItems) {
      setItems((prev) =>
        prev.map((item) => {
          const remaining = (item.sharedBy || []).filter((id) => id !== friendId);
          return {
            ...item,
            sharedBy: remaining.length > 0 ? remaining : friends.filter((f) => f.id !== friendId).map((f) => f.id)
          };
        })
      );
    }

    showToast(`Removed ${friendToRemove?.name || "person"}`);
  };

  // Toggle friend paid status
  const togglePaid = (id) => {
    playTick();
    setFriends((prev) =>
      prev.map((f) => (f.id === id ? { ...f, paid: !f.paid } : f))
    );
  };

  // Update friend name inline
  const handleUpdateName = (id, newName) => {
    setFriends((prev) =>
      prev.map((f) => (f.id === id ? { ...f, name: newName.trim() || f.name } : f))
    );
    setEditingFriendId(null);
  };

  return (
    <div className="bg-[#ffffff] dark:bg-[#15171c] rounded-xl p-5 border-2 border-[#1c1917] dark:border-[#2e323b] shadow-hard transition-all">
      <div className="flex items-center justify-between mb-4">
        <label className="text-xs font-mono font-bold uppercase tracking-wider text-[#756f68] dark:text-[#a39cae] flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-[#0d9488]" />
          Split Group ({friends.length} {friends.length === 1 ? "Person" : "People"})
        </label>
        
        {/* Stepper Buttons */}
        <div className="flex items-center gap-2">
          <button
            disabled={friends.length <= 1}
            onClick={() => handleSetPeopleCount(friends.length - 1)}
            className="w-8 h-8 rounded-md bg-[#f5f2eb] hover:bg-[#ede7dc] dark:bg-[#1e2129] dark:hover:bg-[#282d38] disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center font-bold text-[#1c1917] dark:text-[#f5f2eb] border-2 border-[#1c1917] dark:border-[#2e323b] shadow-hard-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
            aria-label="Decrease group size"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="font-black text-lg w-8 text-center font-mono select-none text-[#e05332] dark:text-[#f97316]">
            {friends.length}
          </span>
          <button
            disabled={friends.length >= 20}
            onClick={() => handleSetPeopleCount(friends.length + 1)}
            className="w-8 h-8 rounded-md bg-[#f5f2eb] hover:bg-[#ede7dc] dark:bg-[#1e2129] dark:hover:bg-[#282d38] disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center font-bold text-[#1c1917] dark:text-[#f5f2eb] border-2 border-[#1c1917] dark:border-[#2e323b] shadow-hard-sm active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer"
            aria-label="Increase group size"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Group Presets & Add Friend Toggle */}
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <div className="flex items-center flex-wrap gap-1.5">
          <span className="text-xs font-mono text-[#756f68] font-medium">Sizes:</span>
          {[1, 2, 3, 4, 5, 6, 8, 10].map((size) => (
            <button
              key={size}
              onClick={() => handleSetPeopleCount(size)}
              className={`px-2 py-0.5 text-xs font-mono font-bold rounded-md border-2 border-[#1c1917] dark:border-[#2e323b] transition-all cursor-pointer ${
                friends.length === size
                  ? "bg-[#e05332] text-white shadow-hard-sm"
                  : "bg-[#f5f2eb] dark:bg-[#1e2129] hover:bg-[#ede7dc] dark:hover:bg-[#282d38] text-[#1c1917] dark:text-[#f5f2eb]"
              }`}
            >
              {size}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            setShowAddFriend(!showAddFriend);
            setTimeout(() => {
              if (addFriendInputRef.current) addFriendInputRef.current.focus();
            }, 50);
          }}
          className="text-xs font-mono font-bold text-[#e05332] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5" />
          {showAddFriend ? "Cancel" : "+ Add Member"}
        </button>
      </div>

      {/* Inline Add Person Form */}
      {showAddFriend && (
        <form onSubmit={handleAddCustomFriend} className="flex gap-2 mb-4 p-2.5 rounded-xl bg-[#f5f2eb] dark:bg-white/5 border border-[#e3ded4] dark:border-white/10 animate-fade-in">
          <input
            ref={addFriendInputRef}
            type="text"
            placeholder="Friend name (e.g. Maya)"
            value={newFriendName}
            onChange={(e) => setNewFriendName(e.target.value)}
            className="flex-1 px-3 py-1.5 text-xs font-mono rounded-lg border border-[#e3ded4] dark:border-white/10 bg-white dark:bg-[#181a20] focus:outline-none focus:border-[#e05332]"
          />
          <button
            type="submit"
            className="px-3.5 py-1.5 rounded-lg bg-[#e05332] hover:bg-[#c84324] text-white text-xs font-mono font-bold cursor-pointer transition-colors shadow-xs"
          >
            Add
          </button>
        </form>
      )}

      {/* Friend Chips Grid */}
      <div className="pt-2 border-t border-[#e3ded4] dark:border-white/10">
        <span className="text-[11px] font-mono text-[#756f68] block mb-2.5">
          Tap name to edit, checkmark to toggle paid:
        </span>
        <div className="flex flex-wrap gap-2">
          {friends.map((friend) => {
            const isEditing = editingFriendId === friend.id;
            return (
              <div
                key={friend.id}
                className={`flex items-center gap-1.5 pl-1.5 pr-2 py-1 rounded-full border text-xs font-mono font-bold transition-all ${
                  friend.paid
                    ? "bg-[#0d9488]/10 border-[#0d9488]/30 text-[#0d9488]"
                    : "bg-[#f5f2eb] dark:bg-white/5 border-[#e3ded4] dark:border-white/10 text-[#1f1d1a] dark:text-[#f5f2eb]"
                }`}
              >
                <span
                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white font-bold shadow-xs select-none"
                  style={{ backgroundColor: friend.color }}
                >
                  {friend.name.charAt(0).toUpperCase()}
                </span>

                {isEditing ? (
                  <input
                    type="text"
                    defaultValue={friend.name}
                    autoFocus
                    onBlur={(e) => handleUpdateName(friend.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleUpdateName(friend.id, e.target.value);
                    }}
                    className="w-20 bg-white dark:bg-[#181a20] px-1 py-0.5 rounded border border-[#e05332] text-xs focus:outline-none"
                  />
                ) : (
                  <span
                    onClick={() => setEditingFriendId(friend.id)}
                    className="cursor-pointer hover:underline"
                    title="Click to rename"
                  >
                    {friend.name}
                  </span>
                )}

                {/* Paid Toggle Button */}
                <button
                  type="button"
                  onClick={() => togglePaid(friend.id)}
                  className="ml-1 p-0.5 hover:bg-[#e9e4d8] dark:hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                  title={friend.paid ? "Mark pending" : "Mark paid"}
                >
                  {friend.paid ? (
                    <Check className="w-3 h-3 text-[#0d9488]" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-[#d97706] block" />
                  )}
                </button>

                {/* Remove Button */}
                {friends.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => handleRemoveFriend(friend.id, e)}
                    className="p-0.5 hover:text-rose-500 rounded-full transition-colors cursor-pointer text-[#756f68] ml-0.5"
                    title={`Remove ${friend.name}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Round Up Toggle Switch */}
      <div className="mt-5 pt-4 border-t border-[#e3ded4] dark:border-white/10 flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5 font-bold text-sm text-[#1f1d1a] dark:text-[#f5f2eb]">
            <Sparkles className="w-4 h-4 text-[#d97706]" />
            Round up per person
          </div>
          <p className="text-xs text-[#756f68] dark:text-[#a39cae]">
            Rounds shares to whole currency; spare cents go to server tip bonus.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            playTick();
            setRoundUp(!roundUp);
          }}
          className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
            roundUp ? "bg-[#e05332] justify-end" : "bg-[#dcd4c5] dark:bg-slate-700 justify-start"
          }`}
          aria-pressed={roundUp}
        >
          <span className="w-4 h-4 rounded-full bg-white shadow-xs transform transition-transform" />
        </button>
      </div>
    </div>
  );
}
