import Stripe from 'stripe';
import { Resend } from 'resend';

export interface FulfilledLineItem {
  doseId?: string;
  compoundId?: string;
  type?: 'physical' | 'digital';
  name: string;
  quantity: number;
  amount: number; // cents
}

export interface FulfillmentPayload {
  sessionId: string;
  email: string | null;
  name: string | null;
  phone: string | null;
  amountTotal: number; // cents
  currency: string;
  shipping: Stripe.Address | null;
  items: FulfilledLineItem[];
}

function buildOrderConfirmationEmail(payload: FulfillmentPayload): string {
  const ref = payload.sessionId.slice(-8).toUpperCase();
  const total = (payload.amountTotal / 100).toFixed(2);
  const itemRows = payload.items
    .map(
      (i) =>
        `<tr>
          <td style="padding:8px 12px;border-bottom:1px solid #e0e0e0;font-family:monospace;font-size:13px;">${i.quantity}×</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e0e0e0;font-size:13px;">${i.name}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #e0e0e0;font-family:monospace;font-size:13px;text-align:right;">$${(i.amount / 100).toFixed(2)}</td>
        </tr>`
    )
    .join('');

  return `
    <div style="max-width:560px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;">
      <div style="border-bottom:2px solid #1a1a1a;padding:24px 0 16px;">
        <div style="font-size:10px;letter-spacing:0.2em;color:#888;font-family:monospace;">TINKORPORATED</div>
        <h1 style="font-size:22px;font-weight:700;letter-spacing:0.08em;margin:8px 0 0;">Order Confirmation</h1>
      </div>

      <p style="font-size:14px;color:#555;margin:20px 0;">
        ${payload.name ? `${payload.name}, your` : 'Your'} prescription has been dispensed successfully.
      </p>

      <div style="background:#f8f8f8;border:1px solid #e0e0e0;padding:16px;margin:20px 0;">
        <div style="font-size:10px;letter-spacing:0.15em;color:#888;font-family:monospace;margin-bottom:8px;">ORDER REFERENCE</div>
        <div style="font-size:18px;font-family:monospace;letter-spacing:0.1em;">${ref}</div>
      </div>

      <table style="width:100%;border-collapse:collapse;margin:20px 0;">
        <thead>
          <tr>
            <th style="padding:8px 12px;border-bottom:2px solid #1a1a1a;font-size:10px;letter-spacing:0.15em;font-family:monospace;text-align:left;color:#888;">QTY</th>
            <th style="padding:8px 12px;border-bottom:2px solid #1a1a1a;font-size:10px;letter-spacing:0.15em;font-family:monospace;text-align:left;color:#888;">ITEM</th>
            <th style="padding:8px 12px;border-bottom:2px solid #1a1a1a;font-size:10px;letter-spacing:0.15em;font-family:monospace;text-align:right;color:#888;">AMOUNT</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding:12px;font-size:14px;font-weight:600;">Total</td>
            <td style="padding:12px;font-family:monospace;font-size:14px;font-weight:600;text-align:right;">$${total}</td>
          </tr>
        </tfoot>
      </table>

      <p style="font-size:12px;color:#888;margin:24px 0 4px;">
        Physical doses ship within 3–5 business days via tracked courier.<br/>
        Digital doses are delivered immediately.
      </p>

      <div style="border-top:1px solid #e0e0e0;margin-top:32px;padding-top:16px;">
        <p style="font-size:10px;color:#aaa;font-family:monospace;letter-spacing:0.1em;">TINKORPORATED — tinkorporated.com</p>
      </div>
    </div>
  `;
}

export async function fulfillOrder(payload: FulfillmentPayload): Promise<void> {
  console.log('[fulfillment] order received', {
    sessionId: payload.sessionId,
    email: payload.email,
    total: `${(payload.amountTotal / 100).toFixed(2)} ${payload.currency.toUpperCase()}`,
    itemCount: payload.items.length,
  });

  // Send order confirmation email to the customer.
  if (payload.email) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY!);
      await resend.emails.send({
        from: 'Tinkorporated <no-reply@tinkorporated.com>',
        to: payload.email,
        subject: `Order Confirmed — REF: ${payload.sessionId.slice(-8).toUpperCase()}`,
        html: buildOrderConfirmationEmail(payload),
      });
      console.log('[fulfillment] confirmation email sent to', payload.email);
    } catch (err) {
      console.error('[fulfillment] failed to send confirmation email', err);
    }
  }

  console.log('[fulfillment] items to ship', {
    to: payload.name,
    address: payload.shipping,
    phone: payload.phone,
    items: payload.items.map((i) => `${i.quantity}× ${i.name} (${i.doseId})`),
  });
}
