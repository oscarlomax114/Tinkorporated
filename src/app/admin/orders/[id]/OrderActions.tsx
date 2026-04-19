'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const STATUSES = ['pending', 'paid', 'in_production', 'packed', 'shipped', 'delivered', 'cancelled', 'refunded'];

export default function OrderActions({
  orderId,
  currentStatus,
  currentCarrier,
  currentTracking,
  currentNotes,
}: {
  orderId: string;
  currentStatus: string;
  currentCarrier: string;
  currentTracking: string;
  currentNotes: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [carrier, setCarrier] = useState(currentCarrier);
  const [trackingNumber, setTrackingNumber] = useState(currentTracking);
  const [notes, setNotes] = useState(currentNotes);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function handleSave() {
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          status: status !== currentStatus ? status : undefined,
          carrier: carrier !== currentCarrier ? carrier : undefined,
          trackingNumber: trackingNumber !== currentTracking ? trackingNumber : undefined,
          notes: notes !== currentNotes ? notes : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Failed to update' });
      } else {
        setMessage({ type: 'success', text: 'Order updated successfully' });
        router.refresh();
      }
    } catch {
      setMessage({ type: 'error', text: 'Network error' });
    } finally {
      setSaving(false);
    }
  }

  const hasChanges =
    status !== currentStatus ||
    carrier !== currentCarrier ||
    trackingNumber !== currentTracking ||
    notes !== currentNotes;

  return (
    <div className="border border-border sticky top-28">
      <div className="p-4 border-b border-border bg-surface">
        <div className="text-[10px] font-mono tracking-[0.15em] text-muted uppercase">Update Order</div>
      </div>

      <div className="p-4 space-y-4">
        {/* Status */}
        <div>
          <label className="text-[10px] font-mono tracking-[0.12em] text-muted uppercase block mb-1.5">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full bg-background border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:border-foreground transition-colors"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</option>
            ))}
          </select>
        </div>

        {/* Carrier */}
        <div>
          <label className="text-[10px] font-mono tracking-[0.12em] text-muted uppercase block mb-1.5">Carrier</label>
          <input
            type="text"
            value={carrier}
            onChange={(e) => setCarrier(e.target.value)}
            placeholder="e.g. USPS, UPS, FedEx"
            className="w-full bg-background border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:border-foreground transition-colors"
          />
        </div>

        {/* Tracking Number */}
        <div>
          <label className="text-[10px] font-mono tracking-[0.12em] text-muted uppercase block mb-1.5">Tracking Number</label>
          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="Enter tracking number"
            className="w-full bg-background border border-border px-3 py-2 text-sm font-mono focus:outline-none focus:border-foreground transition-colors"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="text-[10px] font-mono tracking-[0.12em] text-muted uppercase block mb-1.5">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Internal notes..."
            className="w-full bg-background border border-border px-3 py-2 text-sm focus:outline-none focus:border-foreground transition-colors resize-none"
          />
        </div>

        {/* Message */}
        {message && (
          <div className={`text-[10px] font-mono tracking-[0.1em] px-3 py-2 border ${
            message.type === 'success' ? 'border-accent-green/50 text-accent-green' : 'border-red-500/50 text-red-500'
          }`}>
            {message.text}
          </div>
        )}

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className="w-full bg-foreground text-background px-4 py-2.5 text-[10px] font-mono tracking-[0.15em] uppercase hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
