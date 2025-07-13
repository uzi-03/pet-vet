import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/database';
import { Pet } from '@/types';

// GET /api/pets - Get all pets
export async function GET() {
  try {
    const pets = db.prepare('SELECT * FROM pets ORDER BY created_at DESC').all();
    return NextResponse.json(pets);
  } catch (error) {
    console.error('Error fetching pets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pets' },
      { status: 500 }
    );
  }
}

// POST /api/pets - Create a new pet
export async function POST(request: NextRequest) {
  try {
    const body: Pet = await request.json();
    
    const { name, species, breed, birth_date, weight, color, microchip_id, owner_name, owner_phone, owner_email, notes } = body;
    
    if (!name || !species) {
      return NextResponse.json(
        { error: 'Name and species are required' },
        { status: 400 }
      );
    }

    const stmt = db.prepare(`
      INSERT INTO pets (name, species, breed, birth_date, weight, color, microchip_id, owner_name, owner_phone, owner_email, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(name, species, breed, birth_date, weight, color, microchip_id, owner_name, owner_phone, owner_email, notes);
    
    const newPet = db.prepare('SELECT * FROM pets WHERE id = ?').get(result.lastInsertRowid);
    
    return NextResponse.json(newPet, { status: 201 });
  } catch (error) {
    console.error('Error creating pet:', error);
    return NextResponse.json(
      { error: 'Failed to create pet' },
      { status: 500 }
    );
  }
} 