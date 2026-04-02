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
    <section className="rounded-xl border-l-4 border-tertiary/60 bg-surface-container-high p-6 shadow-lg">
      <h3 className="font-label text-sm uppercase tracking-widest text-secondary-fixed-dim">Blacklist</h3>
      <p className="mt-2 text-sm text-on-surface-variant">
        Exclude games you never want to see in recommendations.
      </p>
      <form onSubmit={addItem} className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Game name"
          className="w-full rounded-lg border-none bg-surface-container-lowest px-4 py-3 text-sm outline-none ring-1 ring-transparent focus:ring-1 focus:ring-primary"
        />
        <button
          disabled={loading}
          className="font-label shrink-0 rounded-lg bg-primary-container px-5 py-3 text-xs font-bold uppercase tracking-widest text-on-primary-container transition hover:bg-[#8083ff]/90 disabled:opacity-50"
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
              type="button"
              onClick={() => removeItem(item.id)}
              className="font-label rounded-full border border-primary/20 bg-surface-container-lowest px-3 py-1.5 text-xs uppercase tracking-wider text-primary transition hover:bg-surface-container"
            >
              {item.game_name} ×
            </button>
          ))
        )}
      </div>
    </section>
  );
}
