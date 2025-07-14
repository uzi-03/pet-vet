import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/database';
import { VetRecord } from '@/types';

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

// GET /api/vet/records - Get all records for the logged-in vet
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
    const pet_id = searchParams.get('pet_id');
    const date_from = searchParams.get('date_from');
    const date_to = searchParams.get('date_to');

    let query = `
      SELECT vr.*, p.name as pet_name, p.species, u.username as owner_username
      FROM vet_records vr 
      JOIN pets p ON vr.pet_id = p.id 
      JOIN users u ON p.owner_id = u.id 
      WHERE vr.vet_id = ?
    `;
    const params = [vetId];

    if (pet_id) {
      query += ' AND vr.pet_id = ?';
      params.push(pet_id);
    }
    if (date_from) {
      query += ' AND vr.visit_date >= ?';
      params.push(date_from);
    }
    if (date_to) {
      query += ' AND vr.visit_date <= ?';
      params.push(date_to);
    }

    query += ' ORDER BY vr.visit_date DESC';

    const records = db.prepare(query).all(...params) as any[];

    return NextResponse.json(records);
  } catch (error) {
    console.error('Error fetching vet records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch records' },
      { status: 500 }
    );
  }
}

// POST /api/vet/records - Create a new vet record
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
    const { 
      pet_id, 
      visit_date, 
      reason, 
      diagnosis, 
      treatment, 
      medications, 
      next_visit_date, 
      office_location, 
      notes 
    } = body;

    if (!pet_id || !visit_date || !reason) {
      return NextResponse.json({ error: 'Pet ID, visit date, and reason are required' }, { status: 400 });
    }

    // Check if pet exists and is assigned to this vet
    const petAssignment = db.prepare('SELECT * FROM vet_patients WHERE vet_id = ? AND pet_id = ?').get(user.id, pet_id);
    if (!petAssignment) {
      return NextResponse.json({ error: 'Pet is not assigned to this vet' }, { status: 403 });
    }

    // Create the record
    const stmt = db.prepare(`
      INSERT INTO vet_records (pet_id, vet_id, visit_date, reason, diagnosis, treatment, medications, next_visit_date, office_location, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(pet_id, user.id, visit_date, reason, diagnosis, treatment, medications, next_visit_date, office_location, notes);

    const newRecord = db.prepare(`
      SELECT vr.*, p.name as pet_name, p.species, u.username as owner_username
      FROM vet_records vr 
      JOIN pets p ON vr.pet_id = p.id 
      JOIN users u ON p.owner_id = u.id 
      WHERE vr.id = ?
    `).get(result.lastInsertRowid);

    return NextResponse.json(newRecord, { status: 201 });
  } catch (error) {
    console.error('Error creating vet record:', error);
    return NextResponse.json(
      { error: 'Failed to create record' },
      { status: 500 }
    );
  }
} 