import Link from 'next/link';
import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background mt-auto">
      {/* Main footer grid */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Image
              src="/tink-logo.png"
              alt="Tink"
              width={200}
              height={60}
              className="h-8 w-auto object-contain mb-2"
            />
            <div className="text-label mb-4">TINKORPORATED</div>
            <p className="text-xs text-muted leading-relaxed max-w-[240px]">
              Beauty to the finest detail. Precision-engineered products, digital assets, and visual research.
            </p>
          </div>

          {/* Index */}
          <div>
            <div className="text-label mb-4">Index</div>
            <nav className="flex flex-col gap-2.5">
              <Link href="/doses" className="text-xs text-muted hover:text-foreground transition-colors">Doses</Link>
              <Link href="/bulletin" className="text-xs text-muted hover:text-foreground transition-colors">Bulletin</Link>
            </nav>
          </div>

          {/* Information */}
          <div>
            <div className="text-label mb-4">Information</div>
            <nav className="flex flex-col gap-2.5">
              <Link href="/about" className="text-xs text-muted hover:text-foreground transition-colors">About Tinkorporated</Link>
              <Link href="/contact" className="text-xs text-muted hover:text-foreground transition-colors">Contact</Link>
              <Link href="/access" className="text-xs text-muted hover:text-foreground transition-colors">Lab Access</Link>
              <Link href="/login" className="text-xs text-muted hover:text-foreground transition-colors">Login / Account</Link>
            </nav>
          </div>

          {/* System */}
          <div>
            <div className="text-label mb-4">System</div>
            <div className="flex flex-col gap-2.5 text-xs text-muted">
              <div className="flex items-center gap-2">
                <span className="status-dot status-active" />
                <span>All systems operational</span>
              </div>
              <div>Build: 2026.03.30</div>
              <div>Protocol: v4.1</div>
              <div>Region: Global</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="text-[10px] tracking-[0.1em] text-muted font-mono">
            © 2026 TINKORPORATED. ALL RIGHTS RESERVED.
          </div>
          <div className="flex items-center gap-4 text-[10px] tracking-[0.1em] text-muted font-mono">
            <Link href="#" className="hover:text-foreground transition-colors">PRIVACY</Link>
            <Link href="#" className="hover:text-foreground transition-colors">TERMS</Link>
            <Link href="#" className="hover:text-foreground transition-colors">COMPLIANCE</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
