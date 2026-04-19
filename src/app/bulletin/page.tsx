'use client';

import { useState } from 'react';
import { bulletinEntries } from '@/data/bulletin';

const FILTER_OPTIONS = ['All', 'Release', 'System Update'] as const;
type Filter = (typeof FILTER_OPTIONS)[number];

function typeLabel(type: string) {
  switch (type) {
    case 'release': return { text: 'Release', dot: 'status-active' };
    case 'system_update': return { text: 'System Update', dot: 'status-pending' };
    default: return { text: type, dot: '' };
  }
}

export default function BulletinPage() {
  const [activeFilter, setActiveFilter] = useState<Filter>('All');

  const filterMap: Record<string, string> = { 'Release': 'release', 'System Update': 'system_update' };
  const filtered = activeFilter === 'All'
    ? bulletinEntries
    : bulletinEntries.filter((e) => e.type === filterMap[activeFilter]);

  return (
    <div>
      <div className="border-b border-border">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-12 md:py-16">
          <div className="text-[10px] font-mono tracking-[0.2em] text-muted mb-3">SECTION 04 — BULLETIN</div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-[0.08em] mb-4">Bulletin</h1>
          <p className="text-sm text-muted leading-relaxed max-w-xl">
            News, releases, updates, and advisories. A chronological record of activity and announcements from Tinkorporated.
          </p>
        </div>
      </div>

      <div className="border-b border-border bg-surface">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-3 flex items-center gap-6 overflow-x-auto">
          {FILTER_OPTIONS.map((type) => (
            <button
              key={type}
              onClick={() => setActiveFilter(type)}
              className={`text-[10px] font-mono tracking-[0.15em] uppercase flex-shrink-0 pb-1 transition-colors ${
                activeFilter === type
                  ? 'text-foreground border-b border-foreground'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="max-w-3xl">
          <div className="border-t border-border">
            {filtered.length === 0 && (
              <div className="py-12 text-center text-sm text-muted">No entries for this category.</div>
            )}
            {filtered.map((entry) => {
              const { text, dot } = typeLabel(entry.type);
              return (
                <article key={entry.id} className="border-b border-border py-8 group hover:bg-surface/50 transition-colors -mx-4 px-4 md:-mx-8 md:px-8">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`status-dot ${dot}`} />
                      <span className="text-[10px] font-mono tracking-[0.15em] text-muted uppercase">{text}</span>
                    </div>
                    <span className="text-[10px] font-mono text-muted tracking-[0.1em]">{entry.code} — {entry.date}</span>
                  </div>
                  <h2 className="text-base md:text-lg font-medium tracking-[0.05em] mb-3">{entry.title}</h2>
                  <p className="text-sm text-muted leading-relaxed whitespace-pre-line mb-4">{entry.content}</p>
                  <div className="flex flex-wrap gap-2">
                    {entry.tags.map(tag => (
                      <span key={tag} className="text-[9px] font-mono text-muted border border-border px-2 py-0.5 tracking-[0.1em]">{tag}</span>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
