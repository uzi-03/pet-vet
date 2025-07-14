import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/database';

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

// PUT /api/vet/patients/[id] - Update patient assignment
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromSession(request);
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    if (user.type !== 'vet') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const assignmentId = parseInt(params.id);
    const body = await request.json();
    const { status, notes } = body;

    // Check if assignment exists and belongs to this vet
    const existing = db.prepare('SELECT * FROM vet_patients WHERE id = ? AND vet_id = ?').get(assignmentId, user.id) as any;
    if (!existing) {
      return NextResponse.json({ error: 'Patient assignment not found' }, { status: 404 });
    }

    // Update the assignment
    const stmt = db.prepare(`
      UPDATE vet_patients 
      SET status = ?, notes = ? 
      WHERE id = ?
    `);
    stmt.run(status || existing.status, notes || existing.notes, assignmentId);

    // Get updated assignment
    const updated = db.prepare(`
      SELECT vp.*, p.*, u.username as owner_username 
      FROM vet_patients vp 
      JOIN pets p ON vp.pet_id = p.id 
      JOIN users u ON p.owner_id = u.id 
      WHERE vp.id = ?
    `).get(assignmentId);

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating patient assignment:', error);
    return NextResponse.json(
      { error: 'Failed to update patient assignment' },
      { status: 500 }
    );
  }
}

// DELETE /api/vet/patients/[id] - Remove patient assignment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = getUserFromSession(request);
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    if (user.type !== 'vet') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const assignmentId = parseInt(params.id);

    // Check if assignment exists and belongs to this vet
    const existing = db.prepare('SELECT * FROM vet_patients WHERE id = ? AND vet_id = ?').get(assignmentId, user.id);
    if (!existing) {
      return NextResponse.json({ error: 'Patient assignment not found' }, { status: 404 });
    }

    // Delete the assignment
    db.prepare('DELETE FROM vet_patients WHERE id = ?').run(assignmentId);

    return NextResponse.json({ message: 'Patient assignment removed' });
  } catch (error) {
    console.error('Error removing patient assignment:', error);
    return NextResponse.json(
      { error: 'Failed to remove patient assignment' },
      { status: 500 }
    );
  }
} 