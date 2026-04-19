'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ApplicationActions({ id, currentStatus }: { id: string; currentStatus: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const updateStatus = async (status: string) => {
    setLoading(true);
    await fetch('/api/admin/update-access', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicationId: id, status }),
    });
    setLoading(false);
    router.refresh();
  };

  if (loading) {
    return <span className="text-[9px] font-mono tracking-[0.1em] uppercase text-muted">Processing…</span>;
  }

  if (currentStatus === 'approved' || currentStatus === 'denied') {
    return (
      <button
        onClick={() => updateStatus('pending')}
        className="text-[9px] font-mono tracking-[0.1em] uppercase text-muted hover:text-foreground transition-colors"
      >
        Reset
      </button>
    );
  }

  return (
    <div className="flex gap-3">
      <button
        onClick={() => updateStatus('approved')}
        className="text-[9px] font-mono tracking-[0.1em] uppercase text-accent-green hover:text-foreground transition-colors"
      >
        Approve
      </button>
      <button
        onClick={() => updateStatus('denied')}
        className="text-[9px] font-mono tracking-[0.1em] uppercase text-accent-red hover:text-foreground transition-colors"
      >
        Deny
      </button>
    </div>
  );
}
