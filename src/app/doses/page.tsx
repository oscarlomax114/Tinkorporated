import DoseCard from '@/components/ui/DoseCard';
import SectionLabel from '@/components/ui/SectionLabel';
import { standardDoses, xrDoses, availableDoses } from '@/data/compounds';
import { getInventory, getTotalStock } from '@/lib/inventory';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Doses — TINKORPORATED',
  description: 'Browse all available doses.',
};

export default async function DosesPage() {
  // Fetch live inventory for all products
  const [mysteryStock, openStock, xr001Stock, xr002Stock, xr003Stock] = await Promise.all([
    getInventory('DSG-MD'),
    getTotalStock('DSG-OS'),
    getInventory('XR-001'),
    getInventory('XR-002'),
    getInventory('XR-003'),
  ]);

  const stockMap: Record<string, number> = {
    'DSG-MD': mysteryStock,
    'DSG-OS': openStock,
    'XR-001': xr001Stock,
    'XR-002': xr002Stock,
    'XR-003': xr003Stock,
  };

  return (
    <div>
      {/* Page header */}
      <div className="border-b border-border">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-8">
              <div className="text-[10px] font-mono tracking-[0.2em] text-muted mb-3">SECTION 01 — DOSE INDEX</div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-[0.08em] mb-4">Doses</h1>
              <p className="text-sm text-muted leading-relaxed max-w-xl">
                All items are dispensed as doses. Standard doses are available through Mystery Dispense or Open Selection. Extended Release doses are individually finished and listed separately.
              </p>
            </div>
            <div className="md:col-span-4 md:text-right">
              <div className="text-[10px] font-mono text-muted tracking-[0.1em] space-y-1">
                <div>Available doses: {availableDoses.length}</div>
                <div>Standard: {standardDoses.length}</div>
                <div>Extended Release: {xrDoses.length}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Standard Doses */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-12 md:py-16">
        <SectionLabel label="Standard Doses" code="2.5&quot;" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-border">
          {standardDoses.map((product) => {
            const dose = product.doses[0];
            const liveStock = stockMap[product.id];
            const status = liveStock !== undefined
              ? (liveStock > 0 ? 'available' : 'depleted')
              : dose.status;
            return (
              <div key={product.id} className="bg-background">
                <DoseCard
                  productId={product.id}
                  productName={product.name}
                  classification={product.classification}
                  price={dose.price}
                  status={status as 'available' | 'depleted'}
                  badge="2.5&quot;"
                  href={`/doses/${product.id}`}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Extended Release */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 pb-12 md:pb-16">
        <SectionLabel label="Extended Release" code="XR" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-border">
          {xrDoses.map((product) => {
            const dose = product.doses[0];
            const liveStock = stockMap[product.id];
            const status = liveStock !== undefined
              ? (liveStock > 0 ? 'available' : 'depleted')
              : dose.status;
            return (
              <div key={product.id} className="bg-background">
                <DoseCard
                  productId={product.id}
                  productName={product.name}
                  classification={product.classification}
                  price={dose.price}
                  status={status as 'available' | 'depleted'}
                  badge="XR"
                  href={`/doses/${product.id}`}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
