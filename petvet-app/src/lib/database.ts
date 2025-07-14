import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'data', 'petvet.db');

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);

// Initialize database with tables
export function initializeDatabase() {
  // Create pets table
  db.exec(`
    CREATE TABLE IF NOT EXISTS pets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      species TEXT NOT NULL,
      breed TEXT,
      birth_date TEXT,
      weight REAL,
      color TEXT,
      microchip_id TEXT,
      owner_name TEXT,
      owner_phone TEXT,
      owner_email TEXT,
      photo_url TEXT,
      notes TEXT,
      owner_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Create vet_records table
  db.exec(`
    CREATE TABLE IF NOT EXISTS vet_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pet_id INTEGER NOT NULL,
      vet_id INTEGER NOT NULL,
      visit_date TEXT NOT NULL,
      reason TEXT NOT NULL,
      diagnosis TEXT,
      treatment TEXT,
      medications TEXT,
      next_visit_date TEXT,
      office_location TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (pet_id) REFERENCES pets (id) ON DELETE CASCADE,
      FOREIGN KEY (vet_id) REFERENCES users (id) ON DELETE CASCADE
    )
  `);

  // Create users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      type TEXT NOT NULL DEFAULT 'owner',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create vet_patients table for vet-pet relationships
  db.exec(`
    CREATE TABLE IF NOT EXISTS vet_patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vet_id INTEGER NOT NULL,
      pet_id INTEGER NOT NULL,
      assigned_date TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (vet_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (pet_id) REFERENCES pets (id) ON DELETE CASCADE,
      UNIQUE(vet_id, pet_id)
    )
  `);

  // Create offices table for vet office locations
  db.exec(`
    CREATE TABLE IF NOT EXISTS offices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      address TEXT,
      phone TEXT,
      email TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create partnered_vet_offices table
  db.exec(`
    CREATE TABLE IF NOT EXISTS partnered_vet_offices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      detail_link TEXT,
      external_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create preferred_vet_offices table (pet owners' preferred vet offices)
  db.exec(`
    CREATE TABLE IF NOT EXISTS preferred_vet_offices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      vet_office_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (vet_office_id) REFERENCES partnered_vet_offices (id) ON DELETE CASCADE
    )
  `);

  // Create vet_office_members table (vet users linked to offices)
  db.exec(`
    CREATE TABLE IF NOT EXISTS vet_office_members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      vet_user_id INTEGER NOT NULL,
      vet_office_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (vet_user_id) REFERENCES users (id) ON DELETE CASCADE,
      FOREIGN KEY (vet_office_id) REFERENCES partnered_vet_offices (id) ON DELETE CASCADE
    )
  `);

  // Add owner_id column to pets table if it doesn't exist
  try {
    db.exec('ALTER TABLE pets ADD COLUMN owner_id INTEGER REFERENCES users(id)');
  } catch (error) {
    // Column already exists, ignore error
  }

  // Add vet_id column to vet_records table if it doesn't exist
  try {
    db.exec('ALTER TABLE vet_records ADD COLUMN vet_id INTEGER REFERENCES users(id)');
  } catch (error) {
    // Column already exists, ignore error
  }

  // Add office_location column to vet_records table if it doesn't exist
  try {
    db.exec('ALTER TABLE vet_records ADD COLUMN office_location TEXT');
  } catch (error) {
    // Column already exists, ignore error
  }

  console.log('Database initialized successfully');
}

// Initialize database on module load
initializeDatabase();

export default db; 