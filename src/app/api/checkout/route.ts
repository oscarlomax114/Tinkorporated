import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { compounds } from '@/data/compounds';
import { createClient } from '@/lib/supabase/server';
import { getInventory } from '@/lib/inventory';

interface CartItem {
  doseId: string;
  quantity: number;
}

// Build a lookup of all doses for server-side price verification.
// Never trust prices sent from the client.
const doseIndex = new Map(
  compounds.flatMap((c) =>
    c.doses.map((d) => [d.id, { dose: d, compound: c }] as const)
  )
);

export async function POST(request: NextRequest) {
  try {
    const { items } = (await request.json()) as { items: CartItem[] };

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    const lineItems: Array<{
      price_data: {
        currency: string;
        unit_amount: number;
        product_data: { name: string; description?: string; metadata: Record<string, string> };
      };
      quantity: number;
    }> = [];

    let hasPhysical = false;

    for (const item of items) {
      // Support option-suffixed IDs like "d-dsg-open:003".
      const baseDoseId = item.doseId.split(':')[0];
      const selectedOption = item.doseId.includes(':') ? item.doseId.split(':')[1] : undefined;

      const entry = doseIndex.get(baseDoseId);
      if (!entry) {
        return NextResponse.json(
          { error: `Unknown dose: ${item.doseId}` },
          { status: 400 }
        );
      }
      const { dose, compound } = entry;

      if (dose.status !== 'available') {
        return NextResponse.json(
          { error: `Dose unavailable: ${dose.title}` },
          { status: 400 }
        );
      }

      hasPhysical = true;

      const qty = Math.max(1, Math.floor(item.quantity || 1));

      // Check live inventory (skip if table not available)
      try {
        const currentStock = await getInventory(compound.id, selectedOption ?? null);
        if (currentStock !== null && currentStock < qty) {
          return NextResponse.json(
            { error: `Insufficient stock for ${compound.name}${selectedOption ? ` — ${selectedOption}` : ''}` },
            { status: 400 }
          );
        }
      } catch (err) {
        console.error('[checkout] inventory check failed, proceeding:', err);
      }
      const productName = selectedOption
        ? `${compound.name} — Compound ${selectedOption}`
        : compound.name;

      lineItems.push({
        price_data: {
          currency: 'usd',
          unit_amount: Math.round(dose.price * 100),
          product_data: {
            name: productName,
            description: compound.classification,
            metadata: {
              doseId: dose.id,
              compoundId: compound.id,
              type: dose.type,
              ...(selectedOption ? { selection: selectedOption } : {}),
            },
          },
        },
        quantity: qty,
      });
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin;

    // Pre-fill the customer's email if they're logged in.
    let customerEmail: string | undefined;
    try {
      const supabase = await createClient();
      const { data: { user } } = await supabase.auth.getUser();
      customerEmail = user?.email ?? undefined;
    } catch {
      // Not logged in — Stripe will collect email at checkout.
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      success_url: `${baseUrl}/prescription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/prescription`,
      ...(customerEmail ? { customer_email: customerEmail } : {}),
      ...(hasPhysical
        ? {
            shipping_address_collection: {
              allowed_countries: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'JP'],
            },
            shipping_options: [
              {
                shipping_rate_data: {
                  type: 'fixed_amount',
                  fixed_amount: { amount: 0, currency: 'usd' },
                  display_name: 'Standard courier (3–5 business days)',
                  delivery_estimate: {
                    minimum: { unit: 'business_day', value: 3 },
                    maximum: { unit: 'business_day', value: 5 },
                  },
                },
              },
            ],
          }
        : {}),
      billing_address_collection: 'required',
      phone_number_collection: { enabled: hasPhysical },
      automatic_tax: { enabled: false },
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('[checkout] error', err);
    const message = err instanceof Error ? err.message : 'Checkout failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
