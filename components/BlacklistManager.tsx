"use client";

import { useState } from "react";

type BlacklistItem = { id: number; game_name: string };

export function BlacklistManager({
  initialItems,
  onChanged
}: {
  initialItems: BlacklistItem[];
  onChanged: () => void;
}) {
  const [items, setItems] = useState(initialItems);
  const [newName, setNewName] = useState("");
  const [loading, setLoading] = useState(false);

  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setLoading(true);
    const response = await fetch("/api/blacklist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameName: newName.trim() })
    });
    const data = await response.json();
    setLoading(false);
    if (response.ok) {
      setItems(data.items);
      setNewName("");
      onChanged();
    }
  }

  async function removeItem(id: number) {
    setLoading(true);
    const response = await fetch("/api/blacklist", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    const data = await response.json();
    setLoading(false);
    if (response.ok) {
      setItems(data.items);
      onChanged();
    }
  }

  return (
    <section className="rounded-2xl bg-surface-container-low p-6 ring-1 ring-outline-variant/20">
      <h3 className="text-xl font-bold text-primary">Blacklist</h3>
      <p className="mt-1 text-sm text-on-surface-variant">
        Exclude games you never want to see in recommendations.
      </p>
      <form onSubmit={addItem} className="mt-4 flex gap-3">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Game name"
          className="w-full rounded-lg bg-surface-container-lowest px-3 py-2 outline-none ring-1 ring-outline-variant/20 focus:ring-2 focus:ring-primary"
        />
        <button
          disabled={loading}
          className="rounded-lg bg-primary-container px-4 py-2 text-sm font-semibold text-on-primary-container disabled:opacity-50"
        >
          Add
        </button>
      </form>
      <div className="mt-4 flex flex-wrap gap-2">
        {items.length === 0 ? (
          <p className="text-sm text-on-surface-variant">No blacklisted games yet.</p>
        ) : (
          items.map((item) => (
            <button
              key={item.id}
              onClick={() => removeItem(item.id)}
              className="rounded-full bg-surface-container-lowest px-3 py-1.5 text-sm text-on-surface ring-1 ring-outline-variant/20"
            >
              {item.game_name} x
            </button>
          ))
        )}
      </div>
    </section>
  );
}
