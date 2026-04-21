import { notFound } from 'next/navigation';
import Link from 'next/link';
import { products, getProduct } from '@/data/compounds';
import ProductImage from '@/components/doses/ProductImage';
import MetadataRow from '@/components/ui/MetadataRow';
import SystemAlert from '@/components/ui/SystemAlert';
import SectionLabel from '@/components/ui/SectionLabel';
import DoseSelector from '@/components/doses/DoseSelector';
import { getInventory, getProductInventory } from '@/lib/inventory';
import { isProductVisible } from '@/lib/visibility';

export const dynamic = 'force-dynamic';

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = getProduct(id);
  return {
    title: product ? `${product.name} — TINKORPORATED` : 'Dose Not Found',
  };
}

export default async function DoseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = getProduct(id);
  if (!product) return notFound();

  // Check product visibility
  const visible = await isProductVisible(product.id);
  if (!visible) return notFound();

  const isXR = product.format === 'xr';
  const dose = product.doses[0];

  // Fetch live inventory from database
  let stock: number | null = null;
  let variantStock: Record<string, number> | null = null;

  if (product.id === 'DSG-OS') {
    const rows = await getProductInventory('DSG-OS');
    if (rows.length > 0) {
      variantStock = {};
      stock = 0;
      for (const row of rows) {
        if (row.variant) {
          variantStock[row.variant] = row.stock;
          stock += row.stock;
        }
      }
    }
    // If no rows returned (table not set up), stock stays null → falls back to static status
  } else {
    // DSG-MD, XR-001, XR-002, XR-003 — single inventory row each
    const fetched = await getInventory(product.id);
    // getInventory returns 0 when row not found — distinguish from actual 0 stock
    // by checking if the row exists
    stock = fetched;
  }

  const isAvailable = stock !== null ? stock > 0 : dose.status === 'available';
  const displayInventory = stock !== null ? stock : dose.inventory;

  return (
    <div>
      {/* Breadcrumb */}
      <div className="border-b border-border">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-3">
          <div className="text-[10px] font-mono tracking-[0.1em] text-muted">
            <Link href="/doses" className="hover:text-foreground transition-colors">DOSES</Link>
            <span className="mx-2">/</span>
            <span className="text-foreground">{product.id}</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          {/* Left: Visual */}
          <div className="lg:col-span-5">
            <ProductImage
              productId={product.id}
              productName={product.name}
              isXR={isXR}
            />
          </div>

          {/* Right: Dossier */}
          <div className="lg:col-span-7">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className={`status-dot ${isAvailable ? 'status-active' : 'status-restricted'}`} />
                <span className="text-[10px] font-mono tracking-[0.15em] text-muted uppercase">
                  {isAvailable ? 'Available for Prescription' : 'Sold Out'}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-[0.08em] mb-3">{product.name}</h1>
              <div className="text-sm text-muted">{product.classification}</div>
            </div>

            {/* Price + CTA */}
            <DoseSelector
              product={JSON.parse(JSON.stringify(product))}
              stock={stock ?? undefined}
              variantStock={variantStock ?? undefined}
            />

            {/* Composition */}
            <div className="mb-8">
              <SectionLabel label="Details" code={product.id} />
              <div className="border-t border-border">
                <MetadataRow label="Dose" value={product.id} mono />
                <MetadataRow label="Name" value={product.name} />
                <MetadataRow label="Classification" value={product.classification} />
                <MetadataRow label="Format" value={
                  <span className="inline-flex items-center gap-2">
                    <span className="text-[9px] font-mono tracking-[0.15em] uppercase border border-border px-2 py-0.5">
                      {isXR ? 'Extended Release' : 'Standard Dose'}
                    </span>
                  </span>
                } />
                <MetadataRow label="Composition" value={dose.composition} />
                {!variantStock && displayInventory !== undefined && (
                  <MetadataRow label="Inventory" value={`${displayInventory} units`} mono />
                )}
                <MetadataRow label="Administration" value={dose.administrationMethod} />
                <MetadataRow label="Availability" value={
                  <span className="inline-flex items-center gap-2">
                    <span className={`status-dot ${isAvailable ? 'status-active' : 'status-restricted'}`} />
                    <span>{isAvailable ? 'Available' : 'Sold Out'}</span>
                  </span>
                } />
              </div>
            </div>

            {/* Side Effects */}
            {dose.sideEffects && (
              <div className="mb-8">
                <SectionLabel label="Cautionary Notes" />
                <SystemAlert type="warning">
                  {dose.sideEffects}
                </SystemAlert>
              </div>
            )}

            {/* Description */}
            <div>
              <SectionLabel label="Description" />
              <p className="text-sm text-muted leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
