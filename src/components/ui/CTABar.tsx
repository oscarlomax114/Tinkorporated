import Link from 'next/link';

interface CTABarProps {
  label: string;
  href: string;
  sublabel?: string;
  className?: string;
}

export default function CTABar({ label, href, sublabel, className = '' }: CTABarProps) {
  return (
    <Link
      href={href}
      className={`group flex items-center justify-between border border-border hover:border-foreground p-5 md:p-6 transition-colors duration-300 ${className}`}
    >
      <div>
        <div className="text-sm md:text-base font-medium tracking-[0.05em] group-hover:tracking-[0.1em] transition-all duration-300">
          {label}
        </div>
        {sublabel && (
          <div className="text-[10px] font-mono text-muted mt-1 tracking-[0.1em]">{sublabel}</div>
        )}
      </div>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-muted group-hover:text-foreground group-hover:translate-x-1 transition-all duration-300">
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    </Link>
  );
}
