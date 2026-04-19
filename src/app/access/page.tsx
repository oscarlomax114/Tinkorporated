'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SectionLabel from '@/components/ui/SectionLabel';
import SystemAlert from '@/components/ui/SystemAlert';

interface AccessState {
  loggedIn: boolean;
  hasOrders: boolean;
  application: { id: string; status: string; created_at: string } | null;
}

export default function AccessPage() {
  const [state, setState] = useState<AccessState | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/access')
      .then((res) => res.json())
      .then((data) => setState(data))
      .catch(() => setState({ loggedIn: false, hasOrders: false, application: null }));
  }, []);

  const handleApply = async () => {
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/access', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to apply');
      setState((prev) => prev ? { ...prev, application: { id: '', status: 'approved', created_at: new Date().toISOString() } } : prev);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
    setSubmitting(false);
  };

  const loading = state === null;
  const isApproved = state?.application?.status === 'approved';
  const requirementsPanel = (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className={`status-dot ${state?.loggedIn ? 'status-active' : 'status-restricted'}`} />
        <span className="text-xs font-mono">
          {state?.loggedIn ? 'Signed in' : 'Sign in or create an account'}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className={`status-dot ${state?.hasOrders ? 'status-active' : 'status-restricted'}`} />
        <span className="text-xs font-mono">
          {state?.hasOrders ? 'Purchase on file' : 'Make your first purchase'}
        </span>
      </div>
    </div>
  );

  return (
    <div>
      {/* Page header */}
      <div className="border-b border-border">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-12 md:py-16">
          <div className="flex items-center gap-3 mb-3">
            <span className={`status-dot ${isApproved ? 'status-active' : 'status-restricted'}`} />
            <span className={`text-[10px] font-mono tracking-[0.2em] uppercase ${isApproved ? 'text-accent-green/70' : 'text-accent-red/70'}`}>
              {isApproved ? 'Access Granted' : 'Clearance Required'}
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-[0.08em] mb-4">Lab Access</h1>
          <p className="text-sm text-muted leading-relaxed max-w-xl">
            Certain compounds & studies are distributed early or exclusively through the Lab Access program. Submit an application to request access.
          </p>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left: Info */}
          <div className="lg:col-span-5">
            <SectionLabel label="Access Privileges" code="§ ACC" />
            <div className="space-y-6">
              {[
                { title: 'Pre-Release Doses', desc: 'Early access to doses before general availability. Review dose composition and submit prescription requests ahead of public issue.' },
                { title: 'Active Studies', desc: 'Participate in surveys, feedback sessions, and directional input on unreleased doses. Approved subjects may influence development decisions during active cycles.' },
                { title: 'Limited Doses', desc: 'Priority notification and prescription window for doses designated as limited release. No guaranteed allocation.' },
              ].map((item, i) => (
                <div key={i} className="border-l-2 border-border pl-4 hover:border-foreground transition-colors">
                  <h3 className="text-sm font-medium tracking-[0.05em] mb-1">{item.title}</h3>
                  <p className="text-xs text-muted leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Application */}
          <div className="lg:col-span-7">
            <div className="border border-border">
              <div className="p-5 border-b border-border bg-surface">
                <div className="text-[10px] font-mono tracking-[0.15em] text-muted">ACCESS APPLICATION — FORM REF: TNK-ACC-001</div>
              </div>

              {loading ? (
                <div className="p-8 text-center text-sm text-muted">Loading…</div>
              ) : isApproved ? (
                <div className="p-8 md:p-12 text-center">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <span className="status-dot status-active" />
                    <span className="text-[10px] font-mono tracking-[0.15em] text-accent-green uppercase">Access Granted</span>
                  </div>
                  <h3 className="text-lg font-medium tracking-[0.08em] mb-3">Lab Access Active</h3>
                  <p className="text-xs text-muted leading-relaxed max-w-md mx-auto mb-6">
                    Your Lab Access has been approved. You have full access to pre-release compounds, active studies, and limited release notifications.
                  </p>
                  <Link
                    href="/profile"
                    className="border border-foreground px-8 py-3 text-[11px] font-mono tracking-[0.2em] uppercase hover:bg-foreground hover:text-background transition-colors"
                  >
                    Go to Profile
                  </Link>
                </div>
              ) : (
                <div className="p-6 md:p-8 space-y-6">
                  <SystemAlert type="restricted">
                    Lab Access requires an active account and at least one completed purchase. Once requirements are met, access is granted immediately.
                  </SystemAlert>

                  <div>
                    <div className="text-[10px] font-mono tracking-[0.15em] text-muted uppercase mb-4">Requirements</div>
                    {requirementsPanel}
                  </div>

                  {error && (
                    <div className="text-[10px] font-mono text-accent-red tracking-[0.1em]">{error}</div>
                  )}

                  {!state?.loggedIn ? (
                    <Link
                      href="/login?redirect=/access"
                      className="block w-full bg-foreground text-background py-3 text-[11px] font-mono tracking-[0.2em] uppercase text-center hover:bg-muted transition-colors"
                    >
                      Sign In to Apply
                    </Link>
                  ) : !state?.hasOrders ? (
                    <Link
                      href="/doses"
                      className="block w-full bg-foreground text-background py-3 text-[11px] font-mono tracking-[0.2em] uppercase text-center hover:bg-muted transition-colors"
                    >
                      Browse Doses
                    </Link>
                  ) : (
                    <button
                      onClick={handleApply}
                      disabled={submitting}
                      className="w-full bg-foreground text-background py-3 text-[11px] font-mono tracking-[0.2em] uppercase hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Processing…' : 'Apply for Lab Access'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
