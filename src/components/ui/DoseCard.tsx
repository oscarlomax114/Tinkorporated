import Link from 'next/link';
import Image from 'next/image';

const productImages: Record<string, string> = {
  'DSG-MD': '/products/dsg-md.png',
};

interface DoseCardProps {
  productId: string;
  productName: string;
  classification: string;
  price: number;
  status: 'available' | 'depleted';
  badge?: string;
  href: string;
}

export default function DoseCard({ productId, productName, classification, price, status, badge, href }: DoseCardProps) {
  const isAvailable = status === 'available';
  const image = productImages[productId];

  return (
    <Link href={href} className="group block border border-border hover:border-foreground transition-colors duration-300">
      <div className="aspect-[4/5] bg-surface-elevated relative overflow-hidden">
        {image ? (
          <Image src={image} alt={productName} fill className="object-cover object-center" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-[10px] font-mono tracking-[0.2em] text-border-light">{productId}</span>
          </div>
        )}
        {badge && (
          <div className="absolute top-3 left-3 px-2 py-0.5 bg-background border border-border text-[9px] font-mono tracking-[0.15em] uppercase">
            {badge}
          </div>
        )}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.03] to-transparent" style={{ animation: 'scanline 2s linear infinite' }} />
        </div>
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between mb-2">
          <div className="text-[10px] font-mono text-muted tracking-[0.1em]">{productId}</div>
          <div className="flex items-center gap-1.5">
            <span className={`status-dot ${isAvailable ? 'status-active' : 'status-restricted'}`} />
            <span className="text-[9px] font-mono text-muted tracking-[0.1em] uppercase">
              {isAvailable ? 'Available' : 'Depleted'}
            </span>
          </div>
        </div>
        <h3 className="text-sm font-medium tracking-[0.05em] mb-1">{productName}</h3>
        <div className="text-[10px] text-muted tracking-[0.05em] mb-3">{classification}</div>
        <div className="flex items-end justify-between">
          <div className="text-sm font-medium tracking-wider">
            {isAvailable ? `$${price}` : '—'}
          </div>
          <div className="text-[9px] font-mono text-muted tracking-[0.1em] uppercase">
            Ships
          </div>
        </div>
      </div>
    </Link>
  );
}
