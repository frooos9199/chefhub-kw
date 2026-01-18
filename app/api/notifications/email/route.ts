import { NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase-admin';
import { sendEmail } from '@/lib/email';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const adminAuth = getAdminAuth();
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : '';

    // In production, require a verified Firebase ID token when Admin SDK is configured.
    if (process.env.NODE_ENV === 'production' && adminAuth) {
      if (!token) {
        return NextResponse.json({ sent: false, error: 'unauthorized' }, { status: 401 });
      }
      await adminAuth.verifyIdToken(token);
    }

    const body = (await request.json().catch(() => null)) as unknown;
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ sent: false, error: 'invalid_body' }, { status: 400 });
    }

    const record = body as Record<string, unknown>;
    const to = typeof record.to === 'string' ? record.to : '';
    const subject = typeof record.subject === 'string' ? record.subject : '';
    const htmlContent = typeof record.htmlContent === 'string' ? record.htmlContent : '';
    const attachments = record.attachments;

    if (!to || !subject || !htmlContent) {
      return NextResponse.json({ sent: false, error: 'missing_fields' }, { status: 400 });
    }

    const sent = await sendEmail(to, subject, htmlContent, attachments);
    return NextResponse.json({ sent });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'internal_error';
    return NextResponse.json(
      { sent: false, error: message },
      { status: 500 }
    );
  }
}
