'use client';

import { useState } from 'react';
import type { Product } from '@/data/compounds';
import { trackEvent } from '@/lib/analytics';

export default function DoseSelector({
  product,
  stock,
  variantStock,
}: {
  product: Product;
  stock?: number;
  variantStock?: Record<string, number>;
}) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const dose = product.doses[0];
  const hasOptions = !!dose.options;

  // Derive availability from live stock if provided, else fall back to static status
  const isAvailable = stock !== undefined ? stock > 0 : dose.status === 'available';

  // For option-based products, check per-variant stock
  const isSelectedAvailable = hasOptions && selectedOption && variantStock
    ? (variantStock[selectedOption] ?? 0) > 0
    : true;

  const handleAdd = () => {
    if (hasOptions && !selectedOption) return;
    if (!isAvailable) return;
    if (hasOptions && !isSelectedAvailable) return;

    const key = 'tink-prescription';
    let items = [];
    try {
      const saved = localStorage.getItem(key);
      items = saved ? JSON.parse(saved) : [];
    } catch {
      items = [];
    }

    const cartDoseId = hasOptions ? `${dose.id}:${selectedOption}` : dose.id;
    const cartTitle = hasOptions ? `${dose.title} — ${selectedOption}` : dose.title;

    const existing = items.find((i: { doseId: string }) => i.doseId === cartDoseId);
    if (existing) {
      existing.quantity += 1;
    } else {
      items.push({
        doseId: cartDoseId,
        compoundId: product.id,
        compoundName: product.name,
        doseTitle: cartTitle,
        type: dose.type,
        price: dose.price,
        quantity: 1,
        selectedOption: selectedOption || undefined,
      });
    }

    localStorage.setItem(key, JSON.stringify(items));
    window.dispatchEvent(new Event('cart-updated'));
    trackEvent('add_to_cart', {
      productId: product.id,
      variant: selectedOption || undefined,
      metadata: { price: dose.price, quantity: existing ? existing.quantity : 1 },
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="border border-border mb-8">
      <div className="p-5">
        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-[10px] font-mono text-muted tracking-[0.1em] mb-1">DOSE PRICE</div>
            <div className="text-2xl font-medium tracking-wider">
              {isAvailable ? `$${dose.price}` : '—'}
            </div>
          </div>
          <div className="text-[10px] font-mono text-muted tracking-[0.1em] text-right">
            <div>FORMAT</div>
            <div className="mt-1 text-foreground uppercase">
              {product.format === 'xr' ? 'Extended Release' : 'Standard Dose'}
            </div>
          </div>
        </div>

        {/* Option selector (for Open Selection) */}
        {hasOptions && dose.options && isAvailable && (
          <div className="mb-4 border-t border-border pt-4">
            <div className="flex items-center justify-between mb-3">
              <div className="text-[10px] font-mono text-muted tracking-[0.15em] uppercase">
                {dose.options.name} (Compound)
              </div>
              {selectedOption && variantStock && (
                <div className="text-[10px] font-mono text-muted tracking-[0.1em]">
                  {(variantStock[selectedOption] ?? 0) > 0
                    ? `${variantStock[selectedOption]} units`
                    : 'Sold Out'}
                </div>
              )}
            </div>
            <div className="grid grid-cols-5 gap-[1px] bg-border">
              {dose.options.values.map((val) => {
                const soldOut = variantStock ? (variantStock[val] ?? 0) <= 0 : false;
                return (
                  <button
                    key={val}
                    onClick={() => !soldOut && setSelectedOption(val)}
                    disabled={soldOut}
                    className={`py-2.5 text-[11px] font-mono tracking-[0.1em] transition-colors ${
                      soldOut
                        ? 'bg-background text-border-light cursor-not-allowed line-through'
                        : selectedOption === val
                          ? 'bg-foreground text-background'
                          : 'bg-background text-muted hover:text-foreground hover:bg-surface'
                    }`}
                  >
                    {val}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* CTA */}
        {isAvailable ? (
          <button
            onClick={handleAdd}
            disabled={(hasOptions && !selectedOption) || (hasOptions && !isSelectedAvailable)}
            className="w-full bg-foreground text-background py-3 text-[11px] font-mono tracking-[0.2em] uppercase hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {added
              ? 'Added to Prescription'
              : hasOptions && !selectedOption
                ? 'Select a Compound'
                : hasOptions && !isSelectedAvailable
                  ? 'Compound Sold Out'
                  : 'Add to Prescription'}
          </button>
        ) : (
          <button disabled className="w-full border border-border text-muted py-3 text-[11px] font-mono tracking-[0.2em] uppercase cursor-not-allowed">
            Sold Out
          </button>
        )}
      </div>
    </div>
  );
}
