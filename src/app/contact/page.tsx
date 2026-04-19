'use client';

import { useState } from 'react';
import SectionLabel from '@/components/ui/SectionLabel';

type Status = 'idle' | 'sending' | 'sent' | 'error';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [inquiryType, setInquiryType] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const canSubmit = name.trim() && email.trim() && subject.trim() && message.trim() && status !== 'sending';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMsg('');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, inquiryType, subject, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send');
      setStatus('sent');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to send');
      setStatus('error');
    }
  };

  return (
    <div>
      {/* Page header */}
      <div className="border-b border-border">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-12 md:py-16">
          <div className="text-[10px] font-mono tracking-[0.2em] text-muted mb-3">COMMUNICATION PROTOCOL</div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-[0.08em] mb-2">Contact</h1>
          <div className="text-sm text-muted tracking-[0.05em] mb-4">Submit Inquiry</div>
          <p className="text-sm text-muted leading-relaxed max-w-xl">
            For inquiries regarding compounds, doses, licensing, or general correspondence. All communications are routed through a single intake channel and reviewed within 72 hours.
          </p>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left: Contact info */}
          <div className="lg:col-span-4">
            <SectionLabel label="Contact" code="§ CNT" />

            <div className="border border-border mb-8">
              <div className="p-5 border-b border-border bg-surface">
                <div className="text-[10px] font-mono tracking-[0.15em] text-muted">PRIMARY CHANNEL</div>
              </div>
              <div className="p-5">
                <div className="text-[10px] font-mono tracking-[0.15em] text-muted uppercase mb-2">All Inquiries</div>
                <a href="mailto:tinkorporated@gmail.com" className="text-sm font-mono text-foreground hover:text-muted transition-colors">tinkorporated@gmail.com</a>
              </div>
            </div>

            <div className="space-y-4">
              <div className="border-l-2 border-border pl-4">
                <h3 className="text-sm font-medium tracking-[0.05em] mb-1">Response Time</h3>
                <p className="text-xs text-muted leading-relaxed">All inquiries are processed within 72 hours. If this is a medical emergency, please contact a licensed professional or local emergency services.</p>
              </div>
              <div className="border-l-2 border-border pl-4">
                <h3 className="text-sm font-medium tracking-[0.05em] mb-1">Location</h3>
                <p className="text-xs text-muted leading-relaxed">Tinkorporated operates through controlled digital and physical distribution channels. No public-facing facility.</p>
              </div>
            </div>
          </div>

          {/* Right: Inquiry form */}
          <div className="lg:col-span-8">
            <div className="border border-border">
              <div className="p-5 border-b border-border bg-surface">
                <div className="text-[10px] font-mono tracking-[0.15em] text-muted">INQUIRY FORM — REF: TNK-INQ-001</div>
              </div>

              {status === 'sent' ? (
                <div className="p-6 md:p-8 text-center py-16">
                  <div className="text-[10px] font-mono tracking-[0.2em] text-muted mb-4">TRANSMISSION CONFIRMED</div>
                  <h2 className="text-xl font-medium tracking-[0.08em] mb-3">Inquiry received</h2>
                  <p className="text-xs text-muted mb-8">Your message has been logged. Expect a response within 72 hours.</p>
                  <button
                    onClick={() => {
                      setName(''); setEmail(''); setInquiryType(''); setSubject(''); setMessage('');
                      setStatus('idle');
                    }}
                    className="border border-foreground px-8 py-3 text-[11px] font-mono tracking-[0.2em] uppercase hover:bg-foreground hover:text-background transition-colors"
                  >
                    New Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-[10px] font-mono tracking-[0.15em] text-muted uppercase block mb-2">Full Name *</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="w-full bg-transparent border border-border px-4 py-3 text-sm text-foreground focus:border-foreground outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono tracking-[0.15em] text-muted uppercase block mb-2">Contact Address *</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full bg-transparent border border-border px-4 py-3 text-sm text-foreground focus:border-foreground outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono tracking-[0.15em] text-muted uppercase block mb-2">Inquiry Type *</label>
                    <select
                      value={inquiryType}
                      onChange={(e) => setInquiryType(e.target.value)}
                      className="w-full bg-transparent border border-border px-4 py-3 text-sm text-muted focus:border-foreground focus:text-foreground outline-none transition-colors appearance-none cursor-pointer"
                    >
                      <option value="">Select category</option>
                      <option value="General">General Inquiry</option>
                      <option value="Wholesale">Wholesale / Trade</option>
                      <option value="Press">Press / Media</option>
                      <option value="Collaboration">Collaboration Proposal</option>
                      <option value="Licensing">Digital Asset Licensing</option>
                      <option value="Support">Product Support</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono tracking-[0.15em] text-muted uppercase block mb-2">Subject *</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required
                      className="w-full bg-transparent border border-border px-4 py-3 text-sm text-foreground focus:border-foreground outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono tracking-[0.15em] text-muted uppercase block mb-2">Message *</label>
                    <textarea
                      rows={6}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      className="w-full bg-transparent border border-border px-4 py-3 text-sm text-foreground focus:border-foreground outline-none transition-colors resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="text-[9px] font-mono text-muted tracking-[0.1em]">
                      {status === 'error' && (
                        <span className="text-accent-red">{errorMsg}</span>
                      )}
                      {status !== 'error' && '* Required fields'}
                    </div>
                    <button
                      type="submit"
                      disabled={!canSubmit}
                      className="bg-foreground text-background px-8 py-3 text-[11px] font-mono tracking-[0.2em] uppercase hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {status === 'sending' ? 'Transmitting…' : 'Submit Inquiry'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
