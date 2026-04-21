'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

const variantImages: Record<string, Record<string, string>> = {
  'DSG-OS': {
    'F-SU1': '/products/os_su1.png',
    'F-PC1': '/products/os_pc1.png',
    'F-BL1': '/products/os_bl1.png',
    'F-AF1': '/products/os_af1.png',
    'F-AS1': '/products/os_as1.png',
    'F-SS1': '/products/os_ss1.png',
  },
};

const productImages: Record<string, string> = {
  'DSG-MD': '/products/dsg-md.png',
  'DSG-OS': '/products/os_mock.png',
};

export default function ProductImage({
  productId,
  productName,
  isXR,
}: {
  productId: string;
  productName: string;
  isXR: boolean;
}) {
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);

  useEffect(() => {
    const handleVariantChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.productId === productId) {
        setSelectedVariant(detail.variant || null);
      }
    };
    window.addEventListener('variant-selected', handleVariantChange);
    return () => window.removeEventListener('variant-selected', handleVariantChange);
  }, [productId]);

  const variants = variantImages[productId];
  const variantImage = selectedVariant && variants ? variants[selectedVariant] : null;
  const defaultImage = productImages[productId] || null;
  const image = variantImage || defaultImage;

  return (
    <div className="aspect-[4/5] bg-surface-elevated border border-border relative overflow-hidden lg:sticky lg:top-28">
      {image ? (
        <Image
          src={image}
          alt={productName}
          fill
          className="object-cover object-center transition-opacity duration-300"
          sizes="(max-width: 1024px) 100vw, 40vw"
          key={image}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-xs font-mono tracking-[0.3em] text-border-light mb-2">{isXR ? 'XR' : 'DOSAGE'}</div>
            <div className="text-xs font-mono tracking-[0.3em] text-border-light">{productId}</div>
          </div>
        </div>
      )}
      <div className="absolute top-4 left-4 px-2.5 py-1 bg-background border border-border text-[9px] font-mono tracking-[0.15em] uppercase z-10">
        {isXR ? 'Extended Release' : 'Standard Dose'}
      </div>
      <div className="absolute inset-0 scanline-overlay" />
    </div>
  );
}
