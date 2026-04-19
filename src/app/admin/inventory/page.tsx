import { createClient } from '@/lib/supabase/server';
import InventoryEditor from './InventoryEditor';

export const metadata = { title: 'Inventory — Admin — TINKORPORATED' };

export default async function AdminInventoryPage() {
  const supabase = await createClient();

  const { data: inventory } = await supabase
    .from('inventory')
    .select('*')
    .order('product_id')
    .order('variant');

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-12">
      <div className="text-[10px] font-mono tracking-[0.2em] text-muted mb-3">STOCK MANAGEMENT</div>
      <h1 className="text-2xl font-bold tracking-[0.08em] mb-8">Inventory</h1>

      <InventoryEditor initialData={inventory || []} />
    </div>
  );
}
