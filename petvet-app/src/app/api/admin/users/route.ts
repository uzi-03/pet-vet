import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/database';
import { User } from '@/types';
import bcrypt from 'bcryptjs';

// GET /api/admin/users - List all users
export async function GET() {
  try {
    const users = db.prepare('SELECT id, username, role, created_at FROM users ORDER BY created_at DESC').all();
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// POST /api/admin/users - Create a new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, role, type } = body;
    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }
    const password_hash = await bcrypt.hash(password, 10);
    const stmt = db.prepare('INSERT INTO users (username, password_hash, role, type) VALUES (?, ?, ?, ?)');
    const result = stmt.run(username, password_hash, role || 'user', type || 'owner');
    const user = db.prepare('SELECT id, username, role, type, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);
    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && (error as any).code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
} 