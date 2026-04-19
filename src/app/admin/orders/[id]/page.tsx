import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import OrderActions from './OrderActions';

export const metadata = { title: 'Order Detail — Admin — TINKORPORATED' };

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order, error } = await supabase
    .from('orders')
    .select('*, profiles(full_name, email)')
    .eq('id', id)
    .single();

  if (error || !order) return notFound();

  // Fetch status logs
  const { data: logs } = await supabase
    .from('order_status_logs')
    .select('*')
    .eq('order_id', id)
    .order('created_at', { ascending: false });

  const customer = order.profiles as { full_name: string | null; email: string | null } | null;
  const ref = order.stripe_session_id?.slice(-8).toUpperCase() ?? order.id.slice(0, 8).toUpperCase();

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-12">
      {/* Breadcrumb */}
      <div className="text-[10px] font-mono tracking-[0.1em] text-muted mb-6">
        <Link href="/admin/orders" className="hover:text-foreground transition-colors">ORDERS</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{ref}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Order Info */}
        <div className="lg:col-span-7">
          <h1 className="text-2xl font-bold tracking-[0.08em] mb-6">Order {ref}</h1>

          {/* Order details */}
          <div className="border border-border mb-6">
            <div className="p-4 border-b border-border bg-surface">
              <div className="text-[10px] font-mono tracking-[0.15em] text-muted uppercase">Order Details</div>
            </div>
            <div className="divide-y divide-border">
              <Row label="Order ID" value={order.id} mono />
              <Row label="Reference" value={ref} mono />
              <Row label="Customer" value={customer?.full_name || '—'} />
              <Row label="Email" value={order.customer_email || customer?.email || '—'} mono />
              <Row label="Amount" value={`$${(order.amount_total / 100).toFixed(2)} ${order.currency?.toUpperCase() || 'USD'}`} mono />
              <Row label="Product" value={order.product_id || '—'} mono />
              {order.selection && <Row label="Selection" value={order.selection} mono />}
              <Row label="Quantity" value={String(order.quantity || 1)} mono />
              <Row label="Status" value={order.status} status />
              <Row label="Created" value={order.created_at?.slice(0, 19).replace('T', ' ') || '—'} mono />
              {order.shipped_at && <Row label="Shipped" value={order.shipped_at.slice(0, 19).replace('T', ' ')} mono />}
              {order.delivered_at && <Row label="Delivered" value={order.delivered_at.slice(0, 19).replace('T', ' ')} mono />}
              {order.cancelled_at && <Row label="Cancelled" value={order.cancelled_at.slice(0, 19).replace('T', ' ')} mono />}
              {order.refunded_at && <Row label="Refunded" value={order.refunded_at.slice(0, 19).replace('T', ' ')} mono />}
              {order.carrier && <Row label="Carrier" value={order.carrier} />}
              {order.tracking_number && <Row label="Tracking" value={order.tracking_number} mono />}
              {order.notes && <Row label="Notes" value={order.notes} />}
            </div>
          </div>

          {/* Status Log */}
          <div className="border border-border">
            <div className="p-4 border-b border-border bg-surface">
              <div className="text-[10px] font-mono tracking-[0.15em] text-muted uppercase">Status History</div>
            </div>
            {(!logs || logs.length === 0) ? (
              <div className="p-6 text-sm text-muted text-center">No status changes recorded.</div>
            ) : (
              <div className="divide-y divide-border">
                {logs.map((log) => (
                  <div key={log.id} className="p-4 flex items-start justify-between gap-4">
                    <div>
                      <div className="text-sm">
                        <span className="text-muted">{log.old_status || '—'}</span>
                        <span className="mx-2 text-muted">→</span>
                        <span className="font-medium">{log.new_status}</span>
                      </div>
                      {log.note && <div className="text-xs text-muted mt-1">{log.note}</div>}
                    </div>
                    <div className="text-[10px] font-mono text-muted whitespace-nowrap">
                      {log.created_at?.slice(0, 19).replace('T', ' ')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="lg:col-span-5">
          <OrderActions
            orderId={order.id}
            currentStatus={order.status}
            currentCarrier={order.carrier || ''}
            currentTracking={order.tracking_number || ''}
            currentNotes={order.notes || ''}
          />
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, mono, status }: { label: string; value: string; mono?: boolean; status?: boolean }) {
  const statusColors: Record<string, string> = {
    pending: 'border-yellow-500/50 text-yellow-500',
    paid: 'border-accent-green/50 text-accent-green',
    in_production: 'border-blue-400/50 text-blue-400',
    packed: 'border-blue-400/50 text-blue-400',
    shipped: 'border-accent-green/50 text-accent-green',
    delivered: 'border-accent-green/50 text-accent-green',
    cancelled: 'border-red-500/50 text-red-500',
    refunded: 'border-red-500/50 text-red-500',
  };

  return (
    <div className="px-4 py-3 flex items-center justify-between gap-4">
      <div className="text-[10px] font-mono tracking-[0.12em] text-muted uppercase shrink-0">{label}</div>
      {status ? (
        <span className={`text-[9px] font-mono tracking-[0.15em] uppercase border px-2 py-0.5 ${statusColors[value] || 'border-border text-muted'}`}>
          {value}
        </span>
      ) : (
        <div className={`text-sm text-right ${mono ? 'font-mono text-xs' : ''} truncate`}>{value}</div>
      )}
    </div>
  );
}
