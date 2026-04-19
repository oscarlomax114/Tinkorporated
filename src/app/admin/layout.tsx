import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login?redirect=/admin');

  // Check admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    redirect('/profile');
  }

  const navItems = [
    { label: 'Dashboard', href: '/admin' },
    { label: 'Orders', href: '/admin/orders' },
    { label: 'Inventory', href: '/admin/inventory' },
    { label: 'Users', href: '/admin/users' },
    { label: 'Applications', href: '/admin/applications' },
    { label: 'Contacts', href: '/admin/contacts' },
  ];

  return (
    <div>
      <div className="border-b border-border bg-surface">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="text-[10px] font-mono tracking-[0.2em] text-accent-red uppercase">Admin</span>
            <nav className="flex items-center gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-[10px] font-mono tracking-[0.1em] uppercase text-muted hover:text-foreground transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <Link href="/profile" className="text-[10px] font-mono tracking-[0.1em] uppercase text-muted hover:text-foreground transition-colors">
            Exit Admin
          </Link>
        </div>
      </div>
      {children}
    </div>
  );
}
