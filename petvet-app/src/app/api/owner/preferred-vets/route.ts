import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/database';

function getUserFromSession(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  if (!session) return null;
  try {
    return JSON.parse(Buffer.from(session, 'base64').toString());
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const user = getUserFromSession(request);
  if (!user || user.type !== 'owner') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }
  const offices = db.prepare(`
    SELECT pvo.id, pvo.vet_office_id, pvo.created_at, pvo.user_id, vo.name, vo.address, vo.detail_link
    FROM preferred_vet_offices pvo
    JOIN partnered_vet_offices vo ON pvo.vet_office_id = vo.id
    WHERE pvo.user_id = ?
    ORDER BY pvo.created_at DESC
  `).all(user.id);
  return NextResponse.json({ offices });
}

export async function POST(request: NextRequest) {
  const user = getUserFromSession(request);
  if (!user || user.type !== 'owner') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }
  const { vet_office_id } = await request.json();
  if (!vet_office_id) {
    return NextResponse.json({ error: 'Missing vet_office_id' }, { status: 400 });
  }
  // Prevent duplicates
  const exists = db.prepare('SELECT 1 FROM preferred_vet_offices WHERE user_id = ? AND vet_office_id = ?').get(user.id, vet_office_id);
  if (exists) {
    return NextResponse.json({ error: 'Already added' }, { status: 400 });
  }
  db.prepare('INSERT INTO preferred_vet_offices (user_id, vet_office_id) VALUES (?, ?)').run(user.id, vet_office_id);
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const user = getUserFromSession(request);
  if (!user || user.type !== 'owner') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }
  const id = Number(new URL(request.url).searchParams.get('id'));
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }
  db.prepare('DELETE FROM preferred_vet_offices WHERE id = ? AND user_id = ?').run(id, user.id);
  return NextResponse.json({ success: true });
} 