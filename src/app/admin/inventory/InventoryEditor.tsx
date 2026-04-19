'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface InventoryRow {
  id: string;
  product_id: string;
  variant: string | null;
  label: string | null;
  stock: number;
}

export default function InventoryEditor({ initialData }: { initialData: InventoryRow[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initialData);
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<{ id: string; type: 'success' | 'error'; text: string } | null>(null);

  // Group by product
  const grouped = items.reduce<Record<string, InventoryRow[]>>((acc, item) => {
    const key = item.product_id;
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  async function handleUpdate(item: InventoryRow, newStock: number) {
    setSaving(item.id);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/inventory', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, stock: newStock }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ id: item.id, type: 'error', text: data.error || 'Failed' });
      } else {
        setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, stock: newStock } : i));
        setMessage({ id: item.id, type: 'success', text: 'Updated' });
        router.refresh();
      }
    } catch {
      setMessage({ id: item.id, type: 'error', text: 'Network error' });
    } finally {
      setSaving(null);
    }
  }

  const totalStock = items.reduce((sum, i) => sum + i.stock, 0);

  return (
    <div>
      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="border border-border p-4">
          <div className="text-2xl font-light tracking-wider mb-1">{totalStock}</div>
          <div className="text-[10px] font-mono text-muted tracking-[0.1em] uppercase">Total Units</div>
        </div>
        <div className="border border-border p-4">
          <div className="text-2xl font-light tracking-wider mb-1">{Object.keys(grouped).length}</div>
          <div className="text-[10px] font-mono text-muted tracking-[0.1em] uppercase">Products</div>
        </div>
        <div className="border border-border p-4">
          <div className="text-2xl font-light tracking-wider mb-1">{items.length}</div>
          <div className="text-[10px] font-mono text-muted tracking-[0.1em] uppercase">SKUs</div>
        </div>
        <div className="border border-border p-4">
          <div className="text-2xl font-light tracking-wider mb-1">{items.filter((i) => i.stock === 0).length}</div>
          <div className="text-[10px] font-mono text-muted tracking-[0.1em] uppercase">Out of Stock</div>
        </div>
      </div>

      {/* Products */}
      {Object.entries(grouped).map(([productId, rows]) => (
        <div key={productId} className="border border-border mb-4">
          <div className="p-4 border-b border-border bg-surface flex items-center justify-between">
            <div className="text-[10px] font-mono tracking-[0.15em] text-muted uppercase">{productId}</div>
            <div className="text-xs font-mono text-muted">
              {rows.reduce((s, r) => s + r.stock, 0)} units total
            </div>
          </div>

          <div className="divide-y divide-border">
            {rows.map((item) => (
              <StockRow
                key={item.id}
                item={item}
                saving={saving === item.id}
                message={message?.id === item.id ? message : null}
                onUpdate={(stock) => handleUpdate(item, stock)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function StockRow({
  item,
  saving,
  message,
  onUpdate,
}: {
  item: InventoryRow;
  saving: boolean;
  message: { type: 'success' | 'error'; text: string } | null;
  onUpdate: (stock: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(item.stock));

  function handleSave() {
    const num = parseInt(value, 10);
    if (isNaN(num) || num < 0) return;
    onUpdate(num);
    setEditing(false);
  }

  return (
    <div className="px-4 py-3 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className={`w-1.5 h-1.5 rounded-full ${item.stock > 0 ? 'bg-accent-green' : 'bg-red-500'}`} />
        <div>
          <div className="text-sm font-mono">{item.variant || 'Default'}</div>
          {item.label && <div className="text-[10px] text-muted">{item.label}</div>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {message && (
          <span className={`text-[9px] font-mono ${message.type === 'success' ? 'text-accent-green' : 'text-red-500'}`}>
            {message.text}
          </span>
        )}

        {editing ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className="w-20 bg-background border border-border px-2 py-1 text-sm font-mono text-right focus:outline-none focus:border-foreground"
              min={0}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSave();
                if (e.key === 'Escape') { setEditing(false); setValue(String(item.stock)); }
              }}
            />
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-[9px] font-mono tracking-[0.1em] uppercase text-accent-green hover:underline disabled:opacity-50"
            >
              {saving ? '...' : 'Save'}
            </button>
            <button
              onClick={() => { setEditing(false); setValue(String(item.stock)); }}
              className="text-[9px] font-mono tracking-[0.1em] uppercase text-muted hover:underline"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="text-sm font-mono hover:text-foreground transition-colors text-muted"
          >
            {item.stock} <span className="text-[9px] ml-1">✎</span>
          </button>
        )}
      </div>
    </div>
  );
}
