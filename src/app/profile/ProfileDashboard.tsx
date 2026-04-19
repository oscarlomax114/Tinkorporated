'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import SectionLabel from '@/components/ui/SectionLabel';
import MetadataRow from '@/components/ui/MetadataRow';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  shipping_address: Record<string, string> | null;
  billing_address: Record<string, string> | null;
  created_at: string;
  role: string;
}

interface Order {
  id: string;
  stripe_session_id: string | null;
  amount_total: number;
  currency: string;
  status: string;
  items: Array<{ name: string; quantity: number; amount: number; type: string }>;
  shipping_address: Record<string, string> | null;
  created_at: string;
}

interface LabAccessApp {
  id: string;
  status: string;
  created_at: string;
}

type Tab = 'overview' | 'orders' | 'settings';

export default function ProfileDashboard({
  user,
  profile,
  orders,
  labAccess,
}: {
  user: User;
  profile: Profile | null;
  orders: Order[];
  labAccess: LabAccessApp | null;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [fullName, setFullName] = useState(profile?.full_name ?? user.user_metadata?.full_name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');

  const displayName = profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Patient';
  const patientId = `PT-${user.id.slice(0, 5).toUpperCase()}`;
  const registeredDate = profile?.created_at?.slice(0, 10) ?? user.created_at?.slice(0, 10) ?? '—';

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveMsg('');
    const supabase = createClient();
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: user.id, full_name: fullName, phone }, { onConflict: 'id' });
    setSaving(false);
    setSaveMsg(error ? 'Failed to save.' : 'Profile updated.');
    if (!error) router.refresh();
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'orders', label: 'Order History' },
    { key: 'settings', label: 'Settings' },
  ];

  return (
    <div>
      <div className="border-b border-border">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-12 md:py-16">
          <div className="flex items-center gap-3 mb-3">
            <span className="status-dot status-active" />
            <span className="text-[10px] font-mono tracking-[0.15em] text-muted uppercase">Authenticated</span>
          </div>
          <div className="text-[10px] font-mono tracking-[0.2em] text-muted mb-3">PATIENT PROFILE — REF: {patientId}</div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-[0.08em]">{displayName}</h1>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          {/* Sidebar */}
          <div className="lg:col-span-3">
            <nav className="space-y-[1px] mb-8">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`block w-full text-left px-4 py-3 text-[11px] font-mono tracking-[0.1em] uppercase transition-colors ${
                    activeTab === tab.key ? 'bg-surface-elevated text-foreground border-l-2 border-foreground' : 'text-muted hover:text-foreground hover:bg-surface'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-3 text-[11px] font-mono tracking-[0.1em] uppercase text-muted hover:text-accent-red transition-colors"
            >
              Sign Out
            </button>
          </div>

          {/* Main content */}
          <div className="lg:col-span-9">
            {/* ─── Overview ─── */}
            {activeTab === 'overview' && (
              <>
                <div className="mb-10">
                  <SectionLabel label="Patient Record" code={patientId} />
                  <div className="border border-border">
                    <div className="p-5 border-b border-border bg-surface">
                      <div className="text-[10px] font-mono tracking-[0.15em] text-muted">PROFILE METADATA</div>
                    </div>
                    <div>
                      <MetadataRow label="Patient ID" value={patientId} mono />
                      <MetadataRow label="Name" value={displayName} />
                      <MetadataRow label="Email" value={user.email ?? '—'} mono />
                      <MetadataRow label="Registered" value={registeredDate} mono />
                      <MetadataRow label="Lab Access" value={
                        labAccess ? (
                          <span className="inline-flex items-center gap-2">
                            <span className={`status-dot ${labAccess.status === 'approved' ? 'status-active' : labAccess.status === 'denied' ? 'status-restricted' : 'status-pending'}`} />
                            <span className="text-xs capitalize">{labAccess.status}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-2">
                            <span className="status-dot status-restricted" />
                            <span className="text-xs">Not Applied</span>
                            <Link href="/access" className="text-[9px] font-mono text-accent-blue underline ml-2">Apply</Link>
                          </span>
                        )
                      } />
                    </div>
                  </div>
                </div>

                <div className="mb-10">
                  <SectionLabel label="Activity Summary" />
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-[1px] bg-border">
                    {[
                      { label: 'Total Orders', value: String(orders.length) },
                      { label: 'Lab Access', value: labAccess ? labAccess.status : 'N/A' },
                      { label: 'Account Status', value: 'Active' },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-background p-5 border border-border text-center">
                        <div className="text-2xl font-light tracking-wider mb-1 capitalize">{stat.value}</div>
                        <div className="text-[9px] font-mono text-muted tracking-[0.1em] uppercase">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {orders.length > 0 && (
                  <div>
                    <SectionLabel label="Recent Orders" />
                    <div className="border border-border">
                      <div className="p-4 border-b border-border bg-surface">
                        <div className="text-[10px] font-mono tracking-[0.15em] text-muted">DISPENSING LOG</div>
                      </div>
                      {orders.slice(0, 3).map((order) => (
                        <div key={order.id} className="p-4 border-b border-border last:border-0 flex items-center justify-between hover:bg-surface transition-colors">
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="text-[10px] font-mono text-muted tracking-[0.1em] flex-shrink-0">{order.id.slice(0, 8).toUpperCase()}</div>
                            <div className="text-sm truncate">
                              {order.items?.[0]?.name ?? 'Order'}{order.items?.length > 1 ? ` +${order.items.length - 1}` : ''}
                            </div>
                          </div>
                          <div className="flex items-center gap-6 text-[10px] font-mono text-muted tracking-[0.1em]">
                            <span className="hidden sm:inline">{order.created_at?.slice(0, 10)}</span>
                            <span className="text-accent-green capitalize">{order.status}</span>
                            <span>${(order.amount_total / 100).toFixed(0)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    {orders.length > 3 && (
                      <button onClick={() => setActiveTab('orders')} className="mt-3 text-[10px] font-mono text-muted hover:text-foreground tracking-[0.1em] uppercase transition-colors">
                        View all orders
                      </button>
                    )}
                  </div>
                )}
              </>
            )}

            {/* ─── Orders ─── */}
            {activeTab === 'orders' && (
              <div>
                <SectionLabel label="Order History" code="ORD" />
                {orders.length === 0 ? (
                  <div className="border border-border p-8 text-center">
                    <div className="text-[10px] font-mono tracking-[0.2em] text-muted mb-3">NO ORDERS</div>
                    <p className="text-sm text-muted mb-6">You have no dispensing records on file.</p>
                    <Link href="/doses" className="border border-foreground px-8 py-3 text-[11px] font-mono tracking-[0.2em] uppercase hover:bg-foreground hover:text-background transition-colors">
                      Browse Doses
                    </Link>
                  </div>
                ) : (
                  <div className="border border-border">
                    <div className="p-4 border-b border-border bg-surface">
                      <div className="text-[10px] font-mono tracking-[0.15em] text-muted">DISPENSING LOG — ALL RECORDS</div>
                    </div>
                    {orders.map((order) => (
                      <div key={order.id} className="p-4 border-b border-border last:border-0 hover:bg-surface transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-[10px] font-mono text-muted tracking-[0.1em]">{order.id.slice(0, 8).toUpperCase()}</div>
                          <div className="flex items-center gap-4 text-[10px] font-mono text-muted tracking-[0.1em]">
                            <span>{order.created_at?.slice(0, 10)}</span>
                            <span className="text-accent-green capitalize">{order.status}</span>
                            <span>${(order.amount_total / 100).toFixed(0)}</span>
                          </div>
                        </div>
                        {order.items?.map((item, i) => (
                          <div key={i} className="text-sm text-muted ml-4">
                            {item.quantity}x {item.name}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ─── Settings ─── */}
            {activeTab === 'settings' && (
              <div>
                <SectionLabel label="Account Settings" code="SET" />
                <div className="border border-border">
                  <div className="p-5 border-b border-border bg-surface">
                    <div className="text-[10px] font-mono tracking-[0.15em] text-muted">PROFILE INFORMATION</div>
                  </div>
                  <div className="p-6 space-y-6">
                    <div>
                      <label className="text-[10px] font-mono tracking-[0.15em] text-muted uppercase block mb-2">Full Name</label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full bg-transparent border border-border px-4 py-3 text-sm text-foreground focus:border-foreground outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono tracking-[0.15em] text-muted uppercase block mb-2">Email</label>
                      <input
                        type="email"
                        value={user.email ?? ''}
                        disabled
                        className="w-full bg-transparent border border-border px-4 py-3 text-sm text-muted outline-none opacity-60"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono tracking-[0.15em] text-muted uppercase block mb-2">Phone</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-transparent border border-border px-4 py-3 text-sm text-foreground focus:border-foreground outline-none transition-colors"
                        placeholder="Optional"
                      />
                    </div>

                    {saveMsg && (
                      <div className="text-[10px] font-mono tracking-[0.1em] text-accent-green">{saveMsg}</div>
                    )}

                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="bg-foreground text-background px-8 py-3 text-[11px] font-mono tracking-[0.2em] uppercase hover:bg-muted transition-colors disabled:opacity-50"
                    >
                      {saving ? 'Saving…' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
