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
  owner_id?: number;
  owner_username?: string;
  created_at?: string;
  updated_at?: string;
}

export interface VetRecord {
  id?: number;
  pet_id: number;
  vet_id: number;
  visit_date: string;
  reason: string;
  diagnosis?: string;
  treatment?: string;
  medications?: string;
  next_visit_date?: string;
  office_location?: string;
  notes?: string;
  created_at?: string;
  vet_username?: string;
  pet_name?: string;
}

export interface VetPatient {
  id?: number;
  vet_id: number;
  pet_id: number;
  assigned_date: string;
  status: 'active' | 'inactive' | 'discharged';
  notes?: string;
  created_at?: string;
  pet?: Pet;
  vet?: User;
}

export interface Office {
  id?: number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  created_at?: string;
}

export interface PetWithRecords extends Pet {
  vet_records?: VetRecord[];
  vet_patients?: VetPatient[];
}

export interface User {
  id?: number;
  username: string;
  password_hash: string;
  role: 'admin' | 'user';
  type: 'vet' | 'owner';
  created_at?: string;
}

export interface VetDashboardStats {
  totalPatients: number;
  activePatients: number;
  recentVisits: number;
  upcomingAppointments: number;
  patientsBySpecies: { species: string; count: number }[];
  patientsByAge: { ageGroup: string; count: number }[];
} 