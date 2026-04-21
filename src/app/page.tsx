import Link from 'next/link';
import DoseCard from '@/components/ui/DoseCard';
import HeroVideo from '@/components/ui/HeroVideo';
import SectionLabel from '@/components/ui/SectionLabel';
import CTABar from '@/components/ui/CTABar';
import RestrictedBlock from '@/components/ui/RestrictedBlock';
import SystemAlert from '@/components/ui/SystemAlert';
import { standardDoses, xrDoses, activeProducts, availableDoses } from '@/data/compounds';

export default function HomePage() {
  return (
    <div>
      {/* System Alert Bar */}
      <div className="border-b border-border">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-2.5 flex items-center gap-3">
          <span className="status-dot status-active" />
          <span className="text-[10px] font-mono tracking-[0.12em] text-muted">
            SYSTEM ACTIVE — DOSAGE NOW AVAILABLE FOR PRESCRIPTION — <Link href="/doses" className="text-foreground hover:underline">VIEW DOSES</Link>
          </span>
        </div>
      </div>

      {/* Hero */}
      <section className="relative border-b border-border overflow-hidden hero-section">
        {/* Background video */}
        <HeroVideo />
        <div className="absolute inset-0 scanline-overlay" />

        <div className="absolute top-3 left-1/2 -translate-x-1/2 text-[9px] font-mono text-white/60 tracking-[0.1em] hidden md:block">
          EST. 2024 — DOCUMENT REF: TNK-SYS-001
        </div>

        <div className="hero-title absolute top-[34%] left-1/2 -translate-x-1/2 text-center animate-fade-in z-10">
          <h1 className="sr-only">TINKORPORATED</h1>
          <div className="text-[10px] md:text-xs font-mono tracking-[0.35em] text-white/60">
            TINKORPORATED
          </div>
        </div>

        <div className="hero-content absolute bottom-16 md:bottom-20 left-1/2 -translate-x-1/2 text-center animate-fade-in stagger-3 w-full px-4">
          <p className="text-xs md:text-base tracking-[0.1em] text-white/90 max-w-lg mx-auto leading-relaxed">
            Ideas, formulated as treatments.
          </p>
          <p className="text-[10px] md:text-xs tracking-[0.08em] text-white/60 mt-2 max-w-md mx-auto">
            Observe, Interpret, Distribute.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-4 md:mt-5">
            <span className="text-[9px] font-mono tracking-[0.15em] uppercase text-white/70 border border-white/40 px-3 py-1.5 hover:border-white/80 hover:text-white transition-colors cursor-default">
              Dosage
            </span>
          </div>
        </div>

        <div className="hero-scroll absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in stagger-5">
          <span className="text-[9px] font-mono tracking-[0.2em] text-white/40">SCROLL</span>
          <div className="w-[1px] h-6 bg-white/20 relative overflow-hidden">
            <div className="absolute inset-x-0 h-3 bg-white/40" style={{ animation: 'scanline 2s ease-in-out infinite' }} />
          </div>
        </div>

        <div className="absolute top-6 left-4 md:left-8 text-[9px] font-mono text-white/60 tracking-[0.1em] hidden md:block">
          SYS.INDEX.001
        </div>
        <div className="absolute top-6 right-4 md:right-8 text-[9px] font-mono text-white/60 tracking-[0.1em] hidden md:block">
          2026.04.18
        </div>
      </section>

      {/* Featured Doses */}
      <section className="border-b border-border">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="flex items-end justify-between mb-10">
            <SectionLabel label="Doses" code="§ 002" className="mb-0" />
            <Link href="/doses" className="text-[10px] font-mono tracking-[0.15em] text-muted hover:text-foreground transition-colors uppercase hidden md:block">
              View All Doses →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[1px] bg-border">
            {[...standardDoses, ...xrDoses].map((product) => {
              const dose = product.doses[0];
              return (
                <div key={product.id} className="bg-background">
                  <DoseCard
                    productId={product.id}
                    productName={product.name}
                    classification={product.classification}
                    price={dose.price}
                    status={dose.status}
                    badge={product.format === 'xr' ? 'XR' : '2.5"'}
                    href={`/doses/${product.id}`}
                  />
                </div>
              );
            })}
          </div>
          <CTABar label="Browse All Doses" href="/doses" sublabel={`${availableDoses.length} doses currently available`} className="mt-[1px]" />
        </div>
      </section>

      {/* System Info Strip */}
      <section className="border-b border-border bg-surface">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8">
          <div className="grid grid-cols-3 divide-x divide-border">
            {[
              { label: 'Active Doses', value: activeProducts.length.toString(), code: 'DSE' },
              { label: 'Standard', value: standardDoses.length.toString(), code: 'STD' },
              { label: 'Extended Release', value: xrDoses.length.toString(), code: 'XR' },
            ].map((stat) => (
              <div key={stat.label} className="py-6 md:py-8 px-4 md:px-6">
                <div className="text-[9px] font-mono tracking-[0.15em] text-muted mb-2">{stat.code}</div>
                <div className="text-2xl md:text-3xl font-light tracking-wider mb-1">{stat.value}</div>
                <div className="text-[10px] font-mono tracking-[0.1em] text-muted">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Restricted Access */}
      <section className="border-b border-border">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-16 md:py-24">
          <SectionLabel label="Lab Access" code="§ 004" />
          <RestrictedBlock
            title="Apply for Lab Access"
            description="Access restricted doses and early releases. Lab Access is a gated program for approved subjects, granting access to limited doses, pre-release previews, and wholesale inquiry channels."
          />
        </div>
      </section>

      {/* Final System Note */}
      <section>
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-16 md:py-24">
          <SystemAlert type="info">
            TINKORPORATED — All doses are issued under controlled conditions. Limited doses are non-renewable.
            For inquiries,
            submit a request through the <Link href="/contact" className="text-foreground underline hover:no-underline">contact protocol</Link>.
          </SystemAlert>
        </div>
      </section>
    </div>
  );
}
