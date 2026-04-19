import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Contacts — Admin — TINKORPORATED' };

export default async function AdminContactsPage() {
  const supabase = await createClient();

  const { data: submissions } = await supabase
    .from('contact_submissions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  const unread = submissions?.filter((s) => !s.read).length ?? 0;

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-12">
      <div className="text-[10px] font-mono tracking-[0.2em] text-muted mb-3">CONTACT SUBMISSIONS</div>
      <div className="flex items-center gap-4 mb-8">
        <h1 className="text-2xl font-bold tracking-[0.08em]">Contacts</h1>
        {unread > 0 && (
          <span className="text-[9px] font-mono tracking-[0.15em] uppercase border border-accent-red/50 text-accent-red px-2 py-0.5">
            {unread} unread
          </span>
        )}
      </div>

      <div className="border border-border">
        <div className="p-4 border-b border-border bg-surface hidden md:grid grid-cols-12 gap-4 text-[10px] font-mono tracking-[0.15em] text-muted uppercase">
          <div className="col-span-1"></div>
          <div className="col-span-2">Name</div>
          <div className="col-span-2">Email</div>
          <div className="col-span-1">Type</div>
          <div className="col-span-3">Subject</div>
          <div className="col-span-3">Date</div>
        </div>
        {(!submissions || submissions.length === 0) && (
          <div className="p-8 text-center text-sm text-muted">No submissions yet.</div>
        )}
        {submissions?.map((sub) => (
          <details key={sub.id} className="border-b border-border last:border-0 group">
            <summary className="p-4 grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 items-center hover:bg-surface transition-colors cursor-pointer list-none [&::-webkit-details-marker]:hidden">
              <div className="md:col-span-1">
                {!sub.read && <span className="w-2 h-2 rounded-full bg-accent-red inline-block" />}
              </div>
              <div className="md:col-span-2 text-sm truncate">{sub.name}</div>
              <div className="md:col-span-2 text-[10px] font-mono text-muted truncate">{sub.email}</div>
              <div className="md:col-span-1">
                <span className="text-[9px] font-mono tracking-[0.1em] uppercase text-muted">{sub.inquiry_type || '—'}</span>
              </div>
              <div className="md:col-span-3 text-sm truncate">{sub.subject}</div>
              <div className="md:col-span-3 text-[10px] font-mono text-muted">{sub.created_at?.slice(0, 19).replace('T', ' ')}</div>
            </summary>
            <div className="px-4 pb-4 md:pl-[calc(8.333%+16px)]">
              <div className="border border-border p-4 bg-surface">
                <div className="text-[10px] font-mono tracking-[0.12em] text-muted uppercase mb-2">Message</div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{sub.message}</p>
                <div className="mt-4 flex items-center gap-3">
                  <a
                    href={`mailto:${sub.email}?subject=Re: ${encodeURIComponent(sub.subject || '')}`}
                    className="text-[10px] font-mono tracking-[0.1em] uppercase text-foreground hover:underline"
                  >
                    Reply →
                  </a>
                </div>
              </div>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
