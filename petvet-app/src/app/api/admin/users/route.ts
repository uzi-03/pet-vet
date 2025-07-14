import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/database';
import { User } from '@/types';
import bcrypt from 'bcryptjs';

// Helper function to get user from session
function getUserFromSession(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  if (!session) return null;
  try {
    return JSON.parse(Buffer.from(session, 'base64').toString());
  } catch {
    return null;
  }
}

// GET /api/admin/users - List all users
export async function GET(request: NextRequest) {
  try {
    // Check authentication and authorization
    const user = getUserFromSession(request);
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const users = db.prepare('SELECT id, username, role, type, created_at FROM users ORDER BY created_at DESC').all();
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// POST /api/admin/users - Create a new user
export async function POST(request: NextRequest) {
  try {
    // Check authentication and authorization
    const user = getUserFromSession(request);
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const { username, password, role, type } = body;
    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }
    const password_hash = await bcrypt.hash(password, 10);
    const stmt = db.prepare('INSERT INTO users (username, password_hash, role, type) VALUES (?, ?, ?, ?)');
    const result = stmt.run(username, password_hash, role || 'user', type || 'owner');
    const newUser = db.prepare('SELECT id, username, role, type, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);
    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && (error as any).code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
} 