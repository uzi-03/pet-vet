import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/database';
import bcrypt from 'bcryptjs';

// POST /api/auth/register - Create a new user account
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, type } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    // Validate account type
    if (type && !['owner', 'vet'].includes(type)) {
      return NextResponse.json({ error: 'Invalid account type' }, { status: 400 });
    }

    // Check if username already exists
    const existingUser = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
    if (existingUser) {
      return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Create user with default role 'user' and specified type
    const stmt = db.prepare('INSERT INTO users (username, password_hash, role, type) VALUES (?, ?, ?, ?)');
    const result = stmt.run(username, password_hash, 'user', type || 'owner');

    const newUser = db.prepare('SELECT id, username, role, type, created_at FROM users WHERE id = ?').get(result.lastInsertRowid);

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
} 