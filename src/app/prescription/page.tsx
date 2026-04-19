'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SectionLabel from '@/components/ui/SectionLabel';

interface PrescriptionItem {
  doseId: string;
  compoundId: string;
  compoundName: string;
  doseTitle: string;
  type: 'physical';
  price: number;
  quantity: number;
  selectedOption?: string;
}

export default function PrescriptionPage() {
  const router = useRouter();
  const [items, setItems] = useState<PrescriptionItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('tink-prescription');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  // Persist cart to localStorage.
  useEffect(() => {
    localStorage.setItem('tink-prescription', JSON.stringify(items));
    window.dispatchEvent(new Event('cart-updated'));
  }, [items]);

  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const remove = (id: string) => setItems(items.filter(i => i.doseId !== id));

  const updateQty = (id: string, delta: number) => {
    setItems(items.map(i => i.doseId === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i));
  };

  const proceedToCheckout = () => {
    setCheckoutLoading(true);
    setCheckoutError(null);
    const cartItems = items.map(i => ({ doseId: i.doseId, quantity: i.quantity }));
    const encoded = encodeURIComponent(JSON.stringify(cartItems));
    router.push(`/prescription/checkout?items=${encoded}`);
  };

  return (
    <div>
      <div className="border-b border-border">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-12 md:py-16">
          <div className="text-[10px] font-mono tracking-[0.2em] text-muted mb-3">PRESCRIPTION SHEET — REF: RX-{Date.now().toString(36).toUpperCase().slice(-6)}</div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-[0.08em] mb-2">Prescription</h1>
          <p className="text-sm text-muted">
            {items.length} {items.length === 1 ? 'dose' : 'doses'} prepared for dispensing.
          </p>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-12 md:py-16">
        {items.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
            <div className="lg:col-span-8">
              <SectionLabel label="Prescribed Doses" code="RX" />

              {/* Table header */}
              <div className="hidden md:grid grid-cols-12 gap-4 py-3 border-b border-border text-[10px] font-mono tracking-[0.15em] uppercase text-muted">
                <div className="col-span-5">Dose</div>
                <div className="col-span-2 text-center">Method</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-1 text-right"></div>
              </div>

              <div>
                {items.map((item) => (
                  <div key={item.doseId} className="grid grid-cols-1 md:grid-cols-12 gap-4 py-6 border-b border-border items-center">
                    <div className="md:col-span-5">
                      <div className="text-[10px] font-mono text-muted tracking-[0.1em] mb-1">{item.compoundId}</div>
                      <div className="text-sm font-medium tracking-[0.05em]">{item.compoundName}</div>
                      <div className="text-[10px] text-muted mt-0.5">{item.doseTitle}</div>
                    </div>
                    <div className="md:col-span-2 md:text-center">
                      <span className="text-[9px] font-mono tracking-[0.15em] uppercase border border-border px-2 py-0.5">
                        {item.compoundId.startsWith('XR') ? 'XR' : item.doseTitle.includes('Mystery') ? 'Mystery' : 'Open'}
                      </span>
                    </div>
                    <div className="md:col-span-2 md:text-center">
                      <div className="inline-flex items-center border border-border">
                        <button onClick={() => updateQty(item.doseId, -1)} className="px-2.5 py-1 text-xs text-muted hover:text-foreground transition-colors">−</button>
                        <span className="text-xs font-mono w-6 text-center">{item.quantity}</span>
                        <button onClick={() => updateQty(item.doseId, 1)} className="px-2.5 py-1 text-xs text-muted hover:text-foreground transition-colors">+</button>
                      </div>
                    </div>
                    <div className="md:col-span-2 md:text-right text-sm font-mono">${item.price * item.quantity}</div>
                    <div className="md:col-span-1 md:text-right">
                      <button
                        onClick={() => remove(item.doseId)}
                        className="text-[10px] font-mono text-muted hover:text-accent-red tracking-[0.1em] uppercase transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="lg:col-span-4">
              <div className="border border-border lg:sticky lg:top-28">
                <div className="p-5 border-b border-border bg-surface">
                  <div className="text-[10px] font-mono tracking-[0.15em] text-muted">DISPENSING SUMMARY</div>
                </div>
                <div className="p-5 space-y-3 border-b border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Subtotal</span>
                    <span className="font-mono">${subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Handling</span>
                    <span className="font-mono text-muted">Calculated at dispensing</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted">Processing</span>
                    <span className="font-mono">$0</span>
                  </div>
                </div>
                <div className="p-5 border-b border-border">
                  <div className="flex justify-between text-base font-medium">
                    <span>Total</span>
                    <span className="font-mono tracking-wider">${subtotal}</span>
                  </div>
                </div>
                <div className="p-5">
                  <button
                    onClick={proceedToCheckout}
                    disabled={checkoutLoading || items.length === 0}
                    className="w-full bg-foreground text-background py-3 text-[11px] font-mono tracking-[0.2em] uppercase hover:bg-muted transition-colors mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {checkoutLoading ? 'Redirecting…' : 'Proceed with Prescription'}
                  </button>
                  {checkoutError && (
                    <div className="text-[10px] font-mono text-accent-red text-center tracking-[0.1em] mb-3">
                      {checkoutError}
                    </div>
                  )}
                  <div className="text-[9px] font-mono text-muted text-center tracking-[0.1em]">
                    All doses ship within 3–5 business days.<br />
                    XR orders may require additional processing time.
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="text-[10px] font-mono tracking-[0.15em] text-muted mb-4">PRESCRIPTION EMPTY</div>
            <h2 className="text-xl font-medium tracking-[0.08em] mb-3">No doses prescribed</h2>
            <p className="text-xs text-muted mb-8">Your prescription contains no doses. Browse the dose index to begin.</p>
            <Link href="/doses" className="inline-block border border-foreground px-8 py-3 text-[11px] font-mono tracking-[0.2em] uppercase hover:bg-foreground hover:text-background transition-colors">
              Browse Doses
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
