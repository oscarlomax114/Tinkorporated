import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Admin — TINKORPORATED' };

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    { count: userCount },
    { count: orderCount },
    { count: appCount },
    { data: recentOrders },
    { count: contactCount },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('lab_access_applications').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('id, status, amount_total, currency, created_at, customer_email').order('created_at', { ascending: false }).limit(5),
    supabase.from('contact_submissions').select('*', { count: 'exact', head: true }).eq('read', false),
  ]);

  const stats = [
    { label: 'Total Orders', value: orderCount ?? 0, href: '/admin/orders' },
    { label: 'Total Users', value: userCount ?? 0, href: '/admin/users' },
    { label: 'Applications', value: appCount ?? 0, href: '/admin/applications' },
    { label: 'Unread Contacts', value: contactCount ?? 0, href: '/admin/contacts' },
  ];

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-12">
      <div className="text-[10px] font-mono tracking-[0.2em] text-muted mb-3">SYSTEM OVERVIEW</div>
      <h1 className="text-2xl font-bold tracking-[0.08em] mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="border border-border p-6 hover:border-foreground transition-colors">
            <div className="text-3xl font-light tracking-wider mb-2">{stat.value}</div>
            <div className="text-[10px] font-mono text-muted tracking-[0.1em] uppercase">{stat.label}</div>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="border border-border">
        <div className="p-4 border-b border-border bg-surface flex items-center justify-between">
          <div className="text-[10px] font-mono tracking-[0.15em] text-muted uppercase">Recent Orders</div>
          <Link href="/admin/orders" className="text-[10px] font-mono tracking-[0.1em] text-muted hover:text-foreground transition-colors uppercase">
            View All →
          </Link>
        </div>
        {(!recentOrders || recentOrders.length === 0) ? (
          <div className="p-6 text-sm text-muted text-center">No orders yet.</div>
        ) : (
          <div className="divide-y divide-border">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="p-4 flex items-center justify-between hover:bg-surface transition-colors block"
              >
                <div className="flex items-center gap-4">
                  <div className="text-[10px] font-mono text-muted tracking-[0.1em]">
                    {order.id.slice(0, 8).toUpperCase()}
                  </div>
                  <div className="text-sm truncate max-w-[200px]">
                    {order.customer_email || '—'}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-mono">${(order.amount_total / 100).toFixed(2)}</span>
                  <span className="text-[9px] font-mono tracking-[0.15em] uppercase text-muted border border-border px-2 py-0.5">
                    {order.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
