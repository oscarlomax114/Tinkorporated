import Link from 'next/link';

export default function CancelPage() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-20 md:py-28">
      <div className="max-w-xl mx-auto text-center">
        <div className="text-[10px] font-mono tracking-[0.2em] text-muted mb-4">
          PRESCRIPTION CANCELLED
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-[0.08em] mb-4">
          Dispensing cancelled
        </h1>
        <p className="text-sm text-muted mb-10">
          No charge was made. Your prescription is still on file.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/prescription"
            className="bg-foreground text-background px-8 py-3 text-[11px] font-mono tracking-[0.2em] uppercase hover:bg-muted transition-colors"
          >
            Return to Prescription
          </Link>
          <Link
            href="/doses"
            className="border border-foreground px-8 py-3 text-[11px] font-mono tracking-[0.2em] uppercase hover:bg-foreground hover:text-background transition-colors"
          >
            Browse Doses
          </Link>
        </div>
      </div>
    </div>
  );
}
