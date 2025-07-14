import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/database';
import { Pet } from '@/types';

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

// GET /api/pets - Get pets for the logged-in user
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromSession(request);
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // If user is admin, show all pets. Otherwise, show only their pets
    let pets;
    if (user.role === 'admin') {
      pets = db.prepare(`
        SELECT p.*, u.username as owner_username 
        FROM pets p 
        LEFT JOIN users u ON p.owner_id = u.id 
        ORDER BY p.created_at DESC
      `).all();
    } else {
      pets = db.prepare(`
        SELECT p.*, u.username as owner_username 
        FROM pets p 
        LEFT JOIN users u ON p.owner_id = u.id 
        WHERE p.owner_id = ? 
        ORDER BY p.created_at DESC
      `).all(user.id);
    }

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
    const user = getUserFromSession(request);
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body: Pet = await request.json();
    
    const { name, species, breed, birth_date, weight, color, microchip_id, owner_name, owner_phone, owner_email, notes } = body;
    
    if (!name || !species) {
      return NextResponse.json(
        { error: 'Name and species are required' },
        { status: 400 }
      );
    }

    const stmt = db.prepare(`
      INSERT INTO pets (name, species, breed, birth_date, weight, color, microchip_id, owner_name, owner_phone, owner_email, notes, owner_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(name, species, breed, birth_date, weight, color, microchip_id, owner_name, owner_phone, owner_email, notes, user.id);
    
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