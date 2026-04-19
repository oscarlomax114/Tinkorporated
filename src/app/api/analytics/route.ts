import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function POST(request: NextRequest) {
  const db = getAdminSupabase();
  if (!db) return NextResponse.json({ error: 'Server error' }, { status: 500 });

  try {
    const body = await request.json();
    const { event_type, product_id, variant, session_id, source, referrer, metadata } = body;

    if (!event_type) return NextResponse.json({ error: 'Missing event_type' }, { status: 400 });

    await db.from('analytics_events').insert({
      event_type,
      product_id: product_id || null,
      variant: variant || null,
      session_id: session_id || null,
      source: source || null,
      referrer: referrer || null,
      metadata: metadata || {},
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
