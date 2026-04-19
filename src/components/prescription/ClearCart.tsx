'use client';

import { useEffect } from 'react';

export default function ClearCart() {
  useEffect(() => {
    localStorage.removeItem('tink-prescription');
    window.dispatchEvent(new Event('cart-updated'));
  }, []);
  return null;
}
