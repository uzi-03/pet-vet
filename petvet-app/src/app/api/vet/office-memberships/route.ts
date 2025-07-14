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
  if (!user || user.type !== 'vet') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }
  const offices = db.prepare(`
    SELECT vom.id, vom.vet_office_id, vom.created_at, vom.vet_user_id, vo.name, vo.address, vo.detail_link
    FROM vet_office_members vom
    JOIN partnered_vet_offices vo ON vom.vet_office_id = vo.id
    WHERE vom.vet_user_id = ?
    ORDER BY vom.created_at DESC
  `).all(user.id);
  return NextResponse.json({ offices });
}

export async function POST(request: NextRequest) {
  const user = getUserFromSession(request);
  if (!user || user.type !== 'vet') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }
  const { vet_office_id } = await request.json();
  if (!vet_office_id) {
    return NextResponse.json({ error: 'Missing vet_office_id' }, { status: 400 });
  }
  // Prevent duplicates
  const exists = db.prepare('SELECT 1 FROM vet_office_members WHERE vet_user_id = ? AND vet_office_id = ?').get(user.id, vet_office_id);
  if (exists) {
    return NextResponse.json({ error: 'Already a member' }, { status: 400 });
  }
  db.prepare('INSERT INTO vet_office_members (vet_user_id, vet_office_id) VALUES (?, ?)').run(user.id, vet_office_id);
  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const user = getUserFromSession(request);
  if (!user || user.type !== 'vet') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }
  const id = Number(new URL(request.url).searchParams.get('id'));
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }
  db.prepare('DELETE FROM vet_office_members WHERE id = ? AND vet_user_id = ?').run(id, user.id);
  return NextResponse.json({ success: true });
} 