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
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }
  const offices = db.prepare('SELECT * FROM partnered_vet_offices ORDER BY created_at DESC').all();
  return NextResponse.json({ offices });
}

export async function POST(request: NextRequest) {
  const user = getUserFromSession(request);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }
  const { name, address, detail_link } = await request.json();
  if (!name || !address) {
    return NextResponse.json({ error: 'Name and address are required' }, { status: 400 });
  }
  const stmt = db.prepare('INSERT INTO partnered_vet_offices (name, address, detail_link) VALUES (?, ?, ?)');
  const result = stmt.run(name, address, detail_link);
  return NextResponse.json({ id: result.lastInsertRowid, name, address, detail_link });
}

export async function DELETE(request: NextRequest) {
  const user = getUserFromSession(request);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }
  const id = Number(new URL(request.url).searchParams.get('id'));
  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }
  db.prepare('DELETE FROM partnered_vet_offices WHERE id = ?').run(id);
  return NextResponse.json({ success: true });
} 