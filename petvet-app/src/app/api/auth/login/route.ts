import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/database';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any;
    if (!user) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }
    // Set session cookie (simple, for MVP)
    const response = NextResponse.json({ id: user.id, username: user.username, role: user.role, created_at: user.created_at });
    response.cookies.set('session', Buffer.from(JSON.stringify({ id: user.id, username: user.username, role: user.role })).toString('base64'), {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      secure: process.env.NODE_ENV === 'production',
    });
    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
} 