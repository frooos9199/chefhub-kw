import { NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase-admin';
import { sendEmail } from '@/lib/email';

export const runtime = 'nodejs';

type EmailAttachment = { filename: string; content: string; type: string };

function parseAttachments(value: unknown): EmailAttachment[] | undefined {
  if (value == null) return undefined;
  if (!Array.isArray(value)) return undefined;

  const attachments: EmailAttachment[] = [];
  for (const item of value) {
    if (!item || typeof item !== 'object') return undefined;
    const rec = item as Record<string, unknown>;
    if (typeof rec.filename !== 'string') return undefined;
    if (typeof rec.content !== 'string') return undefined;
    if (typeof rec.type !== 'string') return undefined;
    attachments.push({ filename: rec.filename, content: rec.content, type: rec.type });
  }
  return attachments;
}

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
    const attachments = parseAttachments(record.attachments);

    // If attachments was provided but invalid, fail fast
    if (record.attachments != null && !attachments) {
      return NextResponse.json({ sent: false, error: 'invalid_attachments' }, { status: 400 });
    }

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
