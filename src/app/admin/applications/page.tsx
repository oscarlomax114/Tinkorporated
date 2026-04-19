import { createClient } from '@/lib/supabase/server';
import ApplicationActions from './ApplicationActions';

export const metadata = { title: 'Applications — Admin — TINKORPORATED' };

export default async function AdminApplicationsPage() {
  const supabase = await createClient();

  const { data: applications } = await supabase
    .from('lab_access_applications')
    .select('*, profiles(full_name, email)')
    .order('created_at', { ascending: false })
    .limit(100);

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-12">
      <div className="text-[10px] font-mono tracking-[0.2em] text-muted mb-3">LAB ACCESS MANAGEMENT</div>
      <h1 className="text-2xl font-bold tracking-[0.08em] mb-8">Applications</h1>

      <div className="border border-border">
        <div className="p-4 border-b border-border bg-surface hidden md:grid grid-cols-12 gap-4 text-[10px] font-mono tracking-[0.15em] text-muted uppercase">
          <div className="col-span-3">Applicant</div>
          <div className="col-span-3">Email</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Date</div>
          <div className="col-span-2">Actions</div>
        </div>
        {applications?.length === 0 && (
          <div className="p-8 text-center text-sm text-muted">No applications yet.</div>
        )}
        {applications?.map((app) => {
          const profile = app.profiles as { full_name: string | null; email: string | null } | null;
          return (
            <div key={app.id} className="p-4 border-b border-border last:border-0 grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 items-center hover:bg-surface transition-colors">
              <div className="md:col-span-3 text-sm">{profile?.full_name || app.name || '—'}</div>
              <div className="md:col-span-3 text-sm font-mono text-muted">{profile?.email || app.email || '—'}</div>
              <div className="md:col-span-2">
                <span className={`text-[9px] font-mono tracking-[0.15em] uppercase border px-2 py-0.5 ${
                  app.status === 'approved' ? 'border-accent-green/50 text-accent-green' :
                  app.status === 'denied' ? 'border-accent-red/50 text-accent-red' :
                  'border-accent-blue/50 text-accent-blue'
                }`}>
                  {app.status}
                </span>
              </div>
              <div className="md:col-span-2 text-[10px] font-mono text-muted">{app.created_at?.slice(0, 10)}</div>
              <div className="md:col-span-2">
                <ApplicationActions id={app.id} currentStatus={app.status} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
