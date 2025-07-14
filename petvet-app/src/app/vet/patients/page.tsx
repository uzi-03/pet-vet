"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Pet, VetPatient } from "@/types";

interface PatientWithDetails extends VetPatient {
  name: string;
  species: string;
  breed?: string;
  owner_username: string;
  owner_name?: string;
  weight?: number;
  birth_date?: string;
}

export default function VetPatientsPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<PatientWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUser] = useState<any>(null);
  const [filters, setFilters] = useState({
    status: "",
    species: "",
    office: ""
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [availablePets, setAvailablePets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState("");
  const [assignmentNotes, setAssignmentNotes] = useState("");

  useEffect(() => {
    checkAuthAndLoadPatients();
  }, [filters]);

  const checkAuthAndLoadPatients = async () => {
    try {
      // Check authentication
      const authRes = await fetch("/api/auth/me");
      if (!authRes.ok) {
        router.push("/login");
        return;
      }
      const userData = await authRes.json();
      if (userData.type !== "vet") {
        router.push("/dashboard");
        return;
      }
      setUser(userData);

      // Load patients with filters
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.species) queryParams.append('species', filters.species);
      if (filters.office) queryParams.append('office', filters.office);

      const patientsRes = await fetch(`/api/vet/patients?${queryParams}`);
      if (patientsRes.ok) {
        const patientsData = await patientsRes.json();
        setPatients(patientsData);
      } else {
        setError("Failed to load patients");
      }
    } catch (error) {
      setError("Failed to load patients");
    } finally {
      setLoading(false);
    }
  };

  const loadAvailablePets = async () => {
    try {
      const res = await fetch("/api/pets");
      if (res.ok) {
        const pets = await res.json();
        setAvailablePets(pets);
      }
    } catch (error) {
      console.error("Error loading available pets:", error);
    }
  };

  const handleAddPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPet) return;

    try {
      const res = await fetch("/api/vet/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pet_id: parseInt(selectedPet),
          notes: assignmentNotes
        }),
      });

      if (res.ok) {
        setShowAddForm(false);
        setSelectedPet("");
        setAssignmentNotes("");
        checkAuthAndLoadPatients();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to assign patient");
      }
    } catch (error) {
      setError("Failed to assign patient");
    }
  };

  const updatePatientStatus = async (patientId: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/vet/patients/${patientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        checkAuthAndLoadPatients();
      }
    } catch (error) {
      setError("Failed to update patient status");
    }
  };

  const getAgeFromBirthDate = (birthDate: string) => {
    if (!birthDate) return "Unknown";
    const birth = new Date(birthDate);
    const today = new Date();
    const ageInYears = today.getFullYear() - birth.getFullYear();
    return `${ageInYears} years`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-yellow-100 text-yellow-800';
      case 'discharged': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading patients...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">My Patients</h1>
            <p className="text-gray-600">Manage your patient pets and their records</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => {
                setShowAddForm(true);
                loadAvailablePets();
              }}
              className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700"
            >
              Add Patient
            </button>
            <button
              onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' });
                router.push('/login');
              }}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="discharged">Discharged</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Species</label>
              <select
                value={filters.species}
                onChange={(e) => setFilters({ ...filters, species: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Species</option>
                <option value="dog">Dog</option>
                <option value="cat">Cat</option>
                <option value="bird">Bird</option>
                <option value="rabbit">Rabbit</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Office</label>
              <select
                value={filters.office}
                onChange={(e) => setFilters({ ...filters, office: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">All Offices</option>
                <option value="main">Main Office</option>
                <option value="branch">Branch Office</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Patients Grid */}
        {patients.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No patients found</h3>
            <p className="text-gray-500">Add your first patient to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {patients.map((patient) => (
              <div key={patient.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200 overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                  <div className="text-indigo-400">
                    <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-1">{patient.name}</h3>
                      <p className="text-gray-600 capitalize">{patient.species}</p>
                      {patient.breed && <p className="text-sm text-gray-500">{patient.breed}</p>}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
                      {patient.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <p><span className="font-medium">Owner:</span> {patient.owner_username}</p>
                    {patient.weight && <p><span className="font-medium">Weight:</span> {patient.weight} kg</p>}
                    {patient.birth_date && <p><span className="font-medium">Age:</span> {getAgeFromBirthDate(patient.birth_date)}</p>}
                    <p><span className="font-medium">Assigned:</span> {new Date(patient.assigned_date).toLocaleDateString()}</p>
                  </div>

                  <div className="flex space-x-2">
                    <Link
                      href={`/vet/patients/${patient.pet_id}`}
                      className="flex-1 px-3 py-2 bg-indigo-600 text-white text-center rounded-lg hover:bg-indigo-700 text-sm"
                    >
                      View Details
                    </Link>
                    <select
                      value={patient.status}
                      onChange={(e) => updatePatientStatus(patient.id!, e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="discharged">Discharged</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Patient Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
              <button
                onClick={() => setShowAddForm(false)}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                aria-label="Close"
              >
                ×
              </button>
              <h2 className="text-xl font-bold mb-4 text-center text-gray-800">Add New Patient</h2>
              <form onSubmit={handleAddPatient} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Pet</label>
                  <select
                    value={selectedPet}
                    onChange={(e) => setSelectedPet(e.target.value)}
                    required
                    className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Choose a pet...</option>
                    {availablePets.map((pet) => (
                      <option key={pet.id} value={pet.id}>
                        {pet.name} ({pet.species}) - {pet.owner_username}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                  <textarea
                    value={assignmentNotes}
                    onChange={(e) => setAssignmentNotes(e.target.value)}
                    className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    rows={3}
                    placeholder="Any notes about this patient assignment..."
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700"
                  >
                    Add Patient
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 