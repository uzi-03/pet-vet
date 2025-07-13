'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { PetWithRecords } from '@/types';

export default function PetDetailPage() {
  const params = useParams();
  const petId = params.id as string;
  const [pet, setPet] = useState<PetWithRecords | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPet();
  }, [petId]);

  const fetchPet = async () => {
    try {
      const response = await fetch(`/api/pets/${petId}`);
      if (response.ok) {
        const data = await response.json();
        setPet(data);
      } else {
        console.error('Failed to fetch pet');
      }
    } catch (error) {
      console.error('Error fetching pet:', error);
    } finally {
      setLoading(false);
    }
  };

  const deletePet = async () => {
    if (!confirm('Are you sure you want to delete this pet? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/pets/${petId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        window.location.href = '/pets';
      } else {
        alert('Failed to delete pet');
      }
    } catch (error) {
      console.error('Error deleting pet:', error);
      alert('Failed to delete pet');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading pet details...</p>
        </div>
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Pet Not Found</h2>
          <p className="text-gray-600 mb-6">The pet you're looking for doesn't exist.</p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Link 
              href="/pets"
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              ← Back to My Pets
            </Link>
            <div className="flex space-x-4">
              <Link
                href={`/pets/${petId}/edit`}
                className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
              >
                Edit Pet
              </Link>
              <button
                onClick={deletePet}
                className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700"
              >
                Delete Pet
              </button>
            </div>
          </div>

          {/* Pet Profile Card */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
            {/* Pet Image */}
            <div className="h-64 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
              {pet.photo_url ? (
                <img 
                  src={pet.photo_url} 
                  alt={pet.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-indigo-400">
                  <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
              )}
            </div>

            {/* Pet Information */}
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">{pet.name}</h1>
                  <p className="text-xl text-gray-600 capitalize">{pet.species}</p>
                  {pet.breed && (
                    <p className="text-lg text-gray-500">{pet.breed}</p>
                  )}
                </div>
                <Link
                  href={`/pets/${petId}/records/new`}
                  className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Vet Record
                </Link>
              </div>

              {/* Pet Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Pet Information</h3>
                  <div className="space-y-3">
                    {pet.birth_date && (
                      <div>
                        <span className="font-medium text-gray-700">Birth Date:</span>
                        <span className="ml-2 text-gray-600">{new Date(pet.birth_date).toLocaleDateString()}</span>
                      </div>
                    )}
                    {pet.weight && (
                      <div>
                        <span className="font-medium text-gray-700">Weight:</span>
                        <span className="ml-2 text-gray-600">{pet.weight} kg</span>
                      </div>
                    )}
                    {pet.color && (
                      <div>
                        <span className="font-medium text-gray-700">Color:</span>
                        <span className="ml-2 text-gray-600">{pet.color}</span>
                      </div>
                    )}
                    {pet.microchip_id && (
                      <div>
                        <span className="font-medium text-gray-700">Microchip ID:</span>
                        <span className="ml-2 text-gray-600">{pet.microchip_id}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Owner Information</h3>
                  <div className="space-y-3">
                    {pet.owner_name && (
                      <div>
                        <span className="font-medium text-gray-700">Name:</span>
                        <span className="ml-2 text-gray-600">{pet.owner_name}</span>
                      </div>
                    )}
                    {pet.owner_phone && (
                      <div>
                        <span className="font-medium text-gray-700">Phone:</span>
                        <span className="ml-2 text-gray-600">{pet.owner_phone}</span>
                      </div>
                    )}
                    {pet.owner_email && (
                      <div>
                        <span className="font-medium text-gray-700">Email:</span>
                        <span className="ml-2 text-gray-600">{pet.owner_email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {pet.notes && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Notes</h3>
                  <p className="text-gray-600">{pet.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Vet Records */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Vet Records</h2>
              <span className="text-gray-500">{pet.vet_records?.length || 0} records</span>
            </div>

            {!pet.vet_records || pet.vet_records.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No vet records yet</h3>
                <p className="text-gray-500 mb-4">Add your first vet record to start tracking your pet's health</p>
                <Link
                  href={`/pets/${petId}/records/new`}
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700"
                >
                  Add First Record
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {pet.vet_records.map((record) => (
                  <div key={record.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{record.reason}</h3>
                        <p className="text-gray-600">{new Date(record.visit_date).toLocaleDateString()}</p>
                      </div>
                      {record.vet_name && (
                        <span className="text-sm text-gray-500">Dr. {record.vet_name}</span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {record.diagnosis && (
                        <div>
                          <span className="font-medium text-gray-700">Diagnosis:</span>
                          <p className="text-gray-600 mt-1">{record.diagnosis}</p>
                        </div>
                      )}
                      {record.treatment && (
                        <div>
                          <span className="font-medium text-gray-700">Treatment:</span>
                          <p className="text-gray-600 mt-1">{record.treatment}</p>
                        </div>
                      )}
                      {record.medications && (
                        <div>
                          <span className="font-medium text-gray-700">Medications:</span>
                          <p className="text-gray-600 mt-1">{record.medications}</p>
                        </div>
                      )}
                      {record.next_visit_date && (
                        <div>
                          <span className="font-medium text-gray-700">Next Visit:</span>
                          <p className="text-gray-600 mt-1">{new Date(record.next_visit_date).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>
                    
                    {record.notes && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <span className="font-medium text-gray-700">Notes:</span>
                        <p className="text-gray-600 mt-1">{record.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 