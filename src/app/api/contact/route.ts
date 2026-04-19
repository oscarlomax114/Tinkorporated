import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

function getResend() {
  return new Resend(process.env.RESEND_API_KEY!);
}

const CONTACT_EMAIL = 'tinkorporated@gmail.com';

function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

interface ContactPayload {
  name: string;
  email: string;
  inquiryType: string;
  subject: string;
  message: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ContactPayload;
    const { name, email, inquiryType, subject, message } = body;

    // Basic validation
    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      return NextResponse.json({ error: 'All required fields must be filled.' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 });
    }

    const { error } = await getResend().emails.send({
      from: 'Tinkorporated <no-reply@tinkorporated.com>',
      to: CONTACT_EMAIL,
      replyTo: email,
      subject: `[${inquiryType || 'General'}] ${subject}`,
      html: `
        <div style="font-family: monospace; font-size: 13px; line-height: 1.6; color: #1a1a1a;">
          <p style="font-size: 10px; letter-spacing: 0.15em; color: #888; text-transform: uppercase;">New Inquiry — tinkorporated.com</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 16px 0;" />
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          <p><strong>Type:</strong> ${escapeHtml(inquiryType || 'General')}</p>
          <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 16px 0;" />
          <p style="white-space: pre-wrap;">${escapeHtml(message)}</p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 16px 0;" />
          <p style="font-size: 10px; color: #888;">Reply directly to this email to respond to the sender.</p>
        </div>
      `,
    });

    if (error) {
      console.error('[contact] Resend error', error);
      return NextResponse.json({ error: 'Failed to send message.' }, { status: 500 });
    }

    // Store in database
    const db = getAdminSupabase();
    if (db) {
      await db.from('contact_submissions').insert({
        name: name.trim(),
        email: email.trim(),
        inquiry_type: inquiryType || 'General',
        subject: subject.trim(),
        message: message.trim(),
      }).then(({ error: dbErr }) => {
        if (dbErr) console.error('[contact] DB insert error', dbErr);
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[contact] error', err);
    return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
