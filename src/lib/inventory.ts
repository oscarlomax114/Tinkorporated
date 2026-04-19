import { createClient } from '@supabase/supabase-js';

// Public read client (uses anon key, respects RLS)
function getPublicSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Admin client (bypasses RLS for writes)
function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export interface InventoryRow {
  product_id: string;
  variant: string | null;
  label: string | null;
  stock: number;
}

/** Get stock for a single product/variant. */
export async function getInventory(
  productId: string,
  variant?: string | null
): Promise<number> {
  const db = getPublicSupabase();
  let query = db
    .from('inventory')
    .select('stock')
    .eq('product_id', productId);

  if (variant) {
    query = query.eq('variant', variant);
  } else {
    query = query.is('variant', null);
  }

  const { data } = await query.single();
  return data?.stock ?? 0;
}

/** Get all inventory rows for a product (all variants). */
export async function getProductInventory(
  productId: string
): Promise<InventoryRow[]> {
  const db = getPublicSupabase();
  const { data } = await db
    .from('inventory')
    .select('product_id, variant, label, stock')
    .eq('product_id', productId)
    .order('variant');

  return data ?? [];
}

/** Get total stock for a product (sum of all variants). */
export async function getTotalStock(productId: string): Promise<number> {
  const rows = await getProductInventory(productId);
  return rows.reduce((sum, r) => sum + r.stock, 0);
}

/**
 * Atomically decrement stock for purchased items.
 * Returns true if all decrements succeeded.
 */
export async function decrementInventory(
  items: Array<{ productId: string; variant: string | null; quantity: number }>
): Promise<boolean> {
  const db = getAdminSupabase();
  if (!db) {
    console.error('[inventory] no admin client available');
    return false;
  }

  let allOk = true;

  for (const item of items) {
    const { data, error } = await db.rpc('decrement_stock', {
      p_product_id: item.productId,
      p_variant: item.variant,
      p_quantity: item.quantity,
    });

    if (error) {
      console.error('[inventory] decrement error:', error);
      allOk = false;
    } else if (data === -1) {
      console.error(
        `[inventory] insufficient stock: ${item.productId} variant=${item.variant} qty=${item.quantity}`
      );
      allOk = false;
    } else {
      console.log(
        `[inventory] decremented ${item.productId} variant=${item.variant} by ${item.quantity}, new stock: ${data}`
      );
    }
  }

  return allOk;
}
