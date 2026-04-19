import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Resend } from 'resend';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY!);
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Verify caller is admin.
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { applicationId, status } = (await request.json()) as {
      applicationId: string;
      status: 'approved' | 'denied' | 'pending';
    };

    if (!applicationId || !['approved', 'denied', 'pending'].includes(status)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Update the application status.
    const { error: updateError } = await supabase
      .from('lab_access_applications')
      .update({ status })
      .eq('id', applicationId);

    if (updateError) {
      console.error('[update-access] update error', updateError);
      return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }

    // Fetch application to get applicant email.
    const { data: app } = await supabase
      .from('lab_access_applications')
      .select('email, name')
      .eq('id', applicationId)
      .single();

    // Send email notification to the applicant.
    if (app?.email && (status === 'approved' || status === 'denied')) {
      const isApproved = status === 'approved';

      await getResend().emails.send({
        from: 'Tinkorporated <no-reply@tinkorporated.com>',
        to: app.email,
        subject: isApproved
          ? 'Lab Access Approved — Tinkorporated'
          : 'Lab Access Update — Tinkorporated',
        html: isApproved
          ? `
            <div style="font-family: monospace; font-size: 13px; line-height: 1.6; color: #1a1a1a;">
              <p style="font-size: 10px; letter-spacing: 0.15em; color: #888; text-transform: uppercase;">Lab Access — Status Update</p>
              <hr style="border: none; border-top: 1px solid #ddd; margin: 16px 0;" />
              <p>Hello ${escapeHtml(app.name || 'there')},</p>
              <p>Your Lab Access application has been <strong>approved</strong>.</p>
              <p>You now have access to pre-release compounds, active studies, and limited release notifications. Log in to your account to explore your new privileges.</p>
              <hr style="border: none; border-top: 1px solid #ddd; margin: 16px 0;" />
              <p style="font-size: 10px; color: #888;">Tinkorporated — tinkorporated.com</p>
            </div>
          `
          : `
            <div style="font-family: monospace; font-size: 13px; line-height: 1.6; color: #1a1a1a;">
              <p style="font-size: 10px; letter-spacing: 0.15em; color: #888; text-transform: uppercase;">Lab Access — Status Update</p>
              <hr style="border: none; border-top: 1px solid #ddd; margin: 16px 0;" />
              <p>Hello ${escapeHtml(app.name || 'there')},</p>
              <p>Your Lab Access application has been reviewed. Unfortunately, we are unable to approve access at this time.</p>
              <p>You may reapply in the future. If you have questions, contact us at tinkorporated@gmail.com.</p>
              <hr style="border: none; border-top: 1px solid #ddd; margin: 16px 0;" />
              <p style="font-size: 10px; color: #888;">Tinkorporated — tinkorporated.com</p>
            </div>
          `,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[update-access] error', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
