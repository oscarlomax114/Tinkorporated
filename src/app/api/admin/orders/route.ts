import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdmin } from '@supabase/supabase-js';
import { Resend } from 'resend';

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createAdmin(url, key);
}

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') return null;
  return user;
}

// PATCH /api/admin/orders — update order status, tracking, etc.
export async function PATCH(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const db = getAdminSupabase();
  if (!db) return NextResponse.json({ error: 'Server error' }, { status: 500 });

  const body = await request.json();
  const { orderId, status, carrier, trackingNumber, notes } = body as {
    orderId: string;
    status?: string;
    carrier?: string;
    trackingNumber?: string;
    notes?: string;
  };

  if (!orderId) return NextResponse.json({ error: 'Missing orderId' }, { status: 400 });

  // Get current order
  const { data: order, error: fetchErr } = await db
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (fetchErr || !order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

  const updates: Record<string, unknown> = {};
  if (notes !== undefined) updates.notes = notes;
  if (carrier !== undefined) updates.carrier = carrier;
  if (trackingNumber !== undefined) updates.tracking_number = trackingNumber;

  if (status && status !== order.status) {
    const validStatuses = ['pending', 'paid', 'in_production', 'packed', 'shipped', 'delivered', 'cancelled', 'refunded'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: `Invalid status: ${status}` }, { status: 400 });
    }

    updates.status = status;

    // Set timestamp fields based on status
    if (status === 'shipped') updates.shipped_at = new Date().toISOString();
    if (status === 'delivered') updates.delivered_at = new Date().toISOString();
    if (status === 'cancelled') updates.cancelled_at = new Date().toISOString();
    if (status === 'refunded') updates.refunded_at = new Date().toISOString();

    // Log status change
    await db.from('order_status_logs').insert({
      order_id: orderId,
      old_status: order.status,
      new_status: status,
      changed_by: admin.id,
      note: notes || null,
    });
  }

  // Mark fulfilled if tracking added
  if (trackingNumber && !order.fulfilled_at) {
    updates.fulfilled_at = new Date().toISOString();
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No changes' }, { status: 400 });
  }

  const { error: updateErr } = await db
    .from('orders')
    .update(updates)
    .eq('id', orderId);

  if (updateErr) return NextResponse.json({ error: updateErr.message }, { status: 500 });

  // Send shipping confirmation email if tracking was just added
  if (trackingNumber && !order.tracking_number && process.env.RESEND_API_KEY) {
    const customerEmail = order.customer_email;
    if (customerEmail) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const ref = order.stripe_session_id?.slice(-8).toUpperCase() ?? order.id.slice(0, 8).toUpperCase();
        await resend.emails.send({
          from: 'Tinkorporated <no-reply@tinkorporated.com>',
          to: customerEmail,
          subject: `Shipment Update — REF: ${ref}`,
          html: `
            <div style="max-width:560px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#1a1a1a;">
              <div style="border-bottom:2px solid #1a1a1a;padding:24px 0 16px;">
                <div style="font-size:10px;letter-spacing:0.2em;color:#888;font-family:monospace;">TINKORPORATED</div>
                <h1 style="font-size:22px;font-weight:700;letter-spacing:0.08em;margin:8px 0 0;">Shipment Confirmation</h1>
              </div>
              <p style="font-size:14px;color:#555;margin:20px 0;">
                Your order has been shipped.
              </p>
              <div style="background:#f8f8f8;border:1px solid #e0e0e0;padding:16px;margin:20px 0;">
                <div style="font-size:10px;letter-spacing:0.15em;color:#888;font-family:monospace;margin-bottom:8px;">TRACKING DETAILS</div>
                ${carrier ? `<div style="font-size:13px;margin-bottom:4px;"><strong>Carrier:</strong> ${carrier}</div>` : ''}
                <div style="font-size:13px;"><strong>Tracking:</strong> ${trackingNumber}</div>
              </div>
              <div style="background:#f8f8f8;border:1px solid #e0e0e0;padding:16px;margin:20px 0;">
                <div style="font-size:10px;letter-spacing:0.15em;color:#888;font-family:monospace;margin-bottom:8px;">ORDER REFERENCE</div>
                <div style="font-size:18px;font-family:monospace;letter-spacing:0.1em;">${ref}</div>
              </div>
              <div style="border-top:1px solid #e0e0e0;margin-top:32px;padding-top:16px;">
                <p style="font-size:10px;color:#aaa;font-family:monospace;letter-spacing:0.1em;">TINKORPORATED — tinkorporated.com</p>
              </div>
            </div>
          `,
        });
      } catch (err) {
        console.error('[admin/orders] failed to send shipping email', err);
      }
    }
  }

  return NextResponse.json({ success: true });
}
