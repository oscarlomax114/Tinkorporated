import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { stripe } from '@/lib/stripe';
import { decrementInventory } from '@/lib/inventory';
import ClearCart from '@/components/prescription/ClearCart';
import type Stripe from 'stripe';

export const dynamic = 'force-dynamic';

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey);
}

async function fulfillSession(session: Stripe.Checkout.Session) {
  const adminDb = getAdminSupabase();
  if (!adminDb) return;

  const customerEmail = session.customer_details?.email ?? null;
  const customerName = session.customer_details?.name ?? null;

  // Check if this order was already saved (idempotent by stripe_session_id).
  const { data: existing } = await adminDb
    .from('orders')
    .select('id')
    .eq('stripe_session_id', session.id)
    .single();

  const alreadySaved = !!existing;

  // Pull line items with product metadata.
  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
    limit: 100,
    expand: ['data.price.product'],
  });

  const items = lineItems.data.map((li) => {
    const product = li.price?.product as Stripe.Product | undefined;
    const meta = product?.metadata ?? {};
    return {
      doseId: meta.doseId,
      compoundId: meta.compoundId,
      type: meta.type === 'physical' || meta.type === 'digital' ? meta.type : undefined,
      selection: meta.selection ?? null,
      name: li.description ?? product?.name ?? 'Item',
      quantity: li.quantity ?? 1,
      amount: li.amount_total ?? 0,
    };
  });

  // Match to user by email.
  let userId: string | null = null;
  if (customerEmail) {
    const { data: profile } = await adminDb
      .from('profiles')
      .select('id')
      .eq('email', customerEmail)
      .single();
    userId = profile?.id ?? null;
  }

  // Save order (skip if already saved).
  if (!alreadySaved) {
    await adminDb.from('orders').insert({
      user_id: userId,
      stripe_session_id: session.id,
      customer_email: customerEmail,
      customer_name: customerName,
      amount_total: session.amount_total ?? 0,
      currency: session.currency ?? 'usd',
      status: 'completed',
      items,
      shipping_address: session.collected_information?.shipping_details?.address ?? null,
      phone: session.customer_details?.phone,
    });

    // Decrement inventory for all products
    const inventoryItems = items
      .filter((i) => !!i.compoundId)
      .map((i) => ({
        productId: i.compoundId as string,
        variant: i.selection as string | null,
        quantity: i.quantity,
      }));

    if (inventoryItems.length > 0) {
      await decrementInventory(inventoryItems);
    }
  }

  // Send confirmation email to customer.
  if (customerEmail && process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const total = ((session.amount_total ?? 0) / 100).toFixed(2);
      const ref = session.id.slice(-8).toUpperCase();

      const itemRows = items
        .map(
          (i) =>
            `<tr>
              <td style="padding:8px 12px;border-bottom:1px solid #e0e0e0;font-family:monospace;font-size:13px;">${i.quantity}×</td>
              <td style="padding:8px 12px;border-bottom:1px solid #e0e0e0;font-size:13px;">${i.name}</td>
              <td style="padding:8px 12px;border-bottom:1px solid #e0e0e0;font-family:monospace;font-size:13px;text-align:right;">$${(i.amount / 100).toFixed(2)}</td>
            </tr>`
        )
        .join('');

      const customerResult = await resend.emails.send({
        from: 'Tinkorporated <no-reply@tinkorporated.com>',
        to: customerEmail,
        subject: `Order Confirmed — REF: ${ref}`,
        html: `
          <div style="max-width:560px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;">
            <div style="border-bottom:2px solid #1a1a1a;padding:24px 0 16px;">
              <div style="font-size:10px;letter-spacing:0.2em;color:#888;font-family:monospace;">TINKORPORATED</div>
              <h1 style="font-size:22px;font-weight:700;letter-spacing:0.08em;margin:8px 0 0;">Order Confirmation</h1>
            </div>
            <p style="font-size:14px;color:#555;margin:20px 0;">
              ${customerName ? `${customerName}, your` : 'Your'} prescription has been dispensed successfully.
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
        `,
      });

      console.log('[success] customer email result:', JSON.stringify(customerResult));

      // Also notify admin.
      const adminResult = await resend.emails.send({
        from: 'Tinkorporated <no-reply@tinkorporated.com>',
        to: 'tinkorporated@gmail.com',
        subject: `New Order — $${total} from ${customerName ?? 'Customer'}`,
        html: `<p><strong>New order received</strong></p>
          <p>Customer: ${customerName ?? 'Unknown'} (${customerEmail})</p>
          <p>Total: $${total}</p>
          <p>Items: ${items.map(i => `${i.quantity}× ${i.name}`).join(', ')}</p>
          <p>Session: ${session.id}</p>`,
      });
      console.log('[success] admin email result:', JSON.stringify(adminResult));
    } catch (err) {
      console.error('[success] failed to send emails', err);
    }
  }
}

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;

  let email: string | null = null;
  let total: number | null = null;
  let ref: string | null = null;

  if (session_id) {
    try {
      const session = await stripe.checkout.sessions.retrieve(session_id);

      // Only fulfill completed payments.
      if (session.status === 'complete') {
        await fulfillSession(session);
      }

      email = session.customer_details?.email ?? null;
      total = session.amount_total ? session.amount_total / 100 : null;
      ref = session.id.slice(-8).toUpperCase();
    } catch (err) {
      console.error('[success] error retrieving session', err);
    }
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-20 md:py-28">
      <div className="max-w-xl mx-auto text-center">
        <div className="text-[10px] font-mono tracking-[0.2em] text-muted mb-4">
          PRESCRIPTION DISPENSED {ref && `— REF: ${ref}`}
        </div>
        <h1 className="text-3xl md:text-4xl font-bold tracking-[0.08em] mb-4">
          Dispensing confirmed
        </h1>
        <p className="text-sm text-muted mb-8">
          {email ? (
            <>A confirmation has been sent to <span className="font-mono text-foreground">{email}</span>.</>
          ) : (
            <>Your prescription has been accepted. A confirmation has been sent to your email.</>
          )}
          <br />
          Physical doses ship within 3–5 business days. Digital doses administer immediately.
        </p>

        {total !== null && (
          <div className="border border-border inline-block px-6 py-3 mb-10">
            <div className="text-[10px] font-mono tracking-[0.15em] text-muted">TOTAL DISPENSED</div>
            <div className="text-2xl font-mono tracking-wider mt-1">${total.toFixed(2)}</div>
          </div>
        )}

        <ClearCart />

        <div className="flex gap-4 justify-center">
          <Link
            href="/profile"
            className="bg-foreground text-background px-8 py-3 text-[11px] font-mono tracking-[0.2em] uppercase hover:bg-muted transition-colors"
          >
            View Orders
          </Link>
          <Link
            href="/doses"
            className="border border-foreground px-8 py-3 text-[11px] font-mono tracking-[0.2em] uppercase hover:bg-foreground hover:text-background transition-colors"
          >
            Continue Browsing
          </Link>
        </div>
      </div>
    </div>
  );
}
