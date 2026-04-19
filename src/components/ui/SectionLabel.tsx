interface SectionLabelProps {
  label: string;
  code?: string;
  className?: string;
}

export default function SectionLabel({ label, code, className = '' }: SectionLabelProps) {
  return (
    <div className={`flex items-center gap-3 mb-6 md:mb-8 ${className}`}>
      {code && (
        <span className="text-[10px] font-mono tracking-[0.15em] text-muted">{code}</span>
      )}
      {code && <span className="w-8 h-[1px] bg-border" />}
      <h2 className="text-[11px] font-mono tracking-[0.2em] uppercase text-muted">{label}</h2>
    </div>
  );
}
