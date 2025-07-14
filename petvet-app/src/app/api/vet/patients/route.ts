import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/database';
import { VetPatient } from '@/types';

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

// GET /api/vet/patients - Get all patients for the logged-in vet
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromSession(request);
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    if (user.type !== 'vet') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const vetId = user.id;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const species = searchParams.get('species');
    const office = searchParams.get('office');

    let query = `
      SELECT vp.*, p.*, u.username as owner_username, u.id as owner_id
      FROM vet_patients vp 
      JOIN pets p ON vp.pet_id = p.id 
      JOIN users u ON p.owner_id = u.id 
      WHERE vp.vet_id = ?
    `;
    const params = [vetId];

    if (status) {
      query += ' AND vp.status = ?';
      params.push(status);
    }
    if (species) {
      query += ' AND p.species = ?';
      params.push(species);
    }

    query += ' ORDER BY vp.assigned_date DESC';

    const patients = db.prepare(query).all(...params) as any[];

    return NextResponse.json(patients);
  } catch (error) {
    console.error('Error fetching vet patients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch patients' },
      { status: 500 }
    );
  }
}

// POST /api/vet/patients - Assign a pet to the vet
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromSession(request);
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    if (user.type !== 'vet') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const { pet_id, status = 'active', notes } = body;

    if (!pet_id) {
      return NextResponse.json({ error: 'Pet ID is required' }, { status: 400 });
    }

    // Check if pet exists
    const pet = db.prepare('SELECT * FROM pets WHERE id = ?').get(pet_id);
    if (!pet) {
      return NextResponse.json({ error: 'Pet not found' }, { status: 404 });
    }

    // Check if already assigned
    const existing = db.prepare('SELECT * FROM vet_patients WHERE vet_id = ? AND pet_id = ?').get(user.id, pet_id);
    if (existing) {
      return NextResponse.json({ error: 'Pet is already assigned to this vet' }, { status: 409 });
    }

    // Assign pet to vet
    const stmt = db.prepare(`
      INSERT INTO vet_patients (vet_id, pet_id, assigned_date, status, notes) 
      VALUES (?, ?, date('now'), ?, ?)
    `);
    const result = stmt.run(user.id, pet_id, status, notes);

    const newAssignment = db.prepare(`
      SELECT vp.*, p.*, u.username as owner_username 
      FROM vet_patients vp 
      JOIN pets p ON vp.pet_id = p.id 
      JOIN users u ON p.owner_id = u.id 
      WHERE vp.id = ?
    `).get(result.lastInsertRowid);

    return NextResponse.json(newAssignment, { status: 201 });
  } catch (error) {
    console.error('Error assigning pet to vet:', error);
    return NextResponse.json(
      { error: 'Failed to assign pet' },
      { status: 500 }
    );
  }
} 