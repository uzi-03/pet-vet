import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/database';
import { VetDashboardStats } from '@/types';

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

// GET /api/vet/stats - Get vet dashboard statistics
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

    // Get total patients
    const totalPatients = db.prepare(`
      SELECT COUNT(*) as count FROM vet_patients WHERE vet_id = ?
    `).get(vetId) as any;

    // Get active patients
    const activePatients = db.prepare(`
      SELECT COUNT(*) as count FROM vet_patients WHERE vet_id = ? AND status = 'active'
    `).get(vetId) as any;

    // Get recent visits (last 30 days)
    const recentVisits = db.prepare(`
      SELECT COUNT(*) as count FROM vet_records 
      WHERE vet_id = ? AND visit_date >= date('now', '-30 days')
    `).get(vetId) as any;

    // Get upcoming appointments (next 7 days)
    const upcomingAppointments = db.prepare(`
      SELECT COUNT(*) as count FROM vet_records 
      WHERE vet_id = ? AND next_visit_date >= date('now') AND next_visit_date <= date('now', '+7 days')
    `).get(vetId) as any;

    // Get patients by species
    const patientsBySpecies = db.prepare(`
      SELECT p.species, COUNT(*) as count 
      FROM vet_patients vp 
      JOIN pets p ON vp.pet_id = p.id 
      WHERE vp.vet_id = ? AND vp.status = 'active'
      GROUP BY p.species 
      ORDER BY count DESC
    `).all(vetId);

    // Get patients by age group
    const patientsByAge = db.prepare(`
      SELECT 
        CASE 
          WHEN p.birth_date IS NULL THEN 'Unknown'
          WHEN date('now') - date(p.birth_date) < 365 THEN 'Under 1 year'
          WHEN date('now') - date(p.birth_date) < 1825 THEN '1-5 years'
          WHEN date('now') - date(p.birth_date) < 3650 THEN '5-10 years'
          ELSE 'Over 10 years'
        END as ageGroup,
        COUNT(*) as count
      FROM vet_patients vp 
      JOIN pets p ON vp.pet_id = p.id 
      WHERE vp.vet_id = ? AND vp.status = 'active'
      GROUP BY ageGroup 
      ORDER BY count DESC
    `).all(vetId);

    const stats: VetDashboardStats = {
      totalPatients: totalPatients.count || 0,
      activePatients: activePatients.count || 0,
      recentVisits: recentVisits.count || 0,
      upcomingAppointments: upcomingAppointments.count || 0,
      patientsBySpecies: patientsBySpecies.map((row: any) => ({
        species: row.species,
        count: row.count
      })),
      patientsByAge: patientsByAge.map((row: any) => ({
        ageGroup: row.ageGroup,
        count: row.count
      }))
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching vet stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
} 