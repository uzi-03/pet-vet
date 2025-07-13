import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/database';
import { Pet, VetRecord } from '@/types';

// GET /api/pets/[id] - Get a specific pet with its vet records
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const petId = parseInt(params.id);
    
    const pet = db.prepare('SELECT * FROM pets WHERE id = ?').get(petId);
    if (!pet) {
      return NextResponse.json(
        { error: 'Pet not found' },
        { status: 404 }
      );
    }

    // Get vet records for this pet
    const vetRecords = db.prepare('SELECT * FROM vet_records WHERE pet_id = ? ORDER BY visit_date DESC').all(petId);
    
    return NextResponse.json({
      ...pet,
      vet_records: vetRecords
    });
  } catch (error) {
    console.error('Error fetching pet:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pet' },
      { status: 500 }
    );
  }
}

// PUT /api/pets/[id] - Update a pet
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const petId = parseInt(params.id);
    const body: Pet = await request.json();
    
    const { name, species, breed, birth_date, weight, color, microchip_id, owner_name, owner_phone, owner_email, notes } = body;
    
    if (!name || !species) {
      return NextResponse.json(
        { error: 'Name and species are required' },
        { status: 400 }
      );
    }

    const stmt = db.prepare(`
      UPDATE pets 
      SET name = ?, species = ?, breed = ?, birth_date = ?, weight = ?, color = ?, 
          microchip_id = ?, owner_name = ?, owner_phone = ?, owner_email = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    const result = stmt.run(name, species, breed, birth_date, weight, color, microchip_id, owner_name, owner_phone, owner_email, notes, petId);
    
    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Pet not found' },
        { status: 404 }
      );
    }

    const updatedPet = db.prepare('SELECT * FROM pets WHERE id = ?').get(petId);
    return NextResponse.json(updatedPet);
  } catch (error) {
    console.error('Error updating pet:', error);
    return NextResponse.json(
      { error: 'Failed to update pet' },
      { status: 500 }
    );
  }
}

// DELETE /api/pets/[id] - Delete a pet
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const petId = parseInt(params.id);
    
    const result = db.prepare('DELETE FROM pets WHERE id = ?').run(petId);
    
    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Pet not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Pet deleted successfully' });
  } catch (error) {
    console.error('Error deleting pet:', error);
    return NextResponse.json(
      { error: 'Failed to delete pet' },
      { status: 500 }
    );
  }
} 