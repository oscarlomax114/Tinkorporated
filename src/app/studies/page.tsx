import Link from 'next/link';
import { studies } from '@/data/studies';

export const metadata = {
  title: 'Studies — TINKORPORATED',
  description: 'Completed visual research, installations, and documented experiments.',
};

export default function StudiesPage() {
  return (
    <div>
      {/* Page header */}
      <div className="border-b border-border">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-8">
              <div className="text-[10px] font-mono tracking-[0.2em] text-muted mb-3">SECTION 02 — STUDY ARCHIVE</div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-[0.08em] mb-4">Studies</h1>
              <p className="text-sm text-muted leading-relaxed max-w-xl">
                A selection of completed visual research, installations, and experimental work. Studies document the process behind the system. Some studies are linked to compounds. None are available for prescription.
              </p>
            </div>
            <div className="md:col-span-4 md:text-right">
              <div className="text-[10px] font-mono text-muted tracking-[0.1em] space-y-1">
                <div>Total studies: {studies.length}</div>
                <div>Complete: {studies.filter(s => s.status === 'complete').length}</div>
                <div>Ongoing: {studies.filter(s => s.status === 'ongoing').length}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Studies grid */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-border">
          {studies.map((study) => (
            <article key={study.id} className="bg-background border border-border hover:border-foreground transition-colors duration-300 group cursor-pointer">
              <div className="aspect-[16/10] bg-surface-elevated relative overflow-hidden border-b border-border">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-mono tracking-[0.2em] text-border-light">{study.code}</span>
                </div>
              </div>
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono text-muted tracking-[0.1em]">{study.code} — {study.date}</span>
                  <div className="flex items-center gap-1.5">
                    <span className={`status-dot ${study.status === 'complete' ? 'status-active' : 'status-pending'}`} />
                    <span className="text-[9px] font-mono text-muted tracking-[0.1em] uppercase">{study.status}</span>
                  </div>
                </div>
                <h2 className="text-lg font-medium tracking-[0.05em] mb-1">{study.title}</h2>
                <div className="text-[10px] text-muted mb-4">{study.classification}</div>
                <p className="text-sm text-muted leading-relaxed mb-4">{study.abstract}</p>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <div className="text-[9px] font-mono text-muted tracking-[0.1em]">{study.medium}</div>
                  {study.linkedCompound && (
                    <Link
                      href={`/doses/${study.linkedCompound}`}
                      className="text-[9px] font-mono text-foreground tracking-[0.1em] border border-border px-2 py-0.5 hover:bg-foreground hover:text-background transition-colors"
                    >
                      → {study.linkedCompound}
                    </Link>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
