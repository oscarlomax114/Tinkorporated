import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Resend } from 'resend';

const CONTACT_EMAIL = 'tinkorporated@gmail.com';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY!);
}

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ loggedIn: false, hasOrders: false, application: null });
    }

    // Check for existing application.
    const { data: application } = await supabase
      .from('lab_access_applications')
      .select('id, status, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    // Check if user has at least one order.
    const { count } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    return NextResponse.json({
      loggedIn: true,
      hasOrders: (count ?? 0) > 0,
      application,
    });
  } catch {
    return NextResponse.json({ loggedIn: false, hasOrders: false, application: null });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'You must be signed in to apply.' }, { status: 401 });
    }

    // Verify at least one order.
    const { count } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if ((count ?? 0) === 0) {
      return NextResponse.json({ error: 'You must make at least one purchase before applying.' }, { status: 403 });
    }

    // Check for existing approved or pending application.
    const { data: existing } = await supabase
      .from('lab_access_applications')
      .select('id, status')
      .eq('user_id', user.id)
      .in('status', ['pending', 'approved'])
      .limit(1)
      .single();

    if (existing?.status === 'approved') {
      return NextResponse.json({ error: 'You already have Lab Access.' }, { status: 409 });
    }
    if (existing?.status === 'pending') {
      return NextResponse.json({ error: 'You already have a pending application.' }, { status: 409 });
    }

    // Get profile info for the application record.
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .single();

    const applicantName = profile?.full_name || user.user_metadata?.full_name || '';
    const applicantEmail = profile?.email || user.email || '';

    // Auto-approve — requirements already met.
    const { error: dbError } = await supabase
      .from('lab_access_applications')
      .insert({
        user_id: user.id,
        name: applicantName,
        email: applicantEmail,
        status: 'approved',
      });

    if (dbError) {
      console.error('[access] DB error', dbError);
      return NextResponse.json({ error: 'Failed to process application.' }, { status: 500 });
    }

    // Notify admin.
    await getResend().emails.send({
      from: 'Tinkorporated <no-reply@tinkorporated.com>',
      to: CONTACT_EMAIL,
      subject: `[Lab Access] Auto-Approved — ${applicantName || applicantEmail}`,
      html: `
        <div style="font-family: monospace; font-size: 13px; line-height: 1.6; color: #1a1a1a;">
          <p style="font-size: 10px; letter-spacing: 0.15em; color: #888; text-transform: uppercase;">Lab Access — Auto-Approved</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 16px 0;" />
          <p><strong>Name:</strong> ${escapeHtml(applicantName)}</p>
          <p><strong>Email:</strong> ${escapeHtml(applicantEmail)}</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 16px 0;" />
          <p style="font-size: 10px; color: #888;">This user met all requirements and was automatically approved.</p>
        </div>
      `,
    }).catch(() => {});

    // Confirmation email to user.
    await getResend().emails.send({
      from: 'Tinkorporated <no-reply@tinkorporated.com>',
      to: applicantEmail,
      subject: 'Lab Access Approved — Tinkorporated',
      html: `
        <div style="font-family: monospace; font-size: 13px; line-height: 1.6; color: #1a1a1a;">
          <p style="font-size: 10px; letter-spacing: 0.15em; color: #888; text-transform: uppercase;">Lab Access — Approved</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 16px 0;" />
          <p>Hello ${escapeHtml(applicantName || 'there')},</p>
          <p>Your Lab Access has been <strong>approved</strong>.</p>
          <p>You now have access to pre-release compounds, active studies, and limited release notifications. Log in to your account to explore your new privileges.</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 16px 0;" />
          <p style="font-size: 10px; color: #888;">Tinkorporated — tinkorporated.com</p>
        </div>
      `,
    }).catch(() => {});

    return NextResponse.json({ success: true, status: 'approved' });
  } catch (err) {
    console.error('[access] error', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
