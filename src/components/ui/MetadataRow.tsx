interface MetadataRowProps {
  label: string;
  value: string | React.ReactNode;
  mono?: boolean;
  className?: string;
}

export default function MetadataRow({ label, value, mono = false, className = '' }: MetadataRowProps) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-baseline py-3 border-b border-border gap-1 sm:gap-0 ${className}`}>
      <div className="text-[10px] font-mono tracking-[0.15em] uppercase text-muted sm:w-40 md:w-48 flex-shrink-0">
        {label}
      </div>
      <div className={`text-sm text-foreground leading-relaxed ${mono ? 'font-mono text-xs' : ''}`}>
        {value}
      </div>
    </div>
  );
}
