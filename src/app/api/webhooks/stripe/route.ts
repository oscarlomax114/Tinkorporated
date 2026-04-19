import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import type Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { fulfillOrder, type FulfilledLineItem } from '@/lib/fulfillment';
import { decrementInventory } from '@/lib/inventory';

// Stripe webhooks need the raw body for signature verification.
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Use service role for webhook — bypasses RLS to insert orders.
function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey);
}

export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    console.error('[webhook] STRIPE_WEBHOOK_SECRET not set');
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  const body = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'invalid';
    console.error('[webhook] signature verification failed', msg);
    return NextResponse.json({ error: `Webhook Error: ${msg}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;

        // Pull line items with expanded product data so we can read our metadata.
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
          limit: 100,
          expand: ['data.price.product'],
        });

        const items: (FulfilledLineItem & { selection?: string })[] = lineItems.data.map((li) => {
          const product = li.price?.product as Stripe.Product | undefined;
          const meta = product?.metadata ?? {};
          return {
            doseId: meta.doseId,
            compoundId: meta.compoundId,
            type: meta.type === 'physical' || meta.type === 'digital' ? meta.type : undefined,
            selection: meta.selection,
            name: li.description ?? product?.name ?? 'Item',
            quantity: li.quantity ?? 1,
            amount: li.amount_total ?? 0,
          };
        });

        // Save order to Supabase (idempotent by stripe_session_id).
        const adminDb = getAdminSupabase();
        if (adminDb) {
          const { data: existing } = await adminDb
            .from('orders')
            .select('id')
            .eq('stripe_session_id', session.id)
            .single();

          if (!existing) {
            const customerEmail = session.customer_details?.email;
            let userId: string | null = null;
            if (customerEmail) {
              const { data: profile } = await adminDb
                .from('profiles')
                .select('id')
                .eq('email', customerEmail)
                .single();
              userId = profile?.id ?? null;
            }

            await adminDb.from('orders').insert({
              user_id: userId,
              stripe_session_id: session.id,
              customer_email: customerEmail,
              customer_name: session.customer_details?.name,
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
                variant: i.selection ?? null,
                quantity: i.quantity,
              }));

            if (inventoryItems.length > 0) {
              await decrementInventory(inventoryItems);
            }
          }
        }

        await fulfillOrder({
          sessionId: session.id,
          email: session.customer_details?.email ?? null,
          name: session.customer_details?.name ?? null,
          phone: session.customer_details?.phone ?? null,
          amountTotal: session.amount_total ?? 0,
          currency: session.currency ?? 'usd',
          shipping: session.collected_information?.shipping_details?.address ?? null,
          items,
        });

        // Notify admin of new order.
        try {
          const resend = new Resend(process.env.RESEND_API_KEY!);
          const total = ((session.amount_total ?? 0) / 100).toFixed(2);
          const customerName = session.customer_details?.name ?? 'Unknown';
          const customerEmail = session.customer_details?.email ?? 'Unknown';
          await resend.emails.send({
            from: 'Tinkorporated <no-reply@tinkorporated.com>',
            to: 'tinkorporated@gmail.com',
            subject: `New Order — $${total} from ${customerName}`,
            html: `<p><strong>New order received</strong></p>
              <p>Customer: ${customerName} (${customerEmail})</p>
              <p>Total: $${total}</p>
              <p>Items: ${items.map(i => `${i.quantity}× ${i.name}`).join(', ')}</p>
              <p>Session: ${session.id}</p>`,
          });
        } catch (err) {
          console.error('[webhook] failed to send admin notification', err);
        }

        break;
      }

      case 'checkout.session.expired':
        console.log('[webhook] checkout session expired', event.data.object.id);
        break;

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error('[webhook] handler error', err);
    return NextResponse.json({ error: 'Handler failed' }, { status: 500 });
  }
}
