export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(price);
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: undefined
  }).toUpperCase();
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'available':
    case 'active':
    case 'complete':
      return 'text-accent-green';
    case 'restricted':
    case 'unavailable':
    case 'archived':
      return 'text-accent-red';
    case 'limited':
    case 'ongoing':
    case 'pending':
      return 'text-accent-blue';
    default:
      return 'text-muted';
  }
}

export function getStatusDotClass(status: string): string {
  switch (status) {
    case 'available':
    case 'active':
    case 'complete':
      return 'status-dot status-active';
    case 'restricted':
    case 'unavailable':
    case 'archived':
      return 'status-dot status-restricted';
    case 'limited':
    case 'ongoing':
    case 'pending':
      return 'status-dot status-pending';
    default:
      return 'status-dot';
  }
}
