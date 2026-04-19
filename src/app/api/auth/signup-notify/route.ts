import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const ADMIN_EMAIL = 'tinkorporated@gmail.com';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY!);
}

export async function POST(request: NextRequest) {
  try {
    const { name, email } = (await request.json()) as { name: string; email: string };

    if (!email) return NextResponse.json({ ok: true }); // silently skip

    await getResend().emails.send({
      from: 'Tinkorporated <no-reply@tinkorporated.com>',
      to: ADMIN_EMAIL,
      subject: `[New Signup] ${name || email}`,
      html: `
        <div style="font-family: monospace; font-size: 13px; line-height: 1.6; color: #1a1a1a;">
          <p style="font-size: 10px; letter-spacing: 0.15em; color: #888; text-transform: uppercase;">New Account Created — tinkorporated.com</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 16px 0;" />
          <p><strong>Name:</strong> ${escapeHtml(name || '—')}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Time:</strong> ${new Date().toISOString()}</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 16px 0;" />
          <p style="font-size: 10px; color: #888;">This is an automated notification.</p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[signup-notify] error', err);
    return NextResponse.json({ ok: true }); // don't block signup on notification failure
  }
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
