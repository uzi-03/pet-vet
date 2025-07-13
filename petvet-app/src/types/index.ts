export interface Pet {
  id?: number;
  name: string;
  species: string;
  breed?: string;
  birth_date?: string;
  weight?: number;
  color?: string;
  microchip_id?: string;
  owner_name?: string;
  owner_phone?: string;
  owner_email?: string;
  photo_url?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface VetRecord {
  id?: number;
  pet_id: number;
  visit_date: string;
  reason: string;
  diagnosis?: string;
  treatment?: string;
  medications?: string;
  next_visit_date?: string;
  vet_name?: string;
  notes?: string;
  created_at?: string;
}

export interface PetWithRecords extends Pet {
  vet_records?: VetRecord[];
}

export interface User {
  id?: number;
  username: string;
  password_hash: string;
  role: 'admin' | 'user';
  type: 'vet' | 'owner';
  created_at?: string;
} 