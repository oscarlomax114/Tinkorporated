import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createClient as createAdmin } from '@supabase/supabase-js';

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

// PATCH /api/admin/inventory — update stock for a single SKU
export async function PATCH(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const db = getAdminSupabase();
  if (!db) return NextResponse.json({ error: 'Server error' }, { status: 500 });

  const body = await request.json();
  const { id, stock } = body as { id: string; stock: number };

  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  if (typeof stock !== 'number' || stock < 0) return NextResponse.json({ error: 'Invalid stock value' }, { status: 400 });

  const { error } = await db
    .from('inventory')
    .update({ stock })
    .eq('id', id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
