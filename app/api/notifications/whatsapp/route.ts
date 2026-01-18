import { NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase-admin';
import { sendWhatsAppMessage } from '@/lib/whatsapp';

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
    const phone = typeof record.phone === 'string' ? record.phone : '';
    const message = typeof record.message === 'string' ? record.message : '';
    const metadata = record.metadata;

    if (!phone || !message) {
      return NextResponse.json({ sent: false, error: 'missing_fields' }, { status: 400 });
    }

    const sent = await sendWhatsAppMessage(phone, message, metadata);
    return NextResponse.json({ sent });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'internal_error';
    return NextResponse.json(
      { sent: false, error: message },
      { status: 500 }
    );
  }
}
