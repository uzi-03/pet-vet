import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/database';
import { VetRecord } from '@/types';

// GET /api/pets/[id]/records - Get all vet records for a pet
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const petId = parseInt(params.id);
    
    // Check if pet exists
    const pet = db.prepare('SELECT id FROM pets WHERE id = ?').get(petId);
    if (!pet) {
      return NextResponse.json(
        { error: 'Pet not found' },
        { status: 404 }
      );
    }

    const records = db.prepare('SELECT * FROM vet_records WHERE pet_id = ? ORDER BY visit_date DESC').all(petId);
    return NextResponse.json(records);
  } catch (error) {
    console.error('Error fetching vet records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch vet records' },
      { status: 500 }
    );
  }
}

// POST /api/pets/[id]/records - Create a new vet record
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const petId = parseInt(params.id);
    const body: VetRecord = await request.json();
    
    const { visit_date, reason, diagnosis, treatment, medications, next_visit_date, vet_name, notes } = body;
    
    if (!visit_date || !reason) {
      return NextResponse.json(
        { error: 'Visit date and reason are required' },
        { status: 400 }
      );
    }

    // Check if pet exists
    const pet = db.prepare('SELECT id FROM pets WHERE id = ?').get(petId);
    if (!pet) {
      return NextResponse.json(
        { error: 'Pet not found' },
        { status: 404 }
      );
    }

    const stmt = db.prepare(`
      INSERT INTO vet_records (pet_id, visit_date, reason, diagnosis, treatment, medications, next_visit_date, vet_name, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(petId, visit_date, reason, diagnosis, treatment, medications, next_visit_date, vet_name, notes);
    
    const newRecord = db.prepare('SELECT * FROM vet_records WHERE id = ?').get(result.lastInsertRowid);
    
    return NextResponse.json(newRecord, { status: 201 });
  } catch (error) {
    console.error('Error creating vet record:', error);
    return NextResponse.json(
      { error: 'Failed to create vet record' },
      { status: 500 }
    );
  }
} 