import { createClient } from '@supabase/supabase-js';

function getPublicSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export interface VisibilityRow {
  product_id: string;
  visible: boolean;
  publish_at: string | null;
  unpublish_at: string | null;
}

/** Check if a product is currently visible. */
export async function isProductVisible(productId: string): Promise<boolean> {
  const db = getPublicSupabase();
  const { data } = await db
    .from('product_visibility')
    .select('visible, publish_at, unpublish_at')
    .eq('product_id', productId)
    .single();

  // No row = visible by default
  if (!data) return true;

  if (!data.visible) return false;

  const now = new Date();
  if (data.publish_at && new Date(data.publish_at) > now) return false;
  if (data.unpublish_at && new Date(data.unpublish_at) < now) return false;

  return true;
}

/** Get visibility for all products. */
export async function getAllVisibility(): Promise<VisibilityRow[]> {
  const db = getPublicSupabase();
  const { data } = await db
    .from('product_visibility')
    .select('product_id, visible, publish_at, unpublish_at')
    .order('product_id');

  return data ?? [];
}
