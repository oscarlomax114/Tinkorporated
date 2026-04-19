'use client';

import { Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CheckoutForm() {
  const searchParams = useSearchParams();
  const items = searchParams.get('items');

  const fetchClientSecret = useCallback(async () => {
    const parsedItems = items ? JSON.parse(decodeURIComponent(items)) : [];
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: parsedItems }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Checkout failed');
    return data.clientSecret;
  }, [items]);

  return (
    <EmbeddedCheckoutProvider stripe={stripePromise} options={{ fetchClientSecret }}>
      <EmbeddedCheckout />
    </EmbeddedCheckoutProvider>
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
        <div id="checkout" className="max-w-2xl mx-auto">
          <Suspense fallback={
            <div className="text-center py-12 text-sm text-muted font-mono">Loading checkout…</div>
          }>
            <CheckoutForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
