'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

function CheckoutRedirect() {
  const searchParams = useSearchParams();
  const items = searchParams.get('items');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!items) return;

    const parsedItems = JSON.parse(decodeURIComponent(items));

    fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: parsedItems }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.url) {
          window.location.href = data.url;
        } else {
          setError(data.error || 'Checkout failed');
        }
      })
      .catch(() => setError('Something went wrong'));
  }, [items]);

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-sm text-red-500 font-mono mb-4">{error}</div>
        <a href="/prescription" className="text-[10px] font-mono tracking-[0.15em] uppercase text-muted hover:text-foreground">
          ← Back to Prescription
        </a>
      </div>
    );
  }

  return (
    <div className="text-center py-12 text-sm text-muted font-mono">
      Redirecting to checkout…
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div>
      <div className="border-b border-border">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-8 md:py-12">
          <div className="text-[10px] font-mono tracking-[0.2em] text-muted mb-3">DISPENSING CHECKOUT</div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-[0.08em]">Complete Prescription</h1>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-8 md:py-12">
        <div className="max-w-2xl mx-auto">
          <Suspense fallback={
            <div className="text-center py-12 text-sm text-muted font-mono">Loading checkout…</div>
          }>
            <CheckoutRedirect />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
