import { NextResponse } from 'next/server';
import { getAdminAuth } from '@/lib/firebase-admin';
import { sendWhatsAppMessage } from '@/lib/whatsapp';
import type { WhatsAppNotification } from '@/types';

export const runtime = 'nodejs';

type WhatsAppMetadata = NonNullable<WhatsAppNotification['metadata']>;

function parseMetadata(value: unknown): WhatsAppNotification['metadata'] {
  if (!value || typeof value !== 'object') return undefined;
  const record = value as Record<string, unknown>;

  const out: WhatsAppMetadata = {};

  if (typeof record.chefName === 'string') out.chefName = record.chefName;
  if (typeof record.customerName === 'string') out.customerName = record.customerName;
  if (typeof record.deliveryAddress === 'string') out.deliveryAddress = record.deliveryAddress;

  if (typeof record.totalAmount === 'number' && Number.isFinite(record.totalAmount)) {
    out.totalAmount = record.totalAmount;
  }
  if (typeof record.itemsCount === 'number' && Number.isFinite(record.itemsCount)) {
    out.itemsCount = record.itemsCount;
  }
  if (typeof record.rating === 'number' && Number.isFinite(record.rating)) {
    out.rating = record.rating;
  }

  return Object.keys(out).length ? out : undefined;
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
    const phone = typeof record.phone === 'string' ? record.phone : '';
    const message = typeof record.message === 'string' ? record.message : '';
    const metadata = parseMetadata(record.metadata);

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
