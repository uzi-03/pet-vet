import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/database';
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

// PUT /api/admin/users/[id] - Update user
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check authentication and authorization
    const user = getUserFromSession(request);
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const id = parseInt(params.id);
    const { username, password, role, type } = await request.json();
    let password_hash;
    if (password) {
      password_hash = await bcrypt.hash(password, 10);
      db.prepare('UPDATE users SET username = ?, password_hash = ?, role = ?, type = ? WHERE id = ?')
        .run(username, password_hash, role, type, id);
    } else {
      db.prepare('UPDATE users SET username = ?, role = ?, type = ? WHERE id = ?')
        .run(username, role, type, id);
    }
    const updatedUser = db.prepare('SELECT id, username, role, type, created_at FROM users WHERE id = ?').get(id);
    return NextResponse.json(updatedUser);
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && (error as any).code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return NextResponse.json({ error: 'Username already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

// DELETE /api/admin/users/[id] - Delete user
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check authentication and authorization
    const user = getUserFromSession(request);
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const id = parseInt(params.id);
    db.prepare('DELETE FROM users WHERE id = ?').run(id);
    return NextResponse.json({ message: 'User deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
} 