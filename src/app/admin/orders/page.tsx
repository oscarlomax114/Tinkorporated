import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export const metadata = { title: 'Orders — Admin — TINKORPORATED' };

const statusColors: Record<string, string> = {
  pending: 'border-yellow-500/50 text-yellow-500',
  paid: 'border-accent-green/50 text-accent-green',
  in_production: 'border-blue-400/50 text-blue-400',
  packed: 'border-blue-400/50 text-blue-400',
  shipped: 'border-accent-green/50 text-accent-green',
  delivered: 'border-accent-green/50 text-accent-green',
  cancelled: 'border-red-500/50 text-red-500',
  refunded: 'border-red-500/50 text-red-500',
  completed: 'border-accent-green/50 text-accent-green',
};

export default async function AdminOrdersPage() {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from('orders')
    .select('*, profiles(full_name, email)')
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-12">
      <div className="text-[10px] font-mono tracking-[0.2em] text-muted mb-3">ORDER MANAGEMENT</div>
      <h1 className="text-2xl font-bold tracking-[0.08em] mb-8">Orders</h1>

      <div className="border border-border">
        <div className="p-4 border-b border-border bg-surface hidden md:grid grid-cols-12 gap-4 text-[10px] font-mono tracking-[0.15em] text-muted uppercase">
          <div className="col-span-2">Order ID</div>
          <div className="col-span-3">Customer</div>
          <div className="col-span-2">Amount</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-3">Date</div>
        </div>
        {orders?.length === 0 && (
          <div className="p-8 text-center text-sm text-muted">No orders yet.</div>
        )}
        {orders?.map((order) => {
          const customer = order.profiles as { full_name: string | null; email: string | null } | null;
          const colorClass = statusColors[order.status] || 'border-border text-muted';
          return (
            <Link
              key={order.id}
              href={`/admin/orders/${order.id}`}
              className="p-4 border-b border-border last:border-0 grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 items-center hover:bg-surface transition-colors block"
            >
              <div className="md:col-span-2 text-[10px] font-mono text-muted tracking-[0.1em]">
                {order.id.slice(0, 8).toUpperCase()}
              </div>
              <div className="md:col-span-3 text-sm">
                <div>{customer?.full_name || '—'}</div>
                <div className="text-[10px] font-mono text-muted">{customer?.email || '—'}</div>
              </div>
              <div className="md:col-span-2 text-sm font-mono">
                ${(order.amount_total / 100).toFixed(2)} {order.currency?.toUpperCase()}
              </div>
              <div className="md:col-span-2">
                <span className={`text-[9px] font-mono tracking-[0.15em] uppercase border px-2 py-0.5 ${colorClass}`}>
                  {order.status}
                </span>
              </div>
              <div className="md:col-span-3 text-[10px] font-mono text-muted">{order.created_at?.slice(0, 19).replace('T', ' ')}</div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
