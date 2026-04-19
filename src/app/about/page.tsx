import SectionLabel from '@/components/ui/SectionLabel';
import MetadataRow from '@/components/ui/MetadataRow';
import CTABar from '@/components/ui/CTABar';

export const metadata = {
  title: 'About — TINKORPORATED',
  description: 'Tinkorporated operates at the intersection of product design, visual research, and controlled distribution.',
};

export default function AboutPage() {
  return (
    <div>
      {/* Page header */}
      <div className="border-b border-border">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-16 md:py-24">
          <div className="text-[10px] font-mono tracking-[0.2em] text-muted mb-3">DOCUMENT REF: TNK-ABT-001</div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-[0.1em] mb-6">Tinkorporated</h1>
          <p className="text-base md:text-lg text-muted leading-relaxed max-w-2xl">
            A structured environment for the development and release of conceptual treatments—objects, garments, and digital works designed to explore perception, identity, internal states, and external conditions.
          </p>
        </div>
      </div>

      {/* Principles */}
      <div className="border-b border-border">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-16 md:py-24">
          <SectionLabel label="Operating Principles" code="§ A.01" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {[
              {
                title: 'Observation',
                text: 'Each release begins from a defined observation. Something identified, considered, and worked through over time. The process is iterative—refining toward a form that feels resolved. Nothing is produced without intent.',
              },
              {
                title: 'Control',
                text: 'Distribution is deliberate. Production is limited by design, not by constraint. We issue when the work meets standard, archive when the cycle is complete, and restrict when scarcity serves the system.',
              },
              {
                title: 'Distribution',
                text: 'Work is released when it reaches its intended form. Not on schedule or in response to demand—only when it holds its own weight within the system and is ready to stand as a complete offering. The same object does not present the same way to everyone.',
              },
            ].map((principle) => (
              <div key={principle.title} className="border border-border p-6 md:p-8 hover:border-foreground transition-colors">
                <h3 className="text-lg font-medium tracking-[0.08em] mb-4">{principle.title}</h3>
                <p className="text-xs text-muted leading-relaxed">{principle.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Overview */}
      <div className="border-b border-border">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-16 md:py-24">
          <SectionLabel label="System Overview" code="§ A.02" />
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16">
            <div className="md:col-span-7">
              <h2 className="text-xl md:text-2xl font-medium tracking-[0.05em] leading-relaxed mb-6">
                Tink operates as an ongoing body of work built through observation and development. Each compound—whether object, garment, or digital—comes from something identified and worked through over time.
              </h2>
              <div className="space-y-4 text-sm text-muted leading-relaxed">
                <p>
                  Nothing is made to fill space or meet a cycle. Work only begins when there&#39;s something worth addressing, and it&#39;s released once it reaches a form that feels complete. There&#39;s no fixed schedule, no seasonal structure, no obligation to produce. Output is determined by whether the idea holds up, not whether it&#39;s expected.
                </p>
                <p>
                  Making sense of the human experience requires time, perspective, and a level of self-awareness that&#39;s easy to avoid. There&#39;s a tendency to look for something external—something that resolves the feeling quickly.
                </p>
                <p>
                  At Tink, the work takes a different approach. It focuses on ideas that don&#39;t fully settle and gives them form—objects you can return to, sit with, and approach from a different angle over time. The intention is to offer space for that process, not replace it.
                </p>
                <p>
                  Each piece exists on its own, but what you take from it depends on where you meet it.
                </p>
              </div>
            </div>
            <div className="md:col-span-5">
              <div className="border border-border">
                <div className="p-5 border-b border-border">
                  <div className="text-[10px] font-mono tracking-[0.15em] text-muted mb-1">ORGANIZATION FILE</div>
                </div>
                <div>
                  <MetadataRow label="Entity" value="Tinkorporated" />
                  <MetadataRow label="Founded" value="2024" mono />
                  <MetadataRow label="Classification" value="Design / Product / Research" />
                  <MetadataRow label="Operating Model" value="Controlled Release" />
                  <MetadataRow label="Distribution" value="Direct — Global" />
                  <MetadataRow label="Protocol Version" value="v4.1" mono />
                  <MetadataRow label="System Status" value={
                    <span className="inline-flex items-center gap-2">
                      <span className="status-dot status-active" />
                      <span>Operational</span>
                    </span>
                  } />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-16 md:py-24 space-y-[1px]">
        <CTABar label="Browse Doses" href="/doses" sublabel="View the full dose index" />
        <CTABar label="Contact" href="/contact" sublabel="Inquiries and institutional requests" />
      </div>
    </div>
  );
}
