interface SystemAlertProps {
  type: 'info' | 'warning' | 'success' | 'restricted';
  children: React.ReactNode;
  className?: string;
}

export default function SystemAlert({ type, children, className = '' }: SystemAlertProps) {
  const borderColor = {
    info: 'border-accent-blue',
    warning: 'border-accent-red',
    success: 'border-accent-green',
    restricted: 'border-accent-red',
  }[type];

  const dotClass = {
    info: 'status-pending',
    warning: 'status-restricted',
    success: 'status-active',
    restricted: 'status-restricted',
  }[type];

  return (
    <div className={`border ${borderColor} bg-surface p-4 flex items-start gap-3 ${className}`}>
      <span className={`status-dot ${dotClass} mt-1 flex-shrink-0`} />
      <div className="text-xs font-mono text-muted leading-relaxed">
        {children}
      </div>
    </div>
  );
}
