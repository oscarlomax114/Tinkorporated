import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Users — Admin — TINKORPORATED' };

export default async function AdminUsersPage() {
  const supabase = await createClient();

  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-12">
      <div className="text-[10px] font-mono tracking-[0.2em] text-muted mb-3">USER MANAGEMENT</div>
      <h1 className="text-2xl font-bold tracking-[0.08em] mb-8">Users</h1>

      <div className="border border-border">
        <div className="p-4 border-b border-border bg-surface hidden md:grid grid-cols-12 gap-4 text-[10px] font-mono tracking-[0.15em] text-muted uppercase">
          <div className="col-span-2">ID</div>
          <div className="col-span-3">Name</div>
          <div className="col-span-3">Email</div>
          <div className="col-span-2">Role</div>
          <div className="col-span-2">Joined</div>
        </div>
        {users?.length === 0 && (
          <div className="p-8 text-center text-sm text-muted">No users yet.</div>
        )}
        {users?.map((user) => (
          <div key={user.id} className="p-4 border-b border-border last:border-0 grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 items-center hover:bg-surface transition-colors">
            <div className="md:col-span-2 text-[10px] font-mono text-muted tracking-[0.1em]">
              {user.id.slice(0, 8).toUpperCase()}
            </div>
            <div className="md:col-span-3 text-sm">{user.full_name || '—'}</div>
            <div className="md:col-span-3 text-sm font-mono text-muted">{user.email || '—'}</div>
            <div className="md:col-span-2">
              <span className={`text-[9px] font-mono tracking-[0.15em] uppercase border px-2 py-0.5 ${
                user.role === 'admin' ? 'border-accent-red/50 text-accent-red' : 'border-border text-muted'
              }`}>
                {user.role || 'user'}
              </span>
            </div>
            <div className="md:col-span-2 text-[10px] font-mono text-muted">{user.created_at?.slice(0, 10)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
