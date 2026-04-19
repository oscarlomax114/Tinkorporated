import Link from 'next/link';
import SystemAlert from '@/components/ui/SystemAlert';
import { products } from '@/data/compounds';

export const metadata = {
  title: 'Remains — TINKORPORATED',
  description: 'Archive of depleted and discontinued doses.',
};

export default function RemainsPage() {
  const depletedProducts = products.filter(p =>
    p.status === 'archived' || p.doses.some(d => d.status === 'depleted')
  );

  return (
    <div>
      {/* Page header */}
      <div className="border-b border-border">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-8">
              <div className="text-[10px] font-mono tracking-[0.2em] text-muted mb-3">SECTION 03 — ARCHIVE</div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-[0.08em] mb-4">Remains</h1>
              <p className="text-sm text-muted leading-relaxed max-w-xl">
                Doses that have been depleted, discontinued, or archived. These passed through the system and will not return. Preserved here as part of the record.
              </p>
            </div>
            <div className="md:col-span-4 md:text-right">
              <div className="text-[10px] font-mono text-muted tracking-[0.1em] space-y-1">
                <div>Depleted: {depletedProducts.length}</div>
                <div>Status: Non-renewable</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-8 pt-8">
        <SystemAlert type="restricted">
          All doses shown below are depleted. No inventory remains. These will not be reissued. This archive is maintained for reference only.
        </SystemAlert>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-12 md:py-16">
        {depletedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-border">
            {depletedProducts.map((product) => {
              const dose = product.doses[0];
              return (
                <Link
                  key={product.id}
                  href={`/doses/${product.id}`}
                  className="bg-background group block border border-border hover:border-foreground transition-colors duration-300 relative"
                >
                  <div className="aspect-[4/5] bg-surface-elevated relative overflow-hidden">
                    <div className="absolute inset-0 flex items-center justify-center opacity-30">
                      <span className="text-[10px] font-mono tracking-[0.2em] text-border-light">{product.id}</span>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="border-2 border-accent-red/60 px-4 py-2 rotate-[-8deg]">
                        <span className="text-[11px] font-mono tracking-[0.2em] uppercase text-accent-red/80">Depleted</span>
                      </div>
                    </div>
                    <div className="absolute top-3 left-3 px-2 py-0.5 bg-background border border-border text-[9px] font-mono tracking-[0.15em] uppercase">
                      Previously Available
                    </div>
                  </div>
                  <div className="p-4 border-t border-border">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-[10px] font-mono text-muted tracking-[0.1em]">{product.id}</div>
                      <div className="flex items-center gap-1.5">
                        <span className="status-dot status-restricted" />
                        <span className="text-[9px] font-mono text-muted tracking-[0.1em] uppercase">Archived</span>
                      </div>
                    </div>
                    <h3 className="text-sm font-medium tracking-[0.05em] mb-1">{product.name}</h3>
                    <div className="text-[10px] text-muted tracking-[0.05em] mb-3">{product.classification}</div>
                    <div className="flex items-end justify-between">
                      <div className="text-sm text-muted line-through">${dose.price}</div>
                      <div className="text-[9px] font-mono text-muted tracking-[0.1em] uppercase">{product.classification}</div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 text-muted text-sm">
            No depleted doses on record.
          </div>
        )}
      </div>
    </div>
  );
}
