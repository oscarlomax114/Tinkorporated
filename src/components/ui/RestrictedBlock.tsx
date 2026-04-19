'use client';

import Link from 'next/link';

interface RestrictedBlockProps {
  title?: string;
  description?: string;
  className?: string;
}

export default function RestrictedBlock({
  title = 'Restricted Access',
  description = 'This content requires Lab Access clearance. Submit credentials to proceed.',
  className = ''
}: RestrictedBlockProps) {
  return (
    <div className={`border border-accent-red/30 bg-surface relative overflow-hidden ${className}`}>
      {/* Diagonal warning stripes */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-accent-red/20" />

      <div className="p-8 md:p-12 text-center">
        <div className="inline-flex items-center gap-2 mb-4">
          <span className="status-dot status-restricted" />
          <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-accent-red/70">
            Clearance Required
          </span>
        </div>

        <h3 className="text-lg md:text-xl font-medium tracking-[0.1em] mb-3">{title}</h3>
        <p className="text-xs text-muted max-w-md mx-auto mb-6 leading-relaxed">{description}</p>

        <Link
          href="/access"
          className="inline-block border border-foreground px-6 py-2.5 text-[11px] font-mono tracking-[0.15em] uppercase hover:bg-foreground hover:text-background transition-colors duration-300"
        >
          Request Access
        </Link>
      </div>
    </div>
  );
}
